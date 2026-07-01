"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Gamepad2, CalendarClock, CheckCircle2, CalendarX, Clock,
  Sparkles, Star, Flame, Search, SlidersHorizontal, Loader2
} from "lucide-react";
import Link from "next/link";
import { formatTimeTo12Hour, formatDateToIndian } from "@/lib/utils";
import GameCard, { Game } from "@/components/games/GameCard";

type SortOption = "newest" | "rated" | "played";
type PlatformFilter = "All" | "PS5" | "Xbox Series X";

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const [statsLoading, setStatsLoading] = useState(true);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [nextBooking, setNextBooking] = useState<any | null>(null);
  const [allGames, setAllGames] = useState<Game[]>([]);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<PlatformFilter>("All");
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState<SortOption>("newest");

  // Fetch booking stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.email) return;
      try {
        const q = query(collection(db, "bookings"), where("userEmail", "==", user.email));
        const snapshot = await getDocs(q);
        const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

        setTotalBookings(all.length);
        const upcoming = all.filter(b => b.bookingStatus === "Upcoming");
        setUpcomingCount(upcoming.length);

        const today = new Date().toISOString().split("T")[0];
        const future = upcoming
          .filter(b => b.bookingDate >= today)
          .sort((a, b) => a.bookingDate.localeCompare(b.bookingDate) || a.startTime.localeCompare(b.startTime));
        setNextBooking(future[0] || null);
      } catch (err) {
        console.error(err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  // Fetch games from Firestore
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, "games"), where("status", "==", "active"))
        );
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Game[];
        setAllGames(data);
      } catch (err) {
        console.error("Games fetch error:", err);
      } finally {
        setGamesLoading(false);
      }
    };
    fetchGames();
  }, []);

  // Derived slices
  const newArrivals = useMemo(() => allGames.filter(g => g.isNewArrival), [allGames]);
  const topRated = useMemo(() => allGames.filter(g => g.isTopRated).sort((a, b) => b.rating - a.rating), [allGames]);
  const mostPlayed = useMemo(() => allGames.filter(g => g.isMostPlayed).sort((a, b) => b.totalPlays - a.totalPlays), [allGames]);

  // All unique genres
  const genres = useMemo(() => {
    const g = new Set(allGames.map(g => g.genre));
    return ["All", ...Array.from(g)];
  }, [allGames]);

  // Filtered & sorted games for search
  const filteredGames = useMemo(() => {
    let result = [...allGames];
    if (search) result = result.filter(g => g.gameName.toLowerCase().includes(search.toLowerCase()));
    if (platform !== "All") result = result.filter(g => g.platform === platform);
    if (genre !== "All") result = result.filter(g => g.genre === genre);
    if (sort === "newest") result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
    if (sort === "rated") result.sort((a, b) => b.rating - a.rating);
    if (sort === "played") result.sort((a, b) => b.totalPlays - a.totalPlays);
    return result;
  }, [allGames, search, platform, genre, sort]);

  const isFiltering = search || platform !== "All" || genre !== "All";

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile?.fullName?.split(" ")[0] || "Gamer"}! 👾
          </h1>
          <p className="text-muted-foreground mt-1">Ready for your next gaming session?</p>
        </div>
        <Link href="/dashboard/book">
          <Button size="lg" className="shadow-lg hover:shadow-primary/20 transition-all">
            <Gamepad2 className="mr-2 h-5 w-5" /> Book Session
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            <CalendarClock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : upcomingCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingCount === 0 ? "No upcoming sessions" : `${upcomingCount} session${upcomingCount > 1 ? "s" : ""} scheduled`}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-xbox-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalBookings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime sessions booked</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            <Clock className="h-4 w-4 text-ps-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Account creation date</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Session */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Your Next Session</CardTitle>
            <CardDescription>Details for your next upcoming booking.</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : nextBooking ? (
              <div className="p-4 rounded-lg bg-secondary border border-border/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{nextBooking.seatId}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDateToIndian(nextBooking.bookingDate)} &bull; {formatTimeTo12Hour(nextBooking.startTime)} – {formatTimeTo12Hour(nextBooking.endTime)}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    {nextBooking.bookingStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-4 border-t border-border/50">
                  <span className="text-muted-foreground">Payment:</span>
                  <span className="font-medium text-amber-500">
                    {nextBooking.paymentMethod} (₹{nextBooking.amount?.toFixed(2)})
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 gap-3 text-center">
                <CalendarX className="w-10 h-10 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">No upcoming sessions.</p>
                <Link href="/dashboard/book"><Button size="sm">Book a Session</Button></Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consoles */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Available Consoles</CardTitle>
            <CardDescription>Choose your preferred next-gen experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "PlayStation 5", color: "ps-blue", price: "₹120/hour" },
              { name: "Xbox Series X", color: "xbox-green", price: "₹120/hour" },
            ].map(c => (
              <div key={c.name} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-${c.color}/10 flex items-center justify-center`}>
                    <Gamepad2 className={`w-5 h-5 text-${c.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{c.price}</p>
                  </div>
                </div>
                <Link href="/dashboard/book">
                  <Button size="sm" variant="outline">Book</Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── GAME LIBRARY ── */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-primary" /> Game Library
        </h2>
        <p className="text-muted-foreground">Browse all available games at GamingBay.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 p-4 rounded-xl bg-card/50 border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search games..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Platform filter */}
          {(["All", "PS5", "Xbox Series X"] as PlatformFilter[]).map(p => (
            <Button
              key={p}
              size="sm"
              variant={platform === p ? "default" : "outline"}
              onClick={() => setPlatform(p)}
              className="text-xs"
            >
              {p}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Genre filter */}
          <select
            value={genre}
            onChange={e => setGenre(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-background border border-border/50 text-sm focus:outline-none focus:border-primary"
          >
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="px-3 py-1.5 rounded-md bg-background border border-border/50 text-sm focus:outline-none focus:border-primary"
          >
            <option value="newest">Newest</option>
            <option value="rated">Highest Rated</option>
            <option value="played">Most Played</option>
          </select>
        </div>
      </div>

      {gamesLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : allGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-center border border-border/50 rounded-xl bg-card/30">
          <Gamepad2 className="w-12 h-12 text-muted-foreground" />
          <p className="font-medium">No games available yet.</p>
          <p className="text-sm text-muted-foreground">Ask the admin to add games from the admin panel.</p>
        </div>
      ) : isFiltering ? (
        // Filtered results
        <>
          <h3 className="font-semibold text-muted-foreground text-sm">
            {filteredGames.length} result{filteredGames.length !== 1 ? "s" : ""} found
          </h3>
          {filteredGames.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No games match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredGames.map(g => (
                <GameCard
                  key={g.gameId}
                  game={g}
                  variant={g.isNewArrival ? "new" : g.isTopRated ? "rated" : "played"}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        // Full sectioned view
        <div className="space-y-12">
          {/* New Arrivals */}
          {newArrivals.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">New Arrivals</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {newArrivals.length} games
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {newArrivals.map(g => <GameCard key={g.gameId} game={g} variant="new" />)}
              </div>
            </section>
          )}

          {/* Top Rated */}
          {topRated.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="text-xl font-bold">Top Rated Games</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {topRated.length} games
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {topRated.map(g => <GameCard key={g.gameId} game={g} variant="rated" />)}
              </div>
            </section>
          )}

          {/* Most Played */}
          {mostPlayed.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Flame className="w-5 h-5 text-red-500" />
                <h3 className="text-xl font-bold">Most Played Games</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                  {mostPlayed.length} games
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {mostPlayed.map(g => <GameCard key={g.gameId} game={g} variant="played" />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
