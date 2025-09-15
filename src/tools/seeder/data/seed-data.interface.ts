export interface UserSeedData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  emailVerified: boolean;
  isSubscribed: boolean;
  isActive: boolean;
  password: string;
  businessType?: string;
  trialEndsAt?: string;
  description: string;
}

export interface SeedFileData<T> {
  content: T;
  metadata: {
    version: string;
    environment: string;
    description: string;
    lastUpdated: string;
    totalUsers: number;
  };
}
