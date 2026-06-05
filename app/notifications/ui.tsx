"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Notification } from "@/lib/types";

const notifications: Notification[] = [
  { _id: "n1", userId: "u1", type: "appointment", title: "New appointment", message: "A new appointment was created", isRead: false, metadata: {}, createdAt: "2026-05-13T10:00:00.000Z" },
  { _id: "n2", userId: "u1", type: "reminder", title: "Appointment reminder", message: "An appointment reminder was sent", isRead: true, metadata: {}, createdAt: "2026-05-12T10:00:00.000Z" }
];

export function NotificationsClient() {
  const [type, setType] = useState("all");
  const filtered = notifications.filter((item) => type === "all" || item.type === type);
  return (
    <div className="space-y-4">
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-full md:w-52"><SelectValue /></SelectTrigger>
        <SelectContent>{["all", "appointment", "reminder", "system"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
      </Select>
      <div className="space-y-2">
        {filtered.map((item) => (
          <Card key={item._id} className={item.isRead ? "opacity-75" : undefined}>
            <CardContent className="flex flex-wrap items-center gap-3 p-4">
              <Bell className="h-4 w-4 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.message}</div>
              </div>
              <StatusBadge value={item.type} />
              <Button variant="outline" size="sm" disabled={item.isRead}>Mark read</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
