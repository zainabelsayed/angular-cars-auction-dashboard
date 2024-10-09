export interface ApiUser {
    statusCode: number;
    timestamp: string;
    path: string;
    data: Data;
}

export interface Data {
    user: UserProfile;
    media: Media;
}

export interface UserProfile {
    id: number;
    createdAt: string;
    deletedAt: string | null;
    updatedAt: string;
    name: string;
    email: string;
    phone: string;
    guard: string;
    isBlocked: boolean;
    isVerified: boolean | null;
    termsAndConditions: boolean;
    packageId: number | null;
    emailVerifiedAt: string;
    phoneVerifiedAt: string;
    lastLoginAt: string;
    role: Role;
    avatarUrl: string;
}

export interface Role {
    id: number;
    createdAt: string;
    deletedAt: string | null;
    updatedAt: string;
    title: string;
    description: string | null;
    permissions: Permission[];
}

export interface Permission {
    id: number;
    createdAt: string;
    deletedAt: string | null;
    updatedAt: string;
    name: string;
    accessLevel: AccessLevel;
}

export interface AccessLevel {
    id: number;
    createdAt: string;
    deletedAt: string | null;
    updatedAt: string;
    name: string;
}

export interface Media {
    id: number;
    createdAt: string;
    deletedAt: string | null;
    updatedAt: string;
    mediableId: number;
    mediableType: string;
    content: string;
    order: number;
    belongsTo: string;
    status: string;
    expirationDate: string | null;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
}
