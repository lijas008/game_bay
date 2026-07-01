"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimeTo12Hour, formatDateToIndian } from "@/lib/utils";

export default function BookingHistoryPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    setCancelling(true);
    try {
      const docRef = doc(db, "bookings", bookingToCancel);
      await updateDoc(docRef, { bookingStatus: "Cancelled" });
      setBookings(prev =>
        prev.map(b => b.id === bookingToCancel ? { ...b, bookingStatus: "Cancelled" } : b)
      );
      setBookingToCancel(null);
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.email) return;
      
      try {
        const q = query(
          collection(db, "bookings"),
          where("userEmail", "==", user.email),
          // orderBy("createdAt", "desc") // requires composite index in firestore, keeping it simple for now
        );
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort manually for now
        data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setBookings(data);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking History</h1>
        <p className="text-muted-foreground mt-1">View your past and upcoming sessions.</p>
      </div>

      {bookings.length === 0 ? (
        <Card className="bg-card/50 border-border/50 p-12 text-center">
          <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
          <p className="text-muted-foreground mb-6">You haven't booked any gaming sessions.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-border/50 hover:bg-card/60 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  
                  {/* Left Side: Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{booking.bookingId}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                        booking.bookingStatus === 'Upcoming' ? 'bg-primary/10 text-primary border-primary/20' : 
                        booking.bookingStatus === 'Completed' ? 'bg-xbox-green/10 text-xbox-green border-xbox-green/20' :
                        'bg-destructive/10 text-destructive border-destructive/20'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> 
                        Station: {booking.seatId}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> 
                        {formatDateToIndian(booking.bookingDate)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> 
                        {formatTimeTo12Hour(booking.startTime)} - {formatTimeTo12Hour(booking.endTime)}
                        {booking.duration && booking.duration > 1 && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 ml-1">{booking.duration}h</span>
                        )}
                      </div>
                      {booking.peakPricing && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">Peak Pricing</span>
                        </div>
                      )}
                      {booking.groupSize && booking.groupSize > 1 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">Group ({booking.groupSize} seats)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Payment & Actions */}
                  <div className="md:text-right border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between items-start md:items-end gap-3 min-w-[150px]">
                    <div>
                      <div className="text-2xl font-bold text-primary mb-1">₹{booking.amount?.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground mt-1 font-medium">
                        {booking.paymentMethod}
                      </div>
                    </div>
                    {booking.bookingStatus === "Upcoming" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full md:w-auto hover:bg-destructive/90 transition-all font-semibold"
                        onClick={() => setBookingToCancel(booking.id)}
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                  
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-border/50 bg-card/95 backdrop-blur-md shadow-2xl p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-destructive flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" /> Cancel Booking
              </h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to cancel this booking? This action cannot be undone and your station seat will be released immediately.
              </p>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setBookingToCancel(null)}
                disabled={cancelling}
                className="font-medium"
              >
                No, Keep Booking
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancelBooking}
                disabled={cancelling}
                className="font-semibold shadow-lg shadow-destructive/20"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
