export interface UsersPagination {
    length: number;
    size: number;
    page: number;
    lastPage: number;
}

interface UserProfile {
    second_phone: any;
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
    secondPhone?: string;
    role?: { id: number };
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

export interface userListParams {
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
    icon?: string;
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

export interface Nationality {
    id: number;
    createdAt: string;
    deletedAt: string | null;
    updatedAt: string;
    status: string;
    is_default: boolean;
    nationality: NationalityDetail;
    attachments: Attachment[];
}

export interface NationalityDetail {
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

// Interface for the Country object
export interface Country {
    id: number;
    createdAt: string; // ISO date string
    deletedAt: string | null;
    updatedAt: string; // ISO date string
    access_code: string;
    ios2: string;
    ios3: string;
}

// Interface for the Media object
interface Media {
    id: number;
    content: string; // URL to the media content
}

// Interface for Titles object
interface Title {
    title: string;
    locale: string;
}

// Interface for the individual country item
export interface CountryItem {
    country: Country;
    media: Media;
    titles: Title[];
}

// Interface for the entire API response
export interface ApiCountries {
    statusCode: number;
    timestamp: string; // ISO date string
    path: string;
    data: CountryItem[];
}

export interface NationalityParams {
    nationalityId: number;
    attachments: { documentUrl: string; mediaTypes: 'other' }[];
}

export interface UserParams {
    avatarUrl?: string; // URL to the user's avatar
    name: string; // User's full name
    email: string; // User's email address
    phone: string; // User's primary phone number
    password?: string; // User's password (ensure proper handling of sensitive data)
    nationalityId?: number; // Nationality ID (as a number)
    second_phone?: string; // User's secondary phone number
    guard: string;
    roleId: number; // User's guard
}

export type userType = 'admin' | 'user';
