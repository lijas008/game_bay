"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gamepad2, DollarSign, CalendarCheck, Loader2, TrendingUp, BarChart3, Clock } from "lucide-react";
import { formatDateToIndian } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const PEAK_COLOR = "#f59e0b";
const OFFPEAK_COLOR = "#10b981";
const PS5_COLOR = "#3b82f6";
const XBOX_COLOR = "#22c55e";
const CHART_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [allGames, setAllGames] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [usersSnap, bookingsSnap, gamesSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "bookings")),
          getDocs(collection(db, "games")),
        ]);
        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setBookings(bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setAllGames(gamesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    let todayBookings = 0;
    let revenue = 0;
    let completedCount = 0;

    bookings.forEach((b: any) => {
      if (b.bookingDate === today) todayBookings++;
      if (b.bookingStatus === "Completed") {
        revenue += b.amount || 0;
        completedCount++;
      }
    });

    return {
      totalUsers: users.length,
      totalBookings: bookings.length,
      todayBookings,
      revenue,
      completedBookings: completedCount,
    };
  }, [users, bookings]);

  // Revenue trend: last 7 days
  const revenueTrend = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      days[key] = 0;
    }
    bookings.forEach((b: any) => {
      if (b.bookingStatus === "Completed" && b.bookingDate && days[b.bookingDate] !== undefined) {
        days[b.bookingDate] += b.amount || 0;
      }
    });
    return Object.entries(days).map(([date, rev]) => ({
      date: formatDateToIndian(date).slice(0, 5),
      revenue: rev,
    }));
  }, [bookings]);

  // Bookings by day of week
  const dayOfWeek = useMemo(() => {
    const map: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    bookings.forEach((b: any) => {
      if (b.bookingDate) {
        const day = new Date(b.bookingDate.split("-").join("/")).getDay();
        const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        map[names[day]]++;
      }
    });
    return Object.entries(map).map(([day, count]) => ({ day, bookings: count }));
  }, [bookings]);

  // Bookings by status
  const statusData = useMemo(() => {
    const map: Record<string, number> = { Upcoming: 0, Completed: 0, Cancelled: 0 };
    bookings.forEach((b: any) => {
      if (map[b.bookingStatus] !== undefined) map[b.bookingStatus]++;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  // Console popularity
  const consoleData = useMemo(() => {
    let ps5 = 0, xbox = 0;
    bookings.forEach((b: any) => {
      if (b.consoleId === "ps5") ps5++;
      else if (b.consoleId === "xbox") xbox++;
    });
    return [
      { name: "PS5", bookings: ps5 },
      { name: "Xbox Series X", bookings: xbox },
    ];
  }, [bookings]);

  // Peak v/s off-peak
  const peakData = useMemo(() => {
    let peak = 0, offpeak = 0;
    bookings.forEach((b: any) => {
      if (b.peakPricing) peak++;
      else offpeak++;
    });
    return [
      { name: "Peak Hours", value: peak, color: PEAK_COLOR },
      { name: "Off-Peak", value: offpeak, color: OFFPEAK_COLOR },
    ];
  }, [bookings]);

  // Top games by totalPlays
  const topGames = useMemo(() => {
    return [...allGames]
      .sort((a: any, b: any) => (b.totalPlays || 0) - (a.totalPlays || 0))
      .slice(0, 5)
      .map((g: any) => ({ name: g.gameName, plays: g.totalPlays || 0 }));
  }, [allGames]);

  const statCards = [
    { label: "Total Revenue", value: `₹${stats.revenue.toFixed(2)}`, sub: "Completed sessions", icon: DollarSign, color: "text-emerald-500" },
    { label: "Today's Bookings", value: stats.todayBookings, sub: "Scheduled for today", icon: CalendarCheck, color: "text-primary" },
    { label: "Total Users", value: stats.totalUsers, sub: "Registered accounts", icon: Users, color: "text-ps-blue" },
    { label: "Total Bookings", value: stats.totalBookings, sub: "Lifetime sessions", icon: Gamepad2, color: "text-xbox-green" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor GamingBay's performance with live analytics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.label} className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Revenue Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12, color: "#f8fafc" }}
                  labelStyle={{ color: "#f8fafc" }}
                  itemStyle={{ color: "#f8fafc" }}
                  formatter={(value: any) => [`₹${value}`, "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings by Day */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-primary" /> Bookings by Day of Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dayOfWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f8fafc" }}
                  labelStyle={{ color: "#f8fafc" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Booking Status Pie */}
        <Card className="border-border/50 bg-card/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Booking Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, idx) => (
                    <Cell key={idx} fill={[PS5_COLOR, XBOX_COLOR, "#ef4444"][idx]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12, color: "#f8fafc" }}
                  labelStyle={{ color: "#f8fafc" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-2">
              {statusData.map((s, i) => (
                <span key={s.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: [PS5_COLOR, XBOX_COLOR, "#ef4444"][i] }} />
                  {s.name} ({s.value})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Console Popularity */}
        <Card className="border-border/50 bg-card/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Console Popularity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={consoleData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} width={90} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f8fafc" }}
                  labelStyle={{ color: "#f8fafc" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Bar dataKey="bookings" radius={[0, 4, 4, 0]}>
                  <Cell fill={PS5_COLOR} />
                  <Cell fill={XBOX_COLOR} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Peak vs Off-Peak */}
        <Card className="border-border/50 bg-card/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Peak vs Off-Peak</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={peakData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {peakData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12, color: "#f8fafc" }}
                  labelStyle={{ color: "#f8fafc" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-2">
              {peakData.map(s => (
                <span key={s.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  {s.name} ({s.value})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Games */}
        <Card className="border-border/50 bg-card/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Top Games (Plays)</CardTitle>
          </CardHeader>
          <CardContent>
            {topGames.length === 0 ? (
              <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">No data</div>
            ) : (
              <div className="space-y-2">
                {topGames.map((g, i) => (
                  <div key={g.name} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">
                      <span className="text-muted-foreground mr-2">#{i + 1}</span>
                      {g.name}
                    </span>
                    <span className="font-semibold text-primary">{g.plays.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings — simple list */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" /> Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No bookings yet.</div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {[...bookings]
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 10)
                .map((b: any) => (
                  <div key={b.id} className="flex justify-between items-center pb-2 border-b border-border/50 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{b.userEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.seatId} &bull; {formatDateToIndian(b.bookingDate)} {b.startTime && `• ${b.startTime}`}
                        {b.duration && ` (${b.duration}h)`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">₹{b.amount}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${
                        b.bookingStatus === "Cancelled" ? "bg-destructive/10 text-destructive border-destructive/20" :
                        b.bookingStatus === "Completed" ? "bg-xbox-green/10 text-xbox-green border-xbox-green/20" :
                        "bg-primary/10 text-primary border-primary/20"
                      }`}>{b.bookingStatus}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
