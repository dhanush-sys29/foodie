
'use client';

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
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
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface DeliveryJob {
  id: string;
  orderId: string;
  restaurantName: string;
  status: string;
  deliveryFee: number;
  completedAt?: { seconds: number };
}

export default function EarningsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const completedJobsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'deliveries'),
      where('agentId', '==', user.uid),
      where('status', '==', 'Delivered')
    );
  }, [user, firestore]);

  const { data: completedJobs, loading } = useCollection<DeliveryJob>(completedJobsQuery);

  const stats = useMemo(() => {
    if (!completedJobs) return { totalEarnings: 0, totalDeliveries: 0 };
    const totalEarnings = completedJobs.reduce(
      (sum, job) => sum + (job.deliveryFee || 0),
      0
    );
    return {
      totalEarnings,
      totalDeliveries: completedJobs.length,
    };
  }, [completedJobs]);

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-32 mt-1" />
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-16 mt-1" />
            </CardHeader>
          </Card>
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-1" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
       <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          My Earnings
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Earnings</CardTitle>
            <p className="text-3xl font-bold font-headline text-primary">
              ₹{stats.totalEarnings.toFixed(2)}
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed Deliveries</CardTitle>
            <p className="text-3xl font-bold font-headline">
              {stats.totalDeliveries}
            </p>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery History</CardTitle>
          <CardDescription>
            A list of your completed deliveries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedJobs && completedJobs.length > 0 ? (
                completedJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.orderId.substring(0, 7)}...</TableCell>
                    <TableCell>{job.restaurantName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{job.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">₹{job.deliveryFee.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    You haven't completed any deliveries yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
