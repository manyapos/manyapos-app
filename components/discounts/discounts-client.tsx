"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import {
  Plus,
  Tag,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CalendarIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "cn"
import { formatRupiah } from "@/lib/format"
import {
  createDiscount,
  updateDiscount,
  deleteDiscount,
  toggleDiscount,
} from "@/lib/actions"

type Discount = {
  id: string
  name: string
  type: string
  value: number
  minPurchase: number
  startDate: Date | null
  endDate: Date | null
  isActive: boolean
  usageLimit: number | null
  usageCount: number
  code: string | null
  createdAt: Date
}

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  type: z.enum(["percentage", "fixed"]),
  value: z
    .number({ invalid_type_error: "Nilai wajib diisi" })
    .min(0.01, "Nilai wajib diisi"),
  minPurchase: z.number().default(0),
  code: z.string().optional(),
  usageLimit: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

type FormValues = z.infer<typeof schema>

function DatePickerField({
  label,
  value,
  onChange,
  error,
}: {
  label: string
  value: Date | undefined
  onChange: (d: Date | undefined) => void
  error?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger
          className={cn(
            "inline-flex w-full items-center justify-start gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-normal shadow-xs hover:bg-muted",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="size-4 shrink-0" />
          {value
            ? format(value, "d MMM yyyy", { locale: idLocale })
            : "Pilih tanggal"}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={onChange} />
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

const DEFAULTS: FormValues = {
  name: "",
  type: "percentage",
  value: 0,
  minPurchase: 0,
  code: "",
  usageLimit: "",
  startDate: undefined,
  endDate: undefined,
}

export function DiscountsClient({
  discounts: initial,
}: {
  discounts: Discount[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Discount | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  })

  const type = watch("type")

  function openNew() {
    setEditing(null)
    reset(DEFAULTS)
    setOpen(true)
  }

  function openEdit(d: Discount) {
    setEditing(d)
    reset({
      name: d.name,
      type: d.type as "percentage" | "fixed",
      value: d.type === "percentage" ? d.value : d.value / 100,
      minPurchase: d.minPurchase / 100,
      code: d.code || "",
      usageLimit: d.usageLimit?.toString() || "",
      startDate: d.startDate ? new Date(d.startDate) : undefined,
      endDate: d.endDate ? new Date(d.endDate) : undefined,
    })
    setOpen(true)
  }

  async function onSubmit(data: FormValues) {
    setLoading(true)
    try {
      const payload = {
        name: data.name,
        type: data.type,
        value:
          data.type === "percentage"
            ? data.value
            : Math.round(data.value * 100),
        minPurchase: Math.round(data.minPurchase * 100),
        code: data.code || undefined,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
        startDate: data.startDate,
        endDate: data.endDate,
      }
      if (editing) await updateDiscount(editing.id, payload)
      else await createDiscount(payload)
      toast.success(editing ? "Diskon diperbarui" : "Diskon dibuat")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("Gagal menyimpan diskon")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDiscount(id)
      toast.success("Diskon dihapus")
      setDeleteTarget(null)
      router.refresh()
    } catch {
      toast.error("Gagal menghapus")
    }
  }

  async function handleToggle(d: Discount) {
    try {
      await toggleDiscount(d.id, !d.isActive)
      router.refresh()
    } catch {
      toast.error("Gagal mengubah status")
    }
  }

  const active = initial.filter((d) => d.isActive)
  const inactive = initial.filter((d) => !d.isActive)

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {active.length} aktif · {inactive.length} nonaktif
        </p>
        <Button onClick={openNew} data-tour="add-discount-btn">
          <Plus className="mr-1.5 size-4" />
          Tambah Diskon
        </Button>
      </div>

      <div className="space-y-3" data-tour="discount-list">
        {initial.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Tag className="mx-auto mb-2 size-8 opacity-30" />
              <p className="text-sm">
                Belum ada diskon. Tambahkan promo pertama.
              </p>
            </CardContent>
          </Card>
        )}
        {initial.map((d) => (
          <Card key={d.id} className={!d.isActive ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{d.name}</span>
                    <Badge variant={d.isActive ? "default" : "outline"}>
                      {d.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                    <Badge variant="secondary">
                      {d.type === "percentage"
                        ? `${d.value}%`
                        : formatRupiah(d.value)}
                    </Badge>
                    {d.code && (
                      <Badge variant="outline" className="font-mono text-xs">
                        {d.code}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {d.minPurchase > 0 && (
                      <span>Min. {formatRupiah(d.minPurchase)}</span>
                    )}
                    {d.usageLimit && (
                      <span>
                        Limit: {d.usageCount}/{d.usageLimit}×
                      </span>
                    )}
                    {d.startDate && (
                      <span>
                        Mulai:{" "}
                        {new Date(d.startDate).toLocaleDateString("id-ID")}
                      </span>
                    )}
                    {d.endDate && (
                      <span>
                        Sampai:{" "}
                        {new Date(d.endDate).toLocaleDateString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => handleToggle(d)}
                    title={d.isActive ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {d.isActive ? (
                      <ToggleRight className="size-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="size-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => openEdit(d)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(d)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Diskon" : "Tambah Diskon"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nama Promo</Label>
              <Input
                placeholder="Contoh: Diskon Lebaran 10%"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tipe</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <select
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <option value="percentage">Persentase (%)</option>
                      <option value="fixed">Nominal (Rp)</option>
                    </select>
                  )}
                />
                {errors.type && (
                  <p className="text-xs text-destructive">
                    {errors.type.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>
                  {type === "percentage" ? "Nilai (%)" : "Nilai (Rp)"}
                </Label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  {...register("value", { valueAsNumber: true })}
                />
                {errors.value && (
                  <p className="text-xs text-destructive">
                    {errors.value.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Min. Pembelian (Rp)</Label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  {...register("minPurchase", { valueAsNumber: true })}
                />
                {errors.minPurchase && (
                  <p className="text-xs text-destructive">
                    {errors.minPurchase.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Kode Promo</Label>
                <Controller
                  control={control}
                  name="code"
                  render={({ field }) => (
                    <Input
                      placeholder="Opsional"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  )}
                />
                {errors.code && (
                  <p className="text-xs text-destructive">
                    {errors.code.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DatePickerField
                    label="Tanggal Mulai"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.startDate?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <DatePickerField
                    label="Tanggal Akhir"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.endDate?.message}
                  />
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Batas Penggunaan</Label>
              <Input
                type="number"
                min={0}
                placeholder="Kosongkan = tidak terbatas"
                {...register("usageLimit")}
              />
              {errors.usageLimit && (
                <p className="text-xs text-destructive">
                  {errors.usageLimit.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Diskon</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus diskon{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.name}
            </span>
            ? Tindakan ini tidak bisa dibatalkan.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
