import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/google-icon";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const renderLoginForm = (userType: "Customer" | "Restaurant" | "Delivery") => {
    const dashboardLink =
      userType === "Customer"
        ? "/dashboard"
        : userType === "Restaurant"
        ? "/manage"
        : "/deliveries";

    return (
      <Card>
        <CardHeader>
          <CardTitle>Login as {userType}</CardTitle>
          <CardDescription>
            Enter your credentials to access your {userType.toLowerCase()} account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${userType}-email`}>Email</Label>
            <Input
              id={`${userType}-email`}
              type="email"
              placeholder="m@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${userType}-password`}>Password</Label>
            <Input id={`${userType}-password`} type="password" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Link href={dashboardLink} className="w-full">
            <Button className="w-full">Sign In</Button>
          </Link>
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            <GoogleIcon className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Logo />
      </div>
      <Tabs defaultValue="customer" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>
        <TabsContent value="customer">
          {renderLoginForm("Customer")}
        </TabsContent>
        <TabsContent value="restaurant">
          {renderLoginForm("Restaurant")}
        </TabsContent>
        <TabsContent value="delivery">
          {renderLoginForm("Delivery")}
        </TabsContent>
      </Tabs>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="#"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
