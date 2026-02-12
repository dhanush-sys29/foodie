
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { File, PlusCircle } from "lucide-react";
import { addDoc, collection, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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
  customerName: string;
  status: "Pending" | "In Progress" | "Delivered" | "Cancelled";
  total: number;
}

const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be a positive number"),
  imageHint: z.string().min(1, "Image hint is required"),
});

export default function OwnerDashboard() {
  const { profile } = useUser();
  const restaurantId = profile?.restaurantId;
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setDialogOpen] = useState(false);

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

  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageHint: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof menuItemSchema>) => {
    if (!menuItemsRef) return;
    try {
      await addDoc(menuItemsRef, {
        ...values,
        available: true,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Success", description: "Menu item added successfully." });
      form.reset();
      setDialogOpen(false);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: "Could not add menu item." });
        const permissionError = new FirestorePermissionError({
            path: menuItemsRef.path,
            operation: 'create',
            requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
    }
  };


  const toggleAvailability = (itemId: string, currentStatus: boolean) => {
    if (!firestore || !restaurantId) return;
    const itemRef = doc(firestore, "restaurants", restaurantId, "menuItems", itemId);
    updateDoc(itemRef, { available: !currentStatus })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: itemRef.path,
                operation: 'update',
                requestResourceData: { available: !currentStatus },
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  const getStatusVariant = (status: Order["status"]) => {
    switch (status) {
        case "Delivered":
            return "secondary";
        case "In Progress":
            return "default";
        case "Pending":
            return "destructive";
        case "Cancelled":
            return "outline";
        default:
            return "default";
    }
  }

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
              checked={item.available}
              onCheckedChange={() => toggleAvailability(item.id, item.available)}
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
          <TableCell className="font-medium">{order.id.substring(0,7)}...</TableCell>
          <TableCell>{order.customerName}</TableCell>
          <TableCell>
            <Badge variant={getStatusVariant(order.status)}>
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
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Item
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Menu Item</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to add a new item to your menu.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Margherita Pizza" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="e.g. Classic pizza with tomato, mozzarella, and basil." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
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
                          <FormLabel>Image Hint</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. margherita pizza" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Adding..." : "Add Item"}
                        </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
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
