"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CommonSelectItem {
  id: string
  value: string
  label: string
}

interface CommonSelectProps {
  items: CommonSelectItem[]
  defaultValue?: string
  value?: string
  onSelect: (selected: CommonSelectItem) => void
  placeholder?: string
  disabled?: boolean
}

const CommonSelect = ({
  items,
  defaultValue,
  value,
  onSelect,
  placeholder = "Select...",
  disabled = false,
}: CommonSelectProps) => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [internalValue, setInternalValue] = useState(defaultValue || "")

  // Use controlled value if provided, otherwise use internal state
  const selectedValue = value !== undefined ? value : internalValue
  const selectedItem = items.find(item => item.value === selectedValue || item.id === selectedValue)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between")}
          disabled={disabled}
        >
          {selectedItem ? selectedItem.label : placeholder}
          <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder={`Search...`}
            className="h-9"
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup>
              {items
                .filter(item =>
                  item.label.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(item => (
                  <CommandItem
                    key={item.id}
                    value={item.value}
                    onSelect={() => {
                      if (value !== undefined) {
                        // Controlled: parent handles value
                        onSelect(item)
                      } else {
                        // Uncontrolled: update internal state
                        setInternalValue(item.value)
                        onSelect(item)
                      }
                      setOpen(false)
                      onSelect(item)
                    }}
                  >
                    {item.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedValue === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default CommonSelect