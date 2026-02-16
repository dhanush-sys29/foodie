"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  imageUrl: string;
  imageHint: string;
}

export default function Dashboard() {
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState("");

  const restaurantsCollection = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, "restaurants");
  }, [firestore]);

  const { data: restaurants, loading } = useCollection<Restaurant>(
    restaurantsCollection
  );
  
  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];
    if (!searchQuery) return restaurants;
    return restaurants.filter(restaurant => {
        const query = searchQuery.toLowerCase();
        const nameMatch = restaurant.name && restaurant.name.toLowerCase().includes(query);
        const cuisineMatch = restaurant.cuisine && restaurant.cuisine.toLowerCase().includes(query);
        return nameMatch || cuisineMatch;
    });
  }, [restaurants, searchQuery]);


  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
            Restaurants Near You
            </h1>
            <div className="relative">
                <Skeleton className="h-10 w-[300px]" />
            </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-6 w-16" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pageTitle = "Restaurants Near You";

  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                {pageTitle}
            </h1>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by name or cuisine..."
                    className="pl-8 sm:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
       </div>

      {filteredRestaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center bg-background p-10 rounded-lg border-2 border-dashed mt-4">
            <p className="text-lg font-semibold text-muted-foreground">
                {searchQuery ? "No restaurants found." : "No restaurants available."}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
                {searchQuery ? "Try searching for something else." : "Check back later for new restaurants in your area."}
            </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRestaurants.map((restaurant) => (
            <Link href={`/restaurants/${restaurant.id}`} key={restaurant.id}>
                <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
                <CardHeader className="p-0">
                    <div className="relative h-48 w-full">
                    <Image
                        src={`https://picsum.photos/seed/${restaurant.id}/600/400`}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                        data-ai-hint={restaurant.imageHint}
                    />
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <CardTitle className="text-xl font-bold font-headline">
                    {restaurant.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                    {restaurant.cuisine}
                    </CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0">
                    <Badge variant="outline">
                    <Star className="w-4 h-4 mr-1 text-orange-500 fill-orange-500" />
                    {restaurant.rating}
                    </Badge>
                </CardFooter>
                </Card>
            </Link>
            ))}
        </div>
      )}
    </div>
  );
}
