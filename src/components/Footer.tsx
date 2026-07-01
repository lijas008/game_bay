"use client";

import { Gamepad2, Heart, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 border-t border-border/40 bg-card/40 backdrop-blur-md mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center space-y-6 text-center">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2">
          <Gamepad2 className="w-6 h-6 text-primary animate-pulse" />
          <span className="text-xl font-bold tracking-tight text-foreground">GamingBay</span>
        </div>

        {/* Creator Badge with Glowing Animation */}
        <div className="relative group my-2">
          {/* Outer Ambient Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-500 rounded-2xl blur-md opacity-75 group-hover:opacity-100 animate-pulse transition duration-1000 group-hover:duration-200" />
          
          {/* Badge Container */}
          <div className="relative px-5 py-3 rounded-xl bg-black/90 border border-amber-500/30 flex items-center gap-4 shadow-[0_0_25px_rgba(245,158,11,0.4)]">
            <div className="relative">
              <img
                src="/creator-logo.jpg"
                alt="Mohammed Lijas - Creator Logo"
                className="h-12 w-12 rounded-lg object-contain bg-black p-0.5 border border-amber-500/20"
              />
              <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1.5 -right-1.5 animate-bounce" />
            </div>

            <div className="text-left">
              <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Designed & Created By
              </span>
              <span className="text-base font-extrabold tracking-wide bg-gradient-to-r from-amber-400 via-yellow-300 to-cyan-400 bg-clip-text text-transparent">
                MOHAMMED LIJAS
              </span>
            </div>
          </div>
        </div>

        {/* Support & Contact */}
        <p className="text-sm text-muted-foreground">
          Questions or Booking Support? Contact us at{" "}
          <a
            href="mailto:admin@gamingbay.com"
            className="text-primary hover:underline font-medium transition-colors"
          >
            admin@gamingbay.com
          </a>
        </p>

        {/* Copyright */}
        <p className="text-xs text-muted-foreground/80">
          © {new Date().getFullYear()} GamingBay. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
