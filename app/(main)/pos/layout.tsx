export default function POSLayout({ children }: { children: React.ReactNode }) {
  // Negate LayoutMain padding so POS fills edge-to-edge
  return <div className="-m-3 -mb-20 sm:-m-6 md:-mb-6 flex flex-col min-h-0 flex-1">{children}</div>
}
