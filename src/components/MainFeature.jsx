import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import ApperIcon from './ApperIcon'

const MainFeature = () => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([
    { id: '1', name: 'Personal', color: '#ef4444', icon: 'User', taskCount: 0 },
    { id: '2', name: 'Work', color: '#3b82f6', icon: 'Briefcase', taskCount: 0 },
    { id: '3', name: 'Projects', color: '#8b5cf6', icon: 'FolderOpen', taskCount: 0 },
    { id: '4', name: 'Shopping', color: '#10b981', icon: 'ShoppingCart', taskCount: 0 }
  ])
  const [activeCategory, setActiveCategory] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [viewMode, setViewMode] = useState('list') // list, board, calendar
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    categoryId: '1'
  })

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow-tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks))
    updateCategoryTaskCounts()
  }, [tasks])

  const updateCategoryTaskCounts = () => {
    const updatedCategories = categories.map(category => ({
      ...category,
      taskCount: tasks.filter(task => task.categoryId === category.id && !task.isCompleted).length
    }))
    setCategories(updatedCategories)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    const taskData = {
      id: editingTask ? editingTask.id : Date.now().toString(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      isCompleted: editingTask ? editingTask.isCompleted : false,
      dueDate: formData.dueDate || null,
      priority: formData.priority,
      categoryId: formData.categoryId,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (editingTask) {
      setTasks(tasks.map(task => task.id === editingTask.id ? taskData : task))
      toast.success('Task updated successfully!')
    } else {
      setTasks([...tasks, taskData])
      toast.success('Task created successfully!')
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      categoryId: '1'
    })
    setIsFormOpen(false)
    setEditingTask(null)
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate || '',
      priority: task.priority,
      categoryId: task.categoryId
    })
    setIsFormOpen(true)
  }

  const handleDelete = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId))
    toast.success('Task deleted successfully!')
  }

  const toggleTaskComplete = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updated = { ...task, isCompleted: !task.isCompleted, updatedAt: new Date().toISOString() }
        toast.success(updated.isCompleted ? 'Task completed! 🎉' : 'Task marked as incomplete')
        return updated
      }
      return task
    }))
  }

  const getFilteredTasks = () => {
    let filtered = tasks

    if (activeCategory !== 'all') {
      if (activeCategory === 'completed') {
        filtered = filtered.filter(task => task.isCompleted)
      } else if (activeCategory === 'today') {
        filtered = filtered.filter(task => task.dueDate && isToday(new Date(task.dueDate)))
      } else if (activeCategory === 'overdue') {
        filtered = filtered.filter(task => task.dueDate && isPast(new Date(task.dueDate)) && !task.isCompleted)
      } else {
        filtered = filtered.filter(task => task.categoryId === activeCategory)
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1
      }
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

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

  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter(task => task.isCompleted).length
    const pending = total - completed
    const overdue = tasks.filter(task => task.dueDate && isPast(new Date(task.dueDate)) && !task.isCompleted).length
    
    return { total, completed, pending, overdue }
  }

  const stats = getTaskStats()
  const filteredTasks = getFilteredTasks()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-1"
      >
        <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-soft border border-surface-200 dark:border-surface-700 p-6 sticky top-24">
          {/* Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-xl p-3">
                <div className="text-2xl font-bold text-primary dark:text-primary-light">{stats.total}</div>
                <div className="text-xs text-primary-dark dark:text-primary">Total Tasks</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl p-3">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
                <div className="text-xs text-green-700 dark:text-green-300">Completed</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 rounded-xl p-3">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
                <div className="text-xs text-amber-700 dark:text-amber-300">Pending</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-xl p-3">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
                <div className="text-xs text-red-700 dark:text-red-300">Overdue</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">Quick Filters</h4>
            <div className="space-y-1">
              {[
                { id: 'all', name: 'All Tasks', icon: 'List', count: stats.total },
                { id: 'today', name: 'Today', icon: 'Calendar', count: tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate))).length },
                { id: 'completed', name: 'Completed', icon: 'CheckSquare', count: stats.completed },
                { id: 'overdue', name: 'Overdue', icon: 'AlertTriangle', count: stats.overdue }
              ].map(filter => (
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
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:col-span-3"
      >
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex bg-surface-100 dark:bg-surface-700 rounded-lg p-1">
              {[
                { mode: 'list', icon: 'List' },
                { mode: 'board', icon: 'LayoutBoard' },
                { mode: 'calendar', icon: 'Calendar' }
              ].map(({ mode, icon }) => (
                <motion.button
                  key={mode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === mode 
                      ? 'bg-white dark:bg-surface-600 text-primary shadow-sm' 
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200'
                  }`}
                >
                  <ApperIcon name={icon} className="w-4 h-4" />
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFormOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <ApperIcon name="Plus" className="w-4 h-4" />
              <span className="hidden sm:inline">Add Task</span>
            </motion.button>
          </div>
        </div>

        {/* Task Form Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => resetForm()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-surface-800 rounded-2xl shadow-soft max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-surface-900 dark:text-white">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetForm}
                    className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors duration-200"
                  >
                    <ApperIcon name="X" className="w-5 h-5 text-surface-500" />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="form-input dark:bg-surface-700 dark:border-surface-600 dark:text-white"
                      placeholder="Enter task title..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="form-textarea dark:bg-surface-700 dark:border-surface-600 dark:text-white"
                      placeholder="Add task description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="form-input dark:bg-surface-700 dark:border-surface-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="form-input dark:bg-surface-700 dark:border-surface-600 dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="form-input dark:bg-surface-700 dark:border-surface-600 dark:text-white"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 btn-primary"
                    >
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={resetForm}
                      className="btn-secondary"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks List */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-soft border border-surface-200 dark:border-surface-700 overflow-hidden">
          {filteredTasks.length === 0 ? (
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
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first task to get started'}
              </p>
              {!searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFormOpen(true)}
                  className="btn-primary"
                >
                  Create Task
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-700">
              <AnimatePresence>
                {filteredTasks.map((task, index) => {
                  const category = categories.find(c => c.id === task.categoryId)
                  const dueDateStatus = getDueDateStatus(task.dueDate)
                  
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 hover:bg-surface-50 dark:hover:bg-surface-700 transition-all duration-200 ${
                        task.isCompleted ? 'opacity-60' : ''
                      } priority-${task.priority}`}
                    >
                      <div className="flex items-start space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleTaskComplete(task.id)}
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
                                  {task.priority}
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
                                onClick={() => handleEdit(task)}
                                className="p-1 text-surface-400 hover:text-primary transition-colors duration-200"
                              >
                                <ApperIcon name="Edit2" className="w-4 h-4" />
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(task.id)}
                                className="p-1 text-surface-400 hover:text-red-500 transition-colors duration-200"
                              >
                                <ApperIcon name="Trash2" className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default MainFeature