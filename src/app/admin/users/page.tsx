"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, UserCheck, UserX, Shield, Inbox } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUsers(data as any[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateUser = async (id: string, fields: Record<string, any>) => {
    try {
      await updateDoc(doc(db, "users", id), fields);
      await fetchUsers();
    } catch (err) { console.error(err); }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile?.includes(search);
    const matchFilter =
      filter === "All" ||
      (filter === "Admin" && u.role === "admin") ||
      (filter === "Customer" && u.role === "customer") ||
      (filter === "Disabled" && u.status === "disabled");
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">View, enable/disable and manage user roles.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email or mobile…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Admin", "Customer", "Disabled"].map(f => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>{f}</Button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} user{filtered.length !== 1 ? "s" : ""} found</p>

      {loading ? (
        <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground border border-border/50 rounded-xl">
          <Inbox className="w-10 h-10" /><p>No users found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u: any) => (
            <Card key={u.id} className={`border-border/50 bg-card/50 ${u.status === "disabled" ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                      {u.fullName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{u.fullName || "—"}</p>
                        <span className={`text-xs px-2 py-0.5 rounded border ${u.role === "admin" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border/50"}`}>
                          {u.role}
                        </span>
                        {u.status === "disabled" && (
                          <span className="text-xs px-2 py-0.5 rounded border bg-destructive/10 text-destructive border-destructive/20">disabled</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      {u.mobile && <p className="text-xs text-muted-foreground">{u.mobile}</p>}
                      <p className="text-xs text-muted-foreground">Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {u.status !== "disabled" ? (
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => updateUser(u.id, { status: "disabled" })}>
                        <UserX className="w-4 h-4 mr-1" /> Disable
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="text-xbox-green border-xbox-green/30 hover:bg-xbox-green/10"
                        onClick={() => updateUser(u.id, { status: "active" })}>
                        <UserCheck className="w-4 h-4 mr-1" /> Enable
                      </Button>
                    )}
                    {u.role !== "admin" ? (
                      <Button size="sm" variant="outline" className="text-primary border-primary/30 hover:bg-primary/10"
                        onClick={() => updateUser(u.id, { role: "admin" })}>
                        <Shield className="w-4 h-4 mr-1" /> Make Admin
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="text-muted-foreground"
                        onClick={() => updateUser(u.id, { role: "customer" })}>
                        <Shield className="w-4 h-4 mr-1" /> Revoke Admin
                      </Button>
                    )}
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
