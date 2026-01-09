

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';
import { Wish as UIWish, SortOption } from './types';
import { wishService, Wish as ApiWish } from '../../services/wish';
import { Header } from '../../components/Header';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { statisticsService } from '../../services/statistics';
import { useToast } from '../../components/Toast';

const WishListPage: React.FC = () => {
  const { userInfo, refreshUserInfo } = useAuthStore();
  const { currentChild, familyMembers } = useFamilyStore();
  const { success, error: showError, warning } = useToast();
  const [wishesData, setWishesData] = useState<UIWish[]>([]);
  const [childEnergy, setChildEnergy] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedWishes, setSelectedWishes] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('created_desc');
  const [wishSearch, setWishSearch] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  // 模态框状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 表单数据
  const [createForm, setCreateForm] = useState({ name: '', description: '', requiredEnergy: '', childId: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '', requiredEnergy: '' });
  const [currentWish, setCurrentWish] = useState<UIWish | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBatchDelete, setIsBatchDelete] = useState(false);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '我的心愿 - 星火计划';
    // 刷新用户信息以获取最新能量值
    refreshUserInfo();
    return () => { document.title = originalTitle; };
  }, []);

  const mapStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待审核',
      approved: '待实现',
      rejected: '已拒绝',
      fulfilled: '已实现',
    };
    return map[status] || status;
  };

  const fetchWishes = async () => {
    setLoading(true);
    setError(null);
    try {
      // 获取孩子能量值
      if (currentChild) {
          const stats = await statisticsService.getDashboardStats({ user_id: currentChild.user_id });
          setChildEnergy(stats.total.total_energy);
      } else {
          setChildEnergy(userInfo?.score || 0);
      }

      let sortField = 'createtime';
      let sortOrder: 'asc' | 'desc' = 'desc';
      
      switch (sortBy) {
        case 'created_asc': sortField = 'createtime'; sortOrder = 'asc'; break;
        case 'created_desc': sortField = 'createtime'; sortOrder = 'desc'; break;
        case 'energy_asc': sortField = 'required_energy'; sortOrder = 'asc'; break;
        case 'energy_desc': sortField = 'required_energy'; sortOrder = 'desc'; break;
      }

      const res = await wishService.getWishList({
        page: currentPage,
        limit: pageSize,
        status: statusFilter as any || undefined,
        keyword: wishSearch || undefined,
        sort: sortField,
        order: sortOrder,
        user_id: currentChild?.user_id
      });

      const uiWishes: UIWish[] = res.list.map((w: ApiWish) => ({
          id: String(w.id),
          name: w.wish_name,
          description: w.description || '',
          requiredEnergy: w.required_energy,
          // 使用当前选中的孩子能量，或者当前用户能量
          currentEnergy: currentChild ? childEnergy : (userInfo?.score || 0),
          status: w.status as any,
          statusText: mapStatusText(w.status),
          createdAt: w.createtime ? new Date(w.createtime * 1000).toLocaleDateString() : '',
          canApply: w.status === 'approved',
        }));
      setWishesData(uiWishes);
      setTotal(res.total);
    } catch (e: any) {
      setError(e.message || '加载心愿失败');
    } finally {
      setLoading(false);
    }
  };

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchWishes();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [wishSearch]);

  // Fetch on filter/sort/page change
  useEffect(() => {
    fetchWishes();
  }, [currentPage, statusFilter, sortBy, currentChild]);

  // 计算分页信息
  const totalPages = Math.ceil(total / pageSize);
  const currentPageData = wishesData;
  const displayStart = (currentPage - 1) * pageSize + 1;
  const displayEnd = Math.min(displayStart + pageSize - 1, total);

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWishes(new Set(currentPageData.map(wish => wish.id)));
    } else {
      setSelectedWishes(new Set());
    }
  };

  // 单项选择
  const handleSelectWish = (wishId: string, checked: boolean) => {
    const newSelected = new Set(selectedWishes);
    if (checked) {
      newSelected.add(wishId);
    } else {
      newSelected.delete(wishId);
    }
    setSelectedWishes(newSelected);
  };

  // 检查是否全选
  const isAllSelected = currentPageData.length > 0 && currentPageData.every(wish => selectedWishes.has(wish.id));
  const isIndeterminate = selectedWishes.size > 0 && selectedWishes.size < currentPageData.length;

  // 显示创建模态框
  const handleShowCreateModal = () => {
    setCreateForm({ 
      name: '', 
      description: '', 
      requiredEnergy: '',
      childId: currentChild ? String(currentChild.user_id) : (familyMembers.length > 0 ? String(familyMembers[0].user_id) : '')
    });
    setShowCreateModal(true);
  };

  // 显示详情模态框
  const handleShowDetailModal = (wish: UIWish) => {
    setCurrentWish(wish);
    setShowDetailModal(true);
  };

  // 显示编辑模态框
  const handleShowEditModal = (wish: UIWish) => {
    setCurrentWish(wish);
    setEditForm({ name: wish.name, description: wish.description });
    setShowEditModal(true);
  };

  // 显示申请模态框
  const handleShowApplyModal = (wish: UIWish) => {
    setCurrentWish(wish);
    setShowApplyModal(true);
  };

  // 显示删除模态框
  const handleShowDeleteModal = (wish: UIWish, batch: boolean = false) => {
    setCurrentWish(wish);
    setIsBatchDelete(batch);
    setShowDeleteModal(true);
  };

  // 隐藏所有模态框
  const hideAllModals = () => {
    setShowCreateModal(false);
    setShowDetailModal(false);
    setShowEditModal(false);
    setShowApplyModal(false);
    setShowDeleteModal(false);
    setCurrentWish(null);
    setIsBatchDelete(false);
  };

  // 创建心愿
  const handleCreateWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      warning('请输入心愿名称');
      return;
    }

    wishService.createWish({
      wish_name: createForm.name,
      description: createForm.description,
      required_energy: Number(createForm.requiredEnergy) || 0,
      user_id: createForm.childId ? Number(createForm.childId) : undefined
    }).then((w) => {
      const newWish: UIWish = {
        id: String(w.id),
        name: w.wish_name,
        description: w.description || '',
        requiredEnergy: w.required_energy,
        currentEnergy: 0,
        status: w.status as any,
        statusText: mapStatusText(w.status),
        createdAt: w.createtime,
        canApply: w.status === 'approved',
      };
      setWishesData(prev => [newWish, ...prev]);
      hideAllModals();
      success('心愿创建成功，等待家长审核');
    }).catch(err => {
      showError(err.message || '心愿创建失败');
    });
  };

  // 编辑心愿
  const handleEditWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim() || !currentWish) {
      warning('请输入心愿名称');
      return;
    }

    wishService.updateWish(Number(currentWish.id), {
      wish_name: editForm.name,
      description: editForm.description,
      required_energy: Number(editForm.requiredEnergy) || 0
    }).then((w) => {
      setWishesData(prev => prev.map(wish => 
        wish.id === currentWish.id 
          ? {
              ...wish,
              name: w.wish_name,
              description: w.description || '',
              requiredEnergy: w.required_energy,
              status: w.status as any,
              statusText: mapStatusText(w.status),
            }
          : wish
      ));
      hideAllModals();
      success('心愿修改成功');
    }).catch(err => {
      showError(err.message || '心愿修改失败');
    });
  };

  // 申请实现心愿
  const handleApplyWish = () => {
    if (!currentWish) return;

    wishService.fulfillWish(Number(currentWish.id)).then((w) => {
      setWishesData(prev => prev.map(wish => 
        wish.id === currentWish.id
          ? {
              ...wish,
              status: w.status as any,
              statusText: mapStatusText(w.status),
              canApply: false,
            }
          : wish
      ));
      hideAllModals();
      success('心愿申请已提交，等待家长确认');
    }).catch(err => {
      showError(err.message || '心愿申请失败');
    });
  };

  // 删除心愿
  const handleDeleteWish = () => {
    if (isBatchDelete) {
      const idsToDelete = Array.from(selectedWishes);
      Promise.all(idsToDelete.map(id => wishService.deleteWish(Number(id))))
        .then(() => {
          setWishesData(prev => prev.filter(wish => !selectedWishes.has(wish.id)));
          setSelectedWishes(new Set());
          success('心愿删除成功');
        })
        .catch(err => {
          showError(err.message || '心愿删除失败');
        });
    } else if (currentWish) {
      wishService.deleteWish(Number(currentWish.id))
        .then(() => {
          setWishesData(prev => prev.filter(wish => wish.id !== currentWish.id));
          success('心愿删除成功');
        })
        .catch(err => {
          showError(err.message || '心愿删除失败');
        });
    }

    hideAllModals();
  };

  // 格式化日期
  const formatDate = (date: string | number) => {
    if (!date) return '';
    const timestamp = typeof date === 'number' 
      ? (date.toString().length === 10 ? date * 1000 : date) 
      : date;
    const d = new Date(timestamp);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 渲染分页按钮
  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        buttons.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 border rounded text-sm ${
              i === currentPage 
                ? 'border-primary bg-primary text-white' 
                : 'border-gray-300 hover:border-primary hover:text-primary'
            }`}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        buttons.push(
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
            ...
          </span>
        );
      }
    }
    return buttons;
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
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-tasks w-5"></i>
                  <span>任务</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/wish-list" 
                  className={`${styles.sidebarItem} ${styles.sidebarItemActive} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all`}
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
                <h2 className="text-2xl font-bold text-text-primary mb-2">我的心愿</h2>
                <nav className="text-sm text-text-secondary">
                  <span>心愿</span>
                </nav>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleShowCreateModal}
                  className={`${styles.btnGradient} text-white px-4 py-2 rounded-lg text-sm font-medium`}
                >
                  <i className="fas fa-plus mr-2"></i>创建心愿
                </button>
                <button 
                  onClick={() => handleShowDeleteModal(null, true)}
                  disabled={selectedWishes.size === 0}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:border-danger hover:text-danger transition-colors disabled:opacity-50"
                >
                  <i className="fas fa-trash mr-2"></i>批量删除
                </button>
              </div>
            </div>
          </div>

          {/* 工具栏区域 */}
          <div className="bg-white rounded-2xl shadow-card p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                {/* 状态筛选 */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="status-filter" className="text-sm font-medium text-text-secondary">状态：</label>
                  <select 
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">全部状态</option>
                    <option value="pending">待审核</option>
                    <option value="approved">待实现</option>
                    <option value="achieved">已实现</option>
                    <option value="rejected">已拒绝</option>
                  </select>
                </div>
                
                {/* 排序选项 */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="sort-select" className="text-sm font-medium text-text-secondary">排序：</label>
                  <select 
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="created_desc">按创建时间（最新）</option>
                    <option value="created_asc">按创建时间（最早）</option>
                    <option value="energy_desc">按所需能量（最高）</option>
                    <option value="energy_asc">按所需能量（最低）</option>
                  </select>
                </div>
              </div>
              
              {/* 搜索框 */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="搜索心愿名称..." 
                  value={wishSearch}
                  onChange={(e) => setWishSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
          </div>

          {/* 数据展示区域 */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6">
                      <input 
                        type="checkbox" 
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-text-primary">心愿名称</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-text-primary">所需能量</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-text-primary">当前能量</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-text-primary">状态</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-text-primary">创建时间</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-text-primary">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageData.map(wish => (
                    <tr key={wish.id} className={`${styles.tableRow} border-b border-gray-100`}>
                      <td className="py-4 px-6">
                        <input 
                          type="checkbox" 
                          value={wish.id}
                          checked={selectedWishes.has(wish.id)}
                          onChange={(e) => handleSelectWish(wish.id, e.target.checked)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <button 
                          onClick={() => handleShowDetailModal(wish)}
                          className="text-primary hover:underline font-medium"
                        >
                          {wish.name}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-lg font-semibold text-text-primary">{wish.requiredEnergy}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${Math.min(((userInfo?.energy || 0) / wish.requiredEnergy) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-text-secondary">{userInfo?.energy || 0}/{wish.requiredEnergy}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[`status${wish.status.charAt(0).toUpperCase() + wish.status.slice(1)}`]}`}>
                          {wish.statusText}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-text-secondary">
                        {formatDate(wish.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          {(wish.status === 'pending' || wish.status === 'approved') && (
                            <button 
                              onClick={() => handleShowEditModal(wish)}
                              className="text-primary text-sm hover:underline"
                            >
                              <i className="fas fa-edit mr-1"></i>编辑
                            </button>
                          )}
                          {wish.canApply && (
                            <button 
                              onClick={() => handleShowApplyModal(wish)}
                              className="text-success text-sm hover:underline"
                            >
                              <i className="fas fa-star mr-1"></i>申请实现
                            </button>
                          )}
                          <button 
                            onClick={() => handleShowDeleteModal(wish)}
                            className="text-danger text-sm hover:underline"
                          >
                            <i className="fas fa-trash mr-1"></i>删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* 分页区域 */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                显示 <span>{displayStart}</span> - <span>{displayEnd}</span> 条，共 <span>{total}</span> 条记录
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="flex space-x-1">
                  {renderPaginationButtons()}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 创建心愿模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalBackdrop} onClick={hideAllModals}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-2xl shadow-xl w-full max-w-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">创建心愿</h3>
                  <button onClick={hideAllModals} className="text-gray-400 hover:text-gray-600">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <form onSubmit={handleCreateWish} className="space-y-4">
                  {familyMembers.length > 0 && (
                    <div>
                      <label htmlFor="wish-child" className="block text-sm font-medium text-text-primary mb-2">为谁创建 *</label>
                      <select 
                        id="wish-child" 
                        value={createForm.childId}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, childId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        {familyMembers.map(member => (
                          <option key={member.user_id} value={member.user_id}>
                            {member.nickname}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label htmlFor="wish-name" className="block text-sm font-medium text-text-primary mb-2">心愿名称 *</label>
                    <input 
                      type="text" 
                      id="wish-name" 
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                      placeholder="请输入心愿名称" 
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="wish-required-energy" className="block text-sm font-medium text-text-primary mb-2">所需能量</label>
                    <input 
                      type="number" 
                      id="wish-required-energy" 
                      value={createForm.requiredEnergy}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, requiredEnergy: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                      placeholder="请输入所需能量" 
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="wish-description" className="block text-sm font-medium text-text-primary mb-2">心愿描述</label>
                    <textarea 
                      id="wish-description" 
                      rows={3}
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                      placeholder="请描述你的心愿..."
                    ></textarea>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button 
                      type="button" 
                      onClick={hideAllModals}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
                    >
                      取消
                    </button>
                    <button 
                      type="submit" 
                      className={`flex-1 ${styles.btnGradient} text-white px-4 py-2 rounded-lg text-sm font-medium`}
                    >
                      提交心愿
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 心愿详情模态框 */}
      {showDetailModal && currentWish && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalBackdrop} onClick={hideAllModals}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-2xl shadow-xl w-full max-w-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">心愿详情</h3>
                  <button onClick={hideAllModals} className="text-gray-400 hover:text-gray-600">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-1">心愿名称</h4>
                    <p className="text-text-primary">{currentWish.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-1">心愿描述</h4>
                    <p className="text-text-primary">{currentWish.description || '无描述'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-1">所需能量</h4>
                    <p className="text-text-primary font-semibold">{currentWish.requiredEnergy} 能量值</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-1">当前能量</h4>
                    <p className="text-text-primary">{userInfo?.energy || 0} 能量值</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-1">状态</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[`status${currentWish.status.charAt(0).toUpperCase() + currentWish.status.slice(1)}`]}`}>
                      {currentWish.statusText}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-1">创建时间</h4>
                    <p className="text-text-primary">{formatDate(currentWish.createdAt)}</p>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={hideAllModals}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑心愿模态框 */}
      {showEditModal && currentWish && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalBackdrop} onClick={hideAllModals}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-2xl shadow-xl w-full max-w-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">编辑心愿</h3>
                  <button onClick={hideAllModals} className="text-gray-400 hover:text-gray-600">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <form onSubmit={handleEditWish} className="space-y-4">
                  <div>
                    <label htmlFor="edit-wish-name" className="block text-sm font-medium text-text-primary mb-2">心愿名称 *</label>
                    <input 
                      type="text" 
                      id="edit-wish-name" 
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                      placeholder="请输入心愿名称" 
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-wish-required-energy" className="block text-sm font-medium text-text-primary mb-2">所需能量</label>
                    <input 
                      type="number" 
                      id="edit-wish-required-energy" 
                      value={editForm.requiredEnergy}
                      onChange={(e) => setEditForm(prev => ({ ...prev, requiredEnergy: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                      placeholder="请输入所需能量" 
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-wish-description" className="block text-sm font-medium text-text-primary mb-2">心愿描述</label>
                    <textarea 
                      id="edit-wish-description" 
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                      placeholder="请描述你的心愿..."
                    ></textarea>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button 
                      type="button" 
                      onClick={hideAllModals}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
                    >
                      取消
                    </button>
                    <button 
                      type="submit" 
                      className={`flex-1 ${styles.btnGradient} text-white px-4 py-2 rounded-lg text-sm font-medium`}
                    >
                      保存修改
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 申请实现心愿确认对话框 */}
      {showApplyModal && currentWish && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalBackdrop} onClick={hideAllModals}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-2xl shadow-xl w-full max-w-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-star text-yellow-500 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">申请实现心愿</h3>
                  <p className="text-sm text-text-secondary">
                    确定要申请实现心愿"<span className="font-semibold">{currentWish.name}</span>"吗？
                  </p>
                  <p className="text-sm text-text-secondary mt-2">
                    实现此心愿将消耗 <span className="font-semibold text-primary">{currentWish.requiredEnergy}</span> 能量值
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={hideAllModals}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleApplyWish}
                    className={`flex-1 ${styles.btnGradient} text-white px-4 py-2 rounded-lg text-sm font-medium`}
                  >
                    确认申请
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalBackdrop} onClick={hideAllModals}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-2xl shadow-xl w-full max-w-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">确认删除</h3>
                  <p className="text-sm text-text-secondary">
                    {isBatchDelete 
                      ? `确定要删除选中的 ${selectedWishes.size} 个心愿吗？此操作不可撤销。`
                      : `确定要删除心愿"<span className="font-semibold">${currentWish?.name}</span>"吗？此操作不可撤销。`
                    }
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={hideAllModals}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleDeleteWish}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    确认删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishListPage;

