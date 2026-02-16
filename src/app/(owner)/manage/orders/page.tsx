
"use client";

import { useMemo } from "react";
import { collection } from "firebase/firestore";

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
import { Skeleton } from "@/components/ui/skeleton";
import { useCollection, useFirestore, useUser } from "@/firebase";

interface Order {
  id: string;
  customerName: string;
  status: "Pending" | "In Progress" | "Delivered" | "Cancelled";
  total: number;
}

export default function OwnerOrdersPage() {
  const { profile } = useUser();
  const restaurantId = profile?.restaurantId;
  const firestore = useFirestore();

  const ordersRef = useMemo(() => {
    if (!firestore || !restaurantId) return null;
    return collection(firestore, "restaurants", restaurantId, "orders");
  }, [firestore, restaurantId]);

  const { data: restaurantOrders, loading: ordersLoading } = useCollection<Order>(ordersRef);

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
         </TableRow>
      ))}
    </TableBody>
  ) : (
    <TableBody>
      {restaurantOrders?.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} className="h-24 text-center">
            No orders found.
          </TableCell>
        </TableRow>
      ) : (
        restaurantOrders?.map((order) => (
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
    </>
  );
}
