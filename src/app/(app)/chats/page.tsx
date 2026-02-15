// src/app/(app)/chats/page.tsx
'use client';

import { ChatList } from '@/components/chat/ChatList';

export default function ChatsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter">My Chats</h1>
        <p className="text-muted-foreground">Your recent conversations.</p>
      </div>
      <ChatList />
    </div>
  );
}
