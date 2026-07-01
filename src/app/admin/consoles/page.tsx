"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Pencil, Trash2, Gamepad2, Monitor, Power, PowerOff } from "lucide-react";

export default function AdminConsolesPage() {
  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSeat, setEditingSeat] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", consoleType: "PS5", status: "available" });

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "seats"));
      setSeats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSeats(); }, []);

  const openAdd = () => {
    setEditingSeat(null);
    setForm({ name: "", consoleType: "PS5", status: "available" });
    setShowForm(true);
  };

  const openEdit = (seat: any) => {
    setEditingSeat(seat);
    setForm({ name: seat.name, consoleType: seat.consoleType || seat.consoleId, status: seat.status });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) { alert("Station name is required."); return; }
    setSaving(true);
    try {
      const data = {
        name: form.name,
        consoleType: form.consoleType,
        consoleId: form.consoleType === "PS5" ? "ps5" : "xbox",
        status: form.status,
      };
      if (editingSeat) {
        await updateDoc(doc(db, "seats", editingSeat.id), data);
      } else {
        await addDoc(collection(db, "seats"), { ...data, createdAt: new Date().toISOString() });
      }
      setShowForm(false);
      await fetchSeats();
    } catch (err) { console.error(err); alert("Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (seat: any) => {
    if (!confirm(`Delete "${seat.name}"?`)) return;
    await deleteDoc(doc(db, "seats", seat.id));
    await fetchSeats();
  };

  const handleToggle = async (seat: any) => {
    await updateDoc(doc(db, "seats", seat.id), {
      status: seat.status === "available" ? "maintenance" : "available",
    });
    await fetchSeats();
  };

  const ps5Seats = seats.filter(s => s.consoleType === "PS5" || s.consoleId === "ps5");
  const xboxSeats = seats.filter(s => s.consoleType === "Xbox Series X" || s.consoleId === "xbox");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consoles & Seats</h1>
          <p className="text-muted-foreground mt-1">Manage gaming stations and their availability.</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Add Station</Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="border-primary/30 bg-card/70">
          <CardHeader><CardTitle>{editingSeat ? "Edit Station" : "Add New Station"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Station Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. PS5 - Station 3" />
              </div>
              <div className="space-y-1.5">
                <Label>Console Type</Label>
                <select value={form.consoleType} onChange={e => setForm(f => ({ ...f, consoleType: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-background border border-border/50 text-sm focus:outline-none focus:border-primary">
                  <option value="PS5">PlayStation 5</option>
                  <option value="Xbox Series X">Xbox Series X</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-background border border-border/50 text-sm focus:outline-none focus:border-primary">
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingSeat ? "Save Changes" : "Add Station"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PS5 */}
          <Card className="border-ps-blue/20">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-ps-blue">
                <Gamepad2 className="w-5 h-5" /> PlayStation 5
                <span className="text-xs font-normal text-muted-foreground ml-auto">{ps5Seats.length} stations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {ps5Seats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No PS5 stations added yet.</p>
              ) : ps5Seats.map(seat => (
                <div key={seat.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/40">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-4 h-4 text-ps-blue" />
                    <div>
                      <p className="font-medium text-sm">{seat.name}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${seat.status === "available" ? "bg-xbox-green/10 text-xbox-green" : "bg-amber-500/10 text-amber-500"}`}>
                        {seat.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleToggle(seat)} title="Toggle status">
                      {seat.status === "available" ? <PowerOff className="w-4 h-4 text-amber-500" /> : <Power className="w-4 h-4 text-xbox-green" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(seat)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(seat)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Xbox */}
          <Card className="border-xbox-green/20">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-xbox-green">
                <Gamepad2 className="w-5 h-5" /> Xbox Series X
                <span className="text-xs font-normal text-muted-foreground ml-auto">{xboxSeats.length} stations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {xboxSeats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No Xbox stations added yet.</p>
              ) : xboxSeats.map(seat => (
                <div key={seat.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/40">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-4 h-4 text-xbox-green" />
                    <div>
                      <p className="font-medium text-sm">{seat.name}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${seat.status === "available" ? "bg-xbox-green/10 text-xbox-green" : "bg-amber-500/10 text-amber-500"}`}>
                        {seat.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleToggle(seat)}>
                      {seat.status === "available" ? <PowerOff className="w-4 h-4 text-amber-500" /> : <Power className="w-4 h-4 text-xbox-green" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(seat)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(seat)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
