
'use client';

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Order {
  id: string;
  customerId: string;
  customerName: string;
}

interface Customer {
  id: string;
  name: string;
  orderCount: number;
}

export default function CustomersPage() {
  const { profile } = useUser();
  const firestore = useFirestore();

  const ordersRef = useMemo(() => {
    if (!profile?.restaurantId || !firestore) return null;
    return collection(firestore, 'restaurants', profile.restaurantId, 'orders');
  }, [profile, firestore]);

  const { data: orders, loading } = useCollection<Order>(ordersRef);

  const customers = useMemo<Customer[]>(() => {
    if (!orders) return [];

    const customerMap = new Map<string, Customer>();

    orders.forEach((order) => {
      const existingCustomer = customerMap.get(order.customerId);
      if (existingCustomer) {
        existingCustomer.orderCount++;
      } else {
        customerMap.set(order.customerId, {
          id: order.customerId,
          name: order.customerName,
          orderCount: 1,
        });
      }
    });

    return Array.from(customerMap.values()).sort(
      (a, b) => b.orderCount - a.orderCount
    );
  }, [orders]);

  if (loading) {
    return (
      <>
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Customers</h1>
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead className="text-right">Total Orders</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({length: 3}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <Skeleton className="h-5 w-32" />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Skeleton className="h-5 w-8 ml-auto" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Customers</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Customers</CardTitle>
          <CardDescription>
            A list of customers who have ordered from your restaurant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://picsum.photos/seed/${customer.id}/100/100`} />
                          <AvatarFallback>
                            {customer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{customer.orderCount}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    No customers found yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
