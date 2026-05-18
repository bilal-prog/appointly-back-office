import { cn } from "@/lib/utils";

export function DataTable({
  headers,
  children,
  className
}: {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/70 text-left text-xs uppercase text-muted-foreground">
            <tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
