import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const StoryScroller = ({ items = [], activeId, onSelect }) => {
  const scrollRef = useRef(null)

  // Auto-scroll to active item
  useEffect(() => {
    if (activeId && scrollRef.current) {
      const activeElement = scrollRef.current.querySelector(`[data-story-id="${activeId}"]`)
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }, [activeId])

  const handleItemClick = (item) => {
    if (onSelect) {
      onSelect(item.id)
    }
  }

  return (
    <div className="py-4">
      <div 
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            data-story-id={item.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleItemClick(item)}
            className="flex flex-col items-center space-y-2 cursor-pointer snap-center flex-shrink-0"
          >
            {/* Avatar */}
            <div className={`relative w-18 h-18 rounded-full p-0.5 ${
              activeId === item.id ? 'ring-2 ring-blue-600' : 'ring-2 ring-gray-200'
            }`}>
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                {item.imgUrl ? (
                  <img
                    src={item.imgUrl}
                    alt={item.label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {item.label.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Label */}
            <span className={`text-xs font-medium text-center max-w-16 ${
              activeId === item.id ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default StoryScroller




