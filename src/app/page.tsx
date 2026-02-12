
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/google-icon";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import {
  useAuth,
  useFirestore,
  useUser,
  type UserProfile,
} from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

type UserType = "Customer" | "Restaurant" | "Delivery";

export default function LoginPage() {
  const [userType, setUserType] = useState<UserType>("Customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, profile, loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && user && profile) {
      switch (profile.role) {
        case "customer":
          router.push("/dashboard");
          break;
        case "restaurant":
          router.push("/manage");
          break;
        case "delivery":
          router.push("/deliveries");
          break;
        default:
          router.push("/dashboard");
      }
    }
  }, [user, profile, userLoading, router]);

  const handleAuthAction = async (action: "signIn" | "signUp") => {
    if (!auth || !firestore) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Firebase not initialized.",
      });
      return;
    }

    setLoading(true);
    try {
      if (action === "signUp") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const newUser = userCredential.user;
        const userProfile: UserProfile = {
          email: newUser.email!,
          role: userType.toLowerCase() as UserProfile["role"],
        };

        if (userProfile.role === "restaurant") {
          userProfile.restaurantId = "1";
        }

        const userDocRef = doc(firestore, "users", newUser.uid);
        setDoc(userDocRef, userProfile).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: "create",
            requestResourceData: userProfile,
          });
          errorEmitter.emit("permission-error", permissionError);
        });
        toast({ title: "Account created successfully!" });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Signed in successfully!" });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            const userProfile: UserProfile = {
                email: user.email!,
                role: userType.toLowerCase() as UserProfile['role'],
            };
            if (userProfile.role === 'restaurant') {
                userProfile.restaurantId = '1';
            }
            setDoc(userDocRef, userProfile).catch(
              async (serverError) => {
                const permissionError = new FirestorePermissionError({
                  path: userDocRef.path,
                  operation: "create",
                  requestResourceData: userProfile,
                });
                errorEmitter.emit("permission-error", permissionError);
              }
            );
            toast({ title: "Account created successfully!" });
        } else {
            toast({ title: "Signed in successfully!" });
        }
    } catch (error: any) {
        let description = error.message;
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            description = "The sign-in popup was closed before completing the sign-in. Please try again.";
            break;
          case 'auth/popup-blocked':
            description = "The sign-in popup was blocked by your browser. Please allow popups for this site and try again.";
            break;
          case 'auth/unauthorized-domain':
            description = "This domain is not authorized for Google Sign-In. Please check your Firebase console configuration.";
            break;
        }
        toast({
            variant: "destructive",
            title: "Google Sign-In Error",
            description,
        });
    } finally {
        setLoading(false);
    }
  };

  if (userLoading || (user && profile)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Logo />
        <p className="mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <Image
          src="https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=2070&auto=format&fit=crop"
          alt="A delicious spread of food ingredients"
          fill
          className="object-cover z-0"
          data-ai-hint="food ingredients"
        />
        <div className="absolute inset-0 bg-black/60 z-0" />
        
        <div className="relative z-10 w-full max-w-md p-4">
            <div className="flex justify-center mb-8">
                <Logo />
            </div>
            <Card className="bg-background/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <h2 className="text-2xl font-bold font-headline">Join Foodie</h2>
                    <CardDescription>Sign in or create an account to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="customer"
                        className="w-full"
                        onValueChange={(value) => setUserType(value as UserType)}
                    >
                        <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="customer">Customer</TabsTrigger>
                        <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
                        <TabsTrigger value="delivery">Delivery</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="grid gap-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            />
                        </div>
                        <div className="flex flex-col gap-4 mt-4">
                            <div className="w-full flex gap-2">
                                <Button
                                className="w-full"
                                onClick={() => handleAuthAction("signIn")}
                                disabled={loading}
                                >
                                {loading ? "Signing In..." : "Sign In"}
                                </Button>
                                <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => handleAuthAction("signUp")}
                                disabled={loading}
                                >
                                {loading ? "Signing Up..." : "Sign Up"}
                                </Button>
                            </div>
                            <div className="relative w-full">
                                <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background/80 px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                                <GoogleIcon className="mr-2 h-4 w-4" />
                                Sign in with Google
                            </Button>
                        </div>
                    </div>
                    {loading && (
                        <div className="sr-only" aria-live="polite">
                            Processing your request...
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
