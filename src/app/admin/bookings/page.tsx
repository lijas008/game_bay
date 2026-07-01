"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, CheckCircle2, XCircle, Banknote, Clock, Inbox } from "lucide-react";
import { formatTimeTo12Hour, formatDateToIndian } from "@/lib/utils";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [confirmDialog, setConfirmDialog] = useState<{ id: string, action: string, title: string, desc: string, variant: "destructive" | "default" } | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "bookings"));
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(data as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateField = async (id: string, field: string, value: string) => {
    try {
      await updateDoc(doc(db, "bookings", id), { [field]: value });
      await fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors: Record<string, string> = {
    Upcoming:  "bg-primary/10 text-primary border-primary/20",
    Completed: "bg-xbox-green/10 text-xbox-green border-xbox-green/20",
    Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      b.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      b.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
      b.seatId?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || b.bookingStatus === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
        <p className="text-muted-foreground mt-1">View, approve, cancel and mark bookings as paid.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by email, booking ID or seat…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Upcoming", "Completed", "Cancelled"].map(s => (
            <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>{s}</Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground border border-border/50 rounded-xl">
          <Inbox className="w-10 h-10" />
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b: any) => (
            <Card key={b.id} className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm">{b.bookingId || b.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${statusColors[b.bookingStatus] || "bg-muted"}`}>{b.bookingStatus}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{b.userEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.seatId} &bull; {formatDateToIndian(b.bookingDate)} &bull; {formatTimeTo12Hour(b.startTime)}–{formatTimeTo12Hour(b.endTime)}
                      {b.duration && <span className="ml-1">({b.duration}h)</span>}
                      {b.peakPricing && <span className="ml-1 text-amber-500">Peak</span>}
                      {b.groupSize && b.groupSize > 1 && <span className="ml-1 text-primary">Group-{b.groupSize}</span>}
                      &bull; <span className="font-semibold text-foreground">₹{b.amount}</span>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {b.bookingStatus !== "Completed" && (
                      <Button size="sm" variant="outline" className="text-xbox-green border-xbox-green/30 hover:bg-xbox-green/10"
                        onClick={() => setConfirmDialog({ id: b.id, action: "Completed", title: "Complete Booking", desc: `Are you sure you want to mark booking ${b.bookingId || b.id} as completed?`, variant: "default" })}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                      </Button>
                    )}
                    {b.bookingStatus !== "Cancelled" && (
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => setConfirmDialog({ id: b.id, action: "Cancelled", title: "Cancel Booking", desc: `Are you sure you want to cancel booking ${b.bookingId || b.id}?`, variant: "destructive" })}>
                        <XCircle className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                    )}

                    {b.bookingStatus !== "Upcoming" && (
                      <Button size="sm" variant="outline" className="text-primary border-primary/30 hover:bg-primary/10"
                        onClick={() => setConfirmDialog({ id: b.id, action: "Upcoming", title: "Restore Booking", desc: `Are you sure you want to restore booking ${b.bookingId || b.id}?`, variant: "default" })}>
                        <Clock className="w-4 h-4 mr-1" /> Restore
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog Overlay */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm border-border/50 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>{confirmDialog.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                {confirmDialog.desc}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setConfirmDialog(null)}>
                  Keep as is
                </Button>
                <Button 
                  variant={confirmDialog.variant} 
                  className={confirmDialog.action === "Completed" ? "bg-xbox-green hover:bg-xbox-green/90 text-black" : ""}
                  onClick={() => {
                    updateField(confirmDialog.id, "bookingStatus", confirmDialog.action);
                    setConfirmDialog(null);
                  }}
                >
                  Yes, {confirmDialog.action === "Cancelled" ? "Cancel" : confirmDialog.action === "Completed" ? "Complete" : "Restore"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
