import { motion } from 'framer-motion'
import { format } from 'date-fns'
import ApperIcon from './ApperIcon'

const TaskDetailPanel = ({ 
  isOpen, 
  task, 
  subtasks,
  categories,
  onClose, 
  onEdit,
  onDelete,
  onAddSubtask,
  onToggleComplete
}) => {
  if (!isOpen || !task) return null

  const category = categories.find(c => c.id === task.categoryId)
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-surface-600 bg-surface-50 border-surface-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-surface-800 rounded-2xl shadow-soft max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-surface-900 dark:text-white">
            Task Details
          </h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors duration-200"
          >
            <ApperIcon name="X" className="w-5 h-5 text-surface-500" />
          </motion.button>
        </div>

        {/* Task Content */}
        <div className="space-y-4">
          {/* Title and Completion */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onToggleComplete(task.id)}
                className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                  task.isCompleted 
                    ? 'bg-primary border-primary text-white' 
                    : 'border-surface-300 dark:border-surface-600 hover:border-primary'
                }`}
              >
                {task.isCompleted && <ApperIcon name="Check" className="w-4 h-4" />}
              </motion.button>
              
              <div className="flex-1">
                <h4 className={`text-lg font-semibold ${
                  task.isCompleted 
                    ? 'line-through text-surface-500 dark:text-surface-400' 
                    : 'text-surface-900 dark:text-white'
                }`}>
                  {task.title}
                </h4>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(task)}
                className="p-2 text-surface-400 hover:text-primary transition-colors duration-200"
              >
                <ApperIcon name="Edit2" className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(task.id)}
                className="p-2 text-surface-400 hover:text-red-500 transition-colors duration-200"
              >
                <ApperIcon name="Trash2" className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Description
              </label>
              <p className={`text-sm p-3 bg-surface-50 dark:bg-surface-700 rounded-lg ${
                task.isCompleted 
                  ? 'line-through text-surface-400 dark:text-surface-500' 
                  : 'text-surface-600 dark:text-surface-400'
              }`}>
                {task.description}
              </p>
            </div>
          )}

          {/* Task Meta Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Priority
              </label>
              <span className={`category-badge ${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Category
              </label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category?.color }}
                ></div>
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  {category?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Due Date
              </label>
              <p className="text-sm text-surface-600 dark:text-surface-400">
                {format(new Date(task.dueDate), 'PPP')}
              </p>
            </div>
          )}

          {/* Subtasks Section */}
          <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold text-surface-900 dark:text-white">
                Subtasks ({subtasks.length})
              </h5>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAddSubtask(task)}
                className="btn-primary flex items-center space-x-2 text-sm"
              >
                <ApperIcon name="Plus" className="w-4 h-4" />
                <span>Add Subtask</span>
              </motion.button>
            </div>

            {/* Subtasks List */}
            {subtasks.length > 0 ? (
              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <motion.div
                    key={subtask.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-3 p-3 bg-surface-50 dark:bg-surface-700 rounded-lg"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onToggleComplete(subtask.id)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                        subtask.isCompleted 
                          ? 'bg-primary border-primary text-white' 
                          : 'border-surface-300 dark:border-surface-600 hover:border-primary'
                      }`}
                    >
                      {subtask.isCompleted && <ApperIcon name="Check" className="w-3 h-3" />}
                    </motion.button>
                    
                    <div className="flex-1">
                      <h6 className={`text-sm font-medium ${
                        subtask.isCompleted 
                          ? 'line-through text-surface-500 dark:text-surface-400' 
                          : 'text-surface-900 dark:text-white'
                      }`}>
                        {subtask.title}
                      </h6>
                      {subtask.description && (
                        <p className={`text-xs mt-1 ${
                          subtask.isCompleted 
                            ? 'line-through text-surface-400 dark:text-surface-500' 
                            : 'text-surface-600 dark:text-surface-400'
                        }`}>
                          {subtask.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(subtask)}
                        className="p-1 text-surface-400 hover:text-primary transition-colors duration-200"
                      >
                        <ApperIcon name="Edit2" className="w-3 h-3" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(subtask.id)}
                        className="p-1 text-surface-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <ApperIcon name="Trash2" className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ApperIcon name="ListTodo" className="w-6 h-6 text-surface-400" />
                </div>
                <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">
                  No subtasks yet
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAddSubtask(task)}
                  className="btn-secondary text-sm"
                >
                  Add First Subtask
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default TaskDetailPanel