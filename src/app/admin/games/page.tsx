"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, Plus, Pencil, Trash2, Gamepad2, Sparkles, Star,
  Flame, Power, PowerOff, DatabaseZap
} from "lucide-react";
import { SEED_GAMES } from "@/lib/seedGames";
import type { Game } from "@/components/games/GameCard";
import Image from "next/image";

const EMPTY_GAME: Omit<Game, "id"> = {
  gameId: "",
  gameName: "",
  platform: "PS5",
  genre: "",
  description: "",
  coverImageUrl: "",
  releaseDate: "",
  rating: 0,
  totalRatings: 0,
  totalPlays: 0,
  isNewArrival: false,
  isTopRated: false,
  isMostPlayed: false,
  avgSessionDuration: 2,
  status: "active",
  createdAt: new Date().toISOString(),
};

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [form, setForm] = useState<Omit<Game, "id">>(EMPTY_GAME);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "games"));
      setGames(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Game[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGames(); }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      for (const game of SEED_GAMES) {
        // Check if already exists
        const q = query(collection(db, "games"), where("gameId", "==", game.gameId));
        const existing = await getDocs(q);
        if (existing.empty) {
          await addDoc(collection(db, "games"), game);
        }
      }
      await fetchGames();
    } catch (err) {
      console.error(err);
      alert("Seeding failed.");
    } finally {
      setSeeding(false);
    }
  };

  const openAdd = () => {
    setEditingGame(null);
    setForm({ ...EMPTY_GAME, gameId: `game_${Date.now()}`, createdAt: new Date().toISOString() });
    setShowForm(true);
  };

  const openEdit = (game: Game) => {
    setEditingGame(game);
    setForm({ ...game });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.gameName || !form.platform || !form.genre) {
      alert("Game name, platform and genre are required.");
      return;
    }
    setSaving(true);
    try {
      if (editingGame?.id) {
        await updateDoc(doc(db, "games", editingGame.id), { ...form });
      } else {
        await addDoc(collection(db, "games"), form);
      }
      setShowForm(false);
      await fetchGames();
    } catch (err) {
      console.error(err);
      alert("Failed to save game.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (game: Game) => {
    if (!confirm(`Delete "${game.gameName}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "games", game.id!));
      await fetchGames();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (game: Game) => {
    try {
      await updateDoc(doc(db, "games", game.id!), {
        status: game.status === "active" ? "inactive" : "active",
      });
      await fetchGames();
    } catch (err) {
      console.error(err);
    }
  };

  const Field = ({ label, id, children }: { label: string; id: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Game Management</h1>
          <p className="text-muted-foreground mt-1">Add, edit and manage games in the GamingBay library.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSeed} disabled={seeding}>
            {seeding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <DatabaseZap className="w-4 h-4 mr-2" />}
            Seed Sample Games
          </Button>
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" /> Add Game
          </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="border-primary/30 bg-card/70">
          <CardHeader>
            <CardTitle>{editingGame ? "Edit Game" : "Add New Game"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Game Name *" id="gameName">
                <Input id="gameName" value={form.gameName} onChange={e => setForm(f => ({ ...f, gameName: e.target.value }))} placeholder="e.g. Stellar Nexus" />
              </Field>
              <Field label="Platform *" id="platform">
                <select
                  id="platform"
                  value={form.platform}
                  onChange={e => setForm(f => ({ ...f, platform: e.target.value as Game["platform"] }))}
                  className="w-full px-3 py-2 rounded-md bg-background border border-border/50 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="PS5">PS5</option>
                  <option value="Xbox Series X">Xbox Series X</option>
                  <option value="Both">Both</option>
                </select>
              </Field>
              <Field label="Genre *" id="genre">
                <Input id="genre" value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} placeholder="e.g. Action RPG" />
              </Field>
              <Field label="Release Date" id="releaseDate">
                <Input id="releaseDate" type="date" value={form.releaseDate} onChange={e => setForm(f => ({ ...f, releaseDate: e.target.value }))} />
              </Field>
              <Field label="Cover Image URL" id="coverImageUrl">
                <Input id="coverImageUrl" value={form.coverImageUrl} onChange={e => setForm(f => ({ ...f, coverImageUrl: e.target.value }))} placeholder="/games/stellar_nexus.png" />
              </Field>
              <Field label="Avg Session Duration (hrs)" id="avgSessionDuration">
                <Input id="avgSessionDuration" type="number" min={1} value={form.avgSessionDuration} onChange={e => setForm(f => ({ ...f, avgSessionDuration: Number(e.target.value) }))} />
              </Field>
              <Field label="Rating (0–5)" id="rating">
                <Input id="rating" type="number" min={0} max={5} step={0.1} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))} />
              </Field>
              <Field label="Total Ratings" id="totalRatings">
                <Input id="totalRatings" type="number" min={0} value={form.totalRatings} onChange={e => setForm(f => ({ ...f, totalRatings: Number(e.target.value) }))} />
              </Field>
              <Field label="Total Plays" id="totalPlays">
                <Input id="totalPlays" type="number" min={0} value={form.totalPlays} onChange={e => setForm(f => ({ ...f, totalPlays: Number(e.target.value) }))} />
              </Field>
            </div>

            <Field label="Description" id="description">
              <textarea
                id="description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 rounded-md bg-background border border-border/50 text-sm focus:outline-none focus:border-primary resize-none"
                placeholder="Game description..."
              />
            </Field>

            {/* Flags */}
            <div className="flex flex-wrap gap-4 pt-2">
              {([
                { key: "isNewArrival", label: "New Arrival", icon: Sparkles },
                { key: "isTopRated", label: "Top Rated", icon: Star },
                { key: "isMostPlayed", label: "Most Played", icon: Flame },
              ] as const).map(({ key, label, icon: Icon }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form[key] as boolean}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                    className="w-4 h-4 accent-primary"
                  />
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.status === "active"}
                  onChange={e => setForm(f => ({ ...f, status: e.target.checked ? "active" : "inactive" }))}
                  className="w-4 h-4 accent-primary"
                />
                <Power className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Active</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingGame ? "Save Changes" : "Add Game"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Games Table */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : games.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-center border border-border/50 rounded-xl bg-card/30">
          <Gamepad2 className="w-12 h-12 text-muted-foreground" />
          <p className="font-medium">No games yet.</p>
          <p className="text-sm text-muted-foreground">Click "Seed Sample Games" to populate with demo data, or "Add Game" to add manually.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {games.map(game => (
            <Card key={game.id} className={`border-border/50 ${game.status === "inactive" ? "opacity-50" : ""}`}>
              <CardContent className="p-4">
                <div className="flex gap-4 items-start">
                  {/* Cover */}
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {game.coverImageUrl ? (
                      <Image src={game.coverImageUrl} alt={game.gameName} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold">{game.gameName}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded border ${game.platform === "PS5" ? "bg-ps-blue/10 text-ps-blue border-ps-blue/20" : "bg-xbox-green/10 text-xbox-green border-xbox-green/20"}`}>
                        {game.platform}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded border border-border/50 text-muted-foreground">{game.genre}</span>
                      {game.isNewArrival && <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">NEW</span>}
                      {game.isTopRated && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">TOP</span>}
                      {game.isMostPlayed && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">HOT</span>}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{game.description}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                      <span>⭐ {game.rating.toFixed(1)} ({game.totalRatings} ratings)</span>
                      <span>🔥 {game.totalPlays.toLocaleString()} plays</span>
                      <span>📅 {game.releaseDate}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleToggleStatus(game)} title={game.status === "active" ? "Deactivate" : "Activate"}>
                      {game.status === "active" ? <PowerOff className="w-4 h-4 text-destructive" /> : <Power className="w-4 h-4 text-xbox-green" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(game)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(game)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
