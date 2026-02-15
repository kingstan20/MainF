"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { User, Post } from '@/lib/types';
import { seedUsers, seedPosts } from '@/lib/seed';
import { useToast } from '@/hooks/use-toast';

type Theme = 'light' | 'dark';

interface AppContextType {
  // State
  users: User[];
  posts: Post[];
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  theme: Theme;

  // Auth Actions
  login: (email: string, password_plaintext: string) => boolean;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'privacy' | 'hackathonsAttended' | 'collaborations' | 'wins'>) => boolean;
  updateUser: (updatedData: Partial<User>) => void;

  // Post Actions
  addPost: (postData: Omit<Post, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'views' | 'reactions'>) => void;
  incrementView: (postId: string) => void;
  addReaction: (postId: string, reaction: 'chat' | 'congrats' | 'bestOfLuck') => void;

  // Getters
  getUserById: (userId: string) => User | undefined;

  // Theme
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useLocalStorage<User[]>('hackmate-users', []);
  const [posts, setPosts] = useLocalStorage<Post[]>('hackmate-posts', []);
  const [sessionId, setSessionId] = useLocalStorage<string | null>('hackmate-session', null);
  const [theme, setTheme] = useLocalStorage<Theme>('hackmate-theme', 'dark');
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Seed data on first load
    const isSeeded = localStorage.getItem('hackmate-seeded');
    if (!isSeeded) {
      setUsers(seedUsers);
      setPosts(seedPosts);
      localStorage.setItem('hackmate-seeded', 'true');
    }
  }, [setUsers, setPosts]);

  useEffect(() => {
    if (sessionId) {
      const user = users.find(u => u.id === sessionId);
      setCurrentUser(user || null);
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  }, [sessionId, users]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);
  
  const login = (email: string, password_plaintext: string): boolean => {
    const user = users.find(u => u.email === email && u.password_plaintext === password_plaintext);
    if (user) {
      setSessionId(user.id);
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setSessionId(null);
    setCurrentUser(null);
    router.push('/');
  };

  const register = (userData: Omit<User, 'id' | 'privacy' | 'hackathonsAttended' | 'collaborations' | 'wins'>): boolean => {
    if (users.some(u => u.email === userData.email)) {
      return false; // User already exists
    }
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      privacy: 'public',
      hackathonsAttended: [],
      collaborations: 0,
      wins: 0,
    };
    setUsers(prev => [...prev, newUser]);
    setSessionId(newUser.id);
    setCurrentUser(newUser);
    return true;
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
  };
  
  const addPost = (postData: Omit<Post, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'views' | 'reactions'>) => {
    if(!currentUser) {
        toast({ title: "Error", description: "You must be logged in to post." });
        return;
    }
    const newPost = {
        ...postData,
        id: `post_${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        createdAt: new Date().toISOString(),
        views: 0,
        reactions: { chat: 0, congrats: 0, bestOfLuck: 0 },
    } as Post;
    setPosts(prev => [newPost, ...prev]);
  };

  const incrementView = useCallback((postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, views: (p.views || 0) + 1 } : p));
  }, [setPosts]);
  
  const addReaction = (postId: string, reaction: 'chat' | 'congrats' | 'bestOfLuck') => {
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            return {
                ...p,
                reactions: {
                    ...p.reactions,
                    [reaction]: (p.reactions[reaction] || 0) + 1,
                }
            }
        }
        return p;
    }));
  };

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const value = {
    users,
    posts,
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    theme,
    login,
    logout,
    register,
    updateUser,
    addPost,
    incrementView,
    addReaction,
    getUserById,
    toggleTheme,
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
