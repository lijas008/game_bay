"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Gamepad2, Flame, Sparkles, Clock, Trophy } from "lucide-react";

export interface Game {
  id?: string;
  gameId: string;
  gameName: string;
  platform: "PS5" | "Xbox Series X" | "Both";
  genre: string;
  description: string;
  coverImageUrl: string;
  releaseDate: string;
  rating: number;
  totalRatings: number;
  totalPlays: number;
  isNewArrival: boolean;
  isTopRated: boolean;
  isMostPlayed: boolean;
  avgSessionDuration?: number;
  status: "active" | "inactive";
  createdAt: string;
}

interface GameCardProps {
  game: Game;
  variant?: "new" | "rated" | "played";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40"
          }`}
        />
      ))}
    </div>
  );
}

export default function GameCard({ game, variant = "new" }: GameCardProps) {
  const platformColor =
    game.platform === "PS5"
      ? "bg-ps-blue/10 text-ps-blue border-ps-blue/20"
      : game.platform === "Xbox Series X"
      ? "bg-xbox-green/10 text-xbox-green border-xbox-green/20"
      : "bg-primary/10 text-primary border-primary/20";

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border/50 bg-card/50 overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <Image
          src={game.coverImageUrl || "/games/stellar_nexus.png"}
          alt={game.gameName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />

        {/* Badge */}
        <div className="absolute top-3 left-3">
          {variant === "new" && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              <Sparkles className="w-3 h-3" /> NEW
            </span>
          )}
          {variant === "rated" && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500 text-white text-xs font-bold">
              <Trophy className="w-3 h-3" /> TOP RATED
            </span>
          )}
          {variant === "played" && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
              <Flame className="w-3 h-3" /> HOT
            </span>
          )}
        </div>

        {/* Platform badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${platformColor}`}>
            {game.platform}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
            {game.gameName}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{game.genre}</p>
        </div>

        {/* Variant-specific details */}
        {variant === "new" && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            <span>Released {new Date(game.releaseDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        )}

        {variant === "rated" && (
          <div className="space-y-1">
            <StarRating rating={game.rating} />
            <p className="text-xs text-muted-foreground">
              {game.rating.toFixed(1)} / 5 &bull; {game.totalRatings.toLocaleString()} ratings
            </p>
          </div>
        )}

        {variant === "played" && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              <Flame className="w-4 h-4" />
              {game.totalPlays.toLocaleString()} plays
            </div>
            {game.avgSessionDuration && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Avg {game.avgSessionDuration}h session
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-2">
          <Link href={`/games/${game.gameId}`}>
            <Button size="sm" className="w-full">
              <Gamepad2 className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
