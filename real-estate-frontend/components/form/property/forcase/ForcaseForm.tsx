import {
  PropertyForcaseDto,
  getTotalExpense,
  getBudgetUsedPercent,
  getProfit,
} from "./dto/PropertyForcaseDto"

export interface ForcaseFormProps {
  data: PropertyForcaseDto;
  onChange: (field: keyof PropertyForcaseDto, value: number) => void;
}

const ForcaseForm = ({ data, onChange }: ForcaseFormProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-muted-foreground mb-1">Property ID</label>
          <input
            type="text"
            value={data.propertyId.slice(0, 6)}
            readOnly
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-muted-foreground"
          />
        </div>
        <div className="flex-[2]">
          <label className="block text-sm font-medium text-muted-foreground mb-1">Property Name</label>
          <input
            type="text"
            value={data.propertyName}
            readOnly
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-muted-foreground"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">FSP</label>
          <input
            type="number"
            value={data.fsp}
            readOnly
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-muted-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">New FSP</label>
          <input
            type="number"
            value={data.newFsp}
            onChange={e => onChange("newFsp", Number(e.target.value))}
            className="w-full px-3 py-2 bg-green-100 border border-border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Current Expense</label>
          <input
            type="number"
            value={data.currentExpense}
            readOnly
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-muted-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Additional Expense</label>
          <input
            type="number"
            value={data.additionalExpense}
            onChange={e => onChange("additionalExpense", Number(e.target.value))}
            className="w-full px-3 py-2 bg-green-100 border border-border rounded-lg text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Total Expense</label>
          <input
            type="number"
            value={getTotalExpense(data)}
            readOnly
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-muted-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Budget</label>
          <input
            type="number"
            value={data.budget}
            readOnly
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-muted-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Budget Used (%)</label>
          <input
            type="number"
            value={getBudgetUsedPercent(data).toFixed(2)}
            readOnly
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-muted-foreground"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">Profit</label>
        <input
          type="number"
          value={getProfit(data)}
          readOnly
          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-muted-foreground"
        />
      </div>
    </div>
  )
}

export default ForcaseForm