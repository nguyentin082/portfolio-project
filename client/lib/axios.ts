/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import axios from 'axios';
import https from 'https';
import Cookies from 'js-cookie';

type AdaptAxiosRequestConfig = {
    headers: AxiosRequestHeaders;
} & AxiosRequestConfig;

const instance = axios.create({
    baseURL:
        process.env.NEXT_PUBLIC_NEST_SERVER_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    // withCredentials: true,
});

instance.interceptors.request.use(
    (config): AdaptAxiosRequestConfig => {
        // const currentLang = Cookies.get('NEXT_LOCALE') || LANGUAGE_SYSTEM.VI;

        const agent = new https.Agent({
            rejectUnauthorized: false,
        });

        config.httpsAgent = agent;
        config.params = {
            ...config.params,
            // lang: currentLang,
        };

        const accessToken = Cookies.get('authToken');
        if (accessToken) {
            if (config?.headers) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error): any => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (res) => {
        return res;
    },
    async (err) => {
        if (err?.response?.status === 401) {
            Cookies.remove('authToken');
            window.location.assign('/login');
        }
        if (err?.response?.status === 502) {
            Cookies.remove('authToken');
        }
        return Promise.reject(err);
    }
);
export default instance;
