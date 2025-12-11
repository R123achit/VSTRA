import { motion, AnimatePresence } from 'framer-motion'

export default function SizeGuide({ isOpen, onClose, category = 'general' }) {
  const sizeCharts = {
    men: {
      title: "Men's Size Guide",
      headers: ['Size', 'Chest (in)', 'Waist (in)', 'Hip (in)'],
      rows: [
        ['XS', '34-36', '28-30', '34-36'],
        ['S', '36-38', '30-32', '36-38'],
        ['M', '38-40', '32-34', '38-40'],
        ['L', '40-42', '34-36', '40-42'],
        ['XL', '42-44', '36-38', '42-44'],
        ['XXL', '44-46', '38-40', '44-46'],
      ],
    },
    women: {
      title: "Women's Size Guide",
      headers: ['Size', 'Bust (in)', 'Waist (in)', 'Hip (in)'],
      rows: [
        ['XS', '32-34', '24-26', '34-36'],
        ['S', '34-36', '26-28', '36-38'],
        ['M', '36-38', '28-30', '38-40'],
        ['L', '38-40', '30-32', '40-42'],
        ['XL', '40-42', '32-34', '42-44'],
        ['XXL', '42-44', '34-36', '44-46'],
      ],
    },
    general: {
      title: 'Size Guide',
      headers: ['Size', 'Chest/Bust (in)', 'Waist (in)', 'Hip (in)'],
      rows: [
        ['XS', '32-34', '24-26', '34-36'],
        ['S', '34-36', '26-28', '36-38'],
        ['M', '36-38', '28-30', '38-40'],
        ['L', '38-40', '30-32', '40-42'],
        ['XL', '40-42', '32-34', '42-44'],
        ['XXL', '42-44', '34-36', '44-46'],
      ],
    },
  }

  const chart = sizeCharts[category] || sizeCharts.general

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{chart.title}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-black transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Size Chart Table */}
              <div className="overflow-x-auto mb-4 sm:mb-6 -mx-4 sm:mx-0">
                <table className="w-full border-collapse min-w-[500px] sm:min-w-0">
                  <thead>
                    <tr className="bg-black text-white">
                      {chart.headers.map((header, idx) => (
                        <th key={idx} className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chart.rows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}
                      >
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                            {cellIdx === 0 ? (
                              <span className="font-bold">{cell}</span>
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Measurement Tips */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6">
                <h3 className="font-bold text-base sm:text-lg mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  How to Measure
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Chest/Bust:</strong> Measure around the fullest part of your chest</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Waist:</strong> Measure around your natural waistline</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Hip:</strong> Measure around the fullest part of your hips</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Use a soft measuring tape and keep it parallel to the floor</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
