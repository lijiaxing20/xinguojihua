

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';
import { useFamilyStore } from '../../store/familyStore';
import { Header } from '../../components/Header';
import { badgeService } from '../../services/badge';
import { taskService } from '../../services/task';
import { useToast } from '../../components/Toast';

interface Achievement {
  id: string;
  type: 'badge' | 'work';
  child: string;
  time: string;
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
}

const FamilyHonorWall: React.FC = () => {
  const { currentChild } = useFamilyStore();
  const { error: showError } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const [badges, worksRes] = await Promise.all([
                badgeService.getUserBadges(currentChild?.user_id),
                taskService.getWorks({ user_id: currentChild?.user_id, limit: 50 })
            ]);

            const badgeItems: Achievement[] = badges.map(b => ({
                id: 'b' + b.id,
                type: 'badge',
                child: currentChild?.nickname || '我',
                time: new Date(b.awarded_at * 1000).toISOString().split('T')[0],
                title: b.badge_name,
                description: b.description,
                icon: b.icon || 'fas fa-trophy'
            }));

            const workItems: Achievement[] = worksRes.list.map(w => ({
                id: 'w' + w.id,
                type: 'work',
                child: w.child_name || currentChild?.nickname || '我',
                time: new Date(w.checkin_time * 1000).toISOString().split('T')[0],
                title: w.task_name,
                description: w.text_content || '完成了任务',
                imageUrl: w.content_url
            }));

            setAchievements([...badgeItems, ...workItems]);
        } catch (e: any) {
            console.error(e);
            showError(e.message || '加载荣誉墙数据失败');
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [currentChild]);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '家庭荣誉墙 - 星火计划';
    return () => { document.title = originalTitle; };
  }, []);

  const filteredAndSortedAchievements = React.useMemo(() => {
    let filtered = achievements;

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'earliest') {
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      } else {
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      }
    });

    return filtered;
  }, [achievements, selectedType, sortBy, searchTerm]);

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAchievement(null);
  };

  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isDetailModalOpen) {
      handleCloseModal();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isDetailModalOpen]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getIconColor = (icon: string) => {
    if (icon.includes('trophy')) return 'text-yellow-600';
    if (icon.includes('rocket')) return 'text-blue-600';
    if (icon.includes('lightbulb')) return 'text-green-600';
    if (icon.includes('book')) return 'text-purple-600';
    return 'text-gray-600';
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
                <Link to="/parent-dashboard" className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}>
                  <i className="fas fa-tachometer-alt w-5"></i>
                  <span>仪表盘</span>
                </Link>
              </li>
              <li>
                <Link to="/task-list" className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}>
                  <i className="fas fa-tasks w-5"></i>
                  <span>任务</span>
                </Link>
              </li>
              <li>
                <Link to="/wish-list" className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}>
                  <i className="fas fa-heart w-5"></i>
                  <span>心愿</span>
                </Link>
              </li>
              <li>
                <Link to="/family-honor-wall" className={`${styles.sidebarItem} ${styles.active} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all`}>
                  <i className="fas fa-trophy w-5"></i>
                  <span>家庭荣誉墙</span>
                </Link>
              </li>
              <li>
                <Link to="/growth-report" className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}>
                  <i className="fas fa-chart-line w-5"></i>
                  <span>成长报告</span>
                </Link>
              </li>
              <li>
                <Link to="/knowledge-base" className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}>
                  <i className="fas fa-book w-5"></i>
                  <span>知识库</span>
                </Link>
              </li>
              <li>
                <Link to="/family-manage" className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}>
                  <i className="fas fa-users w-5"></i>
                  <span>家庭管理</span>
                </Link>
              </li>
              <li>
                <Link to="/user-profile" className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}>
                  <i className="fas fa-user w-5"></i>
                  <span>个人资料</span>
                </Link>
              </li>
              <li>
                <Link to="/settings" className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}>
                  <i className="fas fa-cog w-5"></i>
                  <span>设置</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 ml-60 p-6">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-2xl shadow-card p-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-exclamation-triangle text-2xl text-danger"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">加载失败</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button
                onClick={() => fetchData()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                重试
              </button>
            </div>
          ) : (
            <>
          {/* 页面头部 */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">家庭荣誉墙</h2>
                <nav className="text-sm text-text-secondary">
                  <span>家庭荣誉墙</span>
                </nav>
              </div>

              {/* 右侧操作区 - 已移除重复显示 */}

            </div>
          </div>

          {/* 筛选和排序工具栏 */}
          <div className="bg-white rounded-2xl shadow-card p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* 类型筛选 */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-text-secondary">类型：</label>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">全部类型</option>
                  <option value="badge">徽章</option>
                  <option value="work">作品</option>
                </select>
              </div>

              {/* 时间排序 */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-text-secondary">排序：</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="latest">最新获得</option>
                  <option value="earliest">最早获得</option>
                </select>
              </div>

              {/* 搜索框 */}
              <div className="flex-1 max-w-xs">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="搜索成就..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                </div>
              </div>
            </div>
          </div>

          {/* 成就展示区域 */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedAchievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`${styles.achievementCard} bg-white rounded-2xl shadow-card overflow-hidden cursor-pointer`}
                onClick={() => handleAchievementClick(achievement)}
              >
                {achievement.type === 'badge' ? (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${styles.badgeIcon} w-16 h-16 rounded-full flex items-center justify-center`}>
                        <i className={`${achievement.icon} text-2xl ${getIconColor(achievement.icon!)}`}></i>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{achievement.title}</h3>
                    <p className="text-sm text-text-secondary mb-3">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary">{formatDate(achievement.time)}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <img 
                        src={achievement.imageUrl} 
                        alt={achievement.title} 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-text-primary mb-2">{achievement.title}</h3>
                      <p className="text-sm text-text-secondary mb-3">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-secondary">{formatDate(achievement.time)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* 空状态提示 */}
          {filteredAndSortedAchievements.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-trophy text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">暂无相关成就</h3>
              <p className="text-text-secondary">当前筛选条件下没有找到相关成就</p>
            </div>
          )}
            </>
          )}
        </main>
      </div>

      {/* 详情模态弹窗 */}
      {isDetailModalOpen && selectedAchievement && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={handleModalBackdropClick}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-text-primary">{selectedAchievement.title}</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={handleCloseModal}
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="space-y-4">
                {selectedAchievement.type === 'badge' ? (
                  <>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
                        <i className={`${selectedAchievement.icon} text-2xl ${getIconColor(selectedAchievement.icon!)}`}></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary">徽章成就</h4>
                        <p className="text-sm text-text-secondary">获得时间：{formatDate(selectedAchievement.time)}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-text-primary mb-2">获得条件</h5>
                      <p className="text-sm text-text-secondary">{selectedAchievement.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <button className="text-primary text-sm hover:underline">查看相关任务</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <img 
                        src={selectedAchievement.imageUrl} 
                        alt={selectedAchievement.title} 
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h5 className="font-medium text-text-primary mb-2">作品描述</h5>
                      <p className="text-sm text-text-secondary">{selectedAchievement.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-text-secondary">
                        完成时间：{formatDate(selectedAchievement.time)}
                      </span>
                      <span className="text-sm text-text-secondary">
                        <i className="fas fa-heart text-danger mr-1"></i>获得 {selectedAchievement.likes} 个点赞
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyHonorWall;

