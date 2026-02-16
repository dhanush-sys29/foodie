
"use client";

import { useMemo } from "react";
import { collection, doc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

interface Order {
  id: string; // document id
  orderId: string; // uuid
  customerName: string;
  status: "Pending" | "In Progress" | "Delivered" | "Cancelled";
  total: number;
}

export default function OwnerOrdersPage() {
  const { profile } = useUser();
  const restaurantId = profile?.restaurantId;
  const firestore = useFirestore();
  const { toast } = useToast();

  const ordersRef = useMemo(() => {
    if (!firestore || !restaurantId) return null;
    return collection(firestore, "restaurants", restaurantId, "orders");
  }, [firestore, restaurantId]);

  const { data: restaurantOrders, loading: ordersLoading } = useCollection<Order>(ordersRef);

    const updateOrderStatus = async (orderDocId: string, newStatus: Order["status"]) => {
    if (!firestore || !restaurantId || !restaurantOrders) return;

    const order = restaurantOrders.find(o => o.id === orderDocId);
    if (!order) {
        toast({ variant: "destructive", title: "Error", description: "Order not found." });
        return;
    }

    const orderRef = doc(firestore, "restaurants", restaurantId, "orders", orderDocId);

    // Update order status
    updateDoc(orderRef, { status: newStatus })
        .then(() => {
            toast({ title: "Success", description: `Order status updated to ${newStatus}.` });
        })
        .catch(async (serverError) => {
            toast({ variant: "destructive", title: "Error", description: "Could not update order status." });
            const permissionError = new FirestorePermissionError({
                path: orderRef.path,
                operation: 'update',
                requestResourceData: { status: newStatus },
            });
            errorEmitter.emit('permission-error', permissionError);
        });

    // Find and update corresponding delivery job
    const deliveriesRef = collection(firestore, "deliveries");
    const deliveryQuery = query(deliveriesRef, where("orderId", "==", order.orderId));
    
    try {
        const deliverySnapshot = await getDocs(deliveryQuery);
        if (deliverySnapshot.empty) return;

        const deliveryDocRef = deliverySnapshot.docs[0].ref;
        let deliveryStatusUpdate = {};
        if (newStatus === 'In Progress') {
            deliveryStatusUpdate = { status: 'Accepted' };
        } else if (newStatus === 'Cancelled') {
            deliveryStatusUpdate = { status: 'Declined' };
        }

        if (Object.keys(deliveryStatusUpdate).length > 0) {
            updateDoc(deliveryDocRef, deliveryStatusUpdate).catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: deliveryDocRef.path,
                    operation: 'update',
                    requestResourceData: deliveryStatusUpdate,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
        }
    } catch(e) {
        const permissionError = new FirestorePermissionError({
            path: deliveriesRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
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

  const ordersContent = ordersLoading ? (
    <TableBody>
      {Array.from({ length: 5 }).map((_, i) => (
         <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
         </TableRow>
      ))}
    </TableBody>
  ) : (
    <TableBody>
      {restaurantOrders?.length === 0 ? (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center">
            No orders found.
          </TableCell>
        </TableRow>
      ) : (
        restaurantOrders?.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.orderId ? order.orderId.substring(0,7) : 'N/A'}...</TableCell>
            <TableCell>{order.customerName}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(order.status)}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              ₹{order.total.toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={order.status === 'Delivered' || order.status === 'Cancelled'}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Order Actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                            onClick={() => updateOrderStatus(order.id, 'In Progress')}
                            disabled={order.status !== 'Pending'}
                        >
                            Accept Order
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                            disabled={order.status !== 'Pending'}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                            Cancel Order
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
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          Orders
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Incoming Orders</CardTitle>
          <CardDescription>
            A list of recent orders for your restaurant. Accept or cancel new orders from here.
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
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {ordersContent}
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
