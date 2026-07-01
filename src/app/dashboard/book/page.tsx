"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, query, getDocs, addDoc, where, doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, CheckCircle2, Users, Clock, Sun, Moon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDateToIndian, formatTimeTo12Hour } from "@/lib/utils";

interface Settings {
  ps5HourlyRate: number;
  xboxHourlyRate: number;
  maxDuration: number;
  enableGroupBooking: boolean;
  maxGroupSize: number;
  peakStart: string;
  peakEnd: string;
  peakMultiplier: number;
  offPeakMultiplier: number;
  paymentMethod: string;
}

const DEFAULT_SETTINGS: Settings = {
  ps5HourlyRate: 120,
  xboxHourlyRate: 120,
  maxDuration: 4,
  enableGroupBooking: true,
  maxGroupSize: 4,
  peakStart: "17:00",
  peakEnd: "21:00",
  peakMultiplier: 1.5,
  offPeakMultiplier: 1.0,
  paymentMethod: "Cash / UPI at Center",
};

const TIME_SLOTS = [
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "12:00", end: "13:00" },
  { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" },
  { start: "17:00", end: "18:00" },
  { start: "18:00", end: "19:00" },
  { start: "19:00", end: "20:00" },
  { start: "20:00", end: "21:00" },
  { start: "21:00", end: "22:00" },
];

const DURATIONS = [1, 2, 3, 4];

function isPeakHour(startTime: string, peakStart: string, peakEnd: string) {
  const start = parseInt(startTime.replace(":", ""), 10);
  const peakS = parseInt(peakStart.replace(":", ""), 10);
  const peakE = parseInt(peakEnd.replace(":", ""), 10);
  if (peakE >= peakS) return start >= peakS && start < peakE;
  return start >= peakS || start < peakE;
}

function calcPrice(consoleRate: number, duration: number, isPeak: boolean, settings: Settings) {
  const multiplier = isPeak ? settings.peakMultiplier : settings.offPeakMultiplier;
  return Math.round(consoleRate * duration * multiplier);
}

export default function BookSessionPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Step 1: Console + Group
  const [selectedConsoleType, setSelectedConsoleType] = useState<string | null>(null);
  const [groupSize, setGroupSize] = useState(1);

  // Step 2: Seats
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);

  // Step 3: Date, Duration, Time
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string; end: string } | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const consoles = [
    { id: "ps5", name: "PlayStation 5", type: "PS5", rate: settings.ps5HourlyRate },
    { id: "xbox", name: "Xbox Series X", type: "Xbox", rate: settings.xboxHourlyRate },
  ];

  const selectedConsole = consoles.find(c => c.type === selectedConsoleType);

  // Fetch settings & seats on mount
  useEffect(() => {
    const load = async () => {
      try {
        const settingsSnap = await getDoc(doc(db, "settings", "gamingbay"));
        if (settingsSnap.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsSnap.data() });
        }
        const seatsSnap = await getDocs(collection(db, "seats"));
        if (!seatsSnap.empty) {
          setSeats(seatsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setSeats([
            { id: "s1", consoleId: "ps5", name: "PS5 - Station 1", status: "available" },
            { id: "s2", consoleId: "ps5", name: "PS5 - Station 2", status: "available" },
            { id: "s3", consoleId: "xbox", name: "Xbox - Station 1", status: "available" },
            { id: "s4", consoleId: "xbox", name: "Xbox - Station 2", status: "available" },
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  // Fetch booked slots when date or seats change
  useEffect(() => {
    if (!selectedDate || selectedSeats.length === 0) {
      setBookedSlots([]);
      return;
    }
    const fetchBooked = async () => {
      setSlotsLoading(true);
      try {
        const seatIds = selectedSeats.map(s => s.id);
        const q = query(
          collection(db, "bookings"),
          where("bookingDate", "==", selectedDate),
          where("seatId", "in", seatIds)
        );
        const snap = await getDocs(q);
        const taken = new Set<string>();
        snap.docs.forEach(d => {
          const data = d.data();
          const st = data.startTime;
          const dur = data.duration || 1;
          for (let h = 0; h < dur; h++) {
            const [sh, sm] = st.split(":").map(Number);
            const slotStart = `${String(sh + h).padStart(2, "0")}:${String(sm).padStart(2, "0")}`;
            taken.add(slotStart);
          }
        });
        setBookedSlots(Array.from(taken));
      } catch (err) {
        console.error(err);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchBooked();
  }, [selectedDate, selectedSeats]);

  const availableSlots = useMemo(() => {
    return TIME_SLOTS.filter(slot => {
      const slotEndH = parseInt(slot.end.split(":")[0], 10);
      const maxH = parseInt(slot.start.split(":")[0], 10) + selectedDuration;
      const available = !bookedSlots.includes(slot.start);
      const withinBounds = maxH <= 22;
      const slotTaken = [];
      for (let h = 1; h < selectedDuration; h++) {
        const [sh] = slot.start.split(":").map(Number);
        const check = `${String(sh + h).padStart(2, "0")}:00`;
        slotTaken.push(bookedSlots.includes(check));
      }
      return available && withinBounds && !slotTaken.some(Boolean);
    });
  }, [bookedSlots, selectedDuration]);

  const filteredSeats = useMemo(() => {
    if (!selectedConsoleType) return [];
    return seats.filter(s => {
      const c = consoles.find(c => c.id === s.consoleId);
      return c?.type === selectedConsoleType && s.status === "available";
    });
  }, [seats, selectedConsoleType]);

  const maxGroup = settings.enableGroupBooking ? Math.min(settings.maxGroupSize, filteredSeats.length) : 1;
  const durationOptions = DURATIONS.filter(d => d <= settings.maxDuration);

  const canSelectSeat = (seat: any) => {
    if (selectedSeats.find(s => s.id === seat.id)) return true;
    return selectedSeats.length < groupSize;
  };

  const toggleSeat = (seat: any) => {
    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else if (selectedSeats.length < groupSize) {
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  const isPeak = selectedTimeSlot ? isPeakHour(selectedTimeSlot.start, settings.peakStart, settings.peakEnd) : false;
  const perSeatPrice = selectedConsole ? calcPrice(selectedConsole.rate, selectedDuration, isPeak, settings) : 0;
  const totalPrice = perSeatPrice * selectedSeats.length;

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => {
    setStep(s => s - 1);
    if (step === 3) setSelectedTimeSlot(null);
    if (step === 2) setSelectedSeats([]);
  };

  const handleConfirmBooking = async () => {
    if (!user || selectedSeats.length === 0 || !selectedDate || !selectedTimeSlot) return;
    setLoading(true);
    try {
      const consoleData = consoles.find(c => c.type === selectedConsoleType);
      const groupBookingId = `GRP-${Date.now()}`;

      for (const seat of selectedSeats) {
        const q = query(
          collection(db, "bookings"),
          where("seatId", "==", seat.id),
          where("bookingDate", "==", selectedDate),
          where("startTime", "==", selectedTimeSlot.start)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          alert(`"${seat.name}" was just booked by someone else. Please try a different slot or seat.`);
          setLoading(false);
          return;
        }

        await addDoc(collection(db, "bookings"), {
          bookingId: `BKG-${Math.floor(Math.random() * 10000)}`,
          userEmail: user.email,
          consoleId: seat.consoleId,
          seatId: seat.id,
          bookingDate: selectedDate,
          startTime: selectedTimeSlot.start,
          endTime: selectedTimeSlot.end,
          duration: selectedDuration,
          amount: perSeatPrice,
          peakPricing: isPeak,
          groupBookingId: selectedSeats.length > 1 ? groupBookingId : null,
          groupSize: selectedSeats.length,
          paymentMethod: settings.paymentMethod,
          paymentStatus: "Pending",
          bookingStatus: "Upcoming",
          createdAt: new Date().toISOString(),
        });
      }

      router.push("/dashboard/history");
    } catch (err) {
      console.error(err);
      alert("Failed to create booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Book a Session</h1>
        <p className="text-muted-foreground mt-1">Reserve your spot in 4 easy steps.</p>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Select Console & Group Size"}
            {step === 2 && "Select Your Station(s)"}
            {step === 3 && "Select Date, Duration & Time"}
            {step === 4 && "Confirm Booking"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Choose your console and number of players."}
            {step === 2 && `Select up to ${groupSize} station${groupSize > 1 ? "s" : ""}.`}
            {step === 3 && "Pick your session length and preferred time."}
            {step === 4 && "Review your booking details before confirming."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Console + Group Size */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {consoles.map(c => (
                  <div
                    key={c.id}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedConsoleType === c.type ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/50"}`}
                    onClick={() => { setSelectedConsoleType(c.type); setSelectedSeats([]); }}
                  >
                    <Gamepad2 className={`w-12 h-12 mb-4 ${c.type === "PS5" ? "text-ps-blue" : "text-xbox-green"}`} />
                    <h3 className="text-xl font-bold">{c.name}</h3>
                    <p className="text-muted-foreground">₹{c.rate}/hr</p>
                  </div>
                ))}
              </div>

              {settings.enableGroupBooking && selectedConsoleType && (
                <div className="p-4 rounded-lg bg-secondary border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Party / Group Booking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Number of seats:</span>
                    <select
                      value={groupSize}
                      onChange={e => { setGroupSize(Number(e.target.value)); setSelectedSeats([]); }}
                      className="px-3 py-1.5 rounded-md bg-background border border-border/50 text-sm focus:outline-none focus:border-primary"
                    >
                      {Array.from({ length: maxGroup }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} seat{n > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground">Book multiple seats together</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Seats */}
          {step === 2 && (
            <div className="space-y-4">
              {filteredSeats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No available stations for this console.</div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Select {groupSize === 1 ? "a station" : `up to ${groupSize} stations`}:
                    <span className="ml-2 font-medium text-foreground">{selectedSeats.length}/{groupSize} selected</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredSeats.map(seat => {
                      const isSelected = !!selectedSeats.find(s => s.id === seat.id);
                      const canSelect = canSelectSeat(seat);
                      return (
                        <div
                          key={seat.id}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : canSelect
                              ? "border-border/50 hover:border-primary/50"
                              : "border-border/30 opacity-40 cursor-not-allowed"
                          }`}
                          onClick={() => canSelect && toggleSeat(seat)}
                        >
                          <div>
                            <h4 className="font-semibold">{seat.name}</h4>
                            <p className="text-sm text-muted-foreground capitalize">{seat.status}</p>
                          </div>
                          {isSelected && <CheckCircle2 className="text-primary w-6 h-6" />}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Date, Duration & Visual Time Slots */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Date</label>
                  <input
                    type="date"
                    className="w-full p-3 rounded-md bg-background border border-border/50 focus:outline-none focus:border-primary text-foreground cursor-pointer appearance-none"
                    style={{ colorScheme: "dark" }}
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Session Duration</label>
                  <div className="flex gap-2">
                    {durationOptions.map(d => (
                      <Button
                        key={d}
                        size="sm"
                        variant={selectedDuration === d ? "default" : "outline"}
                        onClick={() => { setSelectedDuration(d); setSelectedTimeSlot(null); }}
                        className="flex-1"
                      >
                        {d}h
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Available Time Slots</label>
                  {slotsLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {selectedTimeSlot && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPeak ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-xbox-green/10 text-xbox-green border border-xbox-green/20"}`}>
                      {isPeak ? "Peak Pricing" : "Off-Peak"}
                    </span>
                  )}
                </div>

                {!selectedDate || selectedSeats.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border border-border/50 rounded-lg">
                    {!selectedDate ? "Please select a date first." : "No seats selected. Go back and select seats."}
                  </div>
                ) : availableSlots.length === 0 && !slotsLoading ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border border-border/50 rounded-lg">
                    No available {selectedDuration}h slots for this date. Try a different duration or date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {TIME_SLOTS.map(slot => {
                      const slotEndH = parseInt(slot.end.split(":")[0], 10);
                      const maxH = parseInt(slot.start.split(":")[0], 10) + selectedDuration;
                      const isBooked = bookedSlots.includes(slot.start);
                      const outOfBounds = maxH > 22;

                      let slotTaken = false;
                      for (let h = 1; h < selectedDuration; h++) {
                        const [sh] = slot.start.split(":").map(Number);
                        if (bookedSlots.includes(`${String(sh + h).padStart(2, "0")}:00`)) slotTaken = true;
                      }

                      const isAvailable = !isBooked && !outOfBounds && !slotTaken;
                      const isSelected = selectedTimeSlot?.start === slot.start;

                      return (
                        <div
                          key={slot.start}
                          onClick={() => isAvailable && setSelectedTimeSlot(isSelected ? null : slot)}
                          className={`p-3 text-center rounded-lg border cursor-pointer transition-all text-sm ${
                            isSelected
                              ? "border-primary bg-primary/20 text-primary font-bold ring-2 ring-primary/30"
                              : isAvailable
                              ? "border-xbox-green/40 bg-xbox-green/5 text-foreground hover:border-xbox-green hover:bg-xbox-green/10"
                              : "border-border/20 bg-muted/30 text-muted-foreground/50 cursor-not-allowed line-through"
                          }`}
                        >
                          <div className="font-medium">{formatTimeTo12Hour(slot.start)}</div>
                          <div className="text-[10px] opacity-70">– {formatTimeTo12Hour(slot.end)}</div>
                          <div className={`mt-1 w-2 h-2 rounded-full mx-auto ${
                            isSelected ? "bg-primary" : isAvailable ? "bg-xbox-green" : "bg-destructive/50"
                          }`} />
                          {isAvailable && selectedDuration > 1 && (
                            <div className="text-[10px] mt-1 text-muted-foreground">{selectedDuration}h slot</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedTimeSlot && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium">{formatDateToIndian(selectedDate)}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{formatTimeTo12Hour(selectedTimeSlot.start)} – {formatTimeTo12Hour(selectedTimeSlot.end)}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{selectedDuration}h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPeak ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-ps-blue" />}
                    <span className={`font-semibold ${isPeak ? "text-amber-500" : "text-xbox-green"}`}>
                      {isPeak ? `Peak ×${settings.peakMultiplier}` : `Off-Peak ×${settings.offPeakMultiplier}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-secondary border border-border/50 space-y-3">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Console</span>
                  <span className="font-medium">{selectedConsoleType}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Station{selectedSeats.length > 1 ? "s" : ""}</span>
                  <span className="font-medium text-right">{selectedSeats.map(s => s.name).join(", ")}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{formatDateToIndian(selectedDate)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{formatTimeTo12Hour(selectedTimeSlot!.start)} – {formatTimeTo12Hour(selectedTimeSlot!.end)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{selectedDuration} hour{selectedDuration > 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Pricing</span>
                  <span className={`font-medium ${isPeak ? "text-amber-500" : "text-xbox-green"}`}>
                    {isPeak ? `Peak (×${settings.peakMultiplier})` : `Off-Peak (×${settings.offPeakMultiplier})`}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="font-medium">{selectedSeats.length} × ₹{perSeatPrice}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-muted-foreground font-medium">Total Amount</span>
                  <span className="font-bold text-lg text-primary">₹{totalPrice}</span>
                </div>
              </div>

              {selectedSeats.length > 1 && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Group booking for {selectedSeats.length} players. All seats share the same time slot.
                </div>
              )}

              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm">
                <strong>Payment:</strong> Pay ₹{totalPrice} at the Gaming Center counter before your session begins. {isPeak && "Peak hour pricing applies."}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-border/10 pt-6">
          <Button variant="outline" onClick={handleBack} disabled={step === 1 || loading}>
            Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={handleNext}
              disabled={
                (step === 1 && !selectedConsoleType) ||
                (step === 2 && selectedSeats.length === 0) ||
                (step === 3 && (!selectedDate || !selectedTimeSlot))
              }
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleConfirmBooking} disabled={loading}>
              {loading ? "Booking..." : `Confirm Booking${selectedSeats.length > 1 ? ` (${selectedSeats.length} seats)` : ""}`}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
