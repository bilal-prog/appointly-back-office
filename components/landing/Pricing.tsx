import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for individuals just getting started.",
    features: [
      "20 Appointments / Month",
      "Real-time Notifications",
      "Community Support",
    ],
    cta: "Get Started",
    popular: false,
    href: "/register",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Ideal for growing teams and businesses.",
    features: [
      "Unlimited Appointments",
      "Real-time Notifications",
      "Reminders",
      "Analytics",
    ],
    cta: "Start Free Trial",
    popular: true,
    href: "/register?plan=pro",
  },
  {
    name: "Premium",
    price: "$29",
    period: "/month",
    description: "Advanced features for scaling operations.",
    features: [
      "Unlimited Appointments",
      "Real-time Notifications",
      "Reminders",
      "Analytics",
      "Priority Support",
    ],
    cta: "Contact Sales",
    popular: false,
    href: "/register?plan=premium",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Simple Pricing</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Choose the right plan for you</h3>
          <p className="text-lg text-muted-foreground">
            No hidden fees. No surprise charges. Upgrade or downgrade your plan at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative flex flex-col p-8 rounded-3xl border ${
                plan.popular 
                  ? "border-primary shadow-2xl scale-105 bg-background z-10" 
                  : "border-border/50 bg-background/50 shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-bold py-1 px-4 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                <p className="text-muted-foreground text-sm h-10">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline text-foreground">
                <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground ml-1 font-medium">{plan.period}</span>}
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className={`h-5 w-5 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                href={plan.href} 
                className={`w-full py-4 rounded-xl font-bold text-center transition-all ${
                  plan.popular 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
