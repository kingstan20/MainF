"use client";

import { Post } from '@/lib/types';
import { PostCard } from './PostCard';

interface PostGridProps {
  posts: Post[];
}

export function PostGrid({ posts }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/20 bg-card p-12 text-center">
        <h2 className="text-xl font-medium">The feed is quiet...</h2>
        <p className="text-muted-foreground">Be the first to create a post!</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
