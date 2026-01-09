
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { Header } from '../../components/Header';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { reportService, ReportStats } from '../../services/report';
import { useToast } from '../../components/Toast';

const GrowthReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const { currentChild } = useFamilyStore();
  const { info } = useToast();
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [reportData, setReportData] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!currentChild) return;
    setLoading(true);
    try {
      let data;
      if (activeTab === 'weekly') {
        data = await reportService.getWeeklyReport({ user_id: currentChild.user_id });
      } else {
        data = await reportService.getMonthlyReport({ user_id: currentChild.user_id });
      }
      setReportData(data);
    } catch (e) {
      console.error('获取报告失败', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, currentChild]);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '成长报告 - 星火计划';
    return () => { document.title = originalTitle; };
  }, []);

  const handleTabChange = (tab: 'weekly' | 'monthly') => {
    setActiveTab(tab);
  };

  const handleDownloadReport = () => {
    console.log('需要调用第三方接口实现报告下载功能');
    info('报告下载功能正在开发中...');
  };

  const handleShareReport = () => {
    console.log('需要调用第三方接口实现报告分享功能');
    info('报告分享功能正在开发中...');
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
                  className={`${styles.sidebarItem} ${styles.sidebarItemActive} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all`}
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
                <h2 className="text-2xl font-bold text-text-primary mb-2">成长报告</h2>
                <nav className="text-sm text-text-secondary">
                  <span>成长报告</span>
                </nav>
              </div>
              <div className="flex space-x-3">
                {/* 报告周期选择器 */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleTabChange('weekly')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none ${
                      activeTab === 'weekly' ? styles.tabActive : styles.tabInactive
                    }`}
                    role="tab"
                  >
                    周报告
                  </button>
                  <button 
                    onClick={() => handleTabChange('monthly')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none ${
                      activeTab === 'monthly' ? styles.tabActive : styles.tabInactive
                    }`}
                    role="tab"
                  >
                    月报告
                  </button>
                </div>
                <button 
                  onClick={handleDownloadReport}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:border-primary transition-colors"
                >
                  <i className="fas fa-download mr-2"></i>下载报告
                </button>
                <button 
                  onClick={handleShareReport}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:border-primary transition-colors"
                >
                  <i className="fas fa-share mr-2"></i>分享报告
                </button>
              </div>
            </div>
          </div>

          {/* 报告内容区 */}
          <div>
            {/* 报告内容 */}
            {reportData && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* 本周/本月概览 */}
                  <div className="bg-white rounded-2xl shadow-card p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">{activeTab === 'weekly' ? '本周概览' : '本月概览'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-2">
                          <svg className={`${styles.progressRing} w-20 h-20`} viewBox="0 0 36 36">
                            <path 
                              className={`${styles.progressRingCircle}`} 
                              stroke="#e5e7eb" 
                              strokeWidth="3" 
                              fill="transparent" 
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path 
                              className={`${styles.progressRingCircle}`} 
                              stroke="#6366f1" 
                              strokeWidth="3" 
                              fill="transparent" 
                              strokeDasharray={`${reportData.task.completion_rate}, 100`} 
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-text-primary">{reportData.task.completion_rate}%</span>
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary">任务完成率</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">{reportData.task.completed}</div>
                        <p className="text-sm text-text-secondary">完成任务数</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-secondary mb-1">+{reportData.energy.earned}</div>
                        <p className="text-sm text-text-secondary">能量值增长</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-tertiary mb-1">{reportData.badge.new}</div>
                        <p className="text-sm text-text-secondary">获得徽章数</p>
                      </div>
                    </div>
                  </div>

                  {/* 能量值趋势 */}
                  <div className="bg-white rounded-2xl shadow-card p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">能量值趋势</h3>
                    <div className={styles.chartContainer}>
                      <div className="text-center">
                        <i className="fas fa-chart-line text-4xl text-primary mb-2"></i>
                        <p className="text-sm text-text-secondary">{activeTab === 'weekly' ? '本周' : '本月'}能量值稳步增长</p>
                        <p className="text-lg font-semibold text-text-primary mt-1">+{reportData.energy.earned} 能量值</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                      {reportData.daily_trend.map((day, index) => (
                        <div key={index} className="flex justify-between text-sm">
                            <span className="text-text-secondary">{day.date}</span>
                            <span className="text-text-primary">+{day.energy_earned}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 任务分类分析 */}
                <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">任务分类分析</h3>
                  {reportData.task.by_category.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {reportData.task.by_category.map((cat, idx) => (
                             <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                                  <i className="fas fa-tasks text-white"></i>
                                </div>
                                <div className="text-xl font-bold text-text-primary">{cat.count}</div>
                                <div className="text-sm text-text-secondary">{cat.category === 'study' ? '学习探索' : cat.category === 'habit' ? '习惯养成' : cat.category === 'sport' ? '运动健康' : cat.category === 'housework' ? '家务劳动' : cat.category}</div>
                              </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">暂无数据</div>
                  )}
                </div>

                {/* 家长反馈统计 (暂时隐藏或mock，因为Report接口没返回这个，或者后续添加) */}
                {/* 亮点表现 */}
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">{activeTab === 'weekly' ? '本周' : '本月'}亮点</h3>
                  {reportData.badge.list.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {reportData.badge.list.map(badge => (
                            <div key={badge.id} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-100">
                                <div className="flex items-center space-x-3 mb-2">
                                  <i className={`${badge.icon || 'fas fa-trophy'} text-yellow-500`}></i>
                                  <span className="font-medium text-text-primary">{badge.badge_name}</span>
                                </div>
                                <p className="text-sm text-text-secondary">{badge.description}</p>
                                <p className="text-xs text-gray-400 mt-2">{new Date(badge.awarded_at * 1000).toLocaleDateString()}</p>
                              </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                        暂无新获得徽章
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {!reportData && !loading && (
                <div className="text-center py-20 text-gray-500">
                    请选择孩子查看报告
                </div>
            )}
            
            {loading && (
                 <div className="text-center py-20 text-gray-500">
                    <i className="fas fa-spinner fa-spin mr-2"></i>加载中...
                 </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GrowthReportPage;
