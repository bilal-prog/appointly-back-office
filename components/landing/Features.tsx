import {
  CalendarCheck,
  Users,
  BellRing,
  BarChart3,
  Globe,
  MessageSquare,
} from "lucide-react";

const features = [
  {
    title: "Service Management",
    description:
      "Easily create and manage your services with custom durations, buffer times, and pricing.",
    icon: Users, // Can keep Users or change to another icon. Let's keep the existing imports.
  },
  {
    title: "Real-time Notifications",
    description:
      "Stay in the loop with instant Socket.IO real-time updates and OneSignal push notifications for new bookings.",
    icon: BellRing,
  },
  {
    title: "Appointment Dashboard",
    description:
      "Manage all your bookings from a single dashboard. Easily view calendars, confirm, or cancel appointments.",
    icon: CalendarCheck,
  },
  {
    title: "Advanced Analytics",
    description:
      "Track today's appointments, pending requests, confirmed bookings, and overall aggregate statistics.",
    icon: BarChart3,
  },
  {
    title: "Automated Reminders",
    description:
      "Reduce no-shows with automated background reminder jobs sent to your customers via email and push.",
    icon: Globe,
  },
  {
    title: "Review Moderation",
    description:
      "Maintain your pristine online reputation. Monitor customer feedback and effortlessly moderate reviews directly from your dashboard.",
    icon: MessageSquare,
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">
            Powerful Features
          </h2>
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Everything you need to run your business
          </h3>
          <p className="text-lg text-muted-foreground">
            Appointly provides a complete toolkit designed specifically for
            service-based businesses to automate operations and drive growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
