"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react"

// ColumnDef compatible with tanstack/react-table v8 shape — consumers unchanged
export type ColumnDef<TData, TValue = unknown> = {
  id?: string
  accessorKey?: string
  header?: string | ((ctx: { column: Column<TData> }) => React.ReactNode)
  cell?: (ctx: { row: { original: TData; index: number; getIsSelected: () => boolean } }) => React.ReactNode
  size?: number
  enableSorting?: boolean
  className?: string  // applied to both <th> and <td>
}

type Column<TData> = {
  id: string
  getToggleSortingHandler: () => () => void
  getIsSorted: () => false | "asc" | "desc"
  getCanSort: () => boolean
  getFilterValue: () => string
  setFilterValue: (v: string) => void
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  searchTourId?: string
  pageSize?: number
  toolbar?: React.ReactNode
}

/** Generate page number array with ellipsis: [0,1,"...",8,9] */
function pageButtons(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  const pages: (number | "...")[] = []
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n) }
  add(0); add(1)
  if (current > 3) pages.push("...")
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 3, current + 1); i++) add(i)
  if (current < total - 4) pages.push("...")
  add(total - 2); add(total - 1)
  return pages
}

function getValue<TData>(row: TData, key: string): unknown {
  // supports dot-notation e.g. "user.name"
  return key.split(".").reduce((o: unknown, k) => (o != null && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), row)
}

export function DataTable<TData>({
  columns, data, searchKey, searchPlaceholder = "Cari...", searchTourId, pageSize: initialPageSize = 10, toolbar,
}: DataTableProps<TData>) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(initialPageSize)

  function onPageSizeChange(n: number) { setPageSize(n); setPage(0) }

  // Resolve column id
  const colId = (col: ColumnDef<TData>) => col.id ?? col.accessorKey ?? ""

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
    setPage(0)
  }

  // Filter
  const filtered = useMemo(() => {
    if (!searchKey || !search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(row => {
      const v = getValue(row, searchKey)
      return String(v ?? "").toLowerCase().includes(q)
    })
  }, [data, search, searchKey])

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = getValue(a, sortKey)
      const bv = getValue(b, sortKey)
      const cmp = av == null ? -1 : bv == null ? 1 : av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize)
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)

  // Build column "object" for cell ctx
  function makeColumn(col: ColumnDef<TData>): Column<TData> {
    const id = colId(col)
    const canSort = col.enableSorting !== false && !!col.accessorKey
    return {
      id,
      getCanSort: () => canSort,
      getIsSorted: () => sortKey === id ? sortDir : false,
      getToggleSortingHandler: () => () => canSort && toggleSort(id),
      getFilterValue: () => searchKey === id ? search : "",
      setFilterValue: (v) => { if (searchKey === id) { setSearch(v); setPage(0) } },
    }
  }

  function renderHeader(col: ColumnDef<TData>) {
    if (typeof col.header === "function") return col.header({ column: makeColumn(col) })
    return col.header ?? ""
  }

  function renderCell(col: ColumnDef<TData>, row: TData, idx: number) {
    const rowCtx = { original: row, index: idx, getIsSelected: () => false }
    if (col.cell) return col.cell({ row: rowCtx })
    if (col.accessorKey) {
      const v = getValue(row, col.accessorKey)
      return v != null ? String(v) : ""
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {(searchKey || toolbar) && (
        <div className="flex items-center justify-between gap-4">
          {searchKey && (
            <div className="relative max-w-sm flex-1" {...(searchTourId ? { "data-tour": searchTourId } : {})}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                className="pl-9"
              />
            </div>
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((col) => {
                const id = colId(col)
                const c = makeColumn(col)
                const canSort = c.getCanSort()
                const sorted = c.getIsSorted()
                return (
                  <TableHead key={id} style={{ width: col.size }} className={col.className}>
                    {canSort ? (
                      <button
                        onClick={c.getToggleSortingHandler()}
                        className="flex items-center gap-1.5 font-medium hover:text-foreground transition-colors"
                      >
                        {renderHeader(col)}
                        {sorted === "asc" ? <ArrowUp className="size-3.5" /> : sorted === "desc" ? <ArrowDown className="size-3.5" /> : <ArrowUpDown className="size-3.5 opacity-40" />}
                      </button>
                    ) : renderHeader(col)}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length ? paged.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={colId(col)} className={col.className}>
                    {renderCell(col, row, page * pageSize + idx)}
                  </TableCell>
                ))}
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {sorted.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          {/* Kiri: per-page selector + info baris */}
          <div className="flex items-center gap-2">
            <Select value={String(pageSize)} onValueChange={v => onPageSizeChange(Number(v))}>
              <SelectTrigger className="h-8 w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map(n => (
                  <SelectItem key={n} value={String(n)}>{n} / hal</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs">
              {sorted.length === data.length
                ? `${sorted.length} baris`
                : `${sorted.length} dari ${data.length}`}
            </span>
          </div>

          {/* Kanan: navigasi halaman */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="sm" className="h-8 w-8 p-0"
              onClick={() => setPage(p => p - 1)} disabled={page === 0}
            >
              <ChevronLeft className="size-4" />
            </Button>

            {/* Desktop: tombol angka; Mobile: "Hal X/Y" */}
            <span className="px-2 text-xs sm:hidden">
              {page + 1} / {totalPages}
            </span>
            <div className="hidden sm:flex items-center gap-1">
              {pageButtons(page, totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="w-8 text-center text-xs">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0 text-xs"
                    onClick={() => setPage(p as number)}
                  >
                    {(p as number) + 1}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outline" size="sm" className="h-8 w-8 p-0"
              onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ponytail: no @tanstack/react-table dep; add when v8 is confirmed installed and ColumnDef types from tanstack are needed
