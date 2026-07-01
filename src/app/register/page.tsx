"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Gamepad2, Check, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.email) {
        // Save additional user info to Firestore
        await setDoc(doc(db, "users", user.email), {
          email: user.email,
          fullName,
          mobile,
          role: "customer", // default role
          status: "active",
          createdAt: new Date().toISOString(),
        });
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err.code, err.message);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Email/Password sign-in is not enabled. Please contact the administrator.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address format.");
      } else if (err.code === "permission-denied") {
        setError("Database permission denied. Please check Firestore rules.");
      } else {
        setError(`Error: ${err.code || err.message || "Unknown error. Please try again."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden py-12">
      <div className="absolute top-[10%] right-[-10%] w-96 h-96 bg-ps-blue/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-xbox-green/20 blur-[100px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-lg z-10 border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <Gamepad2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Join GamingBay</CardTitle>
          <CardDescription>
            Create your account to start reserving your gaming sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-background/50 border-border/50 focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="player@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 border-border/50 focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="bg-background/50 border-border/50 focus:border-primary"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`bg-background/50 border-border/50 focus:border-primary transition-all duration-300 ${
                    password && confirmPassword
                      ? password === confirmPassword
                        ? "border-xbox-green/50 shadow-[0_0_12px_rgba(16,185,129,0.15)] focus:border-xbox-green"
                        : "border-destructive/50 shadow-[0_0_12px_rgba(239,68,68,0.15)] focus:border-destructive"
                      : ""
                  }`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`bg-background/50 border-border/50 focus:border-primary transition-all duration-300 ${
                    password && confirmPassword
                      ? password === confirmPassword
                        ? "border-xbox-green/50 shadow-[0_0_12px_rgba(16,185,129,0.15)] focus:border-xbox-green"
                        : "border-destructive/50 shadow-[0_0_12px_rgba(239,68,68,0.15)] focus:border-destructive"
                      : ""
                  }`}
                />
              </div>
            </div>

            {password && confirmPassword && (
              <div className="flex items-center gap-1.5 text-xs transition-all duration-300">
                {password === confirmPassword ? (
                  <span className="text-xbox-green flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Passwords match
                  </span>
                ) : (
                  <span className="text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                  </span>
                )}
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full font-semibold mt-4" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/10 pt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
