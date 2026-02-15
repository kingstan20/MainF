export interface User {
  id: string;
  name: string;
  email: string;
  github: string;
  password_plaintext?: string;
  avatarUrl?: string;
  privacy: 'public' | 'private';
  hackathonsAttended: string[];
  collaborations: number;
  wins: number;
}

export type PostType = 'HACKATHON' | 'TEAMMATE' | 'COLLABORATION' | 'FAME';

export interface BasePost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  type: PostType;
  description: string;
  createdAt: string;
  views: number;
  reactions: {
    chat: number;
    congrats: number;
    bestOfLuck: number;
  };
}

export interface HackathonPost extends BasePost {
  type: 'HACKATHON';
  venue: string;
  date: string;
}

export interface TeammatePost extends BasePost {
  type: 'TEAMMATE';
  venue: string;
  date: string;
  currentTeam: number;
  requiredTeam: number;
}

export interface CollaborationPost extends BasePost {
  type: 'COLLABORATION';
  idea: string;
  skills: string[];
  teamCount: number;
}

export interface FamePost extends BasePost {
  type: 'FAME';
  venue: string;
  date: string;
  achievement: string;
  teamMembers: string[];
}

export type Post = HackathonPost | TeammatePost | CollaborationPost | FamePost;

export interface Chat {
    id: string;
    participantIds: string[];
    members: { [key: string]: boolean };
    createdAt: string;
    updatedAt: string;
    lastMessage?: string;
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    createdAt: string;
    senderName: string;
}
