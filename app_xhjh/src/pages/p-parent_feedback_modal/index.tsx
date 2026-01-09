

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';
import { useToast } from '../../components/Toast';

interface TaskData {
  name: string;
  category: string;
  description: string;
  checkinDiary: string;
}

interface FeedbackTemplate {
  id: string;
  title: string;
  content: string;
}

interface EmojiOption {
  id: string;
  emoji: string;
  label: string;
}

const ParentFeedbackModal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error: showError, warning } = useToast();
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedEmojiId, setSelectedEmojiId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskData, setTaskData] = useState<TaskData>({
    name: '完成数学练习册第3章',
    category: '学习探索',
    description: '小明今天完成了数学练习册第3章的所有题目，包括加减乘除的混合运算练习。',
    checkinDiary: '今天的数学练习有点难，但是我坚持做完了！特别是最后那道应用题，我想了好久才想出来，感觉自己很棒！'
  });

  const feedbackTemplates: FeedbackTemplate[] = [
    {
      id: 'template-1',
      title: '认真努力',
      content: '看到你这么认真地完成任务，真的很为你骄傲！'
    },
    {
      id: 'template-2',
      title: '坚持到底',
      content: '遇到困难不放弃，这种精神值得称赞！'
    },
    {
      id: 'template-3',
      title: '创意想法',
      content: '你的解决方法很有创意，继续保持！'
    },
    {
      id: 'template-4',
      title: '进步明显',
      content: '这次比上次有很大进步，继续加油！'
    }
  ];

  const emojiOptions: EmojiOption[] = [
    { id: 'emoji-like', emoji: '👍', label: '点赞' },
    { id: 'emoji-hug', emoji: '🤗', label: '拥抱' },
    { id: 'emoji-cheer', emoji: '💪', label: '加油' },
    { id: 'emoji-star', emoji: '⭐', label: '星星' },
    { id: 'emoji-heart', emoji: '❤️', label: '爱心' },
    { id: 'emoji-clap', emoji: '👏', label: '鼓掌' }
  ];

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '提供反馈 - 星火计划';
    return () => { document.title = originalTitle; };
  }, []);

  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (taskId) {
      loadTaskData(taskId);
    }
  }, [searchParams]);

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

  const loadTaskData = (taskId: string) => {
    const mockTasks: Record<string, TaskData> = {
      'task1': {
        name: '完成数学练习册第3章',
        category: '学习探索',
        description: '小明今天完成了数学练习册第3章的所有题目，包括加减乘除的混合运算练习。',
        checkinDiary: '今天的数学练习有点难，但是我坚持做完了！特别是最后那道应用题，我想了好久才想出来，感觉自己很棒！'
      },
      'task2': {
        name: '整理房间',
        category: '习惯养成',
        description: '小明按照计划整理了自己的房间，包括书桌、床铺和玩具区域。',
        checkinDiary: '整理房间虽然有点累，但是看到整洁的房间心情特别好！下次我要保持房间的整洁。'
      }
    };

    const task = mockTasks[taskId] || mockTasks['task1'];
    setTaskData(task);
  };

  const handleCloseModal = () => {
    navigate(-1);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleTemplateSelect = (template: FeedbackTemplate) => {
    setSelectedTemplateId(template.id);
    setFeedbackText(template.content);
  };

  const handleEmojiSelect = (emojiId: string) => {
    setSelectedEmojiId(emojiId);
  };

  const handleSendFeedback = async () => {
    const trimmedFeedback = feedbackText.trim();
    
    if (!trimmedFeedback) {
      warning('请输入反馈内容');
      return;
    }

    setIsSubmitting(true);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success('反馈发送成功！');
      handleCloseModal();
    } catch (error) {
      showError('发送失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div 
        className={`fixed inset-0 ${styles.modalBackdrop} flex items-center justify-center z-50 p-4`}
        onClick={handleBackdropClick}
      >
        <div 
          className={`bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto ${styles.modalEnter}`}
          onClick={handleModalClick}
        >
          {/* 弹窗头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-text-primary">提供反馈</h2>
            <button 
              onClick={handleCloseModal}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* 弹窗内容区 */}
          <div className="p-6">
            {/* 任务信息展示 */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-tasks text-white text-lg"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">{taskData.name}</h3>
                  <p className="text-sm text-text-secondary mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <i className="fas fa-book mr-1"></i>{taskData.category}
                    </span>
                  </p>
                  <p className="text-sm text-text-secondary">
                    {taskData.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 打卡凭证预览 */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-text-primary mb-3">打卡凭证</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 图片凭证 */}
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src="https://s.coze.cn/image/TVnlBaRDYao/" 
                    alt="数学练习册完成照片" 
                    className="w-full h-48 object-cover" 
                    loading="lazy"
                  />
                  <div className="p-3">
                    <p className="text-sm text-text-secondary">练习册完成照片</p>
                  </div>
                </div>
                
                {/* 文字日记 */}
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-pen text-gray-500"></i>
                    <span className="text-sm font-medium text-text-primary">探索日记</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {taskData.checkinDiary}
                  </p>
                </div>
              </div>
            </div>

            {/* 反馈输入区 */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-text-primary mb-3">你的反馈</h4>
              <div className="mb-4">
                <label htmlFor="feedback-text" className="block text-sm font-medium text-text-primary mb-2">
                  给孩子写一些鼓励的话吧
                </label>
                <textarea 
                  id="feedback-text"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="例如：看到你这么认真地完成数学练习，妈妈感到很骄傲！你在解题过程中展现的坚持和思考能力真的很棒..."
                />
              </div>
            </div>

            {/* 反馈模板选择 */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-text-primary mb-3">快速模板</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {feedbackTemplates.map((template) => (
                  <button 
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`${styles.templateButton} p-3 border border-gray-200 rounded-lg text-left hover:border-primary transition-all ${
                      selectedTemplateId === template.id ? styles.selected : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-text-primary">{template.title}</p>
                    <p className="text-xs text-text-secondary mt-1">{template.content}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 互动表情选择 */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-text-primary mb-3">发送表情</h4>
              <div className="flex space-x-3">
                {emojiOptions.map((emoji) => (
                  <button 
                    key={emoji.id}
                    onClick={() => handleEmojiSelect(emoji.id)}
                    className={`${styles.emojiButton} p-3 border-2 border-gray-200 rounded-lg hover:border-primary transition-all ${
                      selectedEmojiId === emoji.id ? styles.selected : ''
                    }`}
                  >
                    <span className="text-2xl">{emoji.emoji}</span>
                    <p className="text-xs text-text-secondary mt-1">{emoji.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 操作按钮区 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button 
              onClick={handleCloseModal}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleSendFeedback}
              disabled={isSubmitting}
              className={`${styles.btnGradient} text-white px-6 py-2 rounded-lg font-medium`}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>发送中...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>发送反馈
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentFeedbackModal;

