import { SEED_GAMES } from "@/lib/seedGames";
import GameDetailClient from "./GameDetailClient";

export async function generateStaticParams() {
  return SEED_GAMES.map(g => ({ gameId: g.gameId }));
}

export default function GameDetailPage() {
  return <GameDetailClient />;
}
