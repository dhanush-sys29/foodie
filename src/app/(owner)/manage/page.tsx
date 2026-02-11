
"use client";

import Image from "next/image";
import { useMemo } from "react";
import { File, PlusCircle } from "lucide-react";
import { collection } from "firebase/firestore";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollection, useFirestore, useUser } from "@/firebase";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  imageHint: string;
}

interface Order {
  id: string;
  customer: string;
  status: "In Progress" | "Delivered" | "Cancelled";
  total: number;
}

export default function OwnerDashboard() {
  const { profile } = useUser();
  const restaurantId = profile?.restaurantId;
  const firestore = useFirestore();

  const menuItemsRef = useMemo(() => {
    if (!firestore || !restaurantId) return null;
    return collection(firestore, "restaurants", restaurantId, "menuItems");
  }, [firestore, restaurantId]);

  const ordersRef = useMemo(() => {
    if (!firestore || !restaurantId) return null;
    return collection(firestore, "restaurants", restaurantId, "orders");
  }, [firestore, restaurantId]);

  const { data: myMenuItems, loading: menuLoading } = useCollection<MenuItem>(menuItemsRef);
  const { data: restaurantOrders, loading: ordersLoading } = useCollection<Order>(ordersRef);

  const menuContent = menuLoading ? (
    <TableBody>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="hidden sm:table-cell">
            <Skeleton className="aspect-square rounded-md object-cover h-16 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-12" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-5 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-11" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  ) : (
    <TableBody>
      {myMenuItems?.map((item) => (
        <TableRow key={item.id}>
          <TableCell className="hidden sm:table-cell">
            <Image
              alt={item.name}
              className="aspect-square rounded-md object-cover"
              height="64"
              src={`https://picsum.photos/seed/${item.id}/64/64`}
              width="64"
              data-ai-hint={item.imageHint}
            />
          </TableCell>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>₹{item.price.toFixed(2)}</TableCell>
          <TableCell className="hidden md:table-cell">
            {item.description}
          </TableCell>
          <TableCell>
            <Switch
              defaultChecked={item.available}
              aria-label="Toggle availability"
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  const ordersContent = ordersLoading ? (
    <TableBody>
      {Array.from({ length: 3 }).map((_, i) => (
         <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
         </TableRow>
      ))}
    </TableBody>
  ) : (
    <TableBody>
      {restaurantOrders?.map((order) => (
        <TableRow key={order.id}>
          <TableCell className="font-medium">{order.id}</TableCell>
          <TableCell>{order.customer}</TableCell>
          <TableCell>
            <Badge
              variant={
                order.status === "Delivered" ? "secondary" : "default"
              }
              className={
                order.status === "In Progress" ? "bg-blue-500" : ""
              }
            >
              {order.status}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            ₹{order.total.toFixed(2)}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          My Restaurant
        </h1>
      </div>
      <Tabs defaultValue="menu">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Item
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="menu">
          <Card>
            <CardHeader>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>
                Manage your dishes and their availability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      <span className="sr-only">Image</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Description
                    </TableHead>
                    <TableHead>
                      Available
                    </TableHead>
                  </TableRow>
                </TableHeader>
                {menuContent}
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing{" "}
                <strong>
                  1-{myMenuItems?.length || 0}
                </strong> of{" "}
                <strong>
                  {myMenuItems?.length || 0}
                </strong>{" "}
                products
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                A list of recent orders for your restaurant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                {ordersContent}
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
