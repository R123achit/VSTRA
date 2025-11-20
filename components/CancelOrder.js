import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function CancelOrder({ orderId, onClose, onCancel }) {
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [loading, setLoading] = useState(false)

  const cancelReasons = [
    'Ordered by mistake',
    'Found better price elsewhere',
    'Changed my mind',
    'Delivery time too long',
    'Need to change shipping address',
    'Need to modify order items',
    'Payment issues',
    'Duplicate order',
    'Other (please specify)'
  ]

  const handleCancel = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for cancellation')
      return
    }

    if (selectedReason === 'Other (please specify)' && !customReason.trim()) {
      toast.error('Please provide a reason for cancellation')
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      toast.success('Order cancelled successfully! Refund will be processed within 5-7 business days.')
      onCancel?.({
        orderId,
        reason: selectedReason,
        customReason: customReason || null
      })
      onClose()
    }, 1500)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Cancel Order</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mt-2">Order ID: {orderId}</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Once cancelled, this action cannot be undone. 
                If your order has already shipped, you'll need to initiate a return instead.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">
                  Why are you cancelling this order? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {cancelReasons.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedReason === reason
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="mr-3 text-purple-600"
                      />
                      <span className="text-sm">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {selectedReason === 'Other (please specify)' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium mb-2">
                    Please specify your reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    rows="4"
                    placeholder="Tell us why you're cancelling..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </motion.div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">Cancellation Policy</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Orders can be cancelled within 24 hours of placement</li>
                  <li>• Full refund will be processed to original payment method</li>
                  <li>• Refunds typically take 5-7 business days</li>
                  <li>• You'll receive a confirmation email once cancelled</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
            >
              Keep Order
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
