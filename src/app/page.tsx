
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        toast({
            variant: "destructive",
            title: "Google Sign-In Error",
            description: error.message,
        });
    } finally {
        setLoading(false);
    }
  };


  const renderAuthForm = (formUserType: UserType) => {
    return (
      <div className="grid gap-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor={`${formUserType}-email`}>Email</Label>
            <Input
              id={`${formUserType}-email`}
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formUserType}-password`}>Password</Label>
            <Input
              id={`${formUserType}-password`}
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
                  variant="outline"
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
                  <span className="bg-background px-2 text-muted-foreground">
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
    );
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
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
             <div className="flex justify-center">
                <Logo />
             </div>
            <h1 className="text-3xl font-bold font-headline">Welcome</h1>
            <p className="text-balance text-muted-foreground">
              Select your role to sign in or create an account.
            </p>
          </div>
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
            <TabsContent value="customer">{renderAuthForm("Customer")}</TabsContent>
            <TabsContent value="restaurant">
              {renderAuthForm("Restaurant")}
            </TabsContent>
            <TabsContent value="delivery">{renderAuthForm("Delivery")}</TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        <Image
          src="https://images.unsplash.com/photo-1579738795534-a2133d130d31?q=80&w=1974&auto=format&fit=crop"
          alt="A restaurant with warm, ambient lighting"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white p-6 rounded-lg bg-black/30 backdrop-blur-md">
            <h1 className="font-bold text-4xl font-headline">Experience culinary excellence.</h1>
            <p className="max-w-prose mt-2 text-lg">From fine dining to casual eats, discover the best your city has to offer.</p>
        </div>
      </div>
    </div>
  );
}
