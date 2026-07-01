"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, addDoc, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Gamepad2, Star, Flame, Sparkles, Clock, Loader2, ArrowLeft,
  Trophy, Calendar, Send, CheckCircle2,
} from "lucide-react";
import type { Game } from "@/components/games/GameCard";

interface Review {
  id: string;
  gameId: string;
  userEmail: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function GameDetailClient() {
  const { gameId } = useParams<{ gameId: string }>();
  const { user, profile } = useAuth();
  const router = useRouter();

  const [game, setGame] = useState<Game | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const q = query(collection(db, "games"), where("gameId", "==", gameId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setGame({ id: snap.docs[0].id, ...snap.docs[0].data() } as Game);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [gameId]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, "reviews"),
          where("gameId", "==", gameId),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
        setReviews(data);

        if (user?.email) {
          const existing = data.find(r => r.userEmail === user.email);
          if (existing) setUserReview(existing);
        }
      } catch (err) {
        console.error("Reviews fetch error:", err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [gameId, user]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : game?.rating.toFixed(1) || "0.0";

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !game || !reviewComment.trim()) return;
    setSubmitting(true);
    try {
      const reviewData = {
        gameId: game.gameId,
        userEmail: user.email!,
        userName: profile?.fullName || user.email!.split("@")[0] || "Anonymous",
        rating: reviewRating,
        comment: reviewComment.trim(),
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "reviews"), reviewData);
      const newReview = { id: docRef.id, ...reviewData };
      setReviews(prev => [newReview, ...prev]);
      setUserReview(newReview);
      setSubmitted(true);
      setReviewComment("");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Gamepad2 className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Game Not Found</h1>
        <p className="text-muted-foreground">The game you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/50">
          <div className="relative h-64 md:h-80 w-full bg-muted">
            <Image
              src={game.coverImageUrl || "/games/stellar_nexus.png"}
              alt={game.gameName}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                    game.platform === "PS5"
                      ? "bg-ps-blue/10 text-ps-blue border-ps-blue/20"
                      : "bg-xbox-green/10 text-xbox-green border-xbox-green/20"
                  }`}>
                    {game.platform}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                    {game.genre}
                  </span>
                  {game.isNewArrival && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      <Sparkles className="w-3 h-3" /> New
                    </span>
                  )}
                  {game.isTopRated && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Trophy className="w-3 h-3" /> Top Rated
                    </span>
                  )}
                  {game.isMostPlayed && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                      <Flame className="w-3 h-3" /> Hot
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{game.gameName}</h1>
              </div>
              <Link href="/dashboard/book">
                <Button size="lg" className="shadow-lg">
                  <Gamepad2 className="mr-2 h-5 w-5" /> Book & Play
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-3">About This Game</h2>
                <p className="text-muted-foreground leading-relaxed">{game.description}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    Reviews ({reviews.length})
                  </h2>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold">{avgRating}</span>
                    <span className="text-muted-foreground">/ 5</span>
                  </div>
                </div>

                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-border/50 rounded-lg">
                    <Gamepad2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 rounded-lg bg-secondary border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                              {review.userName[0]?.toUpperCase() || "?"}
                            </div>
                            <span className="font-semibold text-sm">{review.userName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                        <p className="text-xs text-muted-foreground/60 mt-2">
                          {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {user && !userReview && (
                  <form onSubmit={handleSubmitReview} className="mt-6 p-4 rounded-lg border border-border/50 bg-background/40">
                    <h3 className="font-semibold mb-3">Write a Review</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Rating</Label>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setReviewRating(s)}
                              className="p-1 transition-colors"
                            >
                              <Star className={`w-6 h-6 ${s <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40 hover:text-amber-400/60"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="comment" className="text-sm">Your Review</Label>
                        <textarea
                          id="comment"
                          rows={3}
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this game..."
                          className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border/50 text-sm focus:outline-none focus:border-primary resize-none"
                          required
                        />
                      </div>
                      {submitted && (
                        <div className="flex items-center gap-2 text-sm text-xbox-green">
                          <CheckCircle2 className="w-4 h-4" /> Review submitted successfully!
                        </div>
                      )}
                      <Button type="submit" disabled={submitting || !reviewComment.trim()} className="gap-2">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Submit Review
                      </Button>
                    </div>
                  </form>
                )}
                {user && userReview && (
                  <div className="mt-4 p-3 rounded-lg bg-xbox-green/5 border border-xbox-green/20 text-sm text-xbox-green flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    You reviewed this game. Rating: {userReview.rating}/5
                  </div>
                )}
                {!user && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50 text-sm text-muted-foreground text-center">
                    <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link> to leave a review.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Game Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      Rating
                    </div>
                    <span className="font-bold">{game.rating.toFixed(1)} / 5 ({game.totalRatings.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Flame className="w-4 h-4 text-red-500" />
                      Total Plays
                    </div>
                    <span className="font-bold">{game.totalPlays.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Released
                    </div>
                    <span className="font-bold">{new Date(game.releaseDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  {game.avgSessionDuration && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        Avg Session
                      </div>
                      <span className="font-bold">{game.avgSessionDuration}h</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Gamepad2 className="w-4 h-4" />
                      Platform
                    </div>
                    <span className={`font-bold ${game.platform === "PS5" ? "text-ps-blue" : "text-xbox-green"}`}>
                      {game.platform}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Quick Actions</h3>
                <Link href="/dashboard/book" className="block">
                  <Button className="w-full"><Gamepad2 className="w-4 h-4 mr-2" /> Book a Session</Button>
                </Link>
                <Link href="/dashboard" className="block">
                  <Button variant="outline" className="w-full"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
