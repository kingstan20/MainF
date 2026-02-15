// src/components/chat/ChatView.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { collection, query, orderBy, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';
import { Chat, Message } from '@/lib/types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/contexts/AppContext';

export function ChatView({ chatId }: { chatId: string }) {
  const { user: firebaseUser } = useUser();
  const firestore = useFirestore();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { users } = useAppContext();

  const chatRef = useMemoFirebase(() => doc(firestore, 'chats', chatId), [firestore, chatId]);
  const { data: chat, isLoading: isChatLoading } = useDoc<Chat>(chatRef);
  
  const messagesQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
  }, [firestore, chatId]);
  
  const { data: messages, isLoading: areMessagesLoading } = useCollection<Message>(messagesQuery);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !firebaseUser || !chat) return;

    const messagesCol = collection(firestore, 'chats', chatId, 'messages');
    const senderName = users.find(u => u.id === firebaseUser.uid)?.name || 'Unknown';

    addDocumentNonBlocking(messagesCol, {
      senderId: firebaseUser.uid,
      content: newMessage.trim(),
      createdAt: serverTimestamp(),
      senderName,
    });
    
    updateDocumentNonBlocking(chatRef, {
        lastMessage: newMessage.trim(),
        updatedAt: serverTimestamp(),
    });

    setNewMessage('');
  };
  
  if (isChatLoading || areMessagesLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!chat) {
    return <div className="text-center text-muted-foreground p-8">Chat not found.</div>;
  }
  
  const getOtherParticipant = () => {
    if (!chat) return null;
    const otherId = chat.participantIds.find(id => id !== firebaseUser?.uid);
    return users.find(u => u.id === otherId);
  };
  const otherUser = getOtherParticipant();


  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col glowing-border">
      <CardHeader>
        <CardTitle className="text-primary">{otherUser?.name || 'Chat'}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-4 p-4">
        {messages?.map(message => {
          const isCurrentUser = message.senderId === firebaseUser?.uid;
          const messageDate = message.createdAt ? (message.createdAt as Timestamp).toDate() : new Date();

          return (
            <div key={message.id} className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
              {!isCurrentUser && (
                <Avatar className="h-8 w-8 border-2 border-primary/50">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {message.senderName.charAt(0)}
                    </AvatarFallback>
                </Avatar>
              )}
              <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-card")}>
                <p className="text-sm">{message.content}</p>
                <p className={cn("text-xs mt-1", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
