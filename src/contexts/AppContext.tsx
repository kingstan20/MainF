"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { User, Post, PostType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { seedUsers, seedPosts } from '@/lib/seed';

interface AppContextType {
  users: User[];
  posts: Post[];
  currentUserProfile: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password_plaintext: string) => Promise<void>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'privacy' | 'hackathonsAttended' | 'collaborations' | 'wins' | 'skills'>) => Promise<void>;
  updateUser: (userId: string, updatedData: Partial<User>) => void;
  addPost: (postData: Omit<Post, 'id' | 'authorId' | 'authorName' | 'authorAvatarUrl' | 'createdAt' | 'views' | 'reactions'>) => void;
  incrementView: (postId: string) => void;
  addReaction: (postId: string, reactionType: keyof Post['reactions']) => void;
  startChat: (email: string, name: string) => void;
  getUserById: (userId: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useLocalStorage<User[]>('hackmate_users', seedUsers);
  const [posts, setPosts] = useLocalStorage<Post[]>('hackmate_posts', seedPosts);
  const [currentUserProfile, setCurrentUserProfile] = useLocalStorage<User | null>('hackmate_currentUser', null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password_plaintext: string) => {
    const user = users.find(u => u.email === email && u.password_plaintext === password_plaintext);
    if (user) {
      setCurrentUserProfile(user);
      toast({ title: "Login Successful", description: "Redirecting to your feed..." });
      router.push('/feed');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password.",
      });
    }
  };

  const logout = () => {
    setCurrentUserProfile(null);
    router.push('/');
  };

  const register = async (userData: Omit<User, 'id' | 'privacy' | 'hackathonsAttended' | 'collaborations' | 'wins' | 'skills'>) => {
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      toast({ variant: "destructive", title: "Registration Failed", description: "An account with this email already exists." });
      return;
    }

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      privacy: 'public',
      hackathonsAttended: [],
      collaborations: 0,
      wins: 0,
      skills: [],
    };
    
    setUsers(prevUsers => [...prevUsers, newUser]);
    setCurrentUserProfile(newUser);
    toast({ title: "Registration Successful", description: "Welcome to HackMate!" });
    router.push('/feed');
  };
  
  const updateUser = (userId: string, updatedData: Partial<User>) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, ...updatedData } : user
      )
    );
    if(currentUserProfile?.id === userId){
      setCurrentUserProfile(prev => prev ? {...prev, ...updatedData} : null)
    }
  };
  
  const addPost = (postData: Omit<Post, 'id' | 'authorId' | 'authorName' | 'authorAvatarUrl' | 'createdAt' | 'views' | 'reactions'>) => {
    if(!currentUserProfile) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to post." });
        return;
    }
    const newPost: Post = {
        ...postData,
        id: `post_${Date.now()}`,
        authorId: currentUserProfile.id,
        authorName: currentUserProfile.name,
        authorAvatarUrl: currentUserProfile.avatarUrl,
        createdAt: new Date().toISOString(),
        views: 0,
        reactions: { chat: 0, congrats: 0, bestOfLuck: 0 },
    } as Post;
    
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const incrementView = useCallback((postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(p => p.id === postId ? { ...p, views: p.views + 1 } : p)
    );
  }, [setPosts]);
  
  const addReaction = (postId: string, reactionType: keyof Post['reactions']) => {
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId
          ? {
              ...p,
              reactions: {
                ...p.reactions,
                [reactionType]: (p.reactions[reactionType] || 0) + 1,
              },
            }
          : p
      )
    );
  };

  const startChat = (email: string, name: string) => {
    window.location.href = `mailto:${email}?subject=HackMate Chat with ${name}`;
  };

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  const value = {
    users,
    posts,
    currentUserProfile,
    isAuthenticated: !!currentUserProfile,
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
