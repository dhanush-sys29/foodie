import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { restaurants } from "@/lib/data";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-6">
        Restaurants Near You
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {restaurants.map((restaurant) => (
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
                  <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
                  {restaurant.rating}
                </Badge>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
