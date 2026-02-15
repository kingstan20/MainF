"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
});

export default function SettingsPage() {
  const { currentUser, updateUser, theme, toggleTheme } = useAppContext();
  const { toast } = useToast();

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    if (values.currentPassword !== currentUser?.password_plaintext) {
      toast({ variant: "destructive", title: "Error", description: "Incorrect current password." });
      return;
    }
    updateUser({ password_plaintext: values.newPassword });
    toast({ title: "Password Updated", description: "Your password has been changed successfully." });
    passwordForm.reset();
  };
  
  const handlePrivacyToggle = (isPrivate: boolean) => {
    updateUser({ privacy: isPrivate ? 'private' : 'public' });
    toast({ title: "Privacy Updated", description: `Your profile is now ${isPrivate ? 'private' : 'public'}.` });
  };

  if (!currentUser) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card className="glowing-border">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password here. Make sure it's secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-sm">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Update Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
       <Card className="glowing-border">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize the look and feel of HackMate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-muted-foreground">Toggle the cyber-themed dark interface.</p>
                </div>
                <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                    aria-label="Toggle dark mode"
                />
            </div>
             <Separator />
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium">Private Profile</h3>
                    <p className="text-sm text-muted-foreground">If enabled, your profile will be hidden from others.</p>
                </div>
                <Switch
                    checked={currentUser.privacy === 'private'}
                    onCheckedChange={handlePrivacyToggle}
                    aria-label="Toggle private profile"
                />
            </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Account Control</CardTitle>
          <CardDescription>Permanently delete your account and all associated data.</CardDescription>
        </CardHeader>
        <CardContent>
           <Button variant="destructive" onClick={() => toast({variant: "destructive", title: "Feature Not Implemented", description: "This is a demo application."})}>Delete Account</Button>
        </CardContent>
      </Card>

    </div>
  );
}
