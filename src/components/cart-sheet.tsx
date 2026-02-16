
"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser, useFirestore } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export function CartSheet() {
  const {
    isCartOpen,
    setCartOpen,
    cartItems,
    removeFromCart,
    getCartTotal,
    getCartCount,
    clearCart,
    restaurant,
  } = useCart();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handleCheckout = () => {
    if (!user || !firestore || !restaurant || cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot proceed with checkout. Your cart may be empty.",
      });
      return;
    }

    const orderId = uuidv4();
    const ordersRef = collection(firestore, "restaurants", restaurant.id, "orders");
    const deliveriesRef = collection(firestore, "deliveries");
    
    // 1. Create the order
    const orderData = {
        orderId: orderId,
        customerId: user.uid,
        customerName: user.displayName || user.email,
        status: "Pending",
        total: getCartTotal(),
        createdAt: serverTimestamp(),
        items: cartItems.map(item => ({
            itemId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        })),
    };

    addDoc(ordersRef, orderData)
      .then(() => {
        // 2. Create a delivery job (simulating backend logic)
        // In a real app, this would be a Cloud Function triggered by the new order.
        // The addresses and coordinates here are placeholders.
        const deliveryData = {
            id: uuidv4(),
            orderId: orderId,
            restaurantName: restaurant.name,
            restaurantAddress: "123 Pizza Lane, Food City", // Placeholder
            customerAddress: "456 Home Street, Client Town", // Placeholder
            status: 'Pending',
            restaurantCoords: { lat: 34.0522, lng: -118.2437 }, // Placeholder (LA)
            customerCoords: { lat: 34.0622, lng: -118.2537 }, // Placeholder (Near LA)
            deliveryFee: 50, // Placeholder fee
        };

        return addDoc(deliveriesRef, deliveryData);
      })
      .then(() => {
        toast({
            title: "Order Placed!",
            description: "Your order has been placed successfully.",
        });
        clearCart();
        setCartOpen(false);
        router.push(`/track/${orderId}`);
      })
      .catch((error) => {
        console.error("Checkout Error: ", error);
        toast({
            variant: "destructive",
            title: "Checkout Failed",
            description: "There was an error placing your order. You may not have permission.",
        });
        const permissionError = new FirestorePermissionError({
            path: error.message.includes('deliveries') ? deliveriesRef.path : ordersRef.path,
            operation: 'create',
            requestResourceData: error.message.includes('deliveries') ? {} : orderData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Cart ({getCartCount()})</SheetTitle>
          {restaurant ? (
             <SheetDescription>
                You are ordering from <strong>{restaurant?.name}</strong>
             </SheetDescription>
          ) : null}
        </SheetHeader>
        <Separator />
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="flex flex-col gap-4 py-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {item.quantity} x {item.name}
                      </div>
                      <div className="text-muted-foreground">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="px-6 py-4">
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between font-bold">
                  <div>Total</div>
                  <div>₹{getCartTotal().toFixed(2)}</div>
                </div>
                <Button className="w-full" onClick={handleCheckout}>
                  Checkout
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
