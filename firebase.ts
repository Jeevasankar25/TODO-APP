// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD7QGztQwFyfdX9kD1qcm6OU1HYBw0m0v8",
    authDomain: "todo-app-525b6.firebaseapp.com",
    projectId: "todo-app-525b6",
    storageBucket: "todo-app-525b6.appspot.com",
    messagingSenderId: "717206664035",
    appId: "1:717206664035:web:2ce0ad7d1fbde70a255956",
    measurementId: "G-1RQLDHTH3B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };

