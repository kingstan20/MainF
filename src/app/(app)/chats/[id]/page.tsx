// src/app/(app)/chats/[id]/page.tsx
'use client';

import { ChatView } from '@/components/chat/ChatView';
import { useParams } from 'next/navigation';

export default function SingleChatPage() {
  const params = useParams();
  const chatId = params.id as string;

  return <ChatView chatId={chatId} />;
}
