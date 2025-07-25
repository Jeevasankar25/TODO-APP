import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Modal, Portal, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const { user, error, login, logout, request, signInWithEmail, signUpWithEmail, sendPasswordReset } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [signUpLoading, setSignUpLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [localSignUpError, setLocalSignUpError] = useState<string | null>(null);
    const [signUpVisible, setSignUpVisible] = useState(false);
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [forgotVisible, setForgotVisible] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState<string | null>(null);
    const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

    useEffect(() => {
        setLocalError(null);
        // If the user is logged in and the sign up modal is open, close it and clear fields
        if (user && signUpVisible) {
            setSignUpVisible(false);
            setSignUpEmail('');
            setSignUpPassword('');
            setLocalSignUpError(null);
        }
    }, [user, error, signUpVisible]);

    // Email format validation helper
    function isValidEmail(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Real email/password login
    const handleEmailLogin = async () => {
        setLocalError(null);
        if (!email.trim() && !password.trim()) {
            setLocalError('Please enter both email and password.');
            return;
        }
        if (!email.trim()) {
            setLocalError('Please enter your email address.');
            return;
        }
        if (!password.trim()) {
            setLocalError('Please enter your password.');
            return;
        }
        if (!isValidEmail(email)) {
            setLocalError('Please enter a valid email address.');
            return;
        }
        if (password.length < 5) {
            setLocalError('Password must be at least 5 characters long.');
            return;
        }
        setLoading(true);
        try {
            await signInWithEmail(email, password);
        } catch (e: any) {
            setLocalError(e.message || String(e));
        }
        setLoading(false);
    };

    // Real email/password sign up (in modal)
    const handleEmailSignUp = async () => {
        setLocalSignUpError(null);
        if (!signUpEmail.trim() && !signUpPassword.trim()) {
            setLocalSignUpError('Please enter both email and password.');
            return;
        }
        if (!signUpEmail.trim()) {
            setLocalSignUpError('Please enter your email address.');
            return;
        }
        if (!signUpPassword.trim()) {
            setLocalSignUpError('Please enter your password.');
            return;
        }
        if (!isValidEmail(signUpEmail)) {
            setLocalSignUpError('Please enter a valid email address.');
            return;
        }
        if (signUpPassword.length < 5) {
            setLocalSignUpError('Password must be at least 5 characters long.');
            return;
        }
        setSignUpLoading(true);
        try {
            await signUpWithEmail(signUpEmail, signUpPassword);
            // Do not close modal or clear fields here; let useEffect handle it after user is set
        } catch (e: any) {
            setLocalSignUpError(e.message || String(e));
        }
        setSignUpLoading(false);
    };

    // Forgot password handler
    const handleForgotPassword = async () => {
        setForgotError(null);
        setForgotSuccess(null);
        if (!forgotEmail.trim()) {
            setForgotError('Please enter your email address.');
            return;
        }
        if (!isValidEmail(forgotEmail)) {
            setForgotError('Please enter a valid email address.');
            return;
        }
        setForgotLoading(true);
        try {
            await sendPasswordReset(forgotEmail);
            setForgotSuccess('Password reset email sent! Check your inbox.');
        } catch (e: any) {
            setForgotError(e.message || String(e));
        }
        setForgotLoading(false);
    };

    const LIGHT_GOLDEN = '#FFE082';

    return (
        <View style={styles.container}>
            <Text variant="headlineMedium" style={{ marginBottom: 32, color: 'black' }}>Sign in to Todo App</Text>
            {user ? (
                <View style={styles.userInfo}>
                    <Avatar.Image size={80} source={user.picture ? { uri: user.picture } : require('../assets/images/icon.png')} />
                    <Text style={{ marginTop: 16, color: 'black' }}>{user.name}</Text>
                    <Text style={{ color: 'black' }}>{user.email}</Text>
                    <Button mode="contained" style={{ marginTop: 24 }} onPress={logout}>
                        Logout
                    </Button>
                </View>
            ) : (
                <>
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        style={{ marginBottom: 12, width: 300, height: 36, backgroundColor: '#222', color: 'black' }}
                        theme={{ colors: { text: 'black', background: 'white' } }}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        style={{ marginBottom: 12, width: 300, height: 36, backgroundColor: '#222', color: 'black' }}
                        theme={{ colors: { text: 'black', background: 'white' } }}
                        secureTextEntry
                        placeholder="Password must be 5 letters"
                    />
                    <Button
                        mode="text"
                        onPress={() => { setForgotVisible(true); setForgotEmail(email); setForgotError(null); setForgotSuccess(null); }}
                        style={{ marginBottom: 4, width: 260 }}
                    >
                        Forgot Password?
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleEmailLogin}
                        style={{ marginBottom: 20, width: 260, backgroundColor: LIGHT_GOLDEN }}
                        loading={loading}
                        labelStyle={{ color: 'black', fontWeight: 'bold' }}
                    >
                        Log In
                    </Button>
                    <Text style={{ marginBottom: 4, color: 'white', textAlign: 'center' }}>If you don't have any account</Text>
                    <Button
                        mode="contained"
                        onPress={() => { setSignUpVisible(true); setLocalSignUpError(null); }}
                        style={{ marginBottom: 12, width: 260, backgroundColor: LIGHT_GOLDEN }}
                        labelStyle={{ color: 'black', fontWeight: 'bold' }}
                    >
                        Sign Up
                    </Button>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: 260, marginVertical: 16 }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
                        <Text style={{ marginHorizontal: 8, color: '#888' }}>or</Text>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
                    </View>
                    <Button
                        mode="contained"
                        onPress={login}
                        disabled={!request}
                        icon="google"
                        style={{ marginBottom: 16, backgroundColor: LIGHT_GOLDEN }}
                        labelStyle={{ color: 'black', fontWeight: 'bold' }}
                    >
                        Sign in with Google
                    </Button>
                    {localError && <Text style={{ color: 'red', textAlign: 'center' }}>{localError}</Text>}
                    <Portal>
                        <Modal visible={signUpVisible} onDismiss={() => setSignUpVisible(false)} contentContainerStyle={{ width: '100%', height: '100%', backgroundColor: 'white', alignSelf: 'center', borderRadius: 0, margin: 0, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Text variant="titleMedium" style={{ marginBottom: 16, color: 'black' }}>Sign Up</Text>
                            <TextInput
                                label="Email"
                                value={signUpEmail}
                                onChangeText={setSignUpEmail}
                                style={{ marginBottom: 12, width: 300, height: 36, backgroundColor: '#222', color: 'black' }}
                                theme={{ colors: { text: 'black', background: 'white' } }}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <TextInput
                                label="Password"
                                value={signUpPassword}
                                onChangeText={setSignUpPassword}
                                style={{ marginBottom: 12, width: 300, height: 36, backgroundColor: '#222', color: 'black' }}
                                theme={{ colors: { text: 'black', background: 'white' } }}
                                secureTextEntry
                                placeholder="Password must be 5 letters"
                            />
                            {localSignUpError && <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{localSignUpError}</Text>}
                            <Button
                                mode="contained"
                                onPress={handleEmailSignUp}
                                style={{ marginBottom: 8, width: 260, backgroundColor: LIGHT_GOLDEN }}
                                loading={signUpLoading}
                                labelStyle={{ color: 'black', fontWeight: 'bold' }}
                            >
                                Sign Up
                            </Button>
                            <Button
                                mode="contained"
                                onPress={() => setSignUpVisible(false)}
                                style={{ width: 260, backgroundColor: LIGHT_GOLDEN }}
                                labelStyle={{ color: 'black', fontWeight: 'bold' }}
                            >
                                Cancel
                            </Button>
                        </Modal>
                        <Modal visible={forgotVisible} onDismiss={() => setForgotVisible(false)} contentContainerStyle={styles.modal}>
                            <Text variant="titleMedium" style={{ marginBottom: 16, color: 'black' }}>Reset Password</Text>
                            <TextInput
                                label="Email"
                                value={forgotEmail}
                                onChangeText={setForgotEmail}
                                style={{ marginBottom: 12, width: 260, color: 'black', backgroundColor: 'white' }}
                                theme={{ colors: { text: 'black', background: 'white' } }}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            {forgotError && <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{forgotError}</Text>}
                            {forgotSuccess && <Text style={{ color: 'green', textAlign: 'center', marginBottom: 8 }}>{forgotSuccess}</Text>}
                            <Button
                                mode="contained"
                                onPress={handleForgotPassword}
                                style={{ marginBottom: 8, width: 260 }}
                                loading={forgotLoading}
                            >
                                Send Reset Email
                            </Button>
                            <Button
                                mode="text"
                                onPress={() => setForgotVisible(false)}
                                style={{ width: 260 }}
                            >
                                Cancel
                            </Button>
                        </Modal>
                    </Portal>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: 'black',
    },
    userInfo: {
        alignItems: 'center',
    },
    modal: {
        backgroundColor: 'white',
        margin: 24,
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
}); 