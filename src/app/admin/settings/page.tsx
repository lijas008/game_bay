"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndianRupee, Clock, Gamepad2, Save, Loader2, CheckCircle2, Users, TrendingUp } from "lucide-react";

interface Settings {
  ps5HourlyRate: number;
  xboxHourlyRate: number;
  openingTime: string;
  closingTime: string;
  daysOpen: string;
  ps5Units: number;
  xboxUnits: number;
  paymentMethod: string;
  peakStart: string;
  peakEnd: string;
  peakMultiplier: number;
  offPeakMultiplier: number;
  maxDuration: number;
  enableGroupBooking: boolean;
  maxGroupSize: number;
}

const DEFAULTS: Settings = {
  ps5HourlyRate: 120,
  xboxHourlyRate: 120,
  openingTime: "10:00 AM",
  closingTime: "10:00 PM",
  daysOpen: "Monday – Sunday",
  ps5Units: 4,
  xboxUnits: 4,
  paymentMethod: "Cash / UPI at Center",
  peakStart: "17:00",
  peakEnd: "21:00",
  peakMultiplier: 1.5,
  offPeakMultiplier: 1.0,
  maxDuration: 4,
  enableGroupBooking: true,
  maxGroupSize: 4,
};

const SETTINGS_DOC = "settings/gamingbay";

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "gamingbay"));
        if (snap.exists()) {
          setForm({ ...DEFAULTS, ...snap.data() } as Settings);
        }
      } catch (err) {
        console.error("Settings fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await setDoc(doc(db, "settings", "gamingbay"), { ...form, updatedAt: new Date().toISOString() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Settings save error:", err);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof Settings, value: string | number | boolean) =>
    setForm(f => ({ ...f, [key]: value }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure GamingBay center business settings.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4 mr-2 text-xbox-green" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Save Settings</>
          )}
        </Button>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-xbox-green/10 border border-xbox-green/20 text-xbox-green text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Settings saved successfully and are now live across the app.
        </div>
      )}

      {/* Pricing */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-primary" /> Pricing
          </CardTitle>
          <CardDescription>Set hourly rates for each console type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ps5Rate">PS5 – Hourly Rate (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                <Input
                  id="ps5Rate"
                  type="number"
                  min={1}
                  value={form.ps5HourlyRate || ""}
                  onChange={e => set("ps5HourlyRate", parseInt(e.target.value, 10) || 0)}
                  className="pl-7 bg-background/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">2-hr session: ₹{form.ps5HourlyRate * 2}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="xboxRate">Xbox Series X – Hourly Rate (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                <Input
                  id="xboxRate"
                  type="number"
                  min={1}
                  value={form.xboxHourlyRate || ""}
                  onChange={e => set("xboxHourlyRate", parseInt(e.target.value, 10) || 0)}
                  className="pl-7 bg-background/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">2-hr session: ₹{form.xboxHourlyRate * 2}</p>
            </div>
          </div>

          {/* Live preview */}
          <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Price Preview</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">PS5 / hour</span><span className="font-bold">₹{form.ps5HourlyRate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Xbox / hour</span><span className="font-bold">₹{form.xboxHourlyRate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">PS5 / 2hrs</span><span className="font-bold text-primary">₹{form.ps5HourlyRate * 2}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Xbox / 2hrs</span><span className="font-bold text-primary">₹{form.xboxHourlyRate * 2}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Pricing */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Dynamic Pricing
          </CardTitle>
          <CardDescription>Configure peak hours and duration pricing rules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="peakStart">Peak Hours Start</Label>
              <Input id="peakStart" type="time" value={form.peakStart} onChange={e => set("peakStart", e.target.value)} className="bg-background/50" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="peakEnd">Peak Hours End</Label>
              <Input id="peakEnd" type="time" value={form.peakEnd} onChange={e => set("peakEnd", e.target.value)} className="bg-background/50" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="peakMultiplier">Peak Hour Multiplier (×)</Label>
              <Input id="peakMultiplier" type="number" step={0.1} min={1} max={3} value={form.peakMultiplier} onChange={e => set("peakMultiplier", parseFloat(e.target.value) || 1)} className="bg-background/50" />
              <p className="text-xs text-muted-foreground">e.g. 1.5 = 50% extra during peak hours</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="offPeakMultiplier">Off-Peak Multiplier (×)</Label>
              <Input id="offPeakMultiplier" type="number" step={0.1} min={0.5} max={1} value={form.offPeakMultiplier} onChange={e => set("offPeakMultiplier", parseFloat(e.target.value) || 1)} className="bg-background/50" />
              <p className="text-xs text-muted-foreground">e.g. 0.8 = 20% discount off-peak</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxDuration">Max Session Duration (hours)</Label>
              <Input id="maxDuration" type="number" min={1} max={8} value={form.maxDuration} onChange={e => set("maxDuration", parseInt(e.target.value) || 4)} className="bg-background/50" />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Price Examples</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">PS5 off-peak 1h</span><span className="font-bold ml-2">₹{Math.round(form.ps5HourlyRate * form.offPeakMultiplier)}</span></div>
              <div><span className="text-muted-foreground">PS5 peak 1h</span><span className="font-bold ml-2">₹{Math.round(form.ps5HourlyRate * form.peakMultiplier)}</span></div>
              <div><span className="text-muted-foreground">Xbox off-peak 2h</span><span className="font-bold ml-2">₹{Math.round(form.xboxHourlyRate * form.offPeakMultiplier * 2)}</span></div>
              <div><span className="text-muted-foreground">Xbox peak 2h</span><span className="font-bold ml-2">₹{Math.round(form.xboxHourlyRate * form.peakMultiplier * 2)}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Group Booking */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Group / Party Booking
          </CardTitle>
          <CardDescription>Enable and configure group booking for parties.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="enableGroup" checked={form.enableGroupBooking} onChange={e => set("enableGroupBooking", e.target.checked)} className="w-4 h-4 accent-primary" />
            <Label htmlFor="enableGroup" className="cursor-pointer">Enable Group Booking</Label>
          </div>
          {form.enableGroupBooking && (
            <div className="space-y-1.5">
              <Label htmlFor="maxGroupSize">Max Group Size (seats per booking)</Label>
              <Input id="maxGroupSize" type="number" min={1} max={10} value={form.maxGroupSize} onChange={e => set("maxGroupSize", parseInt(e.target.value) || 4)} className="bg-background/50 w-full sm:w-48" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Operating Hours
          </CardTitle>
          <CardDescription>Set center open and close times shown to customers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="openingTime">Opening Time</Label>
              <Input
                id="openingTime"
                value={form.openingTime}
                onChange={e => set("openingTime", e.target.value)}
                placeholder="e.g. 10:00 AM"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="closingTime">Closing Time</Label>
              <Input
                id="closingTime"
                value={form.closingTime}
                onChange={e => set("closingTime", e.target.value)}
                placeholder="e.g. 10:00 PM"
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="daysOpen">Days Open</Label>
            <Input
              id="daysOpen"
              value={form.daysOpen}
              onChange={e => set("daysOpen", e.target.value)}
              placeholder="e.g. Monday – Sunday"
              className="bg-background/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Console Inventory */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-primary" /> Console Inventory
          </CardTitle>
          <CardDescription>Total hardware units and payment method at the center.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ps5Units">PlayStation 5 Units</Label>
              <Input
                id="ps5Units"
                type="number"
                min={0}
                value={form.ps5Units || ""}
                onChange={e => set("ps5Units", parseInt(e.target.value, 10) || 0)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="xboxUnits">Xbox Series X Units</Label>
              <Input
                id="xboxUnits"
                type="number"
                min={0}
                value={form.xboxUnits || ""}
                onChange={e => set("xboxUnits", parseInt(e.target.value, 10) || 0)}
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Input
              id="paymentMethod"
              value={form.paymentMethod}
              onChange={e => set("paymentMethod", e.target.value)}
              placeholder="e.g. Cash / UPI at Center"
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">This is shown to customers during booking confirmation.</p>
          </div>

          {/* Inventory Summary */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50 grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">PS5 Total</span>
              <span className="font-bold text-ps-blue">{form.ps5Units} units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Xbox Total</span>
              <span className="font-bold text-xbox-green">{form.xboxUnits} units</span>
            </div>
            <div className="col-span-2 flex justify-between items-center pt-2 border-t border-border/50">
              <span className="text-muted-foreground">Total Consoles</span>
              <span className="font-bold">{form.ps5Units + form.xboxUnits} units</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button at Bottom Too */}
      <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
        {saving ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
        ) : saved ? (
          <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved!</>
        ) : (
          <><Save className="w-4 h-4 mr-2" /> Save All Settings</>
        )}
      </Button>
    </div>
  );
}
