import { BaseEntity } from '../../common/entities/BaseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { ProviderType } from '../../common/types/auth.types';

@Entity('user_credentials')
export class UserCredential extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    name: 'provider_type',
    type: 'enum',
    enum: ProviderType,
  })
  providerType: ProviderType;

  @Column({
    name: 'provider_id',
    length: 255,
  })
  providerId: string; // Email for 'email', Google ID for 'google', etc.

  @Column({
    name: 'credential_data',
    type: 'text',
  })
  credentialData: string; // Password hash for email, tokens for OAuth

  @Column({
    name: 'is_primary',
    default: false,
  })
  isPrimary: boolean;

  @Column({
    name: 'is_verified',
    default: false,
  })
  isVerified: boolean;

  @Column({
    name: 'last_used_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  lastUsedAt?: Date;

  @Column({
    name: 'expires_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  expiresAt?: Date; // For OAuth tokens

  @Column({
    name: 'metadata',
    type: 'jsonb',
    nullable: true,
  })
  metadata?: Record<string, any>; // Store provider-specific data

  // Relationship
  @ManyToOne(() => User, user => user.credentials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Business methods
  get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  get isValid(): boolean {
    return this.isVerified && !this.isExpired && !this.isDeleted;
  }

  get displayName(): string {
    switch (this.providerType) {
      case ProviderType.EMAIL:
        return `Email (${this.providerId})`;
      case ProviderType.GOOGLE:
        return 'Google Account';
      case ProviderType.MICROSOFT:
        return 'Microsoft Account';
      case ProviderType.APPLE:
        return 'Apple ID';
      default:
        return this.providerType;
    }
  }

  get isOAuthProvider(): boolean {
    return [ProviderType.GOOGLE, ProviderType.MICROSOFT, ProviderType.APPLE].includes(this.providerType);
  }

  // Actions
  markAsUsed(byUserId?: string): void {
    this.lastUsedAt = new Date();
    if (byUserId) {
      this.setUpdatedBy(byUserId);
    }
  }

  verify(byUserId?: string): void {
    this.isVerified = true;
    if (byUserId) {
      this.setUpdatedBy(byUserId);
    }
  }

  unverify(byUserId?: string): void {
    this.isVerified = false;
    if (byUserId) {
      this.setUpdatedBy(byUserId);
    }
  }

  setPrimary(byUserId?: string): void {
    this.isPrimary = true;
    if (byUserId) {
      this.setUpdatedBy(byUserId);
    }
  }

  unsetPrimary(byUserId?: string): void {
    this.isPrimary = false;
    if (byUserId) {
      this.setUpdatedBy(byUserId);
    }
  }

  updateCredentialData(newData: string, byUserId?: string): void {
    this.credentialData = newData;
    if (byUserId) {
      this.setUpdatedBy(byUserId);
    }
  }

  setExpiration(expiresAt: Date, byUserId?: string): void {
    this.expiresAt = expiresAt;
    if (byUserId) {
      this.setUpdatedBy(byUserId);
    }
  }

  extendExpiration(hours: number, byUserId?: string): void {
    if (this.expiresAt) {
      this.expiresAt = new Date(this.expiresAt.getTime() + hours * 60 * 60 * 1000);
    } else {
      this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    }
    if (byUserId) {
      this.setUpdatedBy(byUserId);
    }
  }

  updateMetadata(metadata: Record<string, any>, byUserId?: string): void {
    this.metadata = { ...this.metadata, ...metadata };
    if (byUserId) {
      this.setUpdatedBy(byUserId);
    }
  }
}
