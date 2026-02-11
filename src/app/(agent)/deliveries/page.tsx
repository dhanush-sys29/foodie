"use client";

import { useState } from "react";
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MapProvider } from "@/components/map-provider";
import { deliveryJobs } from "@/lib/data";
import { Home, Utensils, Bike } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DeliveriesPage() {
  const [selectedJob, setSelectedJob] = useState(deliveryJobs[0]);

  const center = {
    lat: (selectedJob.restaurantCoords.lat + selectedJob.customerCoords.lat) / 2,
    lng: (selectedJob.restaurantCoords.lng + selectedJob.customerCoords.lng) / 2,
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
                selectedJob.id === job.id && "bg-muted"
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
              position={selectedJob.restaurantCoords}
              title={"Restaurant"}
            >
              <Pin
                background={"#4B5563"}
                glyphColor={"#FFFFFF"}
                borderColor={"#4B5563"}
              >
                <Utensils className="w-6 h-6" />
              </Pin>
            </AdvancedMarker>
            <AdvancedMarker
              position={selectedJob.customerCoords}
              title={"Customer"}
            >
              <Pin
                background={"#3498DB"}
                glyphColor={"#FFFFFF"}
                borderColor={"#3498DB"}
              >
                <Home className="w-6 h-6" />
              </Pin>
            </AdvancedMarker>
          </Map>
        </MapProvider>
        <Card className="absolute bottom-4 left-4 right-4 animate-in slide-in-from-bottom-10 duration-500">
          <CardHeader>
            <CardTitle>
              Order #{selectedJob.orderId} - {selectedJob.restaurantName}
            </CardTitle>
            <CardDescription>
              From: {selectedJob.restaurantAddress}
              <br />
              To: {selectedJob.customerAddress}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-bold text-lg text-primary">{selectedJob.status}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Decline</Button>
            <Button>
              <Bike className="mr-2 h-4 w-4" /> Picked Up
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
