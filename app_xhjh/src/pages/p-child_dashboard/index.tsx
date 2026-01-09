

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { statisticsService, DashboardStatistics } from '../../services/statistics';
import { Header } from '../../components/Header';

const ChildDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '我的仪表盘 - 星火计划';
    
    const fetchStats = async () => {
      try {
        const data = await statisticsService.getDashboardStats();
        setStatistics(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };
    fetchStats();

    return () => { document.title = originalTitle; };
  }, []);

  const handleSidebarItemClick = (itemId: string, href?: string) => {
    setActiveSidebarItem(itemId);
    if (href && href !== '#') {
      navigate(href);
    }
  };

  const handleCreateTaskClick = () => {
    navigate('/task-create');
  };

  const handleViewWishesClick = () => {
    navigate('/wish-list');
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/task-list?keyword=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleTasksPendingClick = () => {
    navigate('/task-list?status=pending');
  };

  const handleTasksProgressClick = () => {
    navigate('/task-list?status=progress');
  };

  const handleTasksCompletedClick = () => {
    navigate('/task-list?status=completed');
  };

  const handleBadgeClick = (badgeId: string | number) => {
    navigate(`/family-honor-wall?badgeId=${badgeId}`);
  };

  const handleFeedbackClick = (taskId: string | number) => {
    navigate(`/task-detail?taskId=${taskId}`);
  };

  const handleRecommendedTaskClick = (taskId: string | number) => {
    navigate(`/task-detail?taskId=${taskId}`);
  };

  const handleGrowthTreeClick = () => {
    // 简单的点击反馈效果
    const growthTreeElement = document.querySelector(`.${styles.growthTree}`);
    if (growthTreeElement) {
      (growthTreeElement as HTMLElement).style.transform = 'scale(0.95)';
      setTimeout(() => {
        (growthTreeElement as HTMLElement).style.transform = 'scale(1)';
      }, 150);
    }
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
                  <span>我的任务</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('wishes', '/wish-list')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'wishes' ? styles.sidebarItemActive : 'text-gray-700'} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all w-full text-left`}
                >
                  <i className="fas fa-heart w-5"></i>
                  <span>我的心愿</span>
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
                <h2 className="text-2xl font-bold text-text-primary mb-2">你好，小明！🌟</h2>
                <nav className="text-sm text-text-secondary">
                  <span>仪表盘</span>
                </nav>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleCreateTaskClick}
                  className={`${styles.btnGradient} text-white px-4 py-2 rounded-lg text-sm font-medium`}
                >
                  <i className="fas fa-plus mr-2"></i>创建任务
                </button>
                <button 
                  onClick={handleViewWishesClick}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:border-primary transition-colors"
                >
                  <i className="fas fa-heart mr-2"></i>查看心愿
                </button>
              </div>
            </div>
          </div>

          {/* 成长可视化区 */}
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-card p-8 text-center">
              <h3 className="text-xl font-semibold text-text-primary mb-6">我的成长树</h3>
              <div className="relative inline-block">
                {/* 成长树可视化 */}
                <div 
                  className={`${styles.growthTree} relative w-64 h-64 mx-auto cursor-pointer`}
                  onClick={handleGrowthTreeClick}
                >
                  <div className="absolute inset-0 bg-tree-gradient rounded-full flex items-center justify-center shadow-tree">
                    <div className="text-center">
                      <i className="fas fa-tree text-white text-6xl mb-2"></i>
                      <div className="text-white font-bold text-lg">能量值</div>
                      <div className={`text-white text-2xl font-bold ${styles.energyPulse}`}>
                        {statistics?.total.total_energy.toLocaleString() || '0'}
                      </div>
                    </div>
                  </div>
                  {/* 装饰性星星 */}
                  <div className={`absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center ${styles.badgeGlow}`}>
                    <i className="fas fa-star text-white text-sm"></i>
                  </div>
                  <div className={`absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center ${styles.badgeGlow}`}>
                    <i className="fas fa-heart text-white text-xs"></i>
                  </div>
                  <div className={`absolute top-1/2 -right-6 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center ${styles.badgeGlow}`}>
                    <i className="fas fa-sparkles text-white text-xs"></i>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{statistics?.total.total_badges || 0}</div>
                  <div className="text-sm text-text-secondary">获得徽章</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{statistics?.total.total_checkins || 0}</div>
                  <div className="text-sm text-text-secondary">累计打卡</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{statistics?.total.fulfilled_wishes || 0}</div>
                  <div className="text-sm text-text-secondary">已实现心愿</div>
                </div>
              </div>
            </div>
          </section>

          {/* 我的任务概览 */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={handleTasksPendingClick}
                className={`bg-white rounded-2xl shadow-card p-6 ${styles.cardHover} cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-text-primary">待完成</h4>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <i className="fas fa-clock text-orange-600 text-xl"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">{statistics?.total.pending_tasks || 0}</div>
                <div className="text-sm text-text-secondary">个任务等待完成</div>
                <div className="mt-4 space-y-2">
                  {statistics?.recent_pending_tasks && statistics.recent_pending_tasks.length > 0 ? (
                    statistics.recent_pending_tasks.map(task => (
                      <div key={task.id} className="text-sm text-text-primary truncate">• {task.title}</div>
                    ))
                  ) : (
                    <div className="text-sm text-text-secondary">暂无待办任务</div>
                  )}
                </div>
              </div>

              <div 
                onClick={handleTasksProgressClick}
                className={`bg-white rounded-2xl shadow-card p-6 ${styles.cardHover} cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-text-primary">进行中</h4>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <i className="fas fa-play text-blue-600 text-xl"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{statistics?.total.in_progress_tasks || 0}</div>
                <div className="text-sm text-text-secondary">个任务进行中</div>
                <div className="mt-4 space-y-2">
                   {statistics?.recent_in_progress_tasks && statistics.recent_in_progress_tasks.length > 0 ? (
                    statistics.recent_in_progress_tasks.map(task => (
                      <div key={task.id} className="text-sm text-text-primary truncate">• {task.title}</div>
                    ))
                  ) : (
                    <div className="text-sm text-text-secondary">暂无进行中任务</div>
                  )}
                </div>
              </div>

              <div 
                onClick={handleTasksCompletedClick}
                className={`bg-white rounded-2xl shadow-card p-6 ${styles.cardHover} cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-text-primary">已完成</h4>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <i className="fas fa-check text-green-600 text-xl"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">{statistics?.total.completed_tasks || 0}</div>
                <div className="text-sm text-text-secondary">个任务已完成</div>
                <div className="mt-4">
                  <div className="text-sm text-success">
                    <i className="fas fa-arrow-up mr-1"></i>+{statistics?.week.task_completed || 0} 本周完成
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 最近获得徽章 */}
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">最近获得徽章</h3>
                <Link to="/family-honor-wall" className="text-primary text-sm font-medium hover:underline">查看全部</Link>
              </div>
              {statistics?.recent_badges && statistics.recent_badges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {statistics.recent_badges.map((badge) => (
                    <div 
                      key={badge.id}
                      onClick={() => handleBadgeClick(badge.id)}
                      className="text-center cursor-pointer hover:scale-105 transition-transform"
                    >
                      <div className={`w-16 h-16 bg-gradient-to-br ${
                        badge.badge_type === 'persistence' ? 'from-yellow-400 to-orange-500' :
                        badge.badge_type === 'explorer' ? 'from-blue-400 to-purple-500' :
                        badge.badge_type === 'creativity' ? 'from-pink-400 to-red-500' :
                        badge.badge_type === 'helper' ? 'from-green-400 to-teal-500' :
                        badge.badge_type === 'reader' ? 'from-indigo-400 to-blue-500' :
                        badge.badge_type === 'artist' ? 'from-yellow-300 to-pink-400' :
                        'from-blue-400 to-blue-600'
                      } rounded-full flex items-center justify-center mx-auto mb-2 ${styles.badgeGlow}`}>
                        <i className={`${badge.icon || 'fas fa-medal'} text-white text-2xl`}></i>
                      </div>
                      <div className="text-sm font-medium text-text-primary">{badge.badge_name}</div>
                      <div className="text-xs text-text-secondary">{badge.description}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="mb-2"><i className="fas fa-medal text-4xl text-gray-300"></i></div>
                  <p>还没有获得徽章哦，继续加油！</p>
                </div>
              )}
            </div>
          </section>

          {/* 家长最新反馈 */}
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">家长的鼓励</h3>
                <div className="text-sm text-text-secondary">最新反馈</div>
              </div>
              <div className="space-y-4">
                {statistics?.recent_feedback && statistics.recent_feedback.length > 0 ? (
                  statistics.recent_feedback.map((feedback) => {
                    const formatTime = (timestamp: number) => {
                      const date = new Date(timestamp * 1000);
                      const now = new Date();
                      const diff = now.getTime() - date.getTime();
                      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                      const hours = Math.floor(diff / (1000 * 60 * 60));
                      const minutes = Math.floor(diff / (1000 * 60));

                      if (days > 0) return `${days}天前`;
                      if (hours > 0) return `${hours}小时前`;
                      if (minutes > 0) return `${minutes}分钟前`;
                      return '刚刚';
                    };

                    const getEmojiIcon = (type: string) => {
                      switch(type) {
                        case 'like': return 'fas fa-thumbs-up text-blue-500';
                        case 'hug': return 'fas fa-heart text-pink-500';
                        case 'cheer': return 'fas fa-bullhorn text-green-500';
                        case 'praise': return 'fas fa-star text-yellow-500';
                        default: return 'fas fa-comment text-gray-500';
                      }
                    };

                    return (
                      <div 
                        key={feedback.id}
                        onClick={() => handleFeedbackClick(feedback.task_id)}
                        className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-primary cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-3">
                          <img 
                            src={feedback.parent_avatar || "https://s.coze.cn/image/wYAaNNSqjrE/"} 
                            alt="家长头像" 
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-text-primary">{feedback.parent_name || '家长'}</span>
                              <span className="text-sm text-text-secondary">{formatTime(feedback.createtime)}</span>
                              <i className={getEmojiIcon(feedback.emoji_type)}></i>
                            </div>
                            <p className="text-sm text-text-primary">{feedback.feedback_content}</p>
                            <div className="mt-2 text-xs text-text-secondary">
                              任务：{feedback.task_name}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="mb-2"><i className="fas fa-comment-dots text-4xl text-gray-300"></i></div>
                    <p>还没有收到家长的反馈哦</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        {/* 右侧面板 (仅在大屏幕显示) */}
        <aside className="hidden xl:block fixed right-0 top-16 bottom-0 w-80 bg-white shadow-lg overflow-y-auto">
          <div className="p-6">
            {/* 能量值详情 */}
            <section className="mb-8">
              <h4 className="text-lg font-semibold text-text-primary mb-4">能量值详情</h4>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                <div className="text-center mb-4">
                  <div className={`text-3xl font-bold ${styles.gradientText}`}>1,240</div>
                  <div className="text-sm text-text-secondary">当前能量值</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">今日获得</span>
                    <span className="text-success font-medium">+80</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">本周获得</span>
                    <span className="text-success font-medium">+320</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">本月获得</span>
                    <span className="text-success font-medium">+1,150</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <div className="text-xs text-text-secondary mb-2">能量值来源</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>任务完成</span>
                      <span className="font-medium">850</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>徽章奖励</span>
                      <span className="font-medium">300</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>特殊奖励</span>
                      <span className="font-medium">90</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 徽章预览 */}
            <section className="mb-8">
              <h4 className="text-lg font-semibold text-text-primary mb-4">徽章收集进度</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <i className="fas fa-crown text-white text-sm"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium">完美学生奖</div>
                      <div className="text-xs text-text-secondary">连续30天完成任务</div>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary">进度: 7/30</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                      <i className="fas fa-rocket text-white text-sm"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium">学习火箭奖</div>
                      <div className="text-xs text-text-secondary">完成50个学习任务</div>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary">进度: 15/50</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                      <i className="fas fa-seedling text-white text-sm"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium">环保小卫士</div>
                      <div className="text-xs text-text-secondary">完成环保相关任务</div>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary">进度: 2/5</div>
                </div>
              </div>
            </section>

            {/* 系统推荐任务 */}
            <section>
              <h4 className="text-lg font-semibold text-text-primary mb-4">为你推荐</h4>
              <div className="space-y-3">
                <div 
                  onClick={() => handleRecommendedTaskClick('recommend1')}
                  className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-dumbbell text-white"></i>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-text-primary mb-1">运动小达人</h5>
                      <p className="text-sm text-text-secondary mb-2">每天运动30分钟，保持身体健康</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">运动健身</span>
                        <span className="text-xs text-text-secondary">能量+20</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => handleRecommendedTaskClick('recommend2')}
                  className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100 cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-seedling text-white"></i>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-text-primary mb-1">小小园艺师</h5>
                      <p className="text-sm text-text-secondary mb-2">种植一株小植物，观察它的成长</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">科学探索</span>
                        <span className="text-xs text-text-secondary">能量+25</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => handleRecommendedTaskClick('recommend3')}
                  className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-100 cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-camera text-white"></i>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-text-primary mb-1">摄影小记录</h5>
                      <p className="text-sm text-text-secondary mb-2">用照片记录生活中的美好瞬间</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">艺术创作</span>
                        <span className="text-xs text-text-secondary">能量+15</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChildDashboard;

