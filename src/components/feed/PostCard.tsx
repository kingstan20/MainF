"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Post, HackathonPost, TeammatePost, CollaborationPost, FamePost } from '@/lib/types';
import { Button } from '../ui/button';
import { Icons, PostTypeIcon } from '../Icons';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAppContext } from '@/contexts/AppContext';
import { Eye, MapPin, Users, Lightbulb, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect } from 'react';

const PostCardHeader = ({ post }: { post: Post }) => {
  const { getUserById } = useAppContext();
  const author = getUserById(post.authorId);
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/50">
                <AvatarFallback className="bg-primary/20 text-primary">
                {post.authorName.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <div>
                <CardTitle className="text-base">{post.authorName}</CardTitle>
                <CardDescription suppressHydrationWarning>{timeAgo}</CardDescription>
            </div>
        </div>
        <PostTypeIcon type={post.type} className="h-6 w-6 text-primary" />
      </div>
    </CardHeader>
  );
};

const PostCardFooter = ({ post }: { post: Post }) => {
  const { addReaction } = useAppContext();
  
  return (
    <CardFooter className="flex-col items-start gap-4">
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{post.views} views</span>
            </div>
        </div>
        <div className="flex w-full flex-wrap items-center justify-start gap-2">
            <Button variant="outline" size="sm" onClick={() => addReaction(post.id, 'chat')}>
                <Icons.chat className="mr-2 h-4 w-4" /> Chat ({post.reactions.chat})
            </Button>
            <Button variant="outline" size="sm" onClick={() => addReaction(post.id, 'congrats')}>
                <Icons.congrats className="mr-2 h-4 w-4" /> Congrats ({post.reactions.congrats})
            </Button>
            <Button variant="outline" size="sm" onClick={() => addReaction(post.id, 'bestOfLuck')}>
                <Icons.bestOfLuck className="mr-2 h-4 w-4" /> Luck ({post.reactions.bestOfLuck})
            </Button>
      </div>
    </CardFooter>
  );
};

const HackathonCard = ({ post }: { post: HackathonPost }) => (
  <>
    <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary"/><span>{post.venue}</span></div>
        <div suppressHydrationWarning className="flex items-center gap-2 text-sm text-muted-foreground">📅 {new Date(post.date).toLocaleDateString()}</div>
        <p className="pt-2">{post.description}</p>
    </CardContent>
    <PostCardFooter post={post} />
  </>
);

const TeammateCard = ({ post }: { post: TeammatePost }) => (
  <>
    <CardContent className="space-y-2">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary"/><span>{post.venue}</span></div>
          <Badge variant="secondary">{post.currentTeam}/{post.requiredTeam} Members</Badge>
      </div>
      <div suppressHydrationWarning className="flex items-center gap-2 text-sm text-muted-foreground">📅 {new Date(post.date).toLocaleDateString()}</div>
      <p className="pt-2">{post.description}</p>
    </CardContent>
    <PostCardFooter post={post} />
  </>
);

const CollaborationCard = ({ post }: { post: CollaborationPost }) => (
  <>
    <CardContent className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Lightbulb className="h-4 w-4 text-primary" /> Project Idea</div>
        <p className="font-semibold">{post.idea}</p>
      </div>
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">🛠 Skills Required</div>
        <div className="flex flex-wrap gap-2 pt-2">
          {post.skills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4 text-primary" /> Team</div>
        <p>{post.description}</p>
      </div>
    </CardContent>
    <PostCardFooter post={post} />
  </>
);

const FameCard = ({ post }: { post: FamePost }) => (
    <>
    <CardContent className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-3">
        <Trophy className="h-8 w-8 text-primary" />
        <div>
          <p className="font-bold text-lg text-primary">{post.achievement}</p>
          <p suppressHydrationWarning className="text-sm text-muted-foreground">{post.venue} - {new Date(post.date).toLocaleDateString()}</p>
        </div>
      </div>
      <div>
          <div className="text-sm text-muted-foreground">🏆 Team</div>
          <p className="font-medium">{post.teamMembers.join(', ')}</p>
      </div>
      <p>{post.description}</p>
    </CardContent>
    <PostCardFooter post={post} />
    </>
);

export function PostCard({ post }: { post: Post }) {
  const { incrementView } = useAppContext();

  useEffect(() => {
    const timeout = setTimeout(() => {
      incrementView(post.id);
    }, 1000); // Increment view after 1 second of visibility
    return () => clearTimeout(timeout);
  }, [post.id, incrementView]);


  const renderCardContent = () => {
    switch (post.type) {
      case 'HACKATHON':
        return <HackathonCard post={post as HackathonPost} />;
      case 'TEAMMATE':
        return <TeammateCard post={post as TeammatePost} />;
      case 'COLLABORATION':
        return <CollaborationCard post={post as CollaborationPost} />;
      case 'FAME':
        return <FameCard post={post as FamePost} />;
      default:
        return null;
    }
  };

  return (
    <Card className="flex flex-col justify-between glowing-border glowing-border-hover">
        <div>
            <PostCardHeader post={post} />
            {renderCardContent()}
        </div>
    </Card>
  );
}
