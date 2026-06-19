"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientApi } from "@/lib/client-api";
import type { AuditLogsResponse } from "@/lib/types";

const PAGE_SIZE = 20;

export function AdminAuditLogsClient() {
  const [offset, setOffset] = useState(0);

  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-audit-logs", offset],
    queryFn: async () =>
      (
        await clientApi.get<AuditLogsResponse>("/audit-logs", {
          params: { limit: PAGE_SIZE, offset },
        })
      ).data,
  });

  if (isLoading) return <LoadingState label="Loading audit logs" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Audit Logs</h2>
      </div>
      {logs?.data?.length ? (
        <DataTable
          headers={[
            "Action",
            "User",
            "Business",
            "Entity Type",
            "Date",
          ]}
          pagination={logs.meta}
          onPageChange={setOffset}
        >
          {logs.data.map((log) => (
            <tr key={log._id}>
              <td className="px-4 py-3">
                <StatusBadge value={log.action} />
              </td>
              <td className="px-4 py-3">
                {log.userId?.name || log.userId?.email || "-"}
              </td>
              <td className="px-4 py-3">
                {log.businessId?.name || "-"}
              </td>
              <td className="px-4 py-3">{log.entityType}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState
          title="No audit logs found"
          description="There are no audit logs recorded in the system yet."
        />
      )}
    </div>
  );
}
