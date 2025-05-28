import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths
} from 'date-fns'
import ApperIcon from './ApperIcon'

const CalendarView = ({ 
  tasks, 
  categories,
  onTaskClick,
  onDateClick,
  onToggleComplete
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  const getTasksForDate = (date) => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    )
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-amber-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-surface-400'
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-soft border border-surface-200 dark:border-surface-700 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToday}
            className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
          >
            Today
          </motion.button>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevMonth}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors duration-200"
          >
            <ApperIcon name="ChevronLeft" className="w-5 h-5 text-surface-600 dark:text-surface-400" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNextMonth}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors duration-200"
          >
            <ApperIcon name="ChevronRight" className="w-5 h-5 text-surface-600 dark:text-surface-400" />
          </motion.button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center">
            <span className="text-sm font-medium text-surface-600 dark:text-surface-400">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dayTasks = getTasksForDate(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isDayToday = isToday(day)
          
          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              onClick={() => onDateClick(day)}
              className={`
                min-h-[120px] p-2 border border-surface-200 dark:border-surface-700 rounded-lg cursor-pointer
                transition-all duration-200 hover:bg-surface-50 dark:hover:bg-surface-700
                ${!isCurrentMonth ? 'opacity-50' : ''}
                ${isDayToday ? 'bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700' : 'bg-white dark:bg-surface-800'}
              `}
            >
              {/* Date Number */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  isDayToday 
                    ? 'text-primary dark:text-primary-light' 
                    : isCurrentMonth 
                      ? 'text-surface-900 dark:text-white' 
                      : 'text-surface-400 dark:text-surface-600'
                }`}>
                  {format(day, 'd')}
                </span>
                
                {dayTasks.length > 0 && (
                  <span className="text-xs bg-surface-200 dark:bg-surface-600 text-surface-600 dark:text-surface-300 px-1 py-0.5 rounded">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              {/* Tasks */}
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => {
                  const category = categories.find(c => c.id === task.categoryId)
                  
                  return (
                    <motion.div
                      key={task.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onTaskClick(task)
                      }}
                      className={`
                        p-1 rounded text-xs cursor-pointer transition-all duration-200
                        ${task.isCompleted 
                          ? 'bg-surface-100 dark:bg-surface-600 text-surface-500 dark:text-surface-400 line-through' 
                          : 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white hover:shadow-sm'
                        }
                        border-l-2 ${getPriorityColor(task.priority)}
                      `}
                    >
                      <div className="flex items-center space-x-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleComplete(task.id)
                          }}
                          className={`w-3 h-3 rounded border flex items-center justify-center ${
                            task.isCompleted 
                              ? 'bg-primary border-primary text-white' 
                              : 'border-surface-300 dark:border-surface-600 hover:border-primary'
                          }`}
                        >
                          {task.isCompleted && (
                            <ApperIcon name="Check" className="w-2 h-2" />
                          )}
                        </motion.button>
                        
                        <span className="truncate flex-1" title={task.title}>
                          {task.title}
                        </span>
                        
                        {category && (
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: category.color }}
                            title={category.name}
                          ></div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
                
                {dayTasks.length > 3 && (
                  <div className="text-xs text-surface-500 dark:text-surface-400 text-center py-1">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-sm text-surface-600 dark:text-surface-400">High Priority</span>

        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-amber-500 rounded"></div>
          <span className="text-sm text-surface-600 dark:text-surface-400">Medium Priority</span>

        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-sm text-surface-600 dark:text-surface-400">Low Priority</span>

        </div>
      </div>
    </div>
  )
}

export default CalendarView