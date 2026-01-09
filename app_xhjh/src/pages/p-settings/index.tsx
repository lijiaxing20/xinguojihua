

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import styles from './styles.module.css';

interface NotificationSettings {
  taskNotification: boolean;
  feedbackNotification: boolean;
  wishNotification: boolean;
  systemNotification: boolean;
}

interface SettingsFormData {
  notificationSettings: NotificationSettings;
  selectedNotificationMethods: string[];
  selectedTheme: string;
  selectedColor: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    taskNotification: true,
    feedbackNotification: true,
    wishNotification: true,
    systemNotification: false
  });
  
  const [selectedNotificationMethods, setSelectedNotificationMethods] = useState<string[]>(['web']);
  const [selectedTheme, setSelectedTheme] = useState<string>('light');
  const [selectedColor, setSelectedColor] = useState<string>('blue');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '系统设置 - 星火计划';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // 处理通知开关变化
  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // 处理通知方式选择
  const handleNotificationMethodToggle = (method: string) => {
    setSelectedNotificationMethods(prev => {
      if (prev.includes(method)) {
        return prev.filter(m => m !== method);
      } else {
        return [...prev, method];
      }
    });
  };

  // 处理主题选择
  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
  };

  // 处理颜色选择
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  // 处理表单提交
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const settingsData: SettingsFormData = {
      notificationSettings,
      selectedNotificationMethods,
      selectedTheme,
      selectedColor
    };
    
    console.log('保存设置:', settingsData);
    setShowSuccessModal(true);
  };

  // 处理取消
  const handleCancel = () => {
    if (confirm('确定要放弃修改吗？')) {
      resetForm();
    }
  };

  // 重置表单
  const resetForm = () => {
    setNotificationSettings({
      taskNotification: true,
      feedbackNotification: true,
      wishNotification: true,
      systemNotification: false
    });
    setSelectedNotificationMethods(['web']);
    setSelectedTheme('light');
    setSelectedColor('blue');
  };

  // 关闭成功模态框
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
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
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
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
                <button 
                  className={`${styles.sidebarItem} ${styles.sidebarItemActive} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all w-full text-left`}
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
                <h2 className="text-2xl font-bold text-text-primary mb-2">系统设置</h2>
                <nav className="text-sm text-text-secondary">
                  <span>设置</span>
                </nav>
              </div>
              
              {/* 右侧操作区 - 已移除重复显示 */}

            </div>
          </div>

          {/* 设置表单 */}
          <div className="bg-white rounded-2xl shadow-card p-8">
            <form onSubmit={handleFormSubmit} className="space-y-8">
              {/* 通知偏好设置 */}
              <section className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary border-b border-gray-200 pb-3">通知偏好设置</h3>
                
                {/* 任务提醒通知 */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-text-primary mb-1">任务提醒通知</h4>
                    <p className="text-sm text-text-secondary">当有新任务、任务到期或需要确认时发送通知</p>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.taskNotification}
                      onChange={() => handleNotificationToggle('taskNotification')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                
                {/* 家长反馈通知 */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-text-primary mb-1">家长反馈通知</h4>
                    <p className="text-sm text-text-secondary">当家长提供反馈或发送互动表情时发送通知</p>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.feedbackNotification}
                      onChange={() => handleNotificationToggle('feedbackNotification')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                
                {/* 心愿审核通知 */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-text-primary mb-1">心愿审核通知</h4>
                    <p className="text-sm text-text-secondary">当有新的心愿申请或心愿状态变更时发送通知</p>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.wishNotification}
                      onChange={() => handleNotificationToggle('wishNotification')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                
                {/* 系统消息通知 */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-text-primary mb-1">系统消息通知</h4>
                    <p className="text-sm text-text-secondary">接收系统更新、功能介绍等重要消息</p>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.systemNotification}
                      onChange={() => handleNotificationToggle('systemNotification')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                
                {/* 通知方式选择 */}
                <div className="space-y-4">
                  <h4 className="font-medium text-text-primary">通知方式</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                      className={`${styles.notificationMethod} ${selectedNotificationMethods.includes('web') ? styles.notificationMethodSelected : ''} p-4 border border-gray-200 rounded-lg cursor-pointer`}
                      onClick={() => handleNotificationMethodToggle('web')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-globe text-blue-600"></i>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">站内通知</p>
                          <p className="text-sm text-text-secondary">在应用内显示通知</p>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`${styles.notificationMethod} ${selectedNotificationMethods.includes('email') ? styles.notificationMethodSelected : ''} p-4 border border-gray-200 rounded-lg cursor-pointer`}
                      onClick={() => handleNotificationMethodToggle('email')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-envelope text-green-600"></i>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">邮件通知</p>
                          <p className="text-sm text-text-secondary">发送到注册邮箱</p>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`${styles.notificationMethod} ${selectedNotificationMethods.includes('sms') ? styles.notificationMethodSelected : ''} p-4 border border-gray-200 rounded-lg cursor-pointer`}
                      onClick={() => handleNotificationMethodToggle('sms')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-mobile-alt text-orange-600"></i>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">短信通知</p>
                          <p className="text-sm text-text-secondary">发送到绑定手机</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* 界面主题设置 */}
              <section className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary border-b border-gray-200 pb-3">界面主题设置</h3>
                
                {/* 主题选择 */}
                <div className="space-y-4">
                  <h4 className="font-medium text-text-primary">选择主题</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* 亮色主题 */}
                    <div 
                      className={`${styles.themeOption} ${selectedTheme === 'light' ? styles.themeOptionSelected : ''} bg-white border border-gray-200 rounded-xl p-6 cursor-pointer`}
                      onClick={() => handleThemeSelect('light')}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-sun text-yellow-600 text-xl"></i>
                        </div>
                        <div>
                          <h5 className="font-medium text-text-primary">亮色主题</h5>
                          <p className="text-sm text-text-secondary">清新明亮的界面</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-3 bg-gray-200 rounded-full"></div>
                        <div className="w-full h-3 bg-gray-100 rounded-full"></div>
                        <div className="w-full h-3 bg-gray-50 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* 暗色主题 */}
                    <div 
                      className={`${styles.themeOption} ${selectedTheme === 'dark' ? styles.themeOptionSelected : ''} bg-gray-800 border border-gray-700 rounded-xl p-6 cursor-pointer`}
                      onClick={() => handleThemeSelect('dark')}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-moon text-indigo-600 text-xl"></i>
                        </div>
                        <div>
                          <h5 className="font-medium text-white">暗色主题</h5>
                          <p className="text-sm text-gray-300">护眼深色界面</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-3 bg-gray-700 rounded-full"></div>
                        <div className="w-full h-3 bg-gray-600 rounded-full"></div>
                        <div className="w-full h-3 bg-gray-500 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* 卡通主题 */}
                    <div 
                      className={`${styles.themeOption} ${selectedTheme === 'cartoon' ? styles.themeOptionSelected : ''} bg-gradient-to-br from-pink-50 to-blue-50 border border-pink-200 rounded-xl p-6 cursor-pointer`}
                      onClick={() => handleThemeSelect('cartoon')}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                          <i className="fas fa-palette text-white text-xl"></i>
                        </div>
                        <div>
                          <h5 className="font-medium text-text-primary">卡通主题</h5>
                          <p className="text-sm text-text-secondary">活泼可爱的风格</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-3 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full"></div>
                        <div className="w-full h-3 bg-gradient-to-r from-blue-200 to-green-200 rounded-full"></div>
                        <div className="w-full h-3 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 自定义颜色 */}
                <div className="space-y-4">
                  <h4 className="font-medium text-text-primary">自定义主色调</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div 
                      className={`w-16 h-16 bg-blue-500 rounded-lg cursor-pointer border-3 border-transparent ${selectedColor === 'blue' ? 'border-primary' : ''}`}
                      onClick={() => handleColorSelect('blue')}
                    ></div>
                    <div 
                      className={`w-16 h-16 bg-purple-500 rounded-lg cursor-pointer border-3 border-transparent ${selectedColor === 'purple' ? 'border-primary' : ''}`}
                      onClick={() => handleColorSelect('purple')}
                    ></div>
                    <div 
                      className={`w-16 h-16 bg-green-500 rounded-lg cursor-pointer border-3 border-transparent ${selectedColor === 'green' ? 'border-primary' : ''}`}
                      onClick={() => handleColorSelect('green')}
                    ></div>
                    <div 
                      className={`w-16 h-16 bg-orange-500 rounded-lg cursor-pointer border-3 border-transparent ${selectedColor === 'orange' ? 'border-primary' : ''}`}
                      onClick={() => handleColorSelect('orange')}
                    ></div>
                  </div>
                </div>
              </section>
              
              {/* 操作按钮区 */}
              <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:border-gray-400 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className={`${styles.btnGradient} text-white px-6 py-2 rounded-lg text-sm font-medium`}
                >
                  <i className="fas fa-save mr-2"></i>保存设置
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* 成功提示模态框 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">设置保存成功</h3>
              <p className="text-text-secondary mb-6">您的设置已成功保存，部分设置需要刷新页面后生效。</p>
              <button 
                onClick={handleSuccessModalClose}
                className={`${styles.btnGradient} text-white px-6 py-2 rounded-lg text-sm font-medium`}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

