"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, defaultChecked, checked, onCheckedChange, onChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked ?? false)

    const actualChecked = checked !== undefined ? checked : isChecked

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (checked === undefined) {
        setIsChecked(e.target.checked)
      }
      onCheckedChange?.(e.target.checked)
      onChange?.(e)
    }

    return (
      <label className={cn("inline-flex items-center cursor-pointer relative", className)}>
        <input
          type="checkbox"
          ref={ref}
          checked={actualChecked}
          onChange={handleChange}
          className="sr-only peer"
          {...props}
        />
        <div className="w-8 h-4.5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-red-600 dark:peer-checked:bg-red-600 transition-colors shadow-2xs" />
      </label>
    )
  }
)

Switch.displayName = "Switch"
