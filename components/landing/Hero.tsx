import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-[100px] rounded-full animate-pulse-glow" />
        </div>
      </div>

      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground">
            Scheduling made <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">simple</span> for growing businesses.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Appointly is your all-in-one platform to manage bookings, services, and customer relationships. Save time and grow your revenue effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-1"
            >
              Get Started for Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-all"
            >
              Explore Features
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>Free plan available</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Hero Mockup */}
        <div className="mt-20 relative mx-auto max-w-5xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="relative rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-2 shadow-2xl animate-float">
            <div className="rounded-xl overflow-hidden border border-border/50 relative bg-muted">
              {/* Fallback color if image fails to load */}
              <div className="aspect-video relative w-full h-full bg-secondary">
                 <img 
                  src="/hero_dashboard_mockup.png" 
                  alt="Appointly Dashboard Mockup" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          {/* Decorative elements behind image */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur-2xl opacity-20 -z-10" />
        </div>
      </div>
    </section>
  );
}
