"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";


export default function SettingsPage() {
  const { currentUserProfile, updateUser } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const handlePrivacyToggle = (isPrivate: boolean) => {
    if (currentUserProfile) {
      updateUser(currentUserProfile.id, { privacy: isPrivate ? 'private' : 'public' });
      toast({ title: "Privacy Updated", description: `Your profile is now ${isPrivate ? 'private' : 'public'}.` });
    }
  };

  if (!currentUserProfile) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card className="glowing-border">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Password management is not implemented in this demo.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button disabled>Update Password</Button>
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
                    checked={currentUserProfile.privacy === 'private'}
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
