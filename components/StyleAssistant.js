import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useAuthStore } from '../store/useStore'

export default function StyleAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef(null)
  const { user } = useAuthStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const quickActions = [
    { icon: '👔', text: 'Trending Now', query: 'What are the trending fashion items right now?' },
    { icon: '✨', text: 'Style Me', query: 'Give me outfit recommendations for a casual day out' },
    { icon: '🎨', text: 'Color Match', query: 'What colors go well together for an outfit?' },
    { icon: '🛍️', text: 'Shop Smart', query: 'Help me find the perfect gift for someone special' },
  ]

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        role: 'assistant',
        content: `Hey${user ? ` ${user.name}` : ''}! 👋 I'm your personal style assistant. I can help you with:\n\n• Fashion recommendations\n• Trending styles\n• Outfit combinations\n• Shopping advice\n• Size guides\n\nWhat would you like to know?`,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
      generateSuggestions()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const generateSuggestions = () => {
    const allSuggestions = [
      'What\'s trending this season?',
      'Recommend a formal outfit',
      'Best colors for summer',
      'How to style a blazer?',
      'Gift ideas under $100',
      'Sustainable fashion tips',
    ]
    setSuggestions(allSuggestions.sort(() => 0.5 - Math.random()).slice(0, 3))
  }

  const handleSend = async (text = input) => {
    if (!text.trim()) return

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const { data } = await axios.post('/api/ai/chat', {
        message: text,
        history: messages.slice(-10),
      })

      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        products: data.products || [],
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      generateSuggestions()
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again!',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickAction = (query) => {
    handleSend(query)
  }

  if (!mounted) return null

  return (
    <>
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .custom-scrollbar-horizontal::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .custom-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        .custom-scrollbar-horizontal {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
      
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-full shadow-2xl flex items-center justify-center text-white text-xl md:text-2xl hover:shadow-purple-500/50 transition-shadow"
          >
            <span className="relative">
              ✨
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed inset-4 md:inset-auto md:bottom-6 md:right-6 z-50 md:w-[420px] md:h-[650px] bg-white rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-xl p-4 md:p-6 flex items-center justify-between border-b border-white/20">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center text-xl md:text-2xl">
                    ✨
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base md:text-lg">Style Assistant</h3>
                  <p className="text-white/70 text-[10px] md:text-xs">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-xl p-3 md:p-4 border-b border-white/20">
              <div className="grid grid-cols-4 gap-1.5 md:gap-2">
                {quickActions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAction(action.query)}
                    className="bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3 flex flex-col items-center gap-0.5 md:gap-1 hover:bg-white/30 transition-colors"
                  >
                    <span className="text-xl md:text-2xl">{action.icon}</span>
                    <span className="text-white text-[9px] md:text-[10px] font-medium text-center leading-tight">
                      {action.text}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4 bg-white/5 backdrop-blur-xl custom-scrollbar">
              {messages.map((message, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[80%] rounded-xl md:rounded-2xl p-3 md:p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white'
                        : 'bg-white text-gray-800 shadow-lg'
                    }`}
                  >
                    <p className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    
                    {/* Product Recommendations */}
                    {message.products && message.products.length > 0 && (
                      <div className="mt-3 md:mt-4 space-y-2">
                        {message.products.map((product, pidx) => (
                          <motion.a
                            key={pidx}
                            href={`/product/${product._id}`}
                            target="_blank"
                            whileHover={{ scale: 1.02 }}
                            className="flex gap-2 md:gap-3 bg-gray-50 rounded-lg md:rounded-xl p-2 md:p-3 hover:bg-gray-100 transition-colors"
                          >
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-xs md:text-sm truncate">{product.name}</h4>
                              <p className="text-[10px] md:text-xs text-gray-600">${product.price}</p>
                            </div>
                          </motion.a>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-[10px] opacity-50 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && !isTyping && (
              <div className="bg-white/10 backdrop-blur-xl p-3 border-t border-white/20">
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar-horizontal">
                  {suggestions.map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSend(suggestion)}
                      className="bg-white/20 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full whitespace-nowrap hover:bg-white/30 transition-colors"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="bg-white/10 backdrop-blur-xl p-3 md:p-4 border-t border-white/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-white/20 backdrop-blur-sm text-white placeholder-white/50 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-2.5 md:p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

