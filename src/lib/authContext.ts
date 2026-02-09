// src/lib/authContext.ts
import { AsyncLocalStorage } from 'async_hooks';

export interface AuthSession {
    user_id: string;
    metadata: {
        email: string;
    };
}

export const authStorage = new AsyncLocalStorage<AuthSession>();