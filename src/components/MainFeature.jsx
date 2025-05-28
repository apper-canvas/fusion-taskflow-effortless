import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday, isPast } from 'date-fns'
import ApperIcon from './ApperIcon'
import TaskForm from './TaskForm'
import TaskList from './TaskList'
import TaskStats from './TaskStats'
import Sidebar from './Sidebar'
import CalendarView from './CalendarView'

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

  const handleTaskReorder = (result) => {
    if (!result.destination) return

    const filteredTasks = getFilteredTasks()
    const reorderedTasks = Array.from(filteredTasks)
    const [removed] = reorderedTasks.splice(result.source.index, 1)
    reorderedTasks.splice(result.destination.index, 0, removed)

    // Update task order in the main tasks array
    const updatedTasks = tasks.map(task => {
      const reorderedTask = reorderedTasks.find(rt => rt.id === task.id)
      if (reorderedTask) {
        const newIndex = reorderedTasks.findIndex(rt => rt.id === task.id)
        return { ...task, order: newIndex, updatedAt: new Date().toISOString() }
      }
      return task
    })

    setTasks(updatedTasks)
    toast.success('Tasks reordered successfully!')
  }


  const handleDateClick = (date) => {
    setFormData({
      title: '',
      description: '',
      dueDate: format(date, 'yyyy-MM-dd'),
      priority: 'medium',
      categoryId: '1'
    })
    setEditingTask(null)
    setIsFormOpen(true)
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
      // First sort by completion status
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1
      }
      
      // Then by custom order if exists
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order
      }
      
      // Finally by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

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

  const renderMainContent = () => {
    if (viewMode === 'calendar') {
      return (
        <CalendarView
          tasks={tasks}
          categories={categories}
          onTaskClick={handleEdit}
          onDateClick={handleDateClick}
          onToggleComplete={toggleTaskComplete}
        />
      )
    }

    return (
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-soft border border-surface-200 dark:border-surface-700 overflow-hidden">
        <TaskList
          tasks={filteredTasks}
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleComplete={toggleTaskComplete}
          onCreateTask={() => setIsFormOpen(true)}
          onReorder={handleTaskReorder}
        />

      </div>
    )
  }

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
          <TaskStats stats={stats} />
          <Sidebar
            stats={stats}
            tasks={tasks}
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
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
          {viewMode !== 'calendar' && (
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
          )}

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
          <TaskForm
            isOpen={isFormOpen}
            editingTask={editingTask}
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            onSubmit={handleSubmit}
            onClose={resetForm}
          />
        </AnimatePresence>

        {/* Main Content Area */}
        {renderMainContent()}
      </motion.div>
    </div>
  )
}

export default MainFeature