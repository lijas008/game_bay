"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Loader2, Gamepad2, CalendarCheck, Clock } from "lucide-react";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Real stats from Firestore
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalBookings, setTotalBookings] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setMobile(profile.mobile || "");
    }
  }, [profile]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.email) return;
      try {
        const q = query(
          collection(db, "bookings"),
          where("userEmail", "==", user.email)
        );
        const snapshot = await getDocs(q);
        const all = snapshot.docs.map(d => d.data()) as any[];

        setTotalBookings(all.length);

        const completed = all.filter(b => b.bookingStatus === "Completed");
        setCompletedBookings(completed.length);

        // Calculate total hours from 2-hr slots
        const hours = all.reduce((sum, b) => {
          if (b.startTime && b.endTime) {
            const [sh, sm] = b.startTime.split(":").map(Number);
            const [eh, em] = b.endTime.split(":").map(Number);
            return sum + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
          }
          return sum;
        }, 0);
        setTotalHours(hours);
      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setLoading(true);
    setSuccess(false);

    try {
      const userRef = doc(db, "users", user.email);
      await updateDoc(userRef, { fullName, mobile });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account details and preferences.</p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <form onSubmit={handleUpdateProfile}>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your contact details here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="bg-background/50 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Mobile Number
              </Label>
              <Input
                id="mobile"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                required
                className="bg-background/50 focus:border-primary"
              />
            </div>

            {success && (
              <div className="p-3 bg-xbox-green/10 border border-xbox-green/20 text-xbox-green text-sm rounded-md">
                Profile updated successfully!
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-border/10 pt-6">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Real Account Stats */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>Your lifetime activity on GamingBay.</CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-secondary border border-border/50 text-center">
                <CalendarCheck className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary mb-1">{totalBookings}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Bookings</div>
              </div>
              <div className="p-4 rounded-lg bg-secondary border border-border/50 text-center">
                <Gamepad2 className="w-5 h-5 text-xbox-green mx-auto mb-2" />
                <div className="text-2xl font-bold text-xbox-green mb-1">{completedBookings}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Completed</div>
              </div>
              <div className="p-4 rounded-lg bg-secondary border border-border/50 text-center">
                <Clock className="w-5 h-5 text-ps-blue mx-auto mb-2" />
                <div className="text-2xl font-bold text-ps-blue mb-1">{totalHours}h</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Hours Played</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
