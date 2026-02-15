"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitHub, Mail, User, Award, Users, CalendarDays, Loader2 } from "lucide-react";
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
import { useState } from "react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  github: z.string().min(1, "GitHub username is required."),
});

const EditProfileDialog = () => {
  const { currentUser, updateUser } = useAppContext();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || "",
      github: currentUser?.github || "",
    },
  });

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateUser(values);
    toast({ title: "Profile Updated", description: "Your changes have been saved." });
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
          <DialogDescription>Update your name and GitHub username.</DialogDescription>
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
  const { currentUser, posts } = useAppContext();

  if (!currentUser) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }

  const userPosts = posts.filter(p => p.authorId === currentUser.id);

  const stats = [
    { name: "Hackathons", value: currentUser.hackathonsAttended.length, icon: CalendarDays },
    { name: "Collaborations", value: currentUser.collaborations, icon: Users },
    { name: "Wins", value: currentUser.wins, icon: Award },
  ];

  return (
    <div className="space-y-8">
      <Card className="glowing-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                {currentUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl font-bold">{currentUser.name}</h1>
              <p className="text-sm text-muted-foreground">User ID: {currentUser.id}</p>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {currentUser.email}</span>
                <a href={`https://github.com/${currentUser.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary"><GitHub className="h-4 w-4" /> {currentUser.github}</a>
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

      <div>
        <h2 className="text-2xl font-bold tracking-tighter mb-4">My Posts</h2>
        <Separator className="mb-6"/>
        <PostGrid posts={userPosts} />
      </div>

    </div>
  );
}
