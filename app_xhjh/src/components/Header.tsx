import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ChildSelector } from './ChildSelector';
import styles from './Header.module.css';
import { notificationService } from '../services/notification';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo, logout } = useAuthStore();
  const [globalSearchValue, setGlobalSearchValue] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    // 获取未读通知数量
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('获取未读通知失败', error);
      }
    };
    
    fetchUnreadCount();
    // 可以在这里设置定时器轮询
  }, []);

  const handleGlobalSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const searchTerm = globalSearchValue.trim();
      if (searchTerm) {
        navigate(`/task-list?keyword=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  const handleNotificationButtonClick = () => {
    // 显示通知列表或跳转到通知页面
    console.log('显示通知列表');
  };

  const handleUserAvatarButtonClick = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    if (window.confirm('确定要退出登录吗？')) {
        await logout();
        navigate('/login');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* Logo和产品名称 */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center">
            <i className="fas fa-star text-white text-lg"></i>
          </div>
          <h1 className={`text-xl font-bold ${styles.gradientText}`}>星火计划</h1>
        </div>
        
        {/* 全局搜索框 */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <input 
              type="text" 
              placeholder="搜索任务、心愿..." 
              value={globalSearchValue}
              onChange={(e) => setGlobalSearchValue(e.target.value)}
              onKeyPress={handleGlobalSearchKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
        
        {/* 右侧操作区 */}
        <div className="flex items-center space-x-4">
          {/* 消息通知 */}
          <button 
            onClick={handleNotificationButtonClick}
            className="relative p-2 text-gray-600 hover:text-primary transition-colors"
          >
            <i className="fas fa-bell text-lg"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-danger text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* 快速切换孩子 */}
          <ChildSelector />
          
          {/* 用户头像和下拉菜单 */}
          <div 
            className="relative"
            onMouseEnter={() => setIsUserMenuOpen(true)}
            onMouseLeave={() => setIsUserMenuOpen(false)}
          >
            <button 
              onClick={handleUserAvatarButtonClick}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors focus:outline-none block"
            >
              <img 
                src={userInfo?.avatar || "https://s.coze.cn/image/IJO1FSt2Zro/"} 
                alt={userInfo?.nickname || "家长头像"} 
                className="w-full h-full object-cover"
              />
            </button>
            
            {/* 下拉菜单 */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{userInfo?.nickname || '家长'}</p>
                  <p className="text-xs text-gray-500 truncate">{userInfo?.username || ''}</p>
                </div>
                <button 
                  onClick={() => { setIsUserMenuOpen(false); navigate('/user-profile'); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <i className="fas fa-user w-5 text-gray-400"></i>
                  个人中心
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 flex items-center"
                >
                  <i className="fas fa-sign-out-alt w-5"></i>
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
