"use client"

import { forwardRef, useState } from "react"
import { Input } from "@/components/ui/input"

function formatIDR(n: number): string { return n.toLocaleString("id-ID") }

interface PriceInputProps {
  name?: string
  defaultValue?: number
  value?: number
  onChange?: (val: number) => void
  placeholder?: string
  required?: boolean
  className?: string
}

// Supports both uncontrolled (name/defaultValue for FormData) and controlled (value/onChange for RHF)
export const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  ({ name, defaultValue, value, onChange, className, placeholder, required }, ref) => {
    const isControlled = value !== undefined && onChange !== undefined
    const [display, setDisplay] = useState(
      isControlled ? (value ? formatIDR(value) : "") : (defaultValue ? formatIDR(defaultValue) : "")
    )
    // sync controlled value → display when value changes externally
    const displayVal = isControlled ? (value ? formatIDR(value) : "") : display

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const digits = e.target.value.replace(/\D/g, "")
      const num = digits ? parseInt(digits, 10) : 0
      const formatted = digits ? formatIDR(num) : ""
      if (isControlled) {
        onChange(num)
      } else {
        setDisplay(formatted)
      }
    }

    return (
      <>
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayVal}
          onChange={handleChange}
          placeholder={placeholder ?? "0"}
          required={required}
          className={className}
        />
        {/* hidden input for uncontrolled/FormData usage */}
        {!isControlled && name && (
          <input type="hidden" name={name} value={display.replace(/\./g, "") || "0"} />
        )}
      </>
    )
  }
)
PriceInput.displayName = "PriceInput"
