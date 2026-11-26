import { CircleHelp } from "lucide-react"

/** Tooltip CSS murni — pasang di sebelah Label input yang labelnya kurang jelas */
export function FieldHint({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex items-center">
      <CircleHelp className="size-3.5 cursor-help text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
      <span className="
        pointer-events-none absolute left-1/2 bottom-6 z-[9999]
        w-56 -translate-x-1/2 rounded-lg border bg-popover px-3 py-2
        text-xs leading-relaxed text-popover-foreground shadow-md
        opacity-0 transition-opacity duration-150
        group-hover:opacity-100
      ">
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
        <span className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover" />
        {text}
      </span>
    </span>
  )
}

interface PageTitleProps {
  title: string
  description?: string
  children?: React.ReactNode // slot untuk action buttons di kanan
}

/**
 * Reusable page header: title + optional tooltip icon + right-side slot.
 * Tooltip is pure CSS — no JS, no extra dep.
 */
export function PageTitle({ title, description, children }: PageTitleProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold font-heading">{title}</h1>
        {description && (
          <span className="group relative inline-flex">
            <CircleHelp className="size-4 cursor-help text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
            {/* CSS tooltip — no JS */}
            <span className="
              pointer-events-none absolute left-1/2 top-full z-50 mt-2
              w-64 -translate-x-1/2 rounded-lg border bg-popover px-3 py-2
              text-xs leading-relaxed text-popover-foreground shadow-md
              opacity-0 transition-opacity duration-150
              group-hover:opacity-100
            ">
              {/* arrow */}
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-border" />
              <span className="absolute -top-[5px] left-1/2 -translate-x-1/2 border-4 border-transparent border-b-popover" />
              {description}
            </span>
          </span>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
