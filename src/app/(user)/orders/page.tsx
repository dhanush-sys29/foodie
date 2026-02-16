
'use client';

import Link from "next/link";
import { useMemo } from 'react';
import { collectionGroup, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from "date-fns";

interface Order {
    id: string;
    orderId: string;
    status: 'Pending' | 'In Progress' | 'Delivered' | 'Cancelled';
    total: number;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
}

const getStatusVariant = (status: Order['status']) => {
    switch (status) {
        case 'Delivered':
            return 'secondary';
        case 'In Progress':
            return 'default';
        case 'Pending':
            return 'destructive';
        case 'Cancelled':
            return 'outline';
        default:
            return 'default';
    }
};

export default function MyOrdersPage() {
    const firestore = useFirestore();
    const { user } = useUser();

    const ordersQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(collectionGroup(firestore, 'orders'), where('customerId', '==', user.uid));
    }, [firestore, user]);

    const { data: orders, loading } = useCollection<Order>(ordersQuery);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Orders</CardTitle>
                    <CardDescription>A list of your past and current orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Orders</CardTitle>
                <CardDescription>A list of your past and current orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders && orders.length > 0 ? (
                            orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.orderId.substring(0, 7)}...</TableCell>
                                    <TableCell>{order.createdAt ? format(new Date(order.createdAt.seconds * 1000), 'PPP') : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/track/${order.orderId}`}>Track</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    You haven't placed any orders yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
