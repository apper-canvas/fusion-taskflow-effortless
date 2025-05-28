import { motion } from 'framer-motion'
import { isToday } from 'date-fns'
import ApperIcon from './ApperIcon'

const Sidebar = ({ 
  stats, 
  tasks, 
  categories, 
  activeCategory, 
  setActiveCategory 
}) => {
  const filters = [
    { id: 'all', name: 'All Tasks', icon: 'List', count: stats.total },
    { id: 'today', name: 'Today', icon: 'Calendar', count: tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate))).length },
    { id: 'completed', name: 'Completed', icon: 'CheckSquare', count: stats.completed },
    { id: 'overdue', name: 'Overdue', icon: 'AlertTriangle', count: stats.overdue }
  ]

  return (
    <div>
      {/* Filters */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">Quick Filters</h4>
        <div className="space-y-1">
          {filters.map(filter => (
            <motion.button
              key={filter.id}
              whileHover={{ x: 4 }}
              onClick={() => setActiveCategory(filter.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                activeCategory === filter.id 
                  ? 'bg-primary text-white' 
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ApperIcon name={filter.icon} className="w-4 h-4" />
                <span>{filter.name}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                activeCategory === filter.id 
                  ? 'bg-white text-primary' 
                  : 'bg-surface-200 dark:bg-surface-600 text-surface-600 dark:text-surface-300'
              }`}>
                {filter.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">Categories</h4>
        <div className="space-y-1">
          {categories.map(category => (
            <motion.button
              key={category.id}
              whileHover={{ x: 4 }}
              onClick={() => setActiveCategory(category.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                activeCategory === category.id 
                  ? 'bg-primary text-white' 
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                <ApperIcon name={category.icon} className="w-4 h-4" />
                <span>{category.name}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                activeCategory === category.id 
                  ? 'bg-white text-primary' 
                  : 'bg-surface-200 dark:bg-surface-600 text-surface-600 dark:text-surface-300'
              }`}>
                {category.taskCount}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Sidebar