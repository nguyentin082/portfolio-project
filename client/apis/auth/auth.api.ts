import instance from '@/lib/axios';
import { AuthEnum } from '@/types/enum';
import {
    ProfileResponse,
    Responses,
    SignInResponse,
    SignUpResponse,
} from '@/types/type';
import { useMutation } from '@tanstack/react-query';

interface ISignIn {
    email: string;
    password: string;
}

interface ISignUp {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export async function authSignIn(
    object: ISignIn
): Promise<Responses<SignInResponse>> {
    const url = '/auth/login';
    const res = await instance.post(url, object);
    return res.data;
}

export async function authSignUp(
    object: ISignUp
): Promise<Responses<SignUpResponse>> {
    const url = '/auth/register';
    const res = await instance.post(url, object);
    return res.data;
}

export async function getProfile(): Promise<Responses<ProfileResponse>> {
    const url = '/users/profile';
    const res = await instance.get(url);

    return res.data;
}

export function signInMutation() {
    return useMutation({
        mutationKey: [AuthEnum.SIGN_IN],
        mutationFn: async (values: ISignIn) => {
            const res = await authSignIn(values);
            return res;
        },
    });
}

export function signUpMutation() {
    return useMutation({
        mutationKey: [AuthEnum.SIGN_UP],
        mutationFn: async (values: ISignUp) => {
            const res = await authSignUp(values);
            return res;
        },
    });
}
