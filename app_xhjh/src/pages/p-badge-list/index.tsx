import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { badgeService, Badge, BadgeCategory } from '../../services/badge';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { Header } from '../../components/Header';
import { useToast } from '../../components/Toast';
import BadgeCard from '../../components/BadgeCard';

import styles from './styles.module.css';

const BadgeListPage: React.FC = () => {
  const { userInfo } = useAuthStore();
  const { currentChild } = useFamilyStore();
  const { error: showError } = useToast();

  const [badges, setBadges] = useState<Badge[]>([]);
  const [categories, setCategories] = useState<BadgeCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const userId = currentChild?.id || userInfo?.id;
      if (!userId) {
        showError('请先选择用户');
        return;
      }

      const [badgesData, categoriesData] = await Promise.all([
        badgeService.getAllBadges(),
        badgeService.getBadgeCategories(),
      ]);

      setBadges(badgesData);
      setCategories(categoriesData);
    } catch (err: any) {
      showError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentChild]);

  // 筛选勋章
  const filteredBadges = badges.filter(badge => {
    if (selectedCategory === 'all') return true;
    return badge.badge_type === selectedCategory;
  });

  // 获得的勋章数量
  const achievedCount = badges.filter(b => b.is_achieved).length;
  const totalCount = badges.length;
  const progress = totalCount > 0 ? Math.round((achievedCount / totalCount) * 100) : 0;

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
                <Link
                  to="/child-dashboard"
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-home w-5"></i>
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
                  to="/badge-list"
                  className={`${styles.sidebarItem} ${styles.sidebarItemActive} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all`}
                >
                  <i className="fas fa-trophy w-5"></i>
                  <span>勋章墙</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/energy-history"
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-bolt w-5"></i>
                  <span>能量值</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 ml-60 p-6">
          {/* 进度统计 */}
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">我的勋章</h2>
                <p className="text-sm text-text-secondary">已收集 {achievedCount}/{totalCount} 个勋章</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                  {progress}%
                </div>
                <p className="text-xs text-text-secondary">完成进度</p>
              </div>
            </div>

            {/* 进度条 */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* 分类筛选 */}
          <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {categories.map(category => (
              <button
                key={category.type}
                onClick={() => setSelectedCategory(category.type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category.type
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className={`fas ${category.icon} mr-2`}></i>
                {category.name}
              </button>
            ))}
          </div>

          {/* 勋章网格 */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredBadges.map(badge => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  size="medium"
                  onClick={() => setSelectedBadge(badge)}
                />
              ))}
            </div>
          )}

          {/* 空状态 */}
          {!loading && filteredBadges.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-trophy text-6xl text-gray-300 mb-4"></i>
              <p className="text-text-secondary">暂无勋章</p>
            </div>
          )}
        </main>
      </div>

      {/* 勋章详情弹窗 */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-card max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary">{selectedBadge.badge_name}</h3>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <BadgeCard badge={selectedBadge} size="large" />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-text-secondary mb-1">描述</p>
                <p className="text-text-primary">{selectedBadge.description}</p>
              </div>

              {selectedBadge.energy_threshold && (
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-1">获得条件</p>
                  <p className="text-text-primary">
                    累计获得 {selectedBadge.energy_threshold} 能量值
                  </p>
                </div>
              )}

              {selectedBadge.task_count_threshold && (
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-1">获得条件</p>
                  <p className="text-text-primary">
                    完成 {selectedBadge.task_count_threshold} 个任务
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">状态</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedBadge.is_achieved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedBadge.is_achieved ? '已获得' : '未获得'}
                </span>
              </div>

              {selectedBadge.awarded_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">获得时间</span>
                  <span className="text-sm text-text-primary">
                    {new Date(selectedBadge.awarded_at * 1000).toLocaleString('zh-CN')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeListPage;
