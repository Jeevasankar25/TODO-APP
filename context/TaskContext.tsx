import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
} from 'firebase/firestore';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export type Task = {
    id: string;
    title: string;
    description?: string;
    status: 'open' | 'complete';
    timer?: number; // in seconds
    timerStart?: number; // timestamp (ms)
};

type TaskContextType = {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id'>) => void;
    updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
    deleteTask: (id: string) => void;
    toggleTaskStatus: (id: string) => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);

    // Firestore collection path for this user
    const getUserTasksCollection = useCallback(() => {
        if (!user?.email) return null;
        return collection(db, 'tasks', user.email, 'items');
    }, [user]);

    // Real-time sync
    useEffect(() => {
        const colRef = getUserTasksCollection();
        if (!colRef) {
            setTasks([]);
            return;
        }
        const q = query(colRef, orderBy('title'));
        const unsub = onSnapshot(q, (snapshot) => {
            setTasks(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task))
            );
        });
        return () => unsub();
    }, [getUserTasksCollection]);

    const addTask = async (task: Omit<Task, 'id'>) => {
        const colRef = getUserTasksCollection();
        if (!colRef) return;
        await addDoc(colRef, task);
    };

    const updateTask = async (id: string, updates: Partial<Omit<Task, 'id'>>) => {
        const colRef = getUserTasksCollection();
        if (!colRef) return;
        const docRef = doc(colRef, id);
        await updateDoc(docRef, updates);
    };

    const deleteTask = async (id: string) => {
        const colRef = getUserTasksCollection();
        if (!colRef) return;
        const docRef = doc(colRef, id);
        await deleteDoc(docRef);
    };

    const toggleTaskStatus = async (id: string) => {
        const task = tasks.find((t) => t.id === id);
        if (!task) return;
        await updateTask(id, {
            status: task.status === 'open' ? 'complete' : 'open',
        });
    };

    return (
        <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, toggleTaskStatus }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error('useTasks must be used within a TaskProvider');
    return context;
}; 