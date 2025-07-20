export type ProfileResponse = {
    id: string;
};

export type UserType = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    channel: string;
    lastActiveAt: string;
    createdAt: string;
    updatedAt: string;
};

export type SignInResponse = {
    user: UserType;
    token: string;
};

export type SignUpResponse = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    updatedAt: string;
};

export type Responses<T> = {
    data: T;
    error: string;
    success: boolean;
};

export type PlaygroundResponse = {
    id: string;
    userId: string;
    domainName: string;
    name: string;
    createdAt: string;
    updatedAt: string;
};
