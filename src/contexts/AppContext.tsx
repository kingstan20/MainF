"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import {
  useFirebase,
  useFirestore,
  useUser,
  useCollection,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  useMemoFirebase,
} from '@/firebase';
import { User, Post, PostType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  // State
  users: User[];
  posts: Post[];
  currentUserProfile: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;

  // Auth Actions
  login: (email: string, password_plaintext: string) => Promise<void>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'privacy' | 'hackathonsAttended' | 'collaborations' | 'wins' | 'createdAt' | 'updatedAt'> & { password_plaintext: string }) => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;

  // Post Actions
  addPost: (postData: Omit<Post, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'updatedAt' | 'views' | 'reactions'>) => void;
  incrementView: (postId: string) => void;
  addReaction: (postId: string, reactionType: keyof Post['reactions']) => void;
  startChat: (postAuthorId: string) => Promise<string | null>;

  // Getters
  getUserById: (userId: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();
  const firestore = useFirestore();

  const { user: firebaseUser, isUserLoading: isAuthLoading } = useUser();

  const postsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'posts') : null, [firestore]);
  const { data: postsData, isLoading: isPostsLoading } = useCollection<Post>(
    postsQuery
  );
  
  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: usersData, isLoading: isUsersLoading } = useCollection<User>(
    usersQuery
  );

  const currentUserProfile = useMemo(() => {
    if (!firebaseUser || !usersData) return null;
    return usersData.find(u => u.id === firebaseUser.uid) || null;
  }, [firebaseUser, usersData]);

  const loading = isAuthLoading || isPostsLoading || isUsersLoading;

  const login = async (email: string, password_plaintext: string) => {
    if (!auth) return;
    try {
      await signInWithEmailAndPassword(auth, email, password_plaintext);
      toast({ title: "Login Successful", description: "Redirecting to your feed..." });
      router.push('/feed');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    }
  };

  const logout = async () => {
    if (!auth) return;
    await auth.signOut();
    router.push('/');
  };

  const register = async (userData: Omit<User, 'id' | 'privacy' | 'hackathonsAttended' | 'collaborations' | 'wins' | 'createdAt' | 'updatedAt'> & { password_plaintext: string }) => {
    if (!auth || !firestore) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password_plaintext);
      const user = userCredential.user;
      if (user) {
        const newUserProfile: Omit<User, 'id'> = {
          name: userData.name,
          email: userData.email,
          github: userData.github,
          privacy: 'public',
          hackathonsAttended: [],
          collaborations: 0,
          wins: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        await setDoc(doc(firestore, "users", user.uid), newUserProfile);
        toast({ title: "Registration Successful", description: "Welcome to HackMate!" });
        router.push('/feed');
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: error.message });
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!currentUserProfile || !firestore) return;
    const userRef = doc(firestore, 'users', currentUserProfile.id);
    updateDocumentNonBlocking(userRef, { ...updatedData, updatedAt: serverTimestamp() });
  };
  
  const addPost = (postData: Omit<Post, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'updatedAt' | 'views' | 'reactions'>) => {
    if(!currentUserProfile || !firestore) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to post." });
        return;
    }
    const postsCollection = collection(firestore, 'posts');
    const newPost = {
        ...postData,
        authorId: currentUserProfile.id,
        authorName: currentUserProfile.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        reactions: { chat: 0, congrats: 0, bestOfLuck: 0 },
    };
    addDocumentNonBlocking(postsCollection, newPost);
  };

  const incrementView = useCallback((postId: string) => {
    if (!firestore) return;
    // This is more complex with Firestore to avoid spamming updates.
    // For now, we'll keep it simple and update. A better solution would use server-side logic.
    const postRef = doc(firestore, 'posts', postId);
    // A more complex implementation is needed here to avoid race conditions and spamming.
    // We will skip a direct implementation here to keep it simple for now.
  }, [firestore]);
  
  const addReaction = (postId: string, reactionType: keyof Post['reactions']) => {
    if (!postsData || !firestore) return;
    const post = postsData.find(p => p.id === postId);
    if (!post) return;
    const postRef = doc(firestore, 'posts', postId);
    const newReactionCount = (post.reactions[reactionType] || 0) + 1;
    updateDocumentNonBlocking(postRef, {
      [`reactions.${reactionType}`]: newReactionCount
    });
  };

  const startChat = async (postAuthorId: string): Promise<string | null> => {
    if (!firebaseUser || !firestore) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to start a chat." });
      return null;
    }
    if (firebaseUser.uid === postAuthorId) {
        toast({ title: "Let's not talk to ourselves", description: "You can't start a chat about your own post." });
        return null;
    }

    const chatsRef = collection(firestore, 'chats');
    const q = query(chatsRef, where(`members.${firebaseUser.uid}`, '==', true), where(`members.${postAuthorId}`, '==', true));
    
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Chat already exists
        const chatId = querySnapshot.docs[0].id;
        router.push(`/chats/${chatId}`);
        return chatId;
      } else {
        // Create new chat
        const newChat = {
          members: {
            [firebaseUser.uid]: true,
            [postAuthorId]: true,
          },
          participantIds: [firebaseUser.uid, postAuthorId],
          lastMessage: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        const docRef = await addDoc(chatsRef, newChat);
        router.push(`/chats/${docRef.id}`);
        return docRef.id;
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({ variant: "destructive", title: "Chat Error", description: "Could not start a new chat." });
      return null;
    }
  };

  const getUserById = (userId: string) => usersData?.find(u => u.id === userId);

  const value = {
    users: usersData || [],
    posts: postsData || [],
    currentUserProfile,
    firebaseUser,
    isAuthenticated: !!firebaseUser,
    loading,
    login,
    logout,
    register,
    updateUser,
    addPost,
    incrementView,
    addReaction,
    getUserById,
    startChat
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
