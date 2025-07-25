import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { app } from '../firebase';

WebBrowser.maybeCompleteAuthSession();

const ANDROID_CLIENT_ID = '419283836825-acmtat7kna6ppf2bjuilnp3esr0oj4r6.apps.googleusercontent.com';
const IOS_CLIENT_ID = '419283836825-acmtat7kna6ppf2bjuilnp3esr0oj4r6.apps.googleusercontent.com';
const WEB_CLIENT_ID = '419283836825-acmtat7kna6ppf2bjuilnp3esr0oj4r6.apps.googleusercontent.com';

interface AuthContextType {
    user: any;
    error: string | null;
    login: () => void;
    logout: () => void;
    request: any;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: ANDROID_CLIENT_ID,
        iosClientId: IOS_CLIENT_ID,
        webClientId: WEB_CLIENT_ID,
    });

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                fetchUserInfo(authentication.accessToken);
            } else {
                setError('No access token received.');
            }
        } else if (response?.type === 'error') {
            setError('Login failed. Please try again.');
        }
    }, [response]);

    const fetchUserInfo = async (token: string) => {
        try {
            const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userInfo = await res.json();
            setUser(userInfo);
            setError(null);
        } catch (e) {
            setError('Failed to fetch user info.');
        }
    };

    const login = () => {
        setError(null);
        promptAsync();
    };

    const logout = () => {
        setUser(null);
        setError(null);
    };

    // Stub implementations for email/password auth
    const auth = getAuth(app);
    const signUpWithEmail = async (email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            setError(null);
        } catch (e: any) {
            setError(e.message || String(e));
            throw e;
        }
    };
    const signInWithEmail = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            setError(null);
        } catch (e: any) {
            setError(e.message || String(e));
            throw e;
        }
    };
    const sendPasswordReset = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
            setError(null);
        } catch (e: any) {
            setError(e.message || String(e));
            throw e;
        }
    };

    return (
        <AuthContext.Provider value={{ user, error, login, logout, request, signInWithEmail, signUpWithEmail, sendPasswordReset }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
} 