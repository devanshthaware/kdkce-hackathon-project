import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ReactNode } from "react"

interface AdminTableProps<T> {
  columns: {
    header: string
    accessor: keyof T | ((item: T) => ReactNode)
    className?: string
  }[]
  data: T[]
  emptyMessage?: string
}

export function AdminTable<T>({ columns, data, emptyMessage = "No data available" }: AdminTableProps<T>) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-950/50">
          <TableRow className="border-slate-800 hover:bg-transparent">
            {columns.map((col, idx) => (
              <TableHead key={idx} className={`text-slate-400 font-semibold ${col.className}`}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item, rowIdx) => (
              <TableRow key={rowIdx} className="border-slate-800 hover:bg-slate-800/50 text-slate-300">
                {columns.map((col, colIdx) => (
                  <TableCell key={colIdx} className={col.className}>
                    {typeof col.accessor === "function" 
                      ? col.accessor(item) 
                      : (item[col.accessor] as ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
