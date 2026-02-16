'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapProvider } from '@/components/map-provider';
import { Bike, Utensils, Home } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface DeliveryJob {
    id: string;
    orderId: string;
    restaurantName: string;
    restaurantAddress: string;
    customerAddress: string;
    status: "Pending" | "Accepted" | "Picked Up" | "On the way" | "Delivered";
    restaurantCoords: { lat: number; lng: number };
    customerCoords: { lat: number; lng: number };
}


const OrderStatus = ({ status, progress }: { status: string, progress: number }) => (
    <div className="space-y-2">
        <p className="font-medium">{status}</p>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground">Estimated Arrival: 15 minutes</p>
    </div>
)

const DeliveryAgentInfo = () => (
    <div className="flex items-center space-x-4">
        <Avatar>
            <AvatarImage data-ai-hint="person portrait" src="https://picsum.photos/seed/agent/100/100" />
            <AvatarFallback>DA</AvatarFallback>
        </Avatar>
        <div>
            <p className="font-medium">David Lee</p>
            <p className="text-sm text-muted-foreground">Your delivery agent</p>
        </div>
    </div>
)

function LoadingSkeleton() {
    return (
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            <div className="md:col-span-2 h-full min-h-[300px] rounded-lg overflow-hidden">
                <Skeleton className="w-full h-full" />
            </div>
            <Card className="md:col-span-1">
                <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="space-y-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function TrackOrderPage({ params }: { params: { orderId: string } }) {
    const { orderId } = params;
    const firestore = useFirestore();
    const deliveryQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, "deliveries"), where("orderId", "==", orderId))
    }, [firestore, orderId]);

    const { data: deliveries, loading } = useCollection<DeliveryJob>(deliveryQuery);
    const delivery = deliveries?.[0];
    
    const [agentPosition, setAgentPosition] = useState(delivery?.restaurantCoords);
    const [tripProgress, setTripProgress] = useState(0);

    function lerp(start: number, end: number, t: number) {
      return start * (1 - t) + end * t;
    }

    useEffect(() => {
        if (!delivery || delivery.status !== "Picked Up") return;

        setAgentPosition(delivery.restaurantCoords);
        const interval = setInterval(() => {
            setTripProgress(prev => {
                if (prev >= 1) {
                    clearInterval(interval);
                    return 1;
                }
                const newProgress = prev + 0.02; // Move 2% of the way each second

                if (delivery.restaurantCoords && delivery.customerCoords) {
                    const newLat = lerp(delivery.restaurantCoords.lat, delivery.customerCoords.lat, newProgress);
                    const newLng = lerp(delivery.restaurantCoords.lng, delivery.customerCoords.lng, newProgress);
                    setAgentPosition({ lat: newLat, lng: newLng });
                }
                
                return newProgress;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [delivery]);

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (!delivery) {
        return (
             <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
                <Card>
                    <CardHeader>
                        <CardTitle>Order not found</CardTitle>
                        <CardDescription>We couldn't find tracking information for order #{orderId}.</CardDescription>
                    </CardHeader>
                </Card>
             </div>
        )
    }

    const progressPercentage = {
        "Pending": 10,
        "Accepted": 25,
        "Picked Up": 50,
        "On the way": 75,
        "Delivered": 100,
    }[delivery.status] || 0;


    return (
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            <div className="md:col-span-2 h-full min-h-[300px] rounded-lg overflow-hidden animate-in fade-in duration-500">
                <MapProvider>
                    <Map
                        center={agentPosition || delivery.restaurantCoords}
                        zoom={14}
                        mapId="foodie-map-track"
                        className="w-full h-full"
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                    >
                        <AdvancedMarker position={delivery.restaurantCoords} title={"Restaurant"}>
                            <Pin background={'#B45309'} glyphColor={'#FFFFFF'} borderColor={'#B45309'}>
                                <Utensils className="w-6 h-6" />
                            </Pin>
                        </AdvancedMarker>
                        {agentPosition && delivery.status === 'Picked Up' && (
                             <AdvancedMarker position={agentPosition} title={"Delivery Agent"}>
                                <Pin background={'#FF7800'} glyphColor={'#FFFFFF'} borderColor={'#FF7800'}>
                                    <Bike className="w-6 h-6" />
                                </Pin>
                            </AdvancedMarker>
                        )}
                        <AdvancedMarker position={delivery.customerCoords} title={"Your Location"}>
                             <Pin background={'#F59E0B'} glyphColor={'#FFFFFF'} borderColor={'#F59E0B'}>
                                <Home className="w-6 h-6" />
                            </Pin>
                        </AdvancedMarker>
                    </Map>
                </MapProvider>
            </div>
            <Card className="md:col-span-1 animate-in fade-in duration-500 delay-150">
                <CardHeader>
                    <CardTitle>Tracking Order #{orderId.substring(0, 7)}</CardTitle>
                    <CardDescription>From {delivery.restaurantName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <OrderStatus status={delivery.status} progress={progressPercentage} />
                   <DeliveryAgentInfo />
                </CardContent>
            </Card>
        </div>
    )
}
