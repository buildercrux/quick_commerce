import React from 'react'
import { motion } from 'framer-motion'

const MasonryGrid = ({ children, className = '' }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`masonry-grid ${className}`}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="masonry-item"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

export default MasonryGrid




