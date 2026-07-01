import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gamepad2, Monitor, Trophy, Users, Zap } from "lucide-react";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 border-b border-border/40 bg-background/60 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">GamingBay</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="#contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Book Now</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-ps-blue/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-xbox-green/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              <span>Next-Gen Consoles Available</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
              Level Up Your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ps-blue to-xbox-green">
                Gaming Experience
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Reserve your premium gaming station with PS5 and Xbox Series X. 
              Zero lag, ultimate comfort, and a community of passionate gamers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-lg">
                  Reserve a Seat
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-lg">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-card/30 border-y border-border/50 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose GamingBay?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We provide the ultimate environment for competitive and casual gamers alike.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Monitor,
                  title: "4K 120Hz Displays",
                  description: "Experience your games with crystal clear quality and ultra-smooth frame rates."
                },
                {
                  icon: Users,
                  title: "Premium Comfort",
                  description: "Ergonomic gaming chairs and spacious desks designed for marathon sessions."
                },
                {
                  icon: Trophy,
                  title: "Esports Ready",
                  description: "High-speed wired connections and competitive-grade peripherals."
                }
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/50 transition-colors group">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                No hidden fees or memberships required. Pay as you play for next-gen console stations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* PS5 Card */}
              <div className="p-8 rounded-3xl bg-card border border-ps-blue/30 hover:border-ps-blue transition-all relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-ps-blue/10 rounded-bl-full pointer-events-none group-hover:bg-ps-blue/20 transition-colors" />
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">PlayStation 5</h3>
                    <p className="text-sm text-muted-foreground">DualSense Haptic Feedback</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-ps-blue/10 text-ps-blue text-xs font-semibold border border-ps-blue/20">
                    PS5
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-foreground">₹120</span>
                  <span className="text-muted-foreground"> / hour</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2 text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-ps-blue" /> 4K 120Hz Ultra-HD Display
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-ps-blue" /> Access to Full PS5 Game Library
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-ps-blue" /> High-Speed Wired Internet
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-ps-blue" /> Ergonomic Gaming Chair
                  </li>
                </ul>
                <Link href="/register">
                  <Button className="w-full bg-ps-blue hover:bg-ps-blue/90 text-white font-semibold">
                    Reserve PS5
                  </Button>
                </Link>
              </div>

              {/* Xbox Card */}
              <div className="p-8 rounded-3xl bg-card border border-xbox-green/30 hover:border-xbox-green transition-all relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-xbox-green/10 rounded-bl-full pointer-events-none group-hover:bg-xbox-green/20 transition-colors" />
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Xbox Series X</h3>
                    <p className="text-sm text-muted-foreground">Ultimate Game Pass Access</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-xbox-green/10 text-xbox-green text-xs font-semibold border border-xbox-green/20">
                    Xbox
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-foreground">₹120</span>
                  <span className="text-muted-foreground"> / hour</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2 text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-xbox-green" /> 4K 120Hz Ultra-HD Display
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-xbox-green" /> Xbox Game Pass Ultimate Included
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-xbox-green" /> High-Speed Wired Internet
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-xbox-green" /> Ergonomic Gaming Chair
                  </li>
                </ul>
                <Link href="/register">
                  <Button className="w-full bg-xbox-green hover:bg-xbox-green/90 text-white font-semibold">
                    Reserve Xbox
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-card/30 border-y border-border/50 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Have questions about reservations, tournaments, or custom events? Reach out to our team.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="p-6 rounded-2xl bg-background border border-border/50 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="font-semibold text-lg">Email Us</h3>
                <p className="text-sm text-muted-foreground">For support and general inquiries</p>
                <a href="mailto:admin@gamingbay.com" className="inline-block text-sm font-semibold text-primary hover:underline">
                  admin@gamingbay.com
                </a>
              </div>

              <div className="p-6 rounded-2xl bg-background border border-border/50 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h3 className="font-semibold text-lg">Visit Us</h3>
                <p className="text-sm text-muted-foreground">Drop by our lounge</p>
                <span className="block text-sm font-semibold text-foreground">
                  GamingBay Lounge, Tech Hub
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-background border border-border/50 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-semibold text-lg">Opening Hours</h3>
                <p className="text-sm text-muted-foreground">Monday to Sunday</p>
                <span className="block text-sm font-semibold text-foreground">
                  10:00 AM – 10:00 PM
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Play?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join hundreds of gamers who have already made GamingBay their second home.
            </p>
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
