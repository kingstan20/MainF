"use client";

import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '../ui/button';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { PostType } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const hackathonSchema = z.object({
  venue: z.string().min(1, 'Venue is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
});

const teammateSchema = z.object({
    venue: z.string().min(1, 'Venue is required'),
    date: z.string().min(1, 'Date is required'),
    currentTeam: z.coerce.number().min(1, 'Must have at least 1 member'),
    requiredTeam: z.coerce.number().min(2, 'Must require at least 2 members'),
    description: z.string().min(1, 'Description is required'),
}).refine(data => data.currentTeam < data.requiredTeam, {
    message: "Current team must be less than required team",
    path: ["requiredTeam"],
});

const collaborationSchema = z.object({
    idea: z.string().min(1, 'Project idea is required'),
    skills: z.string().min(1, 'At least one skill is required'),
    teamCount: z.coerce.number().min(1, 'Team count is required'),
    description: z.string().min(1, 'Description is required'),
});

const fameSchema = z.object({
    venue: z.string().min(1, 'Venue is required'),
    date: z.string().min(1, 'Date is required'),
    achievement: z.string().min(1, 'Achievement is required'),
    teamMembers: z.string().min(1, 'At least one team member is required'),
    description: z.string().min(1, 'Description is required'),
});


const PostForm = ({ type, setOpen }: { type: PostType, setOpen: (open: boolean) => void }) => {
    const { addPost } = useAppContext();
    const { toast } = useToast();
    
    let schema: z.ZodObject<any>;
    let defaultValues: Record<string, any> = {};

    switch (type) {
        case 'HACKATHON': 
            schema = hackathonSchema;
            defaultValues = { venue: '', date: '', description: '' };
            break;
        case 'TEAMMATE': 
            schema = teammateSchema;
            defaultValues = { venue: '', date: '', currentTeam: 1, requiredTeam: 2, description: '' };
            break;
        case 'COLLABORATION': 
            schema = collaborationSchema;
            defaultValues = { idea: '', skills: '', teamCount: 1, description: '' };
            break;
        case 'FAME': 
            schema = fameSchema;
            defaultValues = { venue: '', date: '', achievement: '', teamMembers: '', description: '' };
            break;
    }
    
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues,
    });

    const onSubmit = (data: any) => {
        let postData;
        switch(type) {
            case 'HACKATHON': postData = { type, ...data }; break;
            case 'TEAMMATE': postData = { type, ...data }; break;
            case 'COLLABORATION': postData = { type, ...data, skills: data.skills.split(',').map((s: string) => s.trim()) }; break;
            case 'FAME': postData = { type, ...data, teamMembers: data.teamMembers.split(',').map((s: string) => s.trim()) }; break;
        }

        addPost(postData);
        toast({ title: "Post Created!", description: "Your post is now live on the feed." });
        form.reset();
        setOpen(false);
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {type === 'HACKATHON' && <>
                    <FormField control={form.control} name="venue" render={({ field }) => (<FormItem><FormLabel>Venue</FormLabel><FormControl><Input placeholder="e.g., Online" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Tell us about the hackathon" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </>}
                {type === 'TEAMMATE' && <>
                    <FormField control={form.control} name="venue" render={({ field }) => (<FormItem><FormLabel>Venue</FormLabel><FormControl><Input placeholder="e.g., Cyberia Hackathon" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="currentTeam" render={({ field }) => (<FormItem><FormLabel>Current Team</FormLabel><FormControl><Input type="number" placeholder="2" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="requiredTeam" render={({ field }) => (<FormItem><FormLabel>Required Team</FormLabel><FormControl><Input type="number" placeholder="5" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="What are you looking for?" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </>}
                {type === 'COLLABORATION' && <>
                    <FormField control={form.control} name="idea" render={({ field }) => (<FormItem><FormLabel>Project Idea / Field</FormLabel><FormControl><Input placeholder="e.g., AI-powered note taking app" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="skills" render={({ field }) => (<FormItem><FormLabel>Skills Required (comma-separated)</FormLabel><FormControl><Input placeholder="React, Node.js, Python" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="teamCount" render={({ field }) => (<FormItem><FormLabel>Current Team Count</FormLabel><FormControl><Input type="number" placeholder="1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your project and ideal collaborator" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </>}
                 {type === 'FAME' && <>
                    <FormField control={form.control} name="venue" render={({ field }) => (<FormItem><FormLabel>Hackathon Venue/Name</FormLabel><FormControl><Input placeholder="e.g., Mega-City Hack 2024" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="achievement" render={({ field }) => (<FormItem><FormLabel>Achievement</FormLabel><FormControl><Input placeholder="1st Place, Funniest Loss, etc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="teamMembers" render={({ field }) => (<FormItem><FormLabel>Team Members (comma-separated)</FormLabel><FormControl><Input placeholder="Neo, Trinity, Morpheus" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Share your winning story!" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </>}
                <DialogFooter className="pt-4">
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Post
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
};

export function CreatePostModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
          <DialogDescription>
            Share an update with the community. Choose the post type that fits best.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="hackathon" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="hackathon">Hackathon</TabsTrigger>
            <TabsTrigger value="teammate">Team Up</TabsTrigger>
            <TabsTrigger value="collaboration">Project</TabsTrigger>
            <TabsTrigger value="fame">Hall of Fame</TabsTrigger>
          </TabsList>
          <TabsContent value="hackathon"><PostForm type="HACKATHON" setOpen={setOpen} /></TabsContent>
          <TabsContent value="teammate"><PostForm type="TEAMMATE" setOpen={setOpen} /></TabsContent>
          <TabsContent value="collaboration"><PostForm type="COLLABORATION" setOpen={setOpen} /></TabsContent>
          <TabsContent value="fame"><PostForm type="FAME" setOpen={setOpen} /></TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
