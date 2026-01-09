

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/Header';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth';
import { uploadService } from '../../services/upload';
import { useToast } from '../../components/Toast';
import styles from './styles.module.css';

interface ProfileFormData {
  nickname: string;
  gender: 'male' | 'female';
  birthday: string;
  phone: string;
  email: string;
  bio: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserProfilePage: React.FC = () => {
  // 获取用户数据
  const { userInfo, updateUserInfo } = useAuthStore();
  
  // 页面标题设置
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '个人资料 - 星火计划';
    return () => { document.title = originalTitle; };
  }, []);

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 表单状态
  const [profileFormData, setProfileFormData] = useState<ProfileFormData>({
    nickname: '',
    gender: 'male',
    birthday: '',
    phone: '',
    email: '',
    bio: ''
  });

  const [originalProfileData, setOriginalProfileData] = useState<ProfileFormData>({
    nickname: '',
    gender: 'male',
    birthday: '',
    phone: '',
    email: '',
    bio: ''
  });

  // 头像状态
  const [avatarSrc, setAvatarSrc] = useState<string>('https://s.coze.cn/image/m7gdB20EvGA/');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Toast Hook
  const { success, error: showError, warning, info } = useToast();

  // UI状态
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);

  // 密码表单状态
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 手机号脱敏处理
  const maskPhone = (phone: string) => {
    if (phone.length === 11) {
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    return phone;
  };

  // 初始化表单数据
  const initializeFormData = () => {
    if (userInfo) {
      let genderValue: any = userInfo.gender;
      // 兼容后端返回的数字格式
      if (genderValue == 1) genderValue = 'male';
      if (genderValue == 2) genderValue = 'female';

      const data = {
        nickname: userInfo.nickname || '',
        gender: genderValue || 'male',
        birthday: userInfo.birthday || '',
        phone: userInfo.mobile ? maskPhone(userInfo.mobile) : '',
        email: userInfo.email || '',
        bio: userInfo.bio || ''
      };

      setProfileFormData(data);
      setOriginalProfileData(data);
      
      if (userInfo.avatar) {
        // 处理头像URL，如果是相对路径，需要拼接
        // 这里简单判断，实际可能需要更严谨的处理
        // 如果是 data: 开头（预览）或 http 开头（完整URL），直接使用
        // 否则认为是相对路径
        let avatarUrl = userInfo.avatar;
        // 注意：这里假设前端通过代理或直接访问后端，相对路径可能需要调整
        // 简单起见，如果后端返回的是相对路径，前端展示时可能需要 base url
        // 但目前的 uploadService 返回的 url 是 /uploads/... 
        // 如果是在 dev 环境，localhost:5173/uploads/... 可能404，除非配置了代理
        // 暂时假设 avatarUrl 是可访问的
        setAvatarSrc(avatarUrl);
      }
    }
  };

  // 初始化数据
  useEffect(() => {
    if (userInfo) {
      initializeFormData();
    }
  }, [userInfo]);

  // 处理头像上传
  const handleAvatarUploadClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file); // 保存文件对象以便后续上传
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarSrc(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理表单输入变化
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理单选框变化
  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileFormData(prev => ({
      ...prev,
      gender: e.target.value as 'male' | 'female'
    }));
  };

  // 处理表单提交
  const handleProfileFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);

    try {
      let currentAvatarUrl = avatarSrc;

      // 如果有新选择的文件，先上传
      if (avatarFile) {
        const uploadRes = await uploadService.uploadImage(avatarFile);
        // 使用返回的URL（通常是相对路径，如 /uploads/20231027/xxx.jpg）
        currentAvatarUrl = uploadRes.url;
      } else if (currentAvatarUrl && currentAvatarUrl.startsWith('data:')) {
        // 如果是Base64但没有文件对象（可能是之前的脏数据），将其重置为空，以便清除后端脏数据
        console.warn('检测到异常头像数据，将自动重置');
        currentAvatarUrl = '';
      }

      // 调用后端API更新用户资料
      await authService.updateProfile({
        nickname: profileFormData.nickname,
        avatar: currentAvatarUrl !== userInfo?.avatar ? currentAvatarUrl : undefined,
        gender: profileFormData.gender,
        birthday: profileFormData.birthday,
        bio: profileFormData.bio
      });

      // 更新本地用户数据
      updateUserInfo({
        nickname: profileFormData.nickname,
        avatar: currentAvatarUrl,
        gender: profileFormData.gender,
        birthday: profileFormData.birthday,
        bio: profileFormData.bio
      });

      setIsSaving(false);
      setOriginalProfileData(profileFormData);
      setAvatarFile(null); // 清除文件对象
      success('个人资料修改成功！');
    } catch (error: any) {
      setIsSaving(false);
      showError(error.message || '保存失败，请重试');
    }
  };

  // 处理取消操作
  const handleCancelClick = () => {
    if (userInfo) {
      let genderValue: any = userInfo.gender;
      // 兼容后端返回的数字格式
      if (genderValue == 1) genderValue = 'male';
      if (genderValue == 2) genderValue = 'female';

      setProfileFormData({
        nickname: userInfo.nickname || '',
        gender: genderValue || 'male',
        birthday: userInfo.birthday || '',
        phone: userInfo.mobile ? maskPhone(userInfo.mobile) : '',
        email: userInfo.email || '',
        bio: userInfo.bio || ''
      });
      
      // 恢复头像
      if (userInfo.avatar) {
        setAvatarSrc(userInfo.avatar);
      } else {
        setAvatarSrc('https://s.coze.cn/image/m7gdB20EvGA/');
      }
      setAvatarFile(null);
    }
    info('已放弃修改');
  };

  // 处理修改密码
  const handleChangePasswordClick = () => {
    setIsChangePasswordModalVisible(true);
  };

  const handleClosePasswordModal = () => {
    setIsChangePasswordModalVisible(false);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      warning('新密码和确认密码不一致');
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      warning('密码长度不能少于6位');
      return;
    }

    setIsChangingPassword(true);

    try {
      // 调用后端API修改密码
      await authService.changePassword(passwordFormData.currentPassword, passwordFormData.newPassword);
      
      setIsChangingPassword(false);
      handleClosePasswordModal();
      success('密码修改成功！');
      
      // 清空密码表单
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      setIsChangingPassword(false);
      showError(error.message || '密码修改失败，请检查当前密码是否正确');
    }
  };

  // 处理其他安全设置项点击
  const handleBindPhoneClick = () => {
    info('手机号已绑定，如需更换请联系客服');
  };

  const handleBindEmailClick = () => {
    info('邮箱已绑定，如需更换请联系客服');
  };

  const handleTwoFactorAuthClick = () => {
    info('两步验证功能开发中，敬请期待');
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
                  className={`${styles.sidebarItem} ${styles.sidebarItemActive} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all`}
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
                <h2 className="text-2xl font-bold text-text-primary mb-2">个人资料</h2>
                <nav className="text-sm text-text-secondary">
                  <span>个人资料</span>
                </nav>
              </div>
            </div>
          </div>

          {/* 个人资料表单 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：基本信息 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-6">基本信息</h3>
                <form onSubmit={handleProfileFormSubmit} className="space-y-6">
                  {/* 头像上传 */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div 
                        onClick={handleAvatarUploadClick}
                        className={`${styles.avatarUploadArea} w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200`}
                      >
                        <img 
                          src={avatarSrc}
                          alt="用户头像" 
                          className="w-full h-full object-cover"
                        />
                        <div className={`${styles.avatarOverlay} text-center`}>
                          <i className="fas fa-camera text-sm"></i>
                        </div>
                      </div>
                      <input 
                        type="file" 
                        ref={avatarInputRef}
                        accept="image/*" 
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">点击头像更换照片</p>
                      <p className="text-xs text-text-secondary">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
                    </div>
                  </div>

                  {/* 昵称 */}
                  <div className="space-y-2">
                    <label htmlFor="nickname" className="block text-sm font-medium text-text-primary">昵称 *</label>
                    <input 
                      type="text" 
                      id="nickname" 
                      name="nickname" 
                      value={profileFormData.nickname}
                      onChange={handleProfileInputChange}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${styles.formInputFocus}`}
                      required
                    />
                  </div>

                  {/* 个人简介 */}
                  <div className="space-y-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-text-primary">个人简介</label>
                    <textarea 
                      id="bio" 
                      name="bio" 
                      value={profileFormData.bio}
                      onChange={handleProfileInputChange}
                      rows={3}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${styles.formInputFocus} resize-none`}
                      placeholder="介绍一下自己吧..."
                    />
                  </div>

                  {/* 性别 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-primary">性别</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="gender" 
                          value="male" 
                          checked={profileFormData.gender === 'male'}
                          onChange={handleGenderChange}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-text-primary">男</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="gender" 
                          value="female" 
                          checked={profileFormData.gender === 'female'}
                          onChange={handleGenderChange}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-text-primary">女</span>
                      </label>
                    </div>
                  </div>

                  {/* 生日 */}
                  <div className="space-y-2">
                    <label htmlFor="birthday" className="block text-sm font-medium text-text-primary">生日</label>
                    <input 
                      type="date" 
                      id="birthday" 
                      name="birthday" 
                      value={profileFormData.birthday}
                      onChange={handleProfileInputChange}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${styles.formInputFocus}`}
                    />
                  </div>

                  {/* 手机号 */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-text-primary">手机号 *</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={userInfo?.mobile ? maskPhone(userInfo.mobile) : '未绑定'}
                      readOnly
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${styles.formInputFocus}`}
                    />
                    <p className="text-xs text-text-secondary">手机号不可修改，如需更换请联系客服</p>
                  </div>

                  {/* 邮箱 */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary">邮箱</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={profileFormData.email}
                      readOnly
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${styles.formInputFocus} bg-gray-50`}
                    />
                    <p className="text-xs text-text-secondary">邮箱不可直接修改，请在右侧安全设置中进行绑定或更换</p>
                  </div>
                </form>
              </div>
            </div>

            {/* 右侧：安全设置 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-6">安全设置</h3>
                <div className="space-y-4">
                  {/* 修改密码 */}
                  <div 
                    onClick={handleChangePasswordClick}
                    className={`${styles.securityItem} flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer transition-all`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-key text-blue-600"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">修改密码</p>
                        <p className="text-xs text-text-secondary">定期更换密码保护账户安全</p>
                      </div>
                    </div>
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </div>

                  {/* 绑定手机 */}
                  <div 
                    onClick={handleBindPhoneClick}
                    className={`${styles.securityItem} flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer transition-all`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-mobile-alt text-green-600"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">绑定手机</p>
                        <p className="text-xs text-text-secondary">已绑定：{userInfo?.mobile ? maskPhone(userInfo.mobile) : '未绑定'}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      userInfo?.mobile ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <i className={`fas ${userInfo?.mobile ? 'fa-check' : 'fa-circle'} mr-1`}></i>
                      {userInfo?.mobile ? '已绑定' : '未绑定'}
                    </span>
                  </div>

                  {/* 绑定邮箱 */}
                  <div 
                    onClick={handleBindEmailClick}
                    className={`${styles.securityItem} flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer transition-all`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-envelope text-yellow-600"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">绑定邮箱</p>
                        <p className="text-xs text-text-secondary">{userInfo?.email || '未绑定'}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      userInfo?.email ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <i className={`fas ${userInfo?.email ? 'fa-check' : 'fa-circle'} mr-1`}></i>
                      {userInfo?.email ? '已绑定' : '未绑定'}
                    </span>
                  </div>

                  {/* 两步验证 */}
                  <div 
                    onClick={handleTwoFactorAuthClick}
                    className={`${styles.securityItem} flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer transition-all`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-shield-alt text-orange-600"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">两步验证</p>
                        <p className="text-xs text-text-secondary">开启后登录更安全</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <i className="fas fa-circle mr-1"></i>未开启
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮区 */}
          <div className="flex justify-end space-x-4 mt-8">
            <button 
              type="button" 
              onClick={handleCancelClick}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:border-gray-400 transition-colors"
            >
              取消
            </button>
            <button 
              type="submit" 
              onClick={handleProfileFormSubmit}
              disabled={isSaving}
              className={`${styles.btnGradient} text-white px-6 py-2 rounded-lg text-sm font-medium`}
            >
              {isSaving ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>保存中...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>保存修改
                </>
              )}
            </button>
          </div>
        </main>
      </div>

      {/* 修改密码弹窗 */}
      {isChangePasswordModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-2xl shadow-card max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-primary">修改密码</h3>
                  <button 
                    onClick={handleClosePasswordModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <form onSubmit={handlePasswordFormSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-text-primary mb-2">当前密码</label>
                    <input 
                      type="password" 
                      id="current-password" 
                      name="currentPassword" 
                      value={passwordFormData.currentPassword}
                      onChange={handlePasswordInputChange}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${styles.formInputFocus}`}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-text-primary mb-2">新密码</label>
                    <input 
                      type="password" 
                      id="new-password" 
                      name="newPassword" 
                      value={passwordFormData.newPassword}
                      onChange={handlePasswordInputChange}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${styles.formInputFocus}`}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-text-primary mb-2">确认新密码</label>
                    <input 
                      type="password" 
                      id="confirm-password" 
                      name="confirmPassword" 
                      value={passwordFormData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${styles.formInputFocus}`}
                      required
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button 
                      type="button" 
                      onClick={handleClosePasswordModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:border-gray-400 transition-colors"
                    >
                      取消
                    </button>
                    <button 
                      type="submit" 
                      disabled={isChangingPassword}
                      className={`flex-1 ${styles.btnGradient} text-white px-4 py-2 rounded-lg text-sm font-medium`}
                    >
                      {isChangingPassword ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>修改中...
                        </>
                      ) : (
                        '确认修改'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;

