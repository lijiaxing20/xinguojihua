import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { energyService, EnergyLog, EnergyStatistics } from '../../services/energy';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { Header } from '../../components/Header';
import { useToast } from '../../components/Toast';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

import styles from './styles.module.css';

// 注册 Chart.js 组件
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const EnergyHistoryPage: React.FC = () => {
  const { userInfo } = useAuthStore();
  const { currentChild } = useFamilyStore();
  const { error: showError, success } = useToast();

  const [logs, setLogs] = useState<EnergyLog[]>([]);
  const [statistics, setStatistics] = useState<EnergyStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const userId = currentChild?.id || userInfo?.id;
      if (!userId) {
        showError('请先选择用户');
        return;
      }

      const [logsData, statsData] = await Promise.all([
        energyService.getLogs({ user_id: userId, page, limit }),
        energyService.getStatistics(userId),
      ]);

      setLogs(logsData.list);
      setTotal(logsData.total);
      setStatistics(statsData);
    } catch (err: any) {
      showError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentChild, page]);

  // 准备图表数据
  const chartData = statistics ? {
    labels: statistics.trend.map(t => t.date),
    datasets: [
      {
        label: '收入',
        data: statistics.trend.map(t => t.income),
        borderColor: 'rgb(76, 175, 80)',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.3,
      },
      {
        label: '支出',
        data: statistics.trend.map(t => t.expense),
        borderColor: 'rgb(244, 67, 54)',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        tension: 0.3,
      },
    ],
  } : null;

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
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-trophy w-5"></i>
                  <span>勋章墙</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/energy-history"
                  className={`${styles.sidebarItem} ${styles.sidebarItemActive} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all`}
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
          {/* 统计卡片 */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">当前能量值</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                      {statistics.current_energy}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-bolt text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">今日收入</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{statistics.today_income}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <i className="fas fa-arrow-up text-green-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">本周收入</p>
                    <p className="text-2xl font-bold text-blue-600">
                      +{statistics.week_income}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <i className="fas fa-calendar-week text-blue-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">本月收入</p>
                    <p className="text-2xl font-bold text-purple-600">
                      +{statistics.month_income}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <i className="fas fa-calendar-alt text-purple-600 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 图表 */}
          {chartData && (
            <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">近7天收支趋势</h3>
              <div className="h-64">
                <Line data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }} />
              </div>
            </div>
          )}

          {/* 收支明细 */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">收支明细</h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">时间</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">类型</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">变化</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">余额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(log => (
                        <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-text-primary">{log.createtime_text}</td>
                          <td className="py-3 px-4 text-sm text-text-primary">{log.reason_text}</td>
                          <td className={`py-3 px-4 text-sm font-medium ${
                            log.change_amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                          </td>
                          <td className="py-3 px-4 text-sm text-text-primary">{log.after}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 分页 */}
                {total > limit && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-text-secondary">
                      共 {total} 条记录，当前第 {page} 页
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page * limit >= total}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnergyHistoryPage;
