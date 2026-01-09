

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { taskService, Task as ApiTask } from '../../services/task';
import { Header } from '../../components/Header';
import styles from './styles.module.css';

interface TaskData {
  title: string;
  description: string;
  goal: string;
  category: string;
  status: string;
  energy: string;
  creator: string;
  targetDate: string;
  completedDate: string | null;
}

interface CheckinRecord {
  id: string;
  userName: string;
  userAvatar: string;
  timestamp: string;
  content: string;
  images: string[];
  energy: string;
  badge?: string;
  feedback?: {
    authorName: string;
    authorAvatar: string;
    content: string;
    timestamp: string;
    emoji?: string;
  };
}

const TaskDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [taskData, setTaskData] = useState<TaskData | null>(null);
  const [checkinRecords, setCheckinRecords] = useState<CheckinRecord[]>([]);

  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [modalImageAlt, setModalImageAlt] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '任务详情 - 星火计划';
    return () => { document.title = originalTitle; };
  }, []);

  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (taskId) {
      loadTaskDetails(Number(taskId));
    } else {
        setError('任务ID不存在');
    }
  }, [searchParams]);

  const loadTaskDetails = async (taskId: number) => {
    setLoading(true);
    try {
      const task: any = await taskService.getTaskDetail(taskId);
      
      // Map API data to UI state
      const statusMap: Record<string, string> = {
        'pending': '待确认',
        'confirmed': '待执行',
        'in_progress': '进行中',
        'completed': '已完成',
        'rejected': '已拒绝'
      };

      setTaskData({
        title: task.task_name,
        description: task.description || '暂无描述',
        goal: task.description || '暂无目标', // Using description as goal for now
        category: task.category,
        status: statusMap[task.status] || task.status,
        energy: `+${task.energy_value || 0}`,
        creator: task.creator_name || '未知',
        targetDate: task.target_date ? new Date(task.target_date).toLocaleDateString() : '无期限',
        completedDate: task.status === 'completed' ? new Date(task.updatetime * 1000).toLocaleDateString() : null
      });

      if (task.checkins) {
        const records: CheckinRecord[] = task.checkins.map((c: any) => ({
          id: String(c.id),
          userName: c.user_name || '未知',
          userAvatar: c.user_avatar || 'https://s.coze.cn/image/lpjrKsXeUBQ/',
          timestamp: new Date(c.createtime * 1000).toLocaleString(),
          content: c.text_content || (c.content_type === 'image' ? '分享了图片' : '打卡'),
          images: c.content_url ? c.content_url.split(',') : [],
          energy: `+${c.energy_awarded || 0}能量`,
          badge: c.badge_awarded_id ? '获得徽章' : undefined,
          feedback: c.parent_feedback ? {
            authorName: c.parent_feedback.parent_name || '家长',
            authorAvatar: c.parent_feedback.parent_avatar || 'https://s.coze.cn/image/9JpLx3Op7mw/',
            content: c.parent_feedback.feedback_content,
            timestamp: new Date(c.parent_feedback.createtime * 1000).toLocaleString(),
            emoji: c.parent_feedback.emoji_type === 'like' ? '👍' : 
                   c.parent_feedback.emoji_type === 'hug' ? '🤗' : 
                   c.parent_feedback.emoji_type === 'cheer' ? '🎉' : '👍'
          } : undefined
        }));
        setCheckinRecords(records);
      }

    } catch (err: any) {
      console.error('Failed to load task details', err);
      setError(err.message || '加载任务详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (src: string, alt: string) => {
    setModalImageSrc(src);
    setModalImageAlt(alt);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setModalImageSrc('');
    setModalImageAlt('');
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    console.log('删除任务');
    setShowDeleteModal(false);
    navigate('/task-list');
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleEditTask = () => {
    const taskId = searchParams.get('taskId') || 'task1';
    navigate(`/task-create?taskId=${taskId}`);
  };

  const handleCheckin = () => {
    const taskId = searchParams.get('taskId');
    if (taskId) {
      navigate(`/task-checkin?taskId=${taskId}`);
    }
  };

  const handleProvideFeedback = () => {
    const taskId = searchParams.get('taskId') || 'task1';
    console.log('打开家长反馈弹窗', taskId);
  };

  const handleBackToList = () => {
    navigate(-1);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowImageModal(false);
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">加载中...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  if (!taskData) {
    return <div className="flex justify-center items-center min-h-screen">任务不存在</div>;
  }

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
                <Link to="/task-list" className={`${styles.sidebarItem} ${styles.sidebarItemActive} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all`}>
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
                <Link to="/family-honor-wall" className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}>
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
          {/* 页面头部 */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">{taskData.title}</h2>
                <nav className="text-sm text-text-secondary">
                  <Link to="/task-list" className="hover:text-primary">任务</Link>
                  <span className="mx-2">/</span>
                  <span>任务详情</span>
                </nav>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleEditTask}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:border-primary transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i>编辑任务
                </button>
                <button 
                  onClick={handleDeleteClick}
                  className="bg-white border border-danger text-danger px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i>删除任务
                </button>
              </div>
            </div>
          </div>

          {/* 任务基本信息区 */}
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-book text-blue-600 text-xl"></i>
                  </div>
                  <p className="text-sm font-medium text-text-secondary">任务分类</p>
                  <p className="text-lg font-semibold text-text-primary">{taskData.category}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-check-circle text-green-600 text-xl"></i>
                  </div>
                  <p className="text-sm font-medium text-text-secondary">任务状态</p>
                  <p className={`text-lg font-semibold ${taskData.status === '已完成' ? 'text-green-600' : 'text-blue-600'}`}>
                    {taskData.status}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-star text-yellow-600 text-xl"></i>
                  </div>
                  <p className="text-sm font-medium text-text-secondary">能量值</p>
                  <p className="text-lg font-semibold text-text-primary">{taskData.energy}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-user text-purple-600 text-xl"></i>
                  </div>
                  <p className="text-sm font-medium text-text-secondary">创建者</p>
                  <p className="text-lg font-semibold text-text-primary">{taskData.creator}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">任务描述</h3>
                  <p className="text-text-secondary leading-relaxed">
                    {taskData.description}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">任务目标</h3>
                  <p className="text-text-secondary leading-relaxed">
                    {taskData.goal}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">计划完成时间</p>
                    <p className="text-lg font-semibold text-text-primary">{taskData.targetDate}</p>
                  </div>
                  {taskData.completedDate && (
                    <div>
                      <p className="text-sm font-medium text-text-secondary">实际完成时间</p>
                      <p className="text-lg font-semibold text-green-600">{taskData.completedDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 打卡记录区 */}
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">打卡记录</h3>
                <button 
                  onClick={handleCheckin}
                  className={`${styles.btnGradient} text-white px-4 py-2 rounded-lg text-sm font-medium`}
                >
                  <i className="fas fa-plus mr-2"></i>打卡任务
                </button>
              </div>
              
              <div className="space-y-6">
                {checkinRecords.map((record, index) => (
                  <div key={record.id} className={`${styles.timelineItem} ${index === checkinRecords.length - 1 ? 'last:border-b-0' : ''}`}>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={record.userAvatar} 
                            alt={`${record.userName}头像`} 
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-text-primary">{record.userName}</p>
                            <p className="text-sm text-text-secondary">{record.timestamp}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`${styles.energyBadge} text-white text-xs px-2 py-1 rounded-full`}>
                            {record.energy}
                          </span>
                          {record.badge && (
                            <span className={`${styles.badgeIcon} text-white text-xs px-2 py-1 rounded-full`}>
                              <i className="fas fa-trophy mr-1"></i>{record.badge}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-text-secondary mb-3">
                          {record.content}
                        </p>
                        <div className={`grid ${record.images.length === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                          {record.images.map((imageSrc, imageIndex) => (
                            <img 
                              key={imageIndex}
                              src={imageSrc} 
                              alt={`打卡照片${imageIndex + 1}`} 
                              className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleImageClick(imageSrc, `打卡照片${imageIndex + 1}`)}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* 家长反馈 */}
                      {record.feedback && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <img 
                              src={record.feedback.authorAvatar} 
                              alt={`${record.feedback.authorName}头像`} 
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-text-primary">{record.feedback.authorName}</span>
                                <span className="text-sm text-text-secondary">{record.feedback.timestamp}</span>
                                {record.feedback.emoji && <span className="text-2xl">{record.feedback.emoji}</span>}
                              </div>
                              <p className="text-text-secondary">
                                {record.feedback.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 操作按钮区 */}
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleProvideFeedback}
                  className={`${styles.btnGradient} text-white px-6 py-3 rounded-lg text-sm font-medium`}
                >
                  <i className="fas fa-comment-dots mr-2"></i>提供反馈
                </button>
                <Link 
                  to="/family-honor-wall"
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:border-primary transition-colors"
                >
                  <i className="fas fa-trophy mr-2"></i>查看荣誉墙
                </Link>
                <button 
                  onClick={handleBackToList}
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:border-primary transition-colors"
                >
                  <i className="fas fa-arrow-left mr-2"></i>返回列表
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* 图片预览模态框 */}
      {showImageModal && (
        <div 
          className={`fixed inset-0 z-50 ${styles.modalBackdrop}`}
          onClick={handleCloseImageModal}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative">
              <img 
                src={modalImageSrc} 
                alt={modalImageAlt} 
                className="max-w-full max-h-full rounded-lg shadow-2xl"
              />
              <button 
                onClick={handleCloseImageModal}
                className="absolute top-4 right-4 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 确认删除模态框 */}
      {showDeleteModal && (
        <div 
          className={`fixed inset-0 z-50 ${styles.modalBackdrop}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelDelete();
            }
          }}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full ${styles.modalContent}`}>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">确认删除任务</h3>
                <p className="text-text-secondary mb-6">删除后将无法恢复，确定要删除这个任务吗？</p>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleConfirmDelete}
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    确认删除
                  </button>
                  <button 
                    onClick={handleCancelDelete}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    取消
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

export default TaskDetailPage;

