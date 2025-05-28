import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-primary-50 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-soft"
        >
          <ApperIcon name="FileQuestion" className="w-12 h-12 text-white" />
        </motion.div>
        
        <h1 className="text-6xl font-bold text-surface-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-surface-700 mb-4">Page Not Found</h2>
        <p className="text-surface-600 mb-8 max-w-md mx-auto">
          Oops! The task you're looking for seems to have been completed and moved elsewhere.
        </p>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-soft hover:shadow-md"
          >
            <ApperIcon name="ArrowLeft" className="w-5 h-5" />
            <span>Back to Tasks</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default NotFound