"use client"

import { useExpenseTypeContext } from "@/context/store/ExpenseTypeStore"
import * as React from "react"
import { ExpenseService } from "@/service/expense/ExpenseService"
import { isLeft } from "@/implementation/Either"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"
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
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [isClosing, setIsClosing] = React.useState(false)
  const [errorLabel, setErrorLabel] = React.useState("")
  const {refreshExpenseTypes} = useExpenseTypeContext() // To refresh expense types after creation if needed


  React.useEffect(() => {
    refreshExpenseTypes();
  },[])

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

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onCancel()
    }, 300)
  }

  const handleSuccessClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onSuccess()
    }, 300)
  }

  const handleSubmit = async () => {
    setErrorLabel("")
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      const result = await ExpenseService.instance.createNewExpense(formData)
      if (isLeft(result)) {
        setErrorLabel(result.value.message || "Failed to create expense")
        setIsSubmitting(false)
        return
      }
      setIsSubmitting(false)
      setIsSuccess(true)
      setTimeout(() => {
        handleSuccessClose()
      }, 1500)
    } catch (error) {
      setErrorLabel("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`relative transition-all duration-300 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      {/* Success Overlay */}
      {isSuccess && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center z-20">
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 animate-in zoom-in duration-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Success!</h3>
              <p className="text-sm text-gray-600">Expense "{formData.detail}" has been created</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSubmitting && !isSuccess && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
            <Loader2 className="w-5 h-5 mr-2 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-gray-700">Creating expense...</span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className={`space-y-4 transition-opacity duration-200 ${isSuccess ? 'opacity-30' : 'opacity-100'}`}>
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
              setErrorLabel("")
            }}
            placeholder="e.g., Electricity bill"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base transition-colors ${
              validationErrors.detail ? "border-red-500" : "border-border"
            } ${isSubmitting || isSuccess ? "opacity-50" : ""}`}
            disabled={isSubmitting || isSuccess}
          />
          {validationErrors.detail && (
            <p className="flex items-center text-red-500 text-xs mt-1">
              <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
              {validationErrors.detail}
            </p>
          )}
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
                disabled={loading || isSubmitting || isSuccess}
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
          {validationErrors.expenseType && (
            <div className="flex items-center text-red-500 text-xs mt-1">
              <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
              {validationErrors.expenseType}
            </div>
          )}
        </div>
        {errorLabel && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
            <p className="flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
              {errorLabel}
            </p>
          </div>
        )}
      </div>

      {/* Form Footer */}
      <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6 transition-opacity duration-200 ${isSuccess ? 'opacity-30' : 'opacity-100'}`}>
        <button
          onClick={handleClose}
          className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors order-2 sm:order-1 disabled:opacity-50"
          disabled={isSubmitting || isSuccess}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.detail.trim() || !formData.expenseType.trim() || isSubmitting || isSuccess}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 flex items-center justify-center min-w-[160px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Expense"
          )}
        </button>
      </div>
    </div>
  )
}

export default CreateExpenseForm