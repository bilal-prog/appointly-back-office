"use client";

import { Search, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientApi } from "@/lib/client-api";
import type { PaginatedResponse, User } from "@/lib/types";

const PAGE_SIZE = 20;

function userId(user: User) {
  return user._id ?? user.id;
}

export function AdminUsersClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [offset, setOffset] = useState(0);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users", offset],
    queryFn: async () =>
      (
        await clientApi.get<PaginatedResponse<User>>("/users", {
          params: { limit: PAGE_SIZE, offset },
        })
      ).data,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      isActive,
    }: {
      id: string;
      isActive: boolean;
    }) => clientApi.patch(`/users/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to update user",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => clientApi.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to delete user",
      );
    },
  });

  const filtered = useMemo(() => {
    return (users?.data ?? []).filter((user) => {
      const matchesRole = role === "all" || user.role === role;
      const text = `${user.name} ${user.email} ${user.businessId ?? ""}`
        .toLowerCase()
        .trim();
      return matchesRole && text.includes(search.toLowerCase());
    });
  }, [role, search, users?.data]);

  if (isLoading) return <LoadingState label="Loading users" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search users"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">all roles</SelectItem>
            <SelectItem value="admin">admin</SelectItem>
            <SelectItem value="business">business</SelectItem>
            <SelectItem value="customer">customer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filtered.length ? (
        <DataTable
          headers={["User", "Email", "Role", "Status", "Business id", "Actions"]}
          pagination={users?.meta}
          onPageChange={setOffset}
        >
          {filtered.map((user) => (
            <tr key={userId(user)}>
              <td className="px-4 py-3 font-medium">{user.name}</td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">
                <StatusBadge value={user.role} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge value={user.isActive === false ? "inactive" : "active"} />
              </td>
              <td className="px-4 py-3">{user.businessId ?? "-"}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={user.isProtected || updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: userId(user),
                        isActive: user.isActive === false,
                      })
                    }
                  >
                    {user.isActive === false ? "Activate" : "Deactivate"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={user.isProtected || deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(userId(user))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState
          title="No users found"
          description="Adjust the filters to review more platform users."
        />
      )}
    </div>
  );
}
