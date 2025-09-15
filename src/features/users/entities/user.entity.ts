import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/BaseEntity';
import { UserCredential } from './user-credential.entity';
import { ProviderType, SubscriptionStatus } from '../../../shared/types/auth.types';

@Entity('users')
@Index(['email'])
export class User extends BaseEntity {
  @Column({
    unique: true,
    length: 255,
  })
  email: string;

  @Column({
    name: 'first_name',
    length: 100,
    nullable: true,
  })
  firstName?: string;

  @Column({
    name: 'last_name',
    length: 100,
    nullable: true,
  })
  lastName?: string;

  @Column({
    length: 20,
    nullable: true,
  })
  phone?: string;

  @Column({
    name: 'email_verified',
    default: false,
  })
  emailVerified: boolean;

  @Column({
    name: 'is_active',
    default: true,
  })
  isActive: boolean;

  @Column({
    name: 'trial_ends_at',
    type: 'timestamp with time zone',
  })
  trialEndsAt: Date;

  @Column({
    name: 'is_subscribed',
    default: false,
  })
  isSubscribed: boolean;

  // Relationships (prepared for future, not used in US-003)
  @OneToMany(() => UserCredential, credential => credential.user, {
    cascade: true,
  })
  credentials: UserCredential[];

  constructor() {
    super();
    if (!this.trialEndsAt) {
      this.trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  //Business method
  get fullName() {
    if (!this.firstName && !this.lastName) return '';
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  get displayName() {
    return this.fullName || this.email.split('@')[0];
  }

  get isTrialExpired() {
    return new Date() > this.trialEndsAt;
  }

  get canCreateQuote() {
    return this.isActive && !this.isDeleted && this.isAuthenticated && (this.isSubscribed || !this.isTrialExpired);
  }

  get isAuthenticated() {
    return this.isActive && !this.isDeleted && this.emailVerified && this.hasValidCredentials;
  }

  get trialDaysRemaining() {
    if (this.isSubscribed) return -1;
    const now = new Date();
    const msInDays = 1000 * 60 * 60 * 24;
    const diffMs = this.trialEndsAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / msInDays);
    return Math.max(0, diffDays);
  }

  get subscriptionStatus(): SubscriptionStatus {
    if (this.isSubscribed) return 'subscribed';
    if (this.isTrialExpired) return 'expired';
    return 'trial';
  }

  get hasValidCredentials() {
    return this.credentials?.some(cred => cred.isVerified && !cred.isExpired) || false;
  }

  //Helper auth methods
  getPrimaryCredential() {
    return this.credentials?.find(cred => cred.isPrimary && cred.isVerified);
  }

  getCredentialByProvider(providerType: ProviderType) {
    return this.credentials?.find(cred => cred.providerType === providerType);
  }

  hasProvider(providerType: ProviderType) {
    return this.credentials?.some(cred => cred.providerType === providerType && cred.isVerified);
  }

  // Business actions
  subscribe(byUserId?: string) {
    this.isSubscribed = true;
    if (byUserId) {
      this.setUpdatedBy(byUserId);
    }
  }

  unsubscribe(byUserId?: string) {
    this.isSubscribed = false;
    // Set trial to expire soon (7 days grace period)
    this.trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (byUserId) {
      this.setUpdatedBy(byUserId);
    }
  }

  verifyEmail(byUserId: string) {
    this.emailVerified = true;
    if (byUserId) {
      this.setUpdatedBy(byUserId);
    }
  }

  deactivate(byUserId?: string): void {
    this.isActive = false;
    this.softDelete(byUserId);
  }

  reactivate(): void {
    this.isActive = true;
    this.restore();
  }

  extendTrial(days: number, byUserId?: string): void {
    if (!this.isSubscribed) {
      this.trialEndsAt = new Date(this.trialEndsAt.getTime() + days * 24 * 60 * 60 * 1000);
      if (byUserId) {
        this.setUpdatedBy(byUserId);
      }
    }
  }

  // Override soft delete to handle user-specific logic
  softDelete(byUserId?: string): void {
    super.softDelete(byUserId);
    this.isActive = false;
  }

  restore(): void {
    super.restore();
    this.isActive = true;
  }
}
