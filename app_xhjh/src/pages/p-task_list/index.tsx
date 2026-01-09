import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { Task as UITask, SortOption } from './types';
import { taskService } from '../../services/task';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { Header } from '../../components/Header';
import { useToast } from '../../components/Toast';

const TaskListPage: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const { currentChild } = useFamilyStore();
  const { success, error: showError, info } = useToast();
  
  // 状态管理
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  // const [allTasks, setAllTasks] = useState<UITask[]>([]); // Removed
  const [filteredTasks, setFilteredTasks] = useState<UITask[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortSelect, setSortSelect] = useState<SortOption>('time-desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 编辑弹窗状态
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTask, setCurrentTask] = useState<UITask | null>(null);
  const [editForm, setEditForm] = useState({ 
    task_name: '', 
    description: '', 
    category: '',
    energy_value: '',
    target_date: ''
  });

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '我的任务 - 星火计划';
    return () => { document.title = originalTitle; };
  }, []);

  // 从后端加载任务数据
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parse sort option
      let sortField = 'id';
      let sortOrder: 'asc' | 'desc' = 'desc';
      
      switch(sortSelect) {
        case 'time-desc': sortField = 'target_date'; sortOrder = 'desc'; break;
        case 'time-asc': sortField = 'target_date'; sortOrder = 'asc'; break;
        case 'energy-desc': sortField = 'energy_value'; sortOrder = 'desc'; break;
        case 'energy-asc': sortField = 'energy_value'; sortOrder = 'asc'; break;
        case 'name-asc': sortField = 'task_name'; sortOrder = 'asc'; break;
        case 'category-asc': sortField = 'category'; sortOrder = 'asc'; break;
        case 'status-asc': sortField = 'status'; sortOrder = 'asc'; break;
        // creator-asc not fully supported, default to id
      }

      const res = await taskService.getTaskList({
        page: currentPage,
        limit: pageSize,
        status: statusFilter as any || undefined,
        category: categoryFilter as any || undefined,
        keyword: taskSearch || undefined,
        assignee_id: currentChild?.user_id,
        sort: sortField,
        order: sortOrder
      });

      setFilteredTasks(res.list);
      setTotal(res.total);
    } catch (e: any) {
      setError(e.message || '加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentPage, statusFilter, categoryFilter, sortSelect, currentChild]); // Trigger fetch when these change

  // Handle search separately with debounce (optional) or just on blur/enter. 
  // For now, let's trigger on change but maybe we should add a "Search" button or debounce.
  // The original code triggered on change immediately (local filtering).
  // Let's add a useEffect for search with a small timeout to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to page 1 on search
      } else {
        fetchTasks();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [taskSearch]);

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskSearch(e.target.value);
  };

  // 处理筛选
  const handleFilterChange = () => {
    setCurrentPage(1);
    // fetchTasks will be triggered by useEffect
  };

  // 处理排序
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortSelect(e.target.value as SortOption);
    setCurrentPage(1);
  };

  // 处理表格排序
  const handleTableSort = (field: string) => {
    let sortValue: SortOption = 'time-desc';
    switch(field) {
      case 'name': sortValue = 'name-asc'; break;
      case 'category': sortValue = 'category-asc'; break;
      case 'status': sortValue = 'status-asc'; break;
      case 'target-date': sortValue = 'time-asc'; break;
      case 'energy': sortValue = 'energy-asc'; break;
      case 'creator': sortValue = 'creator-asc'; break;
    }
    setSortSelect(sortValue);
    setCurrentPage(1);
  };

  // 处理全选
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    
    if (isChecked) {
      const currentPageIds = new Set(filteredTasks.map(task => task.id));
      setSelectedTasks(currentPageIds);
    } else {
      const newSelected = new Set(selectedTasks);
      filteredTasks.forEach(task => newSelected.delete(task.id));
      setSelectedTasks(newSelected);
    }
  };

  // 处理任务选择
  const handleTaskSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const taskId = Number(e.target.value);
    const newSelected = new Set(selectedTasks);
    
    if (e.target.checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    
    setSelectedTasks(newSelected);
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedTasks.size === 0) return;
    
    if (confirm(`确定要删除选中的 ${selectedTasks.size} 个任务吗？`)) {
      Promise.all(
        Array.from(selectedTasks).map(id => taskService.deleteTask(Number(id)))
      ).then(() => {
        success('任务删除成功！');
        setSelectedTasks(new Set());
        fetchTasks(); // Reload list
      }).catch(err => {
        showError(err.message || '任务删除失败');
      });
    }
  };

  // 处理任务删除
  const handleDeleteTask = (taskId: number) => {
    if (confirm('确定要删除这个任务吗？')) {
      taskService.deleteTask(taskId).then(() => {
        success('任务删除成功！');
        fetchTasks(); // Reload list
      }).catch(err => {
        showError(err.message || '任务删除失败');
      });
    }
  };

  // 处理翻页
  const changePage = (page: number) => {
    const totalPages = Math.ceil(total / pageSize);
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // 刷新任务列表
  const refreshTasks = () => {
    fetchTasks();
    info('任务列表已刷新！');
  };

  // 打开编辑弹窗
  const handleShowEditModal = (task: UITask) => {
    setCurrentTask(task);
    setEditForm({
      task_name: task.task_name,
      description: task.description || '',
      category: task.category,
      energy_value: String(task.energy_value || 0),
      target_date: task.target_date ? task.target_date.split(' ')[0] : ''
    });
    setShowEditModal(true);
  };

  // 提交编辑
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;
    
    try {
      await taskService.updateTask({
        id: currentTask.id,
        task_name: editForm.task_name,
        description: editForm.description,
        category: editForm.category,
        energy_value: Number(editForm.energy_value),
        target_date: editForm.target_date
      });
      
      success('任务更新成功');
      setShowEditModal(false);
      fetchTasks();
    } catch (err: any) {
      showError(err.message || '更新失败');
    }
  };

  // 获取分类文本
  const getCategoryText = (category: string) => {
    const categoryMap: Record<string, string> = {
      'habit': '习惯养成',
      'learning': '学习探索',
      'skill': '兴趣技能',
      'family': '家庭贡献'
    };
    return categoryMap[category] || category;
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': '待确认',
      'confirmed': '待执行',
      'progress': '进行中',
      'completed': '已完成',
      'rejected': '已拒绝'
    };
    return statusMap[status] || status;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  // 检查是否全选
  const isAllSelected = () => {
    if (filteredTasks.length === 0) return false;
    return filteredTasks.every(task => selectedTasks.has(task.id));
  };

  // 检查是否部分选中
  const isIndeterminate = () => {
    const selectedCount = filteredTasks.filter(task => selectedTasks.has(task.id)).length;
    return selectedCount > 0 && selectedCount < filteredTasks.length;
  };

  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  // 生成页码按钮
  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(
          <button
            key={i}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              i === currentPage 
                ? 'bg-primary text-white' 
                : 'border border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
            }`}
            onClick={() => changePage(i)}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
            ...
          </span>
        );
      }
    }
    return pages;
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <div className="flex pt-16">
        {/* 左侧菜单 */}
        <aside className="fixed left-0 top-16 bottom-0 w-60 bg-sidebar-gradient shadow-lg overflow-y-auto">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/parent-dashboard" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-tachometer-alt w-5"></i>
                  <span>仪表盘</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/task-list" 
                  className={`${styles.sidebarItem} ${styles.sidebarItemActive} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all`}
                >
                  <i className="fas fa-tasks w-5"></i>
                  <span>任务</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/wish-list" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-heart w-5"></i>
                  <span>心愿</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/family-honor-wall" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-trophy w-5"></i>
                  <span>家庭荣誉墙</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/growth-report" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-chart-line w-5"></i>
                  <span>成长报告</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/knowledge-base" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-book w-5"></i>
                  <span>知识库</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/family-manage" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-users w-5"></i>
                  <span>家庭管理</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/user-profile" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-user w-5"></i>
                  <span>个人资料</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/settings" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-cog w-5"></i>
                  <span>设置</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 ml-60 p-6">
          {/* 页面头部 */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">我的任务</h2>
                <nav className="text-sm text-text-secondary">
                  <span>任务</span>
                </nav>
              </div>
              <div className="flex space-x-3">
                <Link 
                  to="/task-create"
                  className={`${styles.btnGradient} text-white px-4 py-2 rounded-lg text-sm font-medium`}
                >
                  <i className="fas fa-plus mr-2"></i>创建任务
                </Link>
                <button 
                  onClick={refreshTasks}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:border-primary transition-colors"
                >
                  <i className="fas fa-sync-alt mr-2"></i>刷新
                </button>
              </div>
            </div>
          </div>

          {/* 工具栏区域 */}
          <div className="bg-white rounded-2xl shadow-card p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* 搜索框 */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="搜索任务名称..." 
                    value={taskSearch}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
              
              {/* 状态筛选 */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-text-secondary">状态:</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    handleFilterChange();
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">全部状态</option>
                  <option value="pending">待确认</option>
                  <option value="confirmed">待执行</option>
                  <option value="progress">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="rejected">已拒绝</option>
                </select>
              </div>
              
              {/* 分类筛选 */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-text-secondary">分类:</label>
                <select 
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    handleFilterChange();
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">全部分类</option>
                  <option value="habit">习惯养成</option>
                  <option value="learning">学习探索</option>
                  <option value="skill">兴趣技能</option>
                  <option value="family">家庭贡献</option>
                </select>
              </div>
              
              {/* 排序选项 */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-text-secondary">排序:</label>
                <select 
                  value={sortSelect}
                  onChange={handleSortChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="time-desc">按时间降序</option>
                  <option value="time-asc">按时间升序</option>
                  <option value="energy-desc">按能量值降序</option>
                  <option value="energy-asc">按能量值升序</option>
                </select>
              </div>
              
              {/* 批量操作 */}
              {selectedTasks.size > 0 && (
                <div>
                  <button 
                    onClick={handleBatchDelete}
                    className="bg-danger text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    <i className="fas fa-trash mr-2"></i>批量删除
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 数据展示区域 */}
          <section className="mb-6">
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              {loading && <div className="p-4 text-center text-gray-500">加载中...</div>}
              {error && <div className="p-4 text-center text-red-500">{error}</div>}
              {!loading && !error && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 w-10">
                            <input 
                              type="checkbox" 
                              checked={isAllSelected()}
                              ref={(input) => {
                                if (input) input.indeterminate = isIndeterminate();
                              }}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </th>
                          <th 
                            className="text-left py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-primary"
                            onClick={() => handleTableSort('name')}
                          >
                            任务名称 <i className="fas fa-sort ml-1"></i>
                          </th>
                          <th 
                            className="text-left py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-primary"
                            onClick={() => handleTableSort('category')}
                          >
                            分类 <i className="fas fa-sort ml-1"></i>
                          </th>
                          <th 
                            className="text-left py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-primary"
                            onClick={() => handleTableSort('status')}
                          >
                            状态 <i className="fas fa-sort ml-1"></i>
                          </th>
                          <th 
                            className="text-left py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-primary"
                            onClick={() => handleTableSort('target-date')}
                          >
                            计划完成时间 <i className="fas fa-sort ml-1"></i>
                          </th>
                          <th 
                            className="text-left py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-primary"
                            onClick={() => handleTableSort('energy')}
                          >
                            能量值 <i className="fas fa-sort ml-1"></i>
                          </th>
                          <th 
                            className="text-left py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-primary"
                            onClick={() => handleTableSort('creator')}
                          >
                            创建者 <i className="fas fa-sort ml-1"></i>
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTasks.map(task => (
                          <tr key={task.id} className={`${styles.tableRow} border-b border-gray-100`}>
                            <td className="py-3 px-4">
                              <input 
                                type="checkbox" 
                                value={task.id}
                                checked={selectedTasks.has(task.id)}
                                onChange={handleTaskSelect}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <Link 
                                to={`/task-detail?taskId=${task.id}`}
                                className="text-primary hover:underline font-medium"
                              >
                                {task.task_name}
                              </Link>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`${styles[`categoryBadge${task.category.charAt(0).toUpperCase() + task.category.slice(1)}`]} inline-flex items-center px-2 py-1 rounded-full text-xs font-medium`}>
                                {getCategoryText(task.category)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`${styles[`statusBadge${task.status.charAt(0).toUpperCase() + task.status.slice(1)}`]} inline-flex items-center px-2 py-1 rounded-full text-xs font-medium`}>
                                {getStatusText(task.status)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-text-secondary">
                              {formatDate(task.target_date || '')}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-lg font-bold text-primary">{task.energy_value || 0}</span>
                            </td>
                            <td className="py-3 px-4 text-sm text-text-secondary">
                              {task.creator_user_id}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleShowEditModal(task)}
                                  className="text-primary hover:text-blue-700 text-sm" 
                                  title="编辑"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-danger hover:text-red-700 text-sm" 
                                  title="删除"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                                {task.status === 'in_progress' && (
                                  <button 
                                    onClick={() => info('打卡功能演示 - 实际项目中会打开打卡弹窗')}
                                    className="text-success hover:text-green-700 text-sm" 
                                    title="打卡"
                                  >
                                    <i className="fas fa-check-circle"></i>
                                  </button>
                                )}
                                {task.status === 'completed' && (
                                  <button 
                                    onClick={() => info('反馈功能演示 - 实际项目中会打开反馈弹窗')}
                                    className="text-secondary hover:text-yellow-700 text-sm" 
                                    title="提供反馈"
                                  >
                                    <i className="fas fa-comment-dots"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* 空状态 */}
                  {filteredTasks.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-tasks text-gray-400 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-medium text-text-primary mb-2">暂无任务</h3>
                      <p className="text-text-secondary mb-6">创建您的第一个任务，开始孩子的成长之旅</p>
                      <Link 
                        to="/task-create"
                        className={`${styles.btnGradient} text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg inline-block`}
                      >
                        <i className="fas fa-plus mr-2"></i>创建任务
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* 底部翻页 */}
          {filteredTasks.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                显示第 {startIndex} 到 {endIndex} 条，共 {total} 条任务
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1 
                      ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
                      : 'text-gray-700 hover:border-primary hover:text-primary'
                  }`}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {renderPageNumbers()}
                
                <button 
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages 
                      ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
                      : 'text-gray-700 hover:border-primary hover:text-primary'
                  }`}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 编辑弹窗 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 m-4 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">编辑任务</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
                  <input
                    type="text"
                    value={editForm.task_name}
                    onChange={(e) => setEditForm({...editForm, task_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="请输入任务名称"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">任务描述</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all h-24 resize-none"
                    placeholder="请输入任务描述"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">任务分类</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      required
                    >
                      <option value="habit">习惯养成</option>
                      <option value="learning">学习探索</option>
                      <option value="skill">兴趣技能</option>
                      <option value="family">家庭贡献</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">能量值奖励</label>
                    <input
                      type="number"
                      value={editForm.energy_value}
                      onChange={(e) => setEditForm({...editForm, energy_value: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">计划完成日期</label>
                  <input
                    type="date"
                    value={editForm.target_date}
                    onChange={(e) => setEditForm({...editForm, target_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className={`${styles.btnGradient} flex-1 py-2 text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition-opacity`}
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskListPage;
