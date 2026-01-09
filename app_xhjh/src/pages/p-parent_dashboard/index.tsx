

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { statisticsService, DashboardStatistics } from '../../services/statistics';
import { notificationService, Notification as AppNotification } from '../../services/notification';
import { wishService, Wish } from '../../services/wish';
import { Header } from '../../components/Header';

const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo, refreshUserInfo } = useAuthStore();
  const { currentChild } = useFamilyStore();
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [pendingWishes, setPendingWishes] = useState<Wish[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '家长仪表盘 - 星火计划';
    return () => { document.title = originalTitle; };
  }, []);

  // 加载用户信息 + 统计数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 刷新用户信息（包含能量值等）
        await refreshUserInfo();

        const [statsRes, wishesRes, notifsRes] = await Promise.all([
          statisticsService.getDashboardStats({ user_id: currentChild?.user_id }),
          wishService.getWishList({ status: 'pending', user_id: currentChild?.user_id }).catch(() => ({ list: [], total: 0 })),
          notificationService.getNotifications({ limit: 5 }).catch(() => ({ list: [], total: 0 })),
        ]);

        setStats(statsRes);
        setPendingWishes(wishesRes.list || []);
        setNotifications(notifsRes.list || []);
      } catch (e) {
        // 统计失败不影响页面其它功能
        console.error('加载仪表盘数据失败', e);
      }
    };

    loadData();
  }, [refreshUserInfo, currentChild]);

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
    return date.toLocaleDateString();
  };

  const recentActivities = React.useMemo(() => {
    if (!stats) return [];
    const activities: any[] = [];
    
    // Add pending tasks (Task Created)
    stats.recent_pending_tasks?.forEach(task => {
      activities.push({
        type: 'task_created',
        title: `创建任务"${task.title}"`,
        id: task.id,
        time: task.createtime,
        childName: currentChild?.nickname || '孩子',
        actionType: 'task'
      });
    });

    // Add in progress tasks (Task Updated)
    stats.recent_in_progress_tasks?.forEach(task => {
      activities.push({
        type: 'task_updated',
        title: `更新任务"${task.title}"`,
        id: task.id,
        time: task.updatetime,
        childName: currentChild?.nickname || '孩子',
        actionType: 'task'
      });
    });

    // Add badges
    stats.recent_badges?.forEach(badge => {
      activities.push({
        type: 'badge_earned',
        title: `获得徽章"${badge.badge_name}"`,
        id: badge.id,
        time: badge.awarded_at,
        childName: currentChild?.nickname || '孩子',
        actionType: 'badge'
      });
    });

    // Add feedback
    stats.recent_feedback?.forEach(feedback => {
      activities.push({
        type: 'feedback_given',
        title: `家长反馈"${feedback.task_name}"`,
        id: feedback.id, 
        taskId: feedback.task_id,
        time: feedback.createtime,
        childName: currentChild?.nickname || '孩子',
        actionType: 'task'
      });
    });

    // Sort by time desc
    return activities.sort((a, b) => b.time - a.time).slice(0, 5);
  }, [stats, currentChild]);

  const pendingItems = React.useMemo(() => {
    const items: any[] = [];
    
    // Pending Tasks (from stats)
    stats?.recent_pending_tasks?.forEach(task => {
      items.push({
        type: 'task_confirm',
        title: '待确认任务',
        description: `${currentChild?.nickname || '孩子'}创建了新任务"${task.title}"`,
        id: task.id,
        time: task.createtime,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        iconClass: 'fas fa-clock',
        actionLabel: '立即处理',
        actionType: 'confirm',
        targetId: task.id
      });
    });

    // Pending Wishes (from wishService)
    pendingWishes.forEach(wish => {
      items.push({
        type: 'wish_review',
        title: '待审核心愿',
        description: `${currentChild?.nickname || '孩子'}申请了心愿"${wish.wish_name}"`,
        id: wish.id,
        time: typeof wish.createtime === 'number' ? wish.createtime : new Date(wish.createtime).getTime() / 1000,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        iconClass: 'fas fa-heart',
        actionLabel: '立即处理',
        actionType: 'review',
        targetId: wish.id
      });
    });

    // Sort by time desc
    return items.sort((a, b) => b.time - a.time);
  }, [stats, pendingWishes, currentChild]);

  const handleSidebarItemClick = (itemId: string, href: string) => {
    setActiveSidebarItem(itemId);
    if (href !== '#') {
      navigate(href);
    }
  };

  const handleSuggestTaskClick = () => {
    navigate('/task-suggest');
  };

  const handleViewReportClick = () => {
    navigate('/growth-report');
  };

  const handleActivityTaskLinkClick = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    navigate(`/task-detail?taskId=${taskId}`);
  };

  const handleActivityBadgeLinkClick = (e: React.MouseEvent, badgeId: string) => {
    e.preventDefault();
    navigate(`/family-honor-wall?badgeId=${badgeId}`);
  };

  const handleActivityWishLinkClick = (e: React.MouseEvent, wishId: string) => {
    e.preventDefault();
    navigate(`/wish-list?wishId=${wishId}`);
  };

  const handleActivityViewButtonClick = (taskId?: string, badgeId?: string, wishId?: string) => {
    if (taskId) {
      navigate(`/task-detail?taskId=${taskId}`);
    } else if (badgeId) {
      navigate(`/family-honor-wall?badgeId=${badgeId}`);
    } else if (wishId) {
      navigate(`/wish-list?wishId=${wishId}`);
    }
  };

  const handlePendingTaskButtonClick = (taskId?: string, wishId?: string, action?: string) => {
    if (action === 'confirm' && taskId) {
      // 打开任务确认弹窗
      console.log('打开任务确认弹窗', taskId);
      // 实际应用中这里会打开模态弹窗
    } else if (action === 'review' && wishId) {
      // 打开心愿审核弹窗
      console.log('打开心愿审核弹窗', wishId);
      // 实际应用中这里会打开模态弹窗
    } else if (action === 'feedback' && taskId) {
      // 打开家长反馈弹窗
      console.log('打开家长反馈弹窗', taskId);
      // 实际应用中这里会打开模态弹窗
    }
  };

  const handleQuickSuggestTaskClick = () => {
    navigate('/task-suggest');
  };

  const handleQuickViewChildClick = () => {
    navigate('/child-dashboard');
  };

  const handleQuickGenerateReportClick = () => {
    navigate('/growth-report');
  };

  const handleLearnMoreTipClick = () => {
    navigate('/knowledge-base');
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <Header />

      <div className="flex pt-16">
        {/* 左侧菜单 */}
        <aside className="fixed left-0 top-16 bottom-0 w-60 bg-sidebar-gradient shadow-lg overflow-y-auto">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('dashboard', '#')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'dashboard' ? styles.sidebarItemActive : ''} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all w-full text-left`}
                >
                  <i className="fas fa-tachometer-alt w-5"></i>
                  <span>仪表盘</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('tasks', '/task-list')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'tasks' ? styles.sidebarItemActive : 'text-gray-700'} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all w-full text-left`}
                >
                  <i className="fas fa-tasks w-5"></i>
                  <span>任务</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('wishes', '/wish-list')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'wishes' ? styles.sidebarItemActive : 'text-gray-700'} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all w-full text-left`}
                >
                  <i className="fas fa-heart w-5"></i>
                  <span>心愿</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('honor-wall', '/family-honor-wall')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'honor-wall' ? styles.sidebarItemActive : 'text-gray-700'} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all w-full text-left`}
                >
                  <i className="fas fa-trophy w-5"></i>
                  <span>家庭荣誉墙</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('growth-report', '/growth-report')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'growth-report' ? styles.sidebarItemActive : 'text-gray-700'} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all w-full text-left`}
                >
                  <i className="fas fa-chart-line w-5"></i>
                  <span>成长报告</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('knowledge', '/knowledge-base')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'knowledge' ? styles.sidebarItemActive : 'text-gray-700'} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all w-full text-left`}
                >
                  <i className="fas fa-book w-5"></i>
                  <span>知识库</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('family-manage', '/family-manage')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'family-manage' ? styles.sidebarItemActive : 'text-gray-700'} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all w-full text-left`}
                >
                  <i className="fas fa-users w-5"></i>
                  <span>家庭管理</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('profile', '/user-profile')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'profile' ? styles.sidebarItemActive : 'text-gray-700'} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all w-full text-left`}
                >
                  <i className="fas fa-user w-5"></i>
                  <span>个人资料</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('settings', '/settings')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'settings' ? styles.sidebarItemActive : 'text-gray-700'} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all w-full text-left`}
                >
                  <i className="fas fa-cog w-5"></i>
                  <span>设置</span>
                </button>
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
                <h2 className="text-2xl font-bold text-text-primary mb-2">欢迎回来！</h2>
                <nav className="text-sm text-text-secondary">
                  <span>仪表盘</span>
                </nav>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleSuggestTaskClick}
                  className={`${styles.btnGradient} text-white px-4 py-2 rounded-lg text-sm font-medium`}
                >
                  <i className="fas fa-plus mr-2"></i>建议任务
                </button>
                <button 
                  onClick={handleViewReportClick}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:border-primary transition-colors"
                >
                  <i className="fas fa-chart-bar mr-2"></i>查看报告
                </button>
              </div>
            </div>
          </div>

          {/* 数据概览区 */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`bg-white rounded-2xl shadow-card p-6 ${styles.cardHover}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary mb-1">本周任务完成率</p>
                    <p className="text-3xl font-bold text-text-primary">
                      {stats?.total.total_tasks && stats.total.total_tasks > 0
                        ? `${Math.round((stats.total.completed_tasks / stats.total.total_tasks) * 100)}%`
                        : '0%'}
                    </p>
                    <p className="text-sm text-success mt-1">
                      <i className="fas fa-arrow-up mr-1"></i>
                      任务 {stats?.total.completed_tasks || 0}/{stats?.total.total_tasks || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-stats-gradient-1 rounded-xl flex items-center justify-center">
                    <i className="fas fa-check-circle text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className={`bg-white rounded-2xl shadow-card p-6 ${styles.cardHover}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary mb-1">当前能量值</p>
                    <p className="text-3xl font-bold text-text-primary">
                      {stats?.total.total_energy || 0}
                    </p>
                    <p className="text-sm text-success mt-1">
                      <i className="fas fa-arrow-up mr-1"></i>实时统计
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-stats-gradient-2 rounded-xl flex items-center justify-center">
                    <i className="fas fa-star text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className={`bg-white rounded-2xl shadow-card p-6 ${styles.cardHover}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary mb-1">获得徽章数</p>
                    <p className="text-3xl font-bold text-text-primary">
                      {stats?.total.total_badges || 0}
                    </p>
                    <p className="text-sm text-info mt-1">
                      <i className="fas fa-trophy mr-1"></i>徽章总数
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-stats-gradient-3 rounded-xl flex items-center justify-center">
                    <i className="fas fa-medal text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className={`bg-white rounded-2xl shadow-card p-6 ${styles.cardHover}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary mb-1">近期反馈</p>
                    <p className="text-3xl font-bold text-text-primary">
                      {stats?.recent_feedback?.length || 0}
                    </p>
                    <p className="text-sm text-secondary mt-1">
                      <i className="fas fa-heart mr-1"></i>近期反馈次数
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-stats-gradient-4 rounded-xl flex items-center justify-center">
                    <i className="fas fa-comment-dots text-white text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 最近活动列表 */}
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">最近活动</h3>
                <Link to="/task-list" className="text-primary text-sm font-medium hover:underline">查看全部</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">活动类型</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">关联内容</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">孩子</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">时间</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity, index) => (
                        <tr key={`${activity.type}-${activity.id}-${index}`} className={`${styles.tableRow} border-b border-gray-100`}>
                          <td className="py-3 px-4">
                            {activity.type === 'task_created' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  <i className="fas fa-plus mr-1"></i>创建任务
                                </span>
                            )}
                            {activity.type === 'task_updated' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <i className="fas fa-check mr-1"></i>任务更新
                                </span>
                            )}
                            {activity.type === 'badge_earned' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <i className="fas fa-star mr-1"></i>获得徽章
                                </span>
                            )}
                            {activity.type === 'feedback_given' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <i className="fas fa-heart mr-1"></i>家长反馈
                                </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <button 
                              onClick={() => handleActivityViewButtonClick(
                                activity.actionType === 'task' ? activity.taskId || activity.id : undefined,
                                activity.actionType === 'badge' ? activity.id : undefined,
                                undefined
                              )}
                              className="text-primary hover:underline text-left"
                            >
                              {activity.title}
                            </button>
                          </td>
                          <td className="py-3 px-4">{activity.childName}</td>
                          <td className="py-3 px-4 text-sm text-text-secondary">{formatTime(activity.time)}</td>
                          <td className="py-3 px-4">
                            <button 
                              onClick={() => handleActivityViewButtonClick(
                                activity.actionType === 'task' ? activity.taskId || activity.id : undefined,
                                activity.actionType === 'badge' ? activity.id : undefined,
                                undefined
                              )}
                              className="text-primary text-sm hover:underline"
                            >
                              查看详情
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          暂无最近活动
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 待处理事项 */}
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">待处理事项</h3>
                <span className="text-sm text-text-secondary">{pendingItems.length}项待处理</span>
              </div>
              <div className="space-y-4">
                {pendingItems.length > 0 ? (
                  pendingItems.map((item, index) => (
                    <div key={`${item.type}-${item.id}-${index}`} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 ${item.iconBg} rounded-lg flex items-center justify-center`}>
                          <i className={`${item.iconClass} ${item.iconColor}`}></i>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{item.title}</p>
                          <p className="text-sm text-text-secondary">{item.description}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handlePendingTaskButtonClick(
                          item.actionType === 'confirm' ? item.targetId : undefined, 
                          item.actionType === 'review' ? item.targetId : undefined, 
                          item.actionType
                        )}
                        className={`${styles.btnGradient} text-white px-4 py-2 rounded-lg text-sm font-medium`}
                      >
                        {item.actionLabel}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-check-circle text-4xl mb-3 text-green-100 block"></i>
                    暂无待处理事项，太棒了！
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        {/* 右侧面板 (仅在大屏幕显示) */}
        <aside className="hidden xl:block fixed right-0 top-16 bottom-0 w-80 bg-white shadow-lg overflow-y-auto">
          <div className="p-6">
            {/* 快捷操作区 */}
            <section className="mb-8">
              <h4 className="text-lg font-semibold text-text-primary mb-4">快捷操作</h4>
              <div className="space-y-3">
                <button 
                  onClick={handleQuickSuggestTaskClick}
                  className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-plus text-white"></i>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-text-primary">建议新任务</p>
                    <p className="text-sm text-text-secondary">为孩子推荐任务</p>
                  </div>
                </button>

                <button 
                  onClick={handleQuickViewChildClick}
                  className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg hover:from-green-100 hover:to-teal-100 transition-all"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user text-white"></i>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-text-primary">查看孩子主页</p>
                    <p className="text-sm text-text-secondary">了解孩子最新动态</p>
                  </div>
                </button>

                <button 
                  onClick={handleQuickGenerateReportClick}
                  className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-all"
                >
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-white"></i>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-text-primary">生成成长报告</p>
                    <p className="text-sm text-text-secondary">查看详细成长数据</p>
                  </div>
                </button>
              </div>
            </section>

            {/* 通知中心 */}
            <section className="mb-8">
              <h4 className="text-lg font-semibold text-text-primary mb-4">最新通知</h4>
              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div key={notif.id} className={`p-3 rounded-lg ${notif.status === 'unread' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notif.type === 'task' ? 'bg-blue-500' : 
                          notif.type === 'wish' ? 'bg-yellow-500' : 
                          notif.type === 'feedback' ? 'bg-green-500' : 'bg-gray-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">{notif.title}</p>
                          <p className="text-xs text-text-secondary mt-1">{formatTime(notif.createtime)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">暂无新通知</div>
                )}
              </div>
            </section>

            {/* 育儿小贴士 */}
            <section>
              <h4 className="text-lg font-semibold text-text-primary mb-4">今日育儿小贴士</h4>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="flex items-center space-x-2 mb-3">
                  <i className="fas fa-lightbulb text-purple-500"></i>
                  <span className="text-sm font-medium text-purple-700">成长型思维</span>
                </div>
                <p className="text-sm text-text-primary leading-relaxed">
                  当孩子遇到困难时，与其说"你很聪明"，不如说"你很努力"。这样可以帮助孩子建立成长型思维，相信能力是可以通过努力提升的。
                </p>
                <button 
                  onClick={handleLearnMoreTipClick}
                  className="mt-3 text-sm text-purple-600 font-medium hover:underline"
                >
                  了解更多 <i className="fas fa-arrow-right ml-1"></i>
                </button>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ParentDashboard;

