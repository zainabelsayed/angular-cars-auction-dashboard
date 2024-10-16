export interface Contact {
    id: string;
    avatar?: string | null;
    background?: string | null;
    name: string;
    emails?: {
        email: string;
        label: string;
    }[];
    phoneNumbers?: {
        country: string;
        phoneNumber: string;
        label: string;
    }[];
    title?: string;
    company?: string;
    birthday?: string | null;
    address?: string | null;
    notes?: string | null;
    tags: string[];
}

export interface UsersPagination {
    length: number;
    size: number;
    page: number;
    lastPage: number;
}

interface UserProfile {
    commerical_numbers?: string;
}

export interface UserItem {
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
    emailVerifiedAt: string | null;
    phoneVerifiedAt: string | null;
    lastLoginAt: string | null;
    avatarUrl: string | null;
    isActive: boolean;
    profile: UserProfile;
}

interface SearchListData {
    data: UserItem[];
    count: number;
    totalPages: number;
    currentPage: string;
}

export interface ApiUserResponse {
    statusCode: number;
    timestamp: string;
    path: string;
    data: SearchListData;
}

export interface Country {
    id: string;
    iso: string;
    name: string;
    code: string;
    flagImagePos: string;
}

export interface Tag {
    id?: string;
    title?: string;
}

export interface UserListVariables {
    page: number;
    size: number;
    sort: string;
    order: string;
    search: string;
}

export interface userParams {
    page: number;
    size: number;
    sort: string;
    order: 'asc' | 'desc' | '';
    userType: 'web' | 'admin';
    search?: string;
    status?: string;
    guard?: string;
}

export interface Role {
    id: number;
    createdAt: string;
    deletedAt: string | null;
    updatedAt: string;
    title: string;
    description: string | null;
}

export interface RoleListData {
    data: Role[];
    count: number;
    totalPages: number;
    currentPage: string;
}

export interface ApiRoleList {
    statusCode: number;
    timestamp: string;
    path: string;
    data: RoleListData;
}

export interface InputOption {
    label: string;
    value: number | string;
}

export interface ApiUserData {
    statusCode: number;
    timestamp: string;
    path: string;
    data: {
        user?: UserItem;
        admin?: UserItem;
        locations: any[]; // Replace `any` with appropriate type if you have a defined structure
        nationalities: Nationality[];
    };
}

interface Nationality {
    id: number;
    createdAt: string;
    deletedAt: string | null;
    updatedAt: string;
    status: string;
    is_default: boolean;
    nationality: NationalityDetail;
    attachments: Attachment[];
}

interface NationalityDetail {
    id: number;
    createdAt: string;
    deletedAt: string | null;
    updatedAt: string;
    access_code: string;
    ios2: string;
    ios3: string;
    title: string;
    flag: string;
}

interface Attachment {
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
