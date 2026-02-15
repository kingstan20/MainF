"use client";

import { PostGrid } from '@/components/feed/PostGrid';
import { useAppContext } from '@/contexts/AppContext';

export default function FeedPage() {
  const { posts } = useAppContext();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter">Community Feed</h1>
        <p className="text-muted-foreground">Latest updates from the HackMate community.</p>
      </div>
      <PostGrid posts={posts} />
    </div>
  );
}
