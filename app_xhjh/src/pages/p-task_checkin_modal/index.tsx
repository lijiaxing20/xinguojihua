

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { taskService, Task } from '../../services/task';
import styles from './styles.module.css';
import { useToast } from '../../components/Toast';

interface CategoryInfo {
  class: string;
  icon: string;
}

const TaskCheckinModal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error: showError, warning, info } = useToast();
  
  // 状态管理
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [explorationDiary, setExplorationDiary] = useState('');
  const [checkinNote, setCheckinNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [imageUploadDragOver, setImageUploadDragOver] = useState(false);
  const [videoUploadDragOver, setVideoUploadDragOver] = useState(false);
  
  // Refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const categoryMap: Record<string, CategoryInfo> = {
    '学习探索': { class: 'bg-blue-100 text-blue-800', icon: 'fas fa-book' },
    'habit': { class: 'bg-green-100 text-green-800', icon: 'fas fa-seedling' },
    'learning': { class: 'bg-blue-100 text-blue-800', icon: 'fas fa-book' },
    'interest': { class: 'bg-purple-100 text-purple-800', icon: 'fas fa-star' },
    'family': { class: 'bg-orange-100 text-orange-800', icon: 'fas fa-home' },
    '习惯养成': { class: 'bg-green-100 text-green-800', icon: 'fas fa-seedling' },
    '兴趣技能': { class: 'bg-purple-100 text-purple-800', icon: 'fas fa-star' },
    '家庭贡献': { class: 'bg-orange-100 text-orange-800', icon: 'fas fa-home' }
  };
  
  const taskId = searchParams.get('taskId');

  useEffect(() => {
    if (taskId) {
      setLoading(true);
      taskService.getTaskDetail(Number(taskId))
        .then(data => setTask(data))
        .catch(err => {
          console.error('Failed to load task:', err);
          showError('加载任务失败');
        })
        .finally(() => setLoading(false));
    }
  }, [taskId]);

  const currentTask = task ? {
    name: task.task_name,
    category: task.category,
    energy: task.energy_value || 0,
    icon: 'https://s.coze.cn/image/M4bFi6cAVFc/' // Default icon
  } : null;
  
  const categoryInfo = currentTask ? (categoryMap[currentTask.category] || categoryMap['learning']) : categoryMap['learning'];
  
  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '任务打卡 - 星火计划';
    return () => {
      document.title = originalTitle;
    };
  }, []);
  
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
  
  // 关闭模态弹窗
  const handleCloseModal = () => {
    navigate(`/task-detail?taskId=${taskId}`);
  };
  
  // 图片上传处理
  const handleImageUpload = (file: File) => {
    setSelectedImage(file);
  };
  
  const handleImageInputClick = () => {
    imageInputRef.current?.click();
  };
  
  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };
  
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };
  
  // 视频上传处理
  const handleVideoUpload = (file: File) => {
    setSelectedVideo(file);
  };
  
  const handleVideoInputClick = () => {
    videoInputRef.current?.click();
  };
  
  const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoUpload(file);
    }
  };
  
  const handleRemoveVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVideo(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };
  
  // 摄像头录制
  const handleRecordVideo = () => {
    console.log('需要调用第三方接口实现摄像头录制功能');
    info('摄像头录制功能需要在实际设备上使用，请先上传视频文件。');
  };
  
  // 拖拽处理
  const handleDragOver = (e: React.DragEvent, type: 'image' | 'video') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'image') {
      setImageUploadDragOver(true);
    } else {
      setVideoUploadDragOver(true);
    }
  };
  
  const handleDragEnter = (e: React.DragEvent, type: 'image' | 'video') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'image') {
      setImageUploadDragOver(true);
    } else {
      setVideoUploadDragOver(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent, type: 'image' | 'video') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'image') {
      setImageUploadDragOver(false);
    } else {
      setVideoUploadDragOver(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent, type: 'image' | 'video') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'image') {
      setImageUploadDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
    } else {
      setVideoUploadDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('video/')) {
        handleVideoUpload(file);
      }
    }
  };
  
  // 表单验证
  const isFormValid = explorationDiary.trim() || selectedImage || selectedVideo;
  
  // 提交打卡
  const handleSubmitCheckin = async () => {
    if (!taskId) return;
    if (!isFormValid) {
      warning('请至少填写探索日记或上传凭证后再提交！');
      return;
    }
    
    if (explorationDiary.length > 500) {
      warning('探索日记不能超过500字！');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Determine content type
      let contentType: 'text' | 'image' | 'video' | 'diary' = 'text';
      if (selectedImage) contentType = 'image';
      else if (selectedVideo) contentType = 'video';
      else if (explorationDiary) contentType = 'diary';

      // For now, we simulate file upload by just sending text. 
      // In a real app, we would upload the file first and get a URL.
      await taskService.checkinTask(Number(taskId), {
        content_type: contentType,
        text_content: explorationDiary,
        // content_url: uploadResult.url 
      });

      setShowSuccessModal(true);
    } catch (error: any) {
      showError(error.message || '打卡失败');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 成功确认
  const handleSuccessConfirm = () => {
    navigate(`/task-detail?taskId=${taskId}&checkinSuccess=true`);
  };
  
  // 背景点击关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };
  
  return (
    <div className={styles.pageWrapper}>
      {/* 主模态弹窗 */}
      <div 
        className={`fixed inset-0 ${styles.modalBackdrop} z-50 flex items-center justify-center p-4`}
        onClick={handleBackdropClick}
      >
        <div className={`bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto ${styles.modalEnter}`}>
          {/* 弹窗头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-white text-lg"></i>
              </div>
              <h2 className="text-xl font-bold text-text-primary">任务打卡</h2>
            </div>
            <button 
              onClick={handleCloseModal}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <i className="fas fa-times text-gray-600"></i>
            </button>
          </div>

          {/* 弹窗内容区 */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-10">
                <i className="fas fa-spinner fa-spin text-3xl text-primary"></i>
              </div>
            ) : !currentTask ? (
              <div className="text-center py-10 text-gray-500">
                任务不存在
              </div>
            ) : (
              <>
                {/* 任务信息显示 */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={currentTask.icon}
                      alt="任务图标" 
                      className="w-12 h-12 rounded-lg object-cover" 
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text-primary mb-1">{currentTask.name}</h3>
                      <p className="text-sm text-text-secondary">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.class}`}>
                          <i className={`${categoryInfo.icon} mr-1`}></i>{currentTask.category}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-text-secondary">能量值</p>
                      <p className="text-lg font-bold text-yellow-600">+{currentTask.energy}</p>
                    </div>
                  </div>
                </div>

                {/* 打卡凭证上传区域 */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-4">上传打卡凭证</h4>
                  
                  {/* 图片上传 */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-text-primary">
                      <i className="fas fa-image mr-2 text-blue-500"></i>上传图片
                    </label>
                    <div 
                      className={`${styles.uploadArea} ${imageUploadDragOver ? styles.uploadAreaDragover : ''} rounded-xl p-6 text-center cursor-pointer`}
                      onClick={handleImageInputClick}
                      onDragOver={(e) => handleDragOver(e, 'image')}
                      onDragEnter={(e) => handleDragEnter(e, 'image')}
                      onDragLeave={(e) => handleDragLeave(e, 'image')}
                      onDrop={(e) => handleDrop(e, 'image')}
                    >
                      <input 
                        type="file" 
                        ref={imageInputRef}
                        accept="image/*" 
                        className="hidden"
                        onChange={handleImageInputChange}
                      />
                      {!selectedImage ? (
                        <div className="space-y-2">
                          <i className="fas fa-cloud-upload-alt text-3xl text-gray-400"></i>
                          <p className="text-sm text-text-secondary">点击或拖拽图片到此处上传</p>
                          <p className="text-xs text-text-secondary">支持 JPG、PNG 格式，最大 5MB</p>
                        </div>
                      ) : (
                        <div>
                          <img 
                            src={URL.createObjectURL(selectedImage)} 
                            alt="预览图片" 
                            className="max-w-full max-h-48 rounded-lg mx-auto"
                          />
                          <button 
                            type="button" 
                            onClick={handleRemoveImage}
                            className="mt-2 text-sm text-red-600 hover:underline"
                          >
                            <i className="fas fa-trash mr-1"></i>移除图片
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 视频上传 */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-text-primary">
                      <i className="fas fa-video mr-2 text-green-500"></i>上传视频
                    </label>
                    <div 
                      className={`${styles.uploadArea} ${videoUploadDragOver ? styles.uploadAreaDragover : ''} rounded-xl p-6 text-center cursor-pointer`}
                      onClick={handleVideoInputClick}
                      onDragOver={(e) => handleDragOver(e, 'video')}
                      onDragEnter={(e) => handleDragEnter(e, 'video')}
                      onDragLeave={(e) => handleDragLeave(e, 'video')}
                      onDrop={(e) => handleDrop(e, 'video')}
                    >
                      <input 
                        type="file" 
                        ref={videoInputRef}
                        accept="video/*" 
                        className="hidden"
                        onChange={handleVideoInputChange}
                      />
                      {!selectedVideo ? (
                        <div className="space-y-2">
                          <i className="fas fa-video text-3xl text-gray-400"></i>
                          <p className="text-sm text-text-secondary">点击上传视频或录制</p>
                          <p className="text-xs text-text-secondary">支持 MP4、MOV 格式，最大 50MB</p>
                        </div>
                      ) : (
                        <div>
                          <video 
                            src={URL.createObjectURL(selectedVideo)} 
                            controls 
                            className="max-w-full max-h-48 rounded-lg mx-auto"
                          />
                          <button 
                            type="button" 
                            onClick={handleRemoveVideo}
                            className="mt-2 text-sm text-red-600 hover:underline"
                          >
                            <i className="fas fa-trash mr-1"></i>移除视频
                          </button>
                        </div>
                      )}
                    </div>
                    <button 
                      type="button" 
                      onClick={handleRecordVideo}
                      className="text-sm text-green-600 hover:underline"
                    >
                      <i className="fas fa-camera mr-1"></i>使用摄像头录制
                    </button>
                  </div>

                  {/* 探索日记 */}
                  <div className="space-y-3">
                    <label htmlFor="exploration-diary" className="block text-sm font-medium text-text-primary">
                      <i className="fas fa-pen mr-2 text-purple-500"></i>探索日记
                    </label>
                    <textarea 
                      id="exploration-diary"
                      value={explorationDiary}
                      onChange={(e) => setExplorationDiary(e.target.value)}
                      placeholder="写下今天的收获和感受吧！比如学到了什么新东西，遇到了什么有趣的事情..."
                      className="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={4}
                    />
                    <div className="text-right">
                      <span className={`text-sm ${explorationDiary.length > 500 ? 'text-red-600' : 'text-text-secondary'}`}>
                        {explorationDiary.length}/500
                      </span>
                    </div>
                  </div>

                  {/* 打卡说明 */}
                  <div className="space-y-3">
                    <label htmlFor="checkin-note" className="block text-sm font-medium text-text-primary">
                      <i className="fas fa-sticky-note mr-2 text-orange-500"></i>打卡说明（可选）
                    </label>
                    <input 
                      type="text" 
                      id="checkin-note"
                      value={checkinNote}
                      onChange={(e) => setCheckinNote(e.target.value)}
                      placeholder="简单描述一下完成情况..."
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* 打卡提示 */}
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-lightbulb text-yellow-500 mt-1"></i>
                      <div>
                        <p className="text-sm font-medium text-yellow-800 mb-1">温馨提示</p>
                        <p className="text-xs text-yellow-700">
                          上传的凭证将帮助家长了解你的努力过程，记得真实记录哦！
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 操作按钮区 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button 
              onClick={handleCloseModal}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:border-gray-400 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleSubmitCheckin}
              disabled={!isFormValid || isSubmitting}
              className={`${styles.btnGradient} text-white px-6 py-2 rounded-lg text-sm font-medium ${
                !isFormValid || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>提交中...
                </>
              ) : (
                <>
                  <i className="fas fa-check mr-2"></i>提交打卡
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 成功提示弹窗 */}
      {showSuccessModal && (
        <div className={`fixed inset-0 ${styles.modalBackdrop} z-60 flex items-center justify-center p-4`}>
          <div className={`bg-white rounded-2xl shadow-modal w-full max-w-md text-center ${styles.modalEnter}`}>
            <div className="p-8">
              <div className={`w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 ${styles.successAnimation}`}>
                <i className="fas fa-check text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">打卡成功！</h3>
              <p className="text-sm text-text-secondary mb-6">
                恭喜你完成任务，获得了 <span className="font-bold text-yellow-600">+{currentTask.energy} 能量值</span>！
              </p>
              <button 
                onClick={handleSuccessConfirm}
                className={`${styles.btnGradient} text-white px-6 py-2 rounded-lg text-sm font-medium w-full`}
              >
                太棒了！
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCheckinModal;

