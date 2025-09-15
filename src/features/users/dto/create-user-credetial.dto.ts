import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ProviderType } from '../../../shared/types/auth.types';

export class CreateUserCredentialDto {
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId: string;

  @IsEnum(ProviderType, {
    message: 'Provider type must be one of: email, google, microsoft, apple',
  })
  providerType: ProviderType;

  @IsString({ message: 'Provider ID must be a string' })
  @IsNotEmpty({ message: 'Provider ID cannot be empty' })
  providerId: string; // Email for 'email', Google ID for 'google', etc.

  @IsString({ message: 'Credential data must be a string' })
  @MinLength(8, { message: 'Credential data must be at least 8 characters' })
  credentialData: string; // Password hash for email, tokens for OAuth

  @IsOptional()
  @IsBoolean({ message: 'Is primary must be a boolean' })
  isPrimary?: boolean = false;

  @IsOptional()
  @IsBoolean({ message: 'Is verified must be a boolean' })
  isVerified?: boolean = false;
}
