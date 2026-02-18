"use client";

import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppContext } from "@/contexts/AppContext";
import { HackathonPost } from "@/lib/types";
import { format, isSameDay } from "date-fns";

export default function CalendarPage() {
  const { currentUserProfile, posts } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const likedHackathonPosts = (currentUserProfile?.likedPostIds || [])
    .map(postId => posts.find(p => p.id === postId))
    .filter((p): p is HackathonPost => !!p && p.type === 'HACKATHON');

  const eventDates = likedHackathonPosts.map(p => new Date(p.date));

  const eventsForSelectedDate = selectedDate
    ? likedHackathonPosts.filter(p => isSameDay(new Date(p.date), selectedDate))
    : [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">My Calendar</h1>
        <p className="text-muted-foreground">Upcoming hackathons you've saved.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="md:col-span-1">
          <Card className="glowing-border p-0 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{ event: eventDates }}
                modifiersClassNames={{
                  event: 'event-day',
                }}
                className="p-4"
              />
          </Card>
        </div>
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">
            Events for {selectedDate ? format(selectedDate, "PPP") : "..."}
          </h2>
          {eventsForSelectedDate.length > 0 ? (
            <div className="space-y-4">
              {eventsForSelectedDate.map(post => (
                <Card key={post.id} className="glowing-border-hover">
                  <CardHeader>
                    <CardTitle>{post.venue}</CardTitle>
                    <CardDescription suppressHydrationWarning>
                      {new Date(post.date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{post.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/20 bg-card p-12 text-center">
                <h2 className="text-xl font-medium">No Saved Events</h2>
                <p className="text-muted-foreground">You have no saved hackathons for this day.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
