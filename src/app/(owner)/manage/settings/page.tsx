
"use client";

import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, updateDoc } from "firebase/firestore";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

interface Restaurant {
  id: string;
  name: string;
  imageHint: string;
}

const restaurantSettingsSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  imageHint: z.string().min(1, "A hint for the cover image is required"),
});

export default function SettingsPage() {
  const { profile, loading: userLoading } = useUser();
  const restaurantId = profile?.restaurantId;
  const firestore = useFirestore();
  const { toast } = useToast();

  const restaurantRef = useMemo(() => {
    if (!firestore || !restaurantId) return null;
    return doc(firestore, "restaurants", restaurantId);
  }, [firestore, restaurantId]);

  const { data: restaurant, loading: restaurantLoading } = useDoc<Restaurant>(restaurantRef);

  const form = useForm<z.infer<typeof restaurantSettingsSchema>>({
    resolver: zodResolver(restaurantSettingsSchema),
    defaultValues: {
        name: "",
        imageHint: "",
    }
  });

  useEffect(() => {
    if (restaurant) {
      form.reset({
        name: restaurant.name || "",
        imageHint: restaurant.imageHint || "",
      });
    }
  }, [restaurant, form.reset]);


  const onSubmit = (values: z.infer<typeof restaurantSettingsSchema>) => {
    if (!restaurantRef) return;
    
    updateDoc(restaurantRef, values)
      .then(() => {
        toast({
          title: "Settings Saved",
          description: "Your restaurant details have been updated.",
        });
      })
      .catch((error: any) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not save settings.",
        });
        const permissionError = new FirestorePermissionError({
            path: restaurantRef.path,
            operation: 'update',
            requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  if (userLoading || restaurantLoading) {
    return (
        <div>
            <div className="flex items-center mb-6">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">
                    Settings
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <Skeleton className="h-10 w-24 mt-4" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <>
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">
                Settings
            </h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Restaurant Details</CardTitle>
                <CardDescription>
                Update your restaurant's name and cover image hint. This will change how your restaurant appears to customers.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Restaurant Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. The Pizza Place" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="imageHint"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cover Image Hint</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. cozy pizza restaurant" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                       
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </>
  );
}
