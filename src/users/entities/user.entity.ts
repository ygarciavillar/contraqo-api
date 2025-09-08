import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  // // Relationships (prepared for future, not used in US-003)
  // @OneToMany(() => UserCredentials, credential => credential.user, { cascade: true })
  // credentials: UserCredentials[];

  // Timestamps
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt: Date;
}
