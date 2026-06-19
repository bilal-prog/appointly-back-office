"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, Megaphone, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientApi } from "@/lib/client-api";
import type { Notification, NotificationsResponse, User } from "@/lib/types";

function MarketingDialog({
  open,
  setOpen,
  user,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
  user: User;
}) {
  const [target, setTarget] = useState<"all" | "specific">("all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["target-users", user.role],
    queryFn: async () => {
      if (user.role === "admin") {
        return (await clientApi.get<any>("/users?limit=100")).data?.data || [];
      } else {
        return (
          (await clientApi.get<any>("/customers?limit=100")).data?.data || []
        );
      }
    },
    enabled: target === "specific" && open,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (target === "specific" && selectedUserIds.length === 0) {
      toast.error("Please select at least one user.");
      return;
    }

    setIsLoading(true);
    try {
      await clientApi.post("/notifications/marketing", {
        target,
        title,
        message,
        imageUrl,
        ...(target === "specific" ? { userIds: selectedUserIds } : {}),
      });
      toast.success("Marketing notification sent!");
      setOpen(false);
      setTitle("");
      setMessage("");
      setImageUrl("");
      setTarget("all");
      setSelectedUserIds([]);

      // invalidate notifications query
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to send marketing notification",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const handleUserToggle = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id],
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0">
          <Megaphone className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Marketing Campaign</DialogTitle>
          <DialogDescription>
            Broadcast a rich push notification to your customers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Select
              value={target}
              onValueChange={(val) => setTarget(val as "all" | "specific")}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                side="bottom"
                sideOffset={5}
                className="z-[9999]"
              >
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="specific">Specific Customers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {target === "specific" && (
            <div className="space-y-2 border rounded-md p-3 max-h-48 overflow-y-auto">
              <Label className="mb-2 block">Select Recipients</Label>
              {usersQuery.isLoading ? (
                <div className="text-sm text-muted-foreground flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : usersQuery.data?.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No users found.
                </div>
              ) : (
                <div className="space-y-2">
                  {usersQuery.data?.map((u: any) => (
                    <label
                      key={u._id}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedUserIds.includes(u._id)}
                        onChange={() => handleUserToggle(u._id)}
                        disabled={isLoading}
                      />
                      <span className="text-sm truncate">
                        {u.name} {u.email ? `(${u.email})` : ""}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              placeholder="Summer Sale!"
            />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              placeholder="Get 20% off your next appointment."
            />
          </div>
          <div className="space-y-2">
            <Label>Image URL (Optional)</Label>
            <Input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isLoading}
              placeholder="https://example.com/promo.png"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !title || !message}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Send Campaign
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NotificationsClient({
  initialData,
  user,
}: {
  initialData: NotificationsResponse;
  user: User;
}) {
  const [type, setType] = useState("all");
  const [viewTab, setViewTab] = useState<"inbox" | "sent">("inbox");
  const [isMarketingOpen, setIsMarketingOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    setPage(1);
  }, [type, viewTab]);

  const queryClient = useQueryClient();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const query = useQuery({
    queryKey: ["notifications", type, page],
    queryFn: async () => {
      const typeParam = type !== "all" ? `&type=${type}` : "";
      return (
        await clientApi.get<NotificationsResponse>(
          `/notifications?limit=${limit}&offset=${(page - 1) * limit}${typeParam}`,
        )
      ).data;
    },
    initialData: page === 1 && type === "all" ? initialData : undefined,
  });

  const sentQuery = useQuery({
    queryKey: ["notifications", "sent", page],
    queryFn: async () =>
      (
        await clientApi.get<NotificationsResponse>(
          `/notifications/sent?limit=${limit}&offset=${(page - 1) * limit}`,
        )
      ).data,
    enabled:
      viewTab === "sent" && (user.role === "admin" || user.role === "business"),
  });

  const readMutation = useMutation({
    mutationFn: async (id: string) =>
      clientApi.patch("/notifications/read", { notificationId: id }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => clientApi.delete(`/notifications/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  useEffect(() => {
    let closed = false;
    const abortController = new AbortController();

    async function connect() {
      try {
        const { data } = await clientApi.get<{
          token: string;
          url: string;
          user: User;
        }>("/socket-token", { signal: abortController.signal });
        if (closed) return;
        socketRef.current?.disconnect();
        const socket = io(data.url, {
          auth: { token: data.token },
          transports: ["websocket", "polling"],
        });
        socketRef.current = socket;

        const refresh = () =>
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        socket.on("notification", (data) => {
          toast.info(data?.title || "New notification received!");
          refresh();
        });
      } catch {
        return;
      }
    }

    const connectTimer = window.setTimeout(() => {
      void connect();
    }, 0);
    return () => {
      closed = true;
      window.clearTimeout(connectTimer);
      abortController.abort();
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [queryClient]);

  const activeQuery = viewTab === "sent" ? sentQuery : query;
  const notifications = activeQuery.data?.data || [];
  const filtered = notifications;
  const meta = activeQuery.data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;

  const isSender = user.role === "admin" || user.role === "business";

  return (
    <div className="space-y-4">
      {isSender && (
        <div className="flex bg-muted p-1 rounded-md w-max">
          <button
            className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${viewTab === "inbox" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setViewTab("inbox")}
          >
            Inbox
          </button>
          <button
            className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${viewTab === "sent" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setViewTab("sent")}
          >
            Sent Campaigns
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {viewTab === "inbox" ? (
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              sideOffset={5}
              className="z-[9999]"
            >
              {["all", "appointment", "reminder", "system", "marketing"].map(
                (item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        ) : (
          <div className="w-full sm:w-52 font-medium text-lg">Sent History</div>
        )}

        {(user.role === "admin" || user.role === "business") && (
          <MarketingDialog
            open={isMarketingOpen}
            setOpen={setIsMarketingOpen}
            user={user}
          />
        )}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            No notifications found.
          </div>
        ) : (
          filtered.map((item) => (
            <Card
              key={item._id}
              className={item.isRead ? "opacity-75" : undefined}
            >
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <Bell className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.message}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                    {viewTab === "sent" && item.recipientCount && (
                      <span className="ml-2 font-medium text-primary">
                        • Delivered to {item.recipientCount}{" "}
                        {item.recipientCount === 1 ? "user" : "users"}
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge value={item.type} />
                {viewTab === "inbox" && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={item.isRead || readMutation.isPending}
                      onClick={() => readMutation.mutate(item._id)}
                    >
                      Mark read
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(item._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
