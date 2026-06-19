"use client";

import Link from "next/link";
import { CalendarRange } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <CalendarRange className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">Appointly</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
            Testimonials
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Log in
          </Link>
          <Link 
            href="/register" 
            className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
