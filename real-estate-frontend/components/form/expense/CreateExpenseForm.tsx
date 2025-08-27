"use client"

import { useExpenseTypeContext } from "@/context/store/ExpenseTypeStore"
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
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

interface CreateExpenseFormProps {
  onSuccess: () => void
  onCancel: () => void
}

const CreateExpenseForm = ({ onSuccess, onCancel }: CreateExpenseFormProps) => {
  const { expenseTypes, loading } = useExpenseTypeContext()
  const [formData, setFormData] = React.useState({ detail: "", expenseType: "" })
  const [validationErrors, setValidationErrors] = React.useState({ detail: "", expenseType: "" })
  const [expenseTypeOpen, setExpenseTypeOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  const validateForm = () => {
    const errors = { detail: "", expenseType: "" }
    if (!formData.detail.trim()) {
      errors.detail = "Expense detail is required"
    } else if (formData.detail.trim().length < 2) {
      errors.detail = "Expense detail must be at least 2 characters"
    }
    if (!formData.expenseType.trim()) {
      errors.expenseType = "Expense type is required"
    }
    setValidationErrors(errors)
    return !errors.detail && !errors.expenseType
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    // Call your API here (ExpenseService.instance.createNewExpense(formData))
    // If success:
    onSuccess()
  }

  return (
    <>
      {/* Form Content */}
      <div className="space-y-4">
        {/* Expense Detail */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Expense Detail *</label>
          <input
            type="text"
            value={formData.detail}
            onChange={(e) => {
              setFormData({ ...formData, detail: e.target.value })
              if (validationErrors.detail) {
                setValidationErrors({ ...validationErrors, detail: "" })
              }
            }}
            placeholder="e.g., Electricity bill"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.detail ? "border-red-500" : "border-border"
            }`}
          />
          {validationErrors.detail && <p className="text-red-500 text-xs mt-1">{validationErrors.detail}</p>}
        </div>
        {/* Expense Type (Combobox with Popover & Command) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Expense Type *</label>
          <Popover open={expenseTypeOpen} onOpenChange={setExpenseTypeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={expenseTypeOpen}
                className={cn(
                  "w-full justify-between",
                  validationErrors.expenseType ? "border-red-500" : "border-border"
                )}
                disabled={loading}
              >
                {formData.expenseType
                  ? expenseTypes.find((type) => type.id === formData.expenseType)?.detail
                  : "Select or search expense type"}
                <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full min-w-[200px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search expense type..."
                  className="h-9"
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandList>
                  <CommandEmpty>No expense type found.</CommandEmpty>
                  <CommandGroup>
                    {expenseTypes
                      .filter(type =>
                        type.detail.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((type) => (
                        <CommandItem
                          key={type.id}
                          value={type.id}
                          onSelect={(currentValue) => {
                            setFormData({ ...formData, expenseType: currentValue })
                            setValidationErrors({ ...validationErrors, expenseType: "" })
                            setExpenseTypeOpen(false)
                          }}
                        >
                          {type.detail}
                          <Check
                            className={cn(
                              "ml-auto",
                              formData.expenseType === type.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {validationErrors.expenseType && <p className="text-red-500 text-xs mt-1">{validationErrors.expenseType}</p>}
        </div>
      </div>

      {/* Form Footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.detail.trim() || !formData.expenseType.trim()}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
        >
          Create Expense
        </button>
      </div>
    </>
  )
}

export default CreateExpenseForm