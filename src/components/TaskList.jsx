import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import ApperIcon from './ApperIcon'


const TaskList = ({ 
  tasks, 
  categories, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  onCreateTask,
  onReorder
}) => {

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-surface-600 bg-surface-50 border-surface-200'
    }
  }

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    if (isToday(date)) return { text: 'Today', color: 'text-blue-600' }
    if (isTomorrow(date)) return { text: 'Tomorrow', color: 'text-green-600' }
    if (isPast(date)) return { text: 'Overdue', color: 'text-red-600' }
    return { text: format(date, 'MMM dd'), color: 'text-surface-600' }
  }

  if (tasks.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <ApperIcon name="CheckSquare" className="w-8 h-8 text-surface-400" />
        </div>
        <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">No tasks found</h3>
        <p className="text-surface-600 dark:text-surface-400 mb-6">
          Create your first task to get started
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateTask}
          className="btn-primary"
        >
          Create Task
        </motion.button>
      </motion.div>
    )
  }

  return (
    <DragDropContext onDragEnd={onReorder}>
      <Droppable droppableId="task-list">
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`divide-y divide-surface-200 dark:divide-surface-700 transition-all duration-200 ${
              snapshot.isDraggingOver ? 'bg-surface-50 dark:bg-surface-700' : ''
            }`}
          >
            <AnimatePresence>
              {tasks.map((task, index) => {
                const category = categories.find(c => c.id === task.categoryId)
                const dueDateStatus = getDueDateStatus(task.dueDate)
                
                return (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 hover:bg-surface-50 dark:hover:bg-surface-700 transition-all duration-200 ${
                          task.isCompleted ? 'opacity-60' : ''
                        } priority-${task.priority} ${
                          snapshot.isDragging ? 'drag-item-dragging shadow-lg' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            {...provided.dragHandleProps}
                            className="mt-1 cursor-grab active:cursor-grabbing text-surface-400 hover:text-surface-600 transition-colors duration-200"
                          >
                            <ApperIcon name="GripVertical" className="w-4 h-4" />
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onToggleComplete(task.id)}
                            className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                              task.isCompleted 
                                ? 'bg-primary border-primary text-white' 
                                : 'border-surface-300 dark:border-surface-600 hover:border-primary'
                            }`}
                          >
                            {task.isCompleted && <ApperIcon name="Check" className="w-3 h-3" />}
                          </motion.button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className={`text-sm font-medium transition-all duration-200 ${
                                  task.isCompleted 
                                    ? 'line-through text-surface-500 dark:text-surface-400' 
                                    : 'text-surface-900 dark:text-white'
                                }`}>
                                  {task.title}
                                </h4>
                                
                                {task.description && (
                                  <p className={`text-sm mt-1 ${
                                    task.isCompleted 
                                      ? 'line-through text-surface-400 dark:text-surface-500' 
                                      : 'text-surface-600 dark:text-surface-400'
                                  }`}>
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center space-x-3 mt-2">
                                  <span className={`category-badge ${getPriorityColor(task.priority)}`}>
                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}

                                  </span>
                                  
                                  <div className="flex items-center space-x-1">
                                    <div 
                                      className="w-2 h-2 rounded-full" 
                                      style={{ backgroundColor: category?.color }}
                                    ></div>
                                    <span className="text-xs text-surface-600 dark:text-surface-400">
                                      {category?.name}
                                    </span>
                                  </div>

                                  {dueDateStatus && (
                                    <span className={`text-xs ${dueDateStatus.color}`}>
                                      <ApperIcon name="Calendar" className="w-3 h-3 inline mr-1" />
                                      {dueDateStatus.text}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 ml-4">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => onEdit(task)}
                                  className="p-1 text-surface-400 hover:text-primary transition-colors duration-200"
                                >
                                  <ApperIcon name="Edit2" className="w-4 h-4" />
                                </motion.button>
                                
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => onDelete(task.id)}
                                  className="p-1 text-surface-400 hover:text-red-500 transition-colors duration-200"
                                >
                                  <ApperIcon name="Trash2" className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </Draggable>
                )
              })}
            </AnimatePresence>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )

}

export default TaskList