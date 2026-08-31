"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type Row,
  type SortingState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  GripVerticalIcon,
  CheckCircle2Icon,
  ClockIcon,
  PauseCircleIcon,
  EllipsisVerticalIcon,
  Columns3Icon,
  ChevronDownIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  PlusIcon,
  AlertCircleIcon,
  ImageIcon,
} from "lucide-react"

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<
  typeof features,
  z.infer<typeof schema>
>()

export const schema = z.object({
  id: z.string(),
  judulTask: z.string(),
  assignee: z.string(),
  departemen: z.string(),
  prioritas: z.string(),
  deadline: z.string(),
  status: z.string(),
  progress: z.number(),
  bukti: z.boolean(),
})

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  "Selesai": {
    label: "Selesai",
    icon: <CheckCircle2Icon className="size-3" />,
    className: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400",
  },
  "Dalam Proses": {
    label: "Dalam Proses",
    icon: <ClockIcon className="size-3" />,
    className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400",
  },
  "Tertunda": {
    label: "Tertunda",
    icon: <PauseCircleIcon className="size-3" />,
    className: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400",
  },
}

const prioritasConfig: Record<string, { className: string }> = {
  "Tinggi": { className: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400" },
  "Sedang": { className: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400" },
  "Rendah": { className: "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-400" },
}

function ProgressBar({ value }: { value: number }) {
  const color = value === 100 ? "bg-green-500" : value >= 50 ? "bg-blue-500" : value > 0 ? "bg-yellow-500" : "bg-gray-300"
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground w-7">{value}%</span>
    </div>
  )
}

function isOverdue(deadline: string, status: string) {
  if (status === "Selesai") return false
  return new Date(deadline) < new Date("2026-08-12")
}

const columns = columnHelper.columns([
  columnHelper.display({
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  }),
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("judulTask", {
    header: "Judul Task",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 max-w-[260px]">
        <div className="flex items-center gap-1.5">
          {isOverdue(row.original.deadline, row.original.status) && (
            <AlertCircleIcon className="size-3 shrink-0 text-red-500" />
          )}
          <span className="text-sm font-medium truncate">{row.original.judulTask}</span>
        </div>
        <span className="text-[11px] text-muted-foreground">{row.original.id}</span>
      </div>
    ),
    enableHiding: false,
  }),
  columnHelper.accessor("assignee", {
    header: "Karyawan",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{row.original.assignee}</span>
        <Badge variant="outline" className="w-fit px-1.5 text-[10px] text-muted-foreground">{row.original.departemen}</Badge>
      </div>
    ),
  }),
  columnHelper.accessor("prioritas", {
    header: "Prioritas",
    cell: ({ row }) => {
      const cfg = prioritasConfig[row.original.prioritas] ?? prioritasConfig["Rendah"]
      return (
        <Badge variant="outline" className={`px-2 text-xs font-medium ${cfg.className}`}>
          {row.original.prioritas}
        </Badge>
      )
    },
  }),
  columnHelper.accessor("deadline", {
    header: "Deadline",
    cell: ({ row }) => {
      const overdue = isOverdue(row.original.deadline, row.original.status)
      return (
        <span className={`text-xs tabular-nums ${overdue ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
          {new Date(row.original.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
          {overdue && " ⚠️"}
        </span>
      )
    },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ row }) => {
      const cfg = statusConfig[row.original.status] ?? statusConfig["Dalam Proses"]
      return (
        <Badge variant="outline" className={`flex w-fit items-center gap-1 px-2 text-xs ${cfg.className}`}>
          {cfg.icon}{cfg.label}
        </Badge>
      )
    },
  }),
  columnHelper.accessor("progress", {
    header: "Progress",
    cell: ({ row }) => <ProgressBar value={row.original.progress} />,
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" className="flex size-8 text-muted-foreground data-open:bg-muted" size="icon" />}
        >
          <EllipsisVerticalIcon />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
          <DropdownMenuItem>Edit Task</DropdownMenuItem>
          <DropdownMenuItem>Upload Bukti</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Hapus Task</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
])

function DraggableRow({
  row,
}: {
  row: Row<typeof features, z.infer<typeof schema>>
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          <FlexRender cell={cell} />
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const parsedData = React.useMemo(() => initialData.map((d: Record<string, unknown>) => schema.parse(d)), [initialData])
  const [data, setData] = React.useState(() => parsedData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [isAddOpen, setIsAddOpen] = React.useState(false)

  const handleAddNew = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const judulTask = formData.get("judulTask") as string
    const assignee = formData.get("assignee") as string
    const departemen = formData.get("departemen") as string
    const prioritas = formData.get("prioritas") as string
    const deadline = formData.get("deadline") as string
    const status = "Dalam Proses"

    const newId = `TSK-${String(data.length + 1).padStart(3, "0")}`

    const newTask = {
      id: newId,
      judulTask,
      assignee,
      departemen,
      prioritas,
      deadline,
      status,
      progress: 0,
      bukti: false,
    }

    setData(prev => [newTask, ...prev])
    setIsAddOpen(false)
    toast.success(`Task "${judulTask}" berhasil ditambahkan!`)
  }

  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id as UniqueIdentifier) || [],
    [data]
  )
  const table = useTable({
    features,
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="relative px-4 lg:px-6">
      <div className="bg-white dark:bg-zinc-900 rounded-[8px] border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
        {/* Clean Table Header without Icons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Daftar Manajemen Tugas Operasional
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Ringkasan seluruh tiket pengerjaan tugas kantor, status progres, dan teknisi penanggung jawab
            </p>
          </div>
        </div>

        {/* Inner Table Container */}
        <div className="overflow-hidden rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-card shadow-2xs">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        <FlexRender header={header} />
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => <DraggableRow key={row.id} row={row} />)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                        Tidak ada task ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="text-muted-foreground text-xs font-mono">
            {table.getFilteredSelectedRowModel().rows.length} dari {table.getRowModel().rows.length} baris dipilih.
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Baris per halaman</span>
              <Select
                value={`${pagination.pageSize}`}
                onValueChange={(val) => table.setPageSize(Number(val))}
              >
                <SelectTrigger className="h-8 w-16 text-xs rounded-[8px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 50].map((s) => (
                    <SelectItem key={s} value={`${s}`}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="size-8 rounded-[8px]" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                <ChevronsLeftIcon className="size-4" /><span className="sr-only">Halaman pertama</span>
              </Button>
              <Button variant="outline" size="icon" className="size-8 rounded-[8px]" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <ChevronLeftIcon className="size-4" /><span className="sr-only">Sebelumnya</span>
              </Button>
              <span className="text-xs px-2 font-mono font-medium">
                Hal. {pagination.pageIndex + 1} dari {Math.max(1, table.getPageCount())}
              </span>
              <Button variant="outline" size="icon" className="size-8 rounded-[8px]" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <ChevronRightIcon className="size-4" /><span className="sr-only">Berikutnya</span>
              </Button>
              <Button variant="outline" size="icon" className="size-8 rounded-[8px]" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                <ChevronsRightIcon className="size-4" /><span className="sr-only">Halaman terakhir</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
