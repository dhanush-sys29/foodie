
"use client";

import { useState, useMemo } from "react";
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapProvider } from "@/components/map-provider";
import { Home, Utensils, Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore } from "@/firebase";
import { collection, doc, updateDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

interface DeliveryJob {
  id: string;
  orderId: string;
  restaurantName: string;
  restaurantAddress: string;
  customerAddress: string;
  status: string;
  restaurantCoords: { lat: number; lng: number };
  customerCoords: { lat: number; lng: number };
}

export default function DeliveriesPage() {
  const firestore = useFirestore();
  const deliveriesRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, "deliveries");
  }, [firestore]);

  const { data: deliveryJobs, loading } = useCollection<DeliveryJob>(deliveriesRef);
  const [selectedJob, setSelectedJob] = useState<DeliveryJob | null>(null);

  const updateDeliveryStatus = (jobId: string, status: string) => {
    if (!firestore) return;
    const deliveryRef = doc(firestore, "deliveries", jobId);
    updateDoc(deliveryRef, { status: status })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: deliveryRef.path,
                operation: 'update',
                requestResourceData: { status },
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  if (loading) {
    return (
       <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-4rem)]">
        <div className="lg:col-span-1 flex flex-col h-full bg-background border-r">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold font-headline">Delivery Jobs</h2>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 relative bg-muted" />
      </div>
    )
  }
  
  if (!deliveryJobs || deliveryJobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="font-bold text-lg">No delivery jobs available.</p>
      </div>
    );
  }

  const currentJob = selectedJob || deliveryJobs[0];

  const center = {
    lat: (currentJob.restaurantCoords.lat + currentJob.customerCoords.lat) / 2,
    lng: (currentJob.restaurantCoords.lng + currentJob.customerCoords.lng) / 2,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-4rem)]">
      <div className="lg:col-span-1 flex flex-col h-full bg-background border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold font-headline">Delivery Jobs</h2>
        </div>
        <div className="flex-grow overflow-y-auto">
          {deliveryJobs.map((job) => (
            <div
              key={job.id}
              className={cn(
                "p-4 border-b cursor-pointer hover:bg-muted/50",
                currentJob.id === job.id && "bg-muted"
              )}
              onClick={() => setSelectedJob(job)}
            >
              <p className="font-semibold">{job.restaurantName}</p>
              <p className="text-sm text-muted-foreground truncate">
                To: {job.customerAddress}
              </p>
              <p className="text-sm font-bold text-primary mt-1">
                {job.status}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 relative">
        <MapProvider>
          <Map
            center={center}
            zoom={13}
            mapId="foodie-map-deliveries"
            className="w-full h-full"
            gestureHandling={"greedy"}
            disableDefaultUI={true}
          >
            <AdvancedMarker
              position={currentJob.restaurantCoords}
              title={"Restaurant"}
            >
              <Pin
                background={"#D97706"}
                glyphColor={"#FFFFFF"}
                borderColor={"#D97706"}
              >
                <Utensils className="w-6 h-6" />
              </Pin>
            </AdvancedMarker>
            <AdvancedMarker
              position={currentJob.customerCoords}
              title={"Customer"}
            >
              <Pin
                background={"#F97316"}
                glyphColor={"#FFFFFF"}
                borderColor={"#F97316"}
              >
                <Home className="w-6 h-6" />
              </Pin>
            </AdvancedMarker>
          </Map>
        </MapProvider>
        <Card className="absolute bottom-4 left-4 right-4 animate-in slide-in-from-bottom-10 duration-500">
          <CardHeader>
            <CardTitle>
              Order #{currentJob.orderId} - {currentJob.restaurantName}
            </CardTitle>
            <CardDescription>
              From: {currentJob.restaurantAddress}
              <br />
              To: {currentJob.customerAddress}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-bold text-lg text-primary">{currentJob.status}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => updateDeliveryStatus(currentJob.id, 'Declined')} disabled={currentJob.status === 'Declined' || currentJob.status === 'Delivered'}>Decline</Button>
            {currentJob.status === 'Picked Up' ? (
              <Button onClick={() => updateDeliveryStatus(currentJob.id, 'Delivered')}>
                <Home className="mr-2 h-4 w-4" /> Delivered
              </Button>
            ) : currentJob.status !== 'Delivered' && currentJob.status !== 'Declined' ? (
              <Button onClick={() => updateDeliveryStatus(currentJob.id, 'Picked Up')}>
                <Bike className="mr-2 h-4 w-4" /> Picked Up
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
