"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { type ColumnDef } from "@/components/ui/data-table"
import { createUser, deleteUser } from "@/lib/actions"
import { PageTitle } from "@/components/ui/page-title"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DataTable } from "@/components/ui/data-table"
import { Plus, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/format"
import { useState } from "react"

const schema = z.object({
  name:     z.string().min(1, "Nama wajib diisi"),
  email:    z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role:     z.enum(["CASHIER", "MANAGER"]),
  pin:      z.string().max(4).optional(),
})
type FormValues = z.infer<typeof schema>

type User = { id: string; name: string; email: string; role: string; createdAt: Date }

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-destructive mt-1">{msg}</p>
}

export function UserList({ users }: { users: User[] }) {
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", role: "CASHIER", pin: "" },
  })

  async function onSubmit(data: FormValues) {
    try {
      await createUser({ ...data, pin: data.pin || undefined })
      toast.success("Pengguna ditambahkan")
      reset()
      setOpen(false)
    } catch {
      toast.error("Email sudah digunakan")
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    await deleteUser(deleteId)
    toast.success("Pengguna dihapus")
    setDeleteId(null)
  }

  const columns: ColumnDef<User>[] = [
    { accessorKey: "name", header: "Nama", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role", header: "Role",
      cell: ({ row }) => (
        <Badge variant={row.original.role === "ADMIN" ? "default" : row.original.role === "MANAGER" ? "outline" : "secondary"}>
          {row.original.role}
        </Badge>
      ),
    },
    { accessorKey: "createdAt", header: "Dibuat", cell: ({ row }) => <span className="text-xs">{formatDate(row.original.createdAt)}</span> },
    {
      id: "actions", header: "Aksi", size: 60,
      cell: ({ row }) => (
        <Button variant="ghost" size="icon-xs" onClick={() => setDeleteId(row.original.id)}>
          <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageTitle title="Pengguna" description="Kelola akun pengguna sistem: admin, manajer, dan kasir beserta hak aksesnya." />
        <Button data-tour="add-user-btn" onClick={() => setOpen(true)}><Plus className="size-4" /> Tambah Pengguna</Button>
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Pengguna</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input {...register("name")} placeholder="Nama" />
              <FieldError msg={errors.name?.message} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...register("email")} type="email" placeholder="Email" />
              <FieldError msg={errors.email?.message} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input {...register("password")} type="password" placeholder="Password" />
              <FieldError msg={errors.password?.message} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Controller name="role" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue>{{ CASHIER: "Kasir", MANAGER: "Manager" }[field.value]}</SelectValue></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASHIER">Kasir</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-2">
              <Label>PIN (opsional)</Label>
              <Input {...register("pin")} placeholder="4 digit" maxLength={4} />
              <FieldError msg={errors.pin?.message} />
            </div>
            <DialogFooter><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus Pengguna</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Yakin ingin menghapus pengguna ini? Aksi ini tidak bisa dibatalkan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div data-tour="user-table">
        <DataTable columns={columns} data={users} searchKey="name" searchPlaceholder="Cari pengguna..." />
      </div>
    </div>
  )
}
