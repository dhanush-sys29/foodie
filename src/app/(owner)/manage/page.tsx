
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { File, PlusCircle, MoreHorizontal } from "lucide-react";
import { addDoc, collection, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const menuItemsRef = useMemo(() => {
    if (!firestore || !restaurantId) return null;
    return collection(firestore, "restaurants", restaurantId, "menuItems");
  }, [firestore, restaurantId]);

  const { data: myMenuItems, loading: menuLoading } = useCollection<MenuItem>(menuItemsRef);

  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageHint: "",
    },
  });

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingItem(null);
      form.reset({ name: "", description: "", price: 0, imageHint: "" });
    }
  };

  const handleAddItemClick = () => {
    setEditingItem(null);
    form.reset({ name: "", description: "", price: 0, imageHint: "" });
    setDialogOpen(true);
  };
  
  const handleEditItemClick = (item: MenuItem) => {
    setEditingItem(item);
    form.reset(item);
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof menuItemSchema>) => {
    if (!firestore || !restaurantId) return;

    if (editingItem) {
        // Update
        const itemRef = doc(firestore, "restaurants", restaurantId, "menuItems", editingItem.id);
        updateDoc(itemRef, {...values, updatedAt: serverTimestamp()})
            .then(() => {
                toast({ title: "Success", description: "Menu item updated successfully." });
                handleOpenChange(false);
            })
            .catch((error: any) => {
                toast({ variant: "destructive", title: "Error", description: "Could not update menu item." });
                const permissionError = new FirestorePermissionError({
                    path: itemRef.path,
                    operation: 'update',
                    requestResourceData: values,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    } else {
        // Create
        const newMenuItem = {
            ...values,
            available: true,
            createdAt: serverTimestamp(),
        };
        const menuItemsRef = collection(firestore, "restaurants", restaurantId, "menuItems");
        addDoc(menuItemsRef, newMenuItem)
            .then(() => {
                toast({ title: "Success", description: "Menu item added successfully." });
                handleOpenChange(false);
            })
            .catch((error: any) => {
                toast({ variant: "destructive", title: "Error", description: "Could not add menu item." });
                const permissionError = new FirestorePermissionError({
                    path: menuItemsRef.path,
                    operation: 'create',
                    requestResourceData: newMenuItem,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    }
  };

  const toggleAvailability = (itemId: string, currentStatus: boolean) => {
    if (!firestore || !restaurantId) return;
    const itemRef = doc(firestore, "restaurants", restaurantId, "menuItems", itemId);
    const updatedData = { available: !currentStatus };
    updateDoc(itemRef, updatedData)
        .then(() => {
            toast({
                title: "Availability Updated",
                description: `Item is now ${!currentStatus ? 'available' : 'unavailable'}.`
            });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: itemRef.path,
                operation: 'update',
                requestResourceData: updatedData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  const handleExport = () => {
    if (!myMenuItems || myMenuItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Nothing to Export",
        description: "There are no menu items to export.",
      });
      return;
    }
    const headers = ["ID", "Name", "Description", "Price", "Available", "Image Hint"];
    const escapeCsv = (str: string | number | boolean) => `"${String(str).replace(/"/g, '""')}"`;
    const csvRows = [
      headers.join(','),
      ...myMenuItems.map(item => 
        [
          escapeCsv(item.id),
          escapeCsv(item.name),
          escapeCsv(item.description),
          item.price,
          item.available,
          escapeCsv(item.imageHint)
        ].join(',')
      )
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "menu-items.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Export Successful",
      description: "Your menu has been downloaded as a CSV file.",
    });
  };

  const menuContent = menuLoading ? (
    <TableBody>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="hidden sm:table-cell">
            <Skeleton className="aspect-square rounded-md object-cover h-16 w-16" />
          </TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-12" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-48" /></TableCell>
          <TableCell><Skeleton className="h-6 w-11" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  ) : (
    <TableBody>
       {myMenuItems?.length === 0 ? (
        <TableRow>
          <TableCell colSpan={6} className="h-24 text-center">
            No menu items found. Start by adding a new item.
          </TableCell>
        </TableRow>
      ) : (
        myMenuItems?.map((item) => (
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
              <TableCell className="hidden md:table-cell">{item.description}</TableCell>
              <TableCell>
                  <Switch
                  checked={item.available}
                  onCheckedChange={() => toggleAvailability(item.id, item.available)}
                  aria-label="Toggle availability"
                  />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Item Actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditItemClick(item)}>
                            Edit
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
        ))
      )}
    </TableBody>
  );

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">My Menu</h1>
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
            </Button>
            <Button size="sm" className="h-8 gap-1" onClick={handleAddItemClick}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Item</span>
            </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogContent>
          <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
              <DialogDescription>
                  {editingItem ? "Update the details for this menu item." : "Fill in the details below to add a new item to your menu."}
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
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Saving..." : (editingItem ? "Save Changes" : "Add Item")}
                  </Button>
              </DialogFooter>
              </form>
          </Form>
          </DialogContent>
      </Dialog>
      
      <Card>
        <CardHeader>
            <CardTitle>Menu Items</CardTitle>
            <CardDescription>Manage your dishes and their availability.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell"><span className="sr-only">Image</span></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            {menuContent}
            </Table>
        </CardContent>
        <CardFooter>
            <div className="text-xs text-muted-foreground">
            Showing <strong>1-{myMenuItems?.length || 0}</strong> of <strong>{myMenuItems?.length || 0}</strong> products
            </div>
        </CardFooter>
        </Card>
    </>
  );
}
