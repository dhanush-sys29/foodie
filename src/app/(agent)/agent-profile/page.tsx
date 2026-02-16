
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user, profile, loading } = useUser();

  if (loading || !user || !profile) {
    return (
        <div className="p-4 lg:p-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="items-center text-center">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-7 w-48 mt-4" />
                    <Skeleton className="h-5 w-56 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="p-4 lg:p-6">
        <Card className="max-w-2xl mx-auto animate-in fade-in duration-500">
            <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`} />
                  <AvatarFallback className="text-3xl">{profile.email.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl pt-2">{user.displayName || 'Delivery Agent'}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center">
                     <Badge capitalize>{profile.role}</Badge>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
