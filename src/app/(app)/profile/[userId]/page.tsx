"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Mail, Award, Users, CalendarDays, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PostGrid } from "@/components/feed/PostGrid";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export default function UserProfilePage() {
    const { getUserById, currentUserProfile, posts, startChat } = useAppContext();
    const params = useParams();
    const { replace } = useRouter();
    const userId = params.userId as string;

    const [user, setUser] = useState<User | null | undefined>(undefined);
    
    useEffect(() => {
        if (userId) {
            if (userId === currentUserProfile?.id) {
                replace('/profile');
                return;
            }
            const foundUser = getUserById(userId);
            setUser(foundUser || null);
        }
    }, [userId, getUserById, currentUserProfile, replace]);
    
    if (user === undefined) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>;
    }

    if (user === null) {
        return <div className="text-center p-8">User not found.</div>;
    }
    
    const userPosts = posts.filter(p => p.authorId === user.id);
    const isCurrentUser = user.id === currentUserProfile?.id;
    
    const stats = [
        { name: "Hackathons", value: user.hackathonsAttended.length, icon: CalendarDays },
        { name: "Collaborations", value: user.collaborations, icon: Users },
        { name: "Wins", value: user.wins, icon: Award },
    ];

    if (user.privacy === 'private' && !isCurrentUser) {
        return (
             <div className="mx-auto w-full max-w-4xl space-y-8 px-4">
                <Card className="glowing-border">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <Avatar className="h-24 w-24 border-4 border-primary">
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                    {user.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-grow text-center md:text-left">
                                <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
                                <p className="text-sm text-muted-foreground">This profile is private.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-8 px-4">
            <Card className="glowing-border">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-primary">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                {user.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow text-center md:text-left">
                            <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
                            <p className="text-sm text-muted-foreground">User ID: {user.id}</p>
                            <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {user.email}</span>
                                <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary"><Github className="h-4 w-4" /> {user.github}</a>
                            </div>
                        </div>
                        {!isCurrentUser && (
                            <Button onClick={() => startChat(user.email, user.name)}>Chat with {user.name}</Button>
                        )}
                    </div>
                </CardContent>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-3">
                {stats.map(stat => (
                    <Card key={stat.name} className="glowing-border-hover">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {user.skills && user.skills.length > 0 && (
                <Card className="glowing-border-hover">
                    <CardHeader>
                        <CardTitle className="text-lg">Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {user.skills.map(skill => (
                                <Badge key={skill} variant="secondary">{skill}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div>
                <h2 className="text-2xl font-bold tracking-tighter mb-4">{`${user.name}'s Posts`}</h2>
                <Separator className="mb-6"/>
                <PostGrid posts={userPosts} />
            </div>
        </div>
    );
}
