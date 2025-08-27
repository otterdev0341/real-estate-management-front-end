import { ExclamationTriangleIcon } from "@heroicons/react/24/solid"

interface CommonDeleteFormProps {
  description: string
  onConfirm: () => void
  onCancel: () => void
  isSubmitting?: boolean
  error?: string
}

const CommonDeleteForm = ({
  description,
  onConfirm,
  onCancel,
  isSubmitting = false,
  error = "",
}: CommonDeleteFormProps) => {
  return (
    <div className="space-y-6">
      {/* Warning Content */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Deletion
          </h3>
          <p className="text-sm text-gray-600 max-w-sm">
            {description}
          </p>
        </div>
        {error && (
          <div className="mt-2 flex items-center justify-center text-red-600 text-sm">
            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}
      </div>

      {/* Form Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Deleting...
            </>
          ) : (
            "Yes, Delete"
          )}
        </button>
      </div>
    </div>
  )
}

export default CommonDeleteForm