

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';
import { useToast } from '../../components/Toast';

interface TaskData {
  id: string;
  name: string;
  description: string;
  goal: string;
  goalDetails: string[];
  category: string;
  categoryClass: string;
  categoryIcon: string;
  targetDate: string;
  energy: number;
  creatorName: string;
  creatorAvatar: string;
  createdTime: string;
}

const TaskConfirmModal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success } = useToast();
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [isModifyLoading, setIsModifyLoading] = useState(false);
  const [currentTaskData, setCurrentTaskData] = useState<TaskData | null>(null);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '确认任务 - 星火计划';
    return () => { document.title = originalTitle; };
  }, []);

  // 模拟任务数据
  const mockTasksData: Record<string, TaskData> = {
    'task1': {
      id: 'task1',
      name: '学习骑自行车',
      description: '我想学会骑自行车，这样周末就可以和爸爸妈妈一起去公园骑车了。我会每天练习30分钟，先学会平衡，再学习转弯和刹车。',
      goal: '学会独立骑自行车',
      goalDetails: [
        '能够独立上车和下车',
        '掌握平衡技巧，骑行50米不摔倒',
        '学会基本的转弯和刹车',
        '能够在公园安全骑行'
      ],
      category: '兴趣技能',
      categoryClass: 'categoryInterest',
      categoryIcon: 'fas fa-bicycle',
      targetDate: '2024年2月15日',
      energy: 50,
      creatorName: '小明',
      creatorAvatar: 'https://s.coze.cn/image/s1sFw1aWnQQ/',
      createdTime: '2024年1月15日 14:30'
    },
    'task2': {
      id: 'task2',
      name: '每天阅读30分钟',
      description: '我想养成阅读的好习惯，每天阅读30分钟，增加知识，提高理解能力。',
      goal: '养成阅读习惯',
      goalDetails: [
        '每天坚持阅读30分钟',
        '完成至少5本课外书籍',
        '学会做简单的读书笔记'
      ],
      category: '习惯养成',
      categoryClass: 'categoryHabit',
      categoryIcon: 'fas fa-book',
      targetDate: '2024年3月1日',
      energy: 30,
      creatorName: '小红',
      creatorAvatar: 'https://s.coze.cn/image/a_mgmu3zJSg/',
      createdTime: '2024年1月15日 16:45'
    }
  };

  // 加载任务数据
  useEffect(() => {
    const taskId = searchParams.get('taskId') || 'task1';
    const taskData = mockTasksData[taskId] || mockTasksData['task1'];
    setCurrentTaskData(taskData);
  }, [searchParams]);

  // 关闭弹窗
  const handleCloseModal = () => {
    navigate(-1);
  };

  // 确认任务
  const handleConfirmTask = () => {
    setIsConfirmLoading(true);
    
    // 模拟API调用
    setTimeout(() => {
      success('任务已确认！');
      handleCloseModal();
    }, 1000);
  };

  // 建议修改
  const handleSuggestModify = () => {
    setIsModifyLoading(true);
    
    // 模拟API调用
    setTimeout(() => {
      success('修改建议已发送给孩子！');
      handleCloseModal();
    }, 1000);
  };

  // 点击背景关闭弹窗
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // 防止弹窗内容点击时关闭弹窗
  const handleModalContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // ESC键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!currentTaskData) {
    return null;
  }

  return (
    <div className={styles.pageWrapper}>
      {/* 模态弹窗背景 */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 ${styles.modalBackdrop}`}
        onClick={handleBackdropClick}
      >
        {/* 弹窗内容 */}
        <div 
          className={`bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${styles.modalContent}`}
          onClick={handleModalContentClick}
        >
          {/* 弹窗头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-white text-lg"></i>
              </div>
              <h2 className="text-xl font-bold text-text-primary">确认任务</h2>
            </div>
            <button 
              onClick={handleCloseModal}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          {/* 弹窗内容区 */}
          <div className="p-6">
            {/* 任务创建者信息 */}
            <div className="flex items-center space-x-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <img 
                src={currentTaskData.creatorAvatar}
                alt={`${currentTaskData.creatorName}头像`} 
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm" 
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-secondary">任务创建者</p>
                <p className="text-lg font-semibold text-text-primary">{currentTaskData.creatorName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">创建时间</p>
                <p className="text-sm font-medium text-text-primary">{currentTaskData.createdTime}</p>
              </div>
            </div>

            {/* 任务详细信息 */}
            <div className="space-y-6">
              {/* 任务名称 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">任务名称</label>
                <h3 className="text-xl font-bold text-text-primary bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  {currentTaskData.name}
                </h3>
              </div>

              {/* 任务描述 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">任务描述</label>
                <div className="bg-gray-50 p-4 rounded-lg text-text-primary">
                  {currentTaskData.description}
                </div>
              </div>

              {/* 任务目标 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">任务目标</label>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-target text-green-600"></i>
                    <span className="font-medium text-green-800">{currentTaskData.goal}</span>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1 ml-6">
                    {currentTaskData.goalDetails.map((detail, index) => (
                      <li key={index}>• {detail}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 任务分类和计划完成时间 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">任务分类</label>
                  <span className={`${styles.taskCategory} ${styles[currentTaskData.categoryClass]}`}>
                    <i className={`${currentTaskData.categoryIcon} mr-1`}></i>{currentTaskData.category}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">计划完成时间</label>
                  <div className="flex items-center space-x-2 text-text-primary">
                    <i className="fas fa-calendar-alt text-gray-400"></i>
                    <span>{currentTaskData.targetDate}</span>
                  </div>
                </div>
              </div>

              {/* 预估能量值 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">预估能量值</label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-yellow-50 p-3 rounded-lg">
                    <i className="fas fa-star text-yellow-500"></i>
                    <span className="text-lg font-bold text-yellow-800">{currentTaskData.energy}</span>
                    <span className="text-sm text-yellow-600">能量值</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-secondary">
                      <i className="fas fa-info-circle mr-1"></i>
                      此能量值为系统建议，您可以在确认时调整
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮区 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button 
              onClick={handleCloseModal}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
            >
              <i className="fas fa-times mr-2"></i>取消
            </button>
            <button 
              onClick={handleSuggestModify}
              disabled={isModifyLoading}
              className={`px-6 py-2 text-white rounded-lg font-medium ${styles.btnSecondary}`}
            >
              {isModifyLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>提交建议中...
                </>
              ) : (
                <>
                  <i className="fas fa-edit mr-2"></i>建议修改
                </>
              )}
            </button>
            <button 
              onClick={handleConfirmTask}
              disabled={isConfirmLoading}
              className={`px-6 py-2 text-white rounded-lg font-medium ${styles.btnGradient}`}
            >
              {isConfirmLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>确认中...
                </>
              ) : (
                <>
                  <i className="fas fa-check mr-2"></i>确认任务
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskConfirmModal;

