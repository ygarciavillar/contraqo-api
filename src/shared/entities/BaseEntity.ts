import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  //Soft Delete
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  deletedAt?: Date | null;

  //Optimistic Locking
  @Column({
    name: 'version',
    default: 1,
  })
  version: number;

  // Full Audit Trail
  @Column({
    name: 'created_by_user_id',
    type: 'uuid',
    nullable: true,
  })
  createdBy?: string;

  @Column({
    name: 'updated_by_user_id',
    type: 'uuid',
    nullable: true,
  })
  updatedBy?: string;

  @Column({
    name: 'deleted_by_user_id',
    type: 'uuid',
    nullable: true,
  })
  deletedBy?: string | null;

  get isDeleted() {
    return this.deletedAt !== undefined && this.deletedAt !== null;
  }

  get lastModified(): string {
    const diffMs = new Date().getTime() - this.updatedAt.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  }

  setCreatedBy(userId: string) {
    this.createdBy = userId;
  }

  setUpdatedBy(userId: string) {
    this.updatedBy = userId;
  }

  setDeletedBy(userId: string) {
    this.deletedBy = userId;
  }

  // Soft delete methods
  softDelete(userId?: string): void {
    if (userId) {
      this.setDeletedBy(userId);
    }
  }

  restore(): void {
    this.deletedAt = null;
    this.deletedBy = null;
  }

  // Version conflict helper
  checkVersion(expectedVersion: number): void {
    if (this.version !== expectedVersion) {
      throw new Error(
        `Version conflict. Expected ${expectedVersion}, got ${this.version}. Please refresh and try again.`,
      );
    }
  }
}
