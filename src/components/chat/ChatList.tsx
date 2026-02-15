// src/components/chat/ChatList.tsx
'use client';

import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Chat } from '@/lib/types';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useAppContext } from '@/contexts/AppContext';

export function ChatList() {
  const { user: firebaseUser } = useUser();
  const firestore = useFirestore();
  const { users } = useAppContext();

  const chatsQuery = useMemoFirebase(() => {
    if (!firebaseUser) return null;
    return query(collection(firestore, 'chats'), where(`members.${firebaseUser.uid}`, '==', true));
  }, [firestore, firebaseUser]);

  const { data: chats, isLoading } = useCollection<Chat>(chatsQuery);

  if (isLoading) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
        You have no active chats. Start a conversation from a post!
      </div>
    );
  }

  const getOtherParticipant = (chat: Chat) => {
    const otherId = chat.participantIds.find(id => id !== firebaseUser?.uid);
    return users.find(u => u.id === otherId);
  };

  return (
    <div className="space-y-4">
      {chats.map(chat => {
        const otherUser = getOtherParticipant(chat);
        const timeAgo = chat.updatedAt ? formatDistanceToNow(new Date((chat.updatedAt as Timestamp).toDate()), { addSuffix: true }) : 'a while ago';
        return (
          <Link key={chat.id} href={`/chats/${chat.id}`} passHref>
            <Card className="glowing-border-hover cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                 <Avatar className="h-12 w-12 border-2 border-primary/50">
                    <AvatarFallback className="bg-primary/20 text-primary">
                        {otherUser?.name.charAt(0) || '?'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <CardTitle>{otherUser?.name || 'Unknown User'}</CardTitle>
                    <CardDescription className="line-clamp-1">{chat.lastMessage || 'No messages yet...'}</CardDescription>
                </div>
                <div className="text-xs text-muted-foreground self-start">{timeAgo}</div>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
