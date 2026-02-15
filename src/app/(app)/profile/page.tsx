"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Mail, Award, Users, CalendarDays, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PostGrid } from "@/components/feed/PostGrid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  github: z.string().min(1, "GitHub username is required."),
  avatarUrl: z.string().optional(),
  skills: z.string().optional(),
});

const EditProfileDialog = () => {
  const { currentUserProfile, updateUser } = useAppContext();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUserProfile?.name || "",
      github: currentUserProfile?.github || "",
      avatarUrl: currentUserProfile?.avatarUrl || "",
      skills: currentUserProfile?.skills?.join(', ') || "",
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 1024 * 1024) { // 1MB limit
            toast({ variant: "destructive", title: "Image too large", description: "Please upload an image smaller than 1MB." });
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            form.setValue('avatarUrl', reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    if (currentUserProfile) {
      const updatedData = {
          name: values.name,
          github: values.github,
          avatarUrl: values.avatarUrl,
          skills: values.skills ? values.skills.split(',').map(s => s.trim()) : [],
      };
      updateUser(currentUserProfile.id, updatedData);
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Edit Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your name, GitHub, and profile photo.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="github"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills (comma-separated)</FormLabel>
                  <FormControl><Input placeholder="React, Python, Java" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Profile Photo</FormLabel>
                    <FormControl>
                        <Input
                            type="file"
                            accept="image/png, image/jpeg, image/gif"
                            onChange={handleAvatarChange}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


export default function ProfilePage() {
  const { currentUserProfile, posts } = useAppContext();

  if (!currentUserProfile) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }

  const userPosts = posts.filter(p => p.authorId === currentUserProfile.id);

  const stats = [
    { name: "Hackathons", value: currentUserProfile.hackathonsAttended.length, icon: CalendarDays },
    { name: "Collaborations", value: currentUserProfile.collaborations, icon: Users },
    { name: "Wins", value: currentUserProfile.wins, icon: Award },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4">
      <Card className="glowing-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={currentUserProfile.avatarUrl} alt={currentUserProfile.name} />
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                {currentUserProfile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">{currentUserProfile.name}</h1>
              <p className="text-sm text-muted-foreground">User ID: {currentUserProfile.id}</p>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {currentUserProfile.email}</span>
                <a href={`https://github.com/${currentUserProfile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary"><Github className="h-4 w-4" /> {currentUserProfile.github}</a>
              </div>
            </div>
            <EditProfileDialog />
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

      {currentUserProfile.skills && currentUserProfile.skills.length > 0 && (
        <Card className="glowing-border-hover">
            <CardHeader>
                <CardTitle className="text-lg">Skills</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {currentUserProfile.skills.map(skill => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-2xl font-bold tracking-tighter mb-4">My Posts</h2>
        <Separator className="mb-6"/>
        <PostGrid posts={userPosts} />
      </div>

    </div>
  );
}
