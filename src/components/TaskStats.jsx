const TaskStats = ({ stats }) => {
  return (
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
  )
}

export default TaskStats