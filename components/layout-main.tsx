export function LayoutMain({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto p-3 pb-20 sm:p-6 md:pb-6">
      {children}
    </main>
  )
}
