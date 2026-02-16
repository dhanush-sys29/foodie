"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { Star, Clock, PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDoc, useCollection, useFirestore } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/cart-context";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  imageHint: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  imageHint: string;
}

export default function RestaurantPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { addToCart } = useCart();

  const restaurantRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, "restaurants", id);
  }, [firestore, id]);
  const { data: restaurant, loading: restaurantLoading } =
    useDoc<Restaurant>(restaurantRef);

  const menuRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, "restaurants", id, "menuItems");
  }, [firestore, id]);
  const { data: menu, loading: menuLoading } = useCollection<MenuItem>(menuRef);

  const availableMenu = useMemo(() => {
    if (!menu) return [];
    return menu.filter(item => item.available);
  }, [menu]);

  if (restaurantLoading || menuLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="overflow-hidden">
          <Skeleton className="h-64 w-full" />
          <CardContent className="p-6">
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-6 w-1/4" />
          </CardContent>
        </Card>
        <div className="mt-8">
          <h2 className="text-2xl font-bold font-headline mb-6">Menu</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader className="flex flex-row gap-4 items-start">
                  <Skeleton className="w-24 h-24 flex-shrink-0 rounded-md" />
                  <div className="flex-grow">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex items-end justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-9 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    notFound();
  }

  const handleAddToCart = (item: MenuItem) => {
    if (restaurant) {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        restaurant: { id: restaurant.id, name: restaurant.name },
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="overflow-hidden">
        <div className="relative h-64 w-full">
          <Image
            src={`https://picsum.photos/seed/${id}/1200/400`}
            alt={restaurant.name}
            fill
            className="object-cover"
            data-ai-hint={restaurant.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-4xl font-bold text-white font-headline">
              {restaurant.name}
            </h1>
            <p className="text-lg text-gray-200">{restaurant.cuisine}</p>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-orange-500 fill-orange-500" />
              <span>{restaurant.rating}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>20-30 min</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-bold font-headline mb-6">Menu</h2>
        {availableMenu.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {availableMenu.map((item) => (
              <Card key={item.id} className="flex flex-col">
                <CardHeader className="flex flex-row gap-4 items-start">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={`https://picsum.photos/seed/${item.id}/200/200`}
                      alt={item.name}
                      fill
                      className="rounded-md object-cover"
                      data-ai-hint={item.imageHint}
                    />
                  </div>
                  <div className="flex-grow">
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {item.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex items-end justify-between">
                  <p className="text-lg font-semibold">
                    ₹{item.price.toFixed(2)}
                  </p>
                  <Button size="sm" onClick={() => handleAddToCart(item)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center bg-background p-10 rounded-lg border-2 border-dashed">
            <p className="text-lg font-semibold text-muted-foreground">
                This restaurant's menu is currently empty.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
                Please check back later for delicious items.
            </p>
        </div>
        )}
      </div>
    </div>
  );
}
