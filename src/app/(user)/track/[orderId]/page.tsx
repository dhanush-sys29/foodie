'use client';
import { useState, useEffect } from 'react';
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

export default function TrackOrderPage({ params }: { params: { orderId: string } }) {
    const [agentPosition, setAgentPosition] = useState({ lat: 34.0572, lng: -118.2487 });

    useEffect(() => {
        const interval = setInterval(() => {
            setAgentPosition(prev => ({ lat: prev.lat + 0.0001, lng: prev.lng + 0.0001 }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const restaurantPosition = { lat: 34.0522, lng: -118.2437 };
    const homePosition = { lat: 34.0622, lng: -118.2537 };

    return (
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            <div className="md:col-span-2 h-full min-h-[300px] rounded-lg overflow-hidden animate-in fade-in duration-500">
                <MapProvider>
                    <Map
                        defaultCenter={agentPosition}
                        defaultZoom={14}
                        mapId="foodie-map-track"
                        className="w-full h-full"
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                    >
                        <AdvancedMarker position={restaurantPosition} title={"Restaurant"}>
                            <Pin background={'#4B5563'} glyphColor={'#FFFFFF'} borderColor={'#4B5563'}>
                                <Utensils className="w-6 h-6" />
                            </Pin>
                        </AdvancedMarker>
                        <AdvancedMarker position={agentPosition} title={"Delivery Agent"}>
                             <Pin background={'#FF7800'} glyphColor={'#FFFFFF'} borderColor={'#FF7800'}>
                                <Bike className="w-6 h-6" />
                            </Pin>
                        </AdvancedMarker>
                        <AdvancedMarker position={homePosition} title={"Your Location"}>
                             <Pin background={'#3498DB'} glyphColor={'#FFFFFF'} borderColor={'#3498DB'}>
                                <Home className="w-6 h-6" />
                            </Pin>
                        </AdvancedMarker>
                    </Map>
                </MapProvider>
            </div>
            <Card className="md:col-span-1 animate-in fade-in duration-500 delay-150">
                <CardHeader>
                    <CardTitle>Tracking Order #{params.orderId}</CardTitle>
                    <CardDescription>From Pizza Palace</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <OrderStatus status="Out for delivery" progress={75} />
                   <DeliveryAgentInfo />
                </CardContent>
            </Card>
        </div>
    )
}
