

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { uploadService } from '../../services/upload';
import styles from './styles.module.css';

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterFormData {
  username: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  captcha: string;
}

interface ForgotPasswordFormData {
  account: string;
  verificationCode: string;
}

interface MessageState {
  text: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
}

type AuthMode = 'login' | 'register' | 'forgot-password';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, loading } = useAuthStore();
  
  // 如果已登录，重定向到仪表盘
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/parent-dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);
  
  // 表单数据状态
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false
  });

  const [registerFormData, setRegisterFormData] = useState<RegisterFormData>({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    captcha: '',
  });

  const [forgotPasswordFormData, setForgotPasswordFormData] = useState<ForgotPasswordFormData>({
    account: '',
    verificationCode: ''
  });

  // UI状态
  const [currentAuthMode, setCurrentAuthMode] = useState<AuthMode>('login');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [messageState, setMessageState] = useState<MessageState>({
    text: '',
    type: 'info',
    visible: false
  });
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // 开发环境下通过 Vite 代理访问后端，保持与 API 相同的 Session
  const [captchaUrl, setCaptchaUrl] = useState('/api/common/captcha?id=register');

  const refreshCaptcha = () => {
    setCaptchaUrl(`/api/common/captcha?id=register&t=${Date.now()}`);
  };

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '登录 - 星火计划';
    return () => { document.title = originalTitle; };
  }, []);

  // 验证码倒计时
  useEffect(() => {
    let interval: number | null = null;
    if (codeCountdown > 0) {
      interval = window.setInterval(() => {
        setCodeCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [codeCountdown]);

  // 显示消息提示
  const showMessage = (text: string, type: MessageState['type'] = 'info') => {
    setMessageState({ text, type, visible: true });
    
    // 3秒后自动隐藏
    setTimeout(() => {
      setMessageState(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // 切换到登录模式
  const switchToLogin = () => {
    setCurrentAuthMode('login');
    setMessageState(prev => ({ ...prev, visible: false }));
  };

  // 切换到注册模式
  const switchToRegister = () => {
    setCurrentAuthMode('register');
    setMessageState(prev => ({ ...prev, visible: false }));
  };

  // 切换到忘记密码模式
  const switchToForgotPassword = () => {
    setCurrentAuthMode('forgot-password');
    setMessageState(prev => ({ ...prev, visible: false }));
  };

  // 登录表单提交
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginFormData.username.trim() || !loginFormData.password) {
      showMessage('请填写完整的登录信息', 'error');
      return;
    }
    
    setIsLoading(true);
    showMessage('登录中...', 'info');
    
    try {
      await login(loginFormData.username.trim(), loginFormData.password);
      showMessage('登录成功！', 'success');
      
      // 根据用户角色跳转
      setTimeout(() => {
        // 从 location.state 获取重定向地址，或根据用户角色跳转
        const from = (location.state as any)?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else {
          // 默认跳转到家长仪表盘（实际应该根据用户角色判断）
          navigate('/parent-dashboard', { replace: true });
        }
      }, 500);
    } catch (error: any) {
      setIsLoading(false);
      showMessage(error.message || '登录失败，请检查账号密码', 'error');
    }
  };

  // 注册表单提交
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerFormData.username.trim() || !registerFormData.phone.trim() || 
        !registerFormData.email.trim() || !registerFormData.password || 
        !registerFormData.confirmPassword) {
      showMessage('请填写完整的注册信息', 'error');
      return;
    }
    
    if (registerFormData.password.length < 6) {
      showMessage('密码至少需要6位字符', 'error');
      return;
    }
    
    if (registerFormData.password !== registerFormData.confirmPassword) {
      showMessage('两次输入的密码不一致', 'error');
      return;
    }
    
    if (!registerFormData.agreeTerms) {
      showMessage('请阅读并同意用户协议和隐私政策', 'error');
      return;
    }
    
    if (!registerFormData.phone.match(/^1\d{10}$/)) {
      showMessage('请输入正确的手机号', 'error');
      return;
    }

    if (!registerFormData.captcha.trim()) {
      showMessage('请输入图片验证码', 'error');
      return;
    }
    
    setIsLoading(true);
    showMessage('注册中...', 'info');
    
    try {
      // 注意：这里需要用户输入验证码，暂时使用空字符串
      // 实际应该从表单中获取验证码
      await register({
        username: registerFormData.username.trim(),
        password: registerFormData.password,
        email: registerFormData.email.trim(),
        mobile: registerFormData.phone.trim(),
        captcha: registerFormData.captcha.trim(),
      });
      
      showMessage('注册成功！正在跳转...', 'success');
      setTimeout(() => {
        navigate('/parent-dashboard', { replace: true });
      }, 1000);
    } catch (error: any) {
      setIsLoading(false);
      showMessage(error.message || '注册失败，请重试', 'error');
    }
  };

  // 忘记密码表单提交
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordFormData.account.trim() || !forgotPasswordFormData.verificationCode.trim()) {
      showMessage('请填写完整的信息', 'error');
      return;
    }
    
    setIsLoading(true);
    showMessage('验证中...', 'info');
    
    setTimeout(() => {
      setIsLoading(false);
      showMessage('验证成功！请设置新密码', 'success');
      setTimeout(() => {
        switchToLogin();
      }, 2000);
    }, 1500);
  };

  // 发送验证码
  const handleSendVerificationCode = () => {
    if (!forgotPasswordFormData.account.trim()) {
      showMessage('请先输入手机号或邮箱', 'error');
      return;
    }
    
    showMessage('验证码已发送', 'success');
    setCodeCountdown(60);
  };

  // 键盘导航支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (currentAuthMode === 'login') {
          // 在登录页面，清除输入
          setLoginFormData({
            username: '',
            password: '',
            rememberMe: false
          });
        } else if (currentAuthMode === 'register') {
          // 在注册页面，切换到登录
          switchToLogin();
        } else if (currentAuthMode === 'forgot-password') {
          // 在忘记密码页面，返回登录
          switchToLogin();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentAuthMode]);

  return (
    <div className={styles.pageWrapper}>
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-32 h-32 bg-primary opacity-10 rounded-full ${styles.floatingAnimation}`}></div>
        <div className={`absolute top-40 right-20 w-24 h-24 bg-secondary opacity-10 rounded-full ${styles.floatingAnimation}`} style={{animationDelay: '-2s'}}></div>
        <div className={`absolute bottom-40 left-1/4 w-28 h-28 bg-tertiary opacity-10 rounded-full ${styles.floatingAnimation}`} style={{animationDelay: '-4s'}}></div>
        <div className={`absolute bottom-20 right-1/3 w-20 h-20 bg-info opacity-10 rounded-full ${styles.floatingAnimation}`} style={{animationDelay: '-1s'}}></div>
      </div>

      {/* 主内容区 */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* 登录/注册表单卡片 */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-gradient p-8 relative z-10">
          {/* Logo和标题区域 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-main-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-star text-white text-2xl"></i>
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${styles.gradientText}`}>星火计划</h1>
          <p className="text-text-secondary text-sm">激发孩子内在驱动力的家庭互动平台</p>
        </div>

        {/* 消息提示 */}
        {messageState.visible && (
          <div 
            role="alert"
            className={`absolute top-20 left-1/2 -translate-x-1/2 w-auto max-w-sm px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-fade-in-down ${
              messageState.type === 'success' ? 'bg-green-500' :
              messageState.type === 'error' ? 'bg-red-500' :
              messageState.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}>
            {messageState.text}
          </div>
        )}

          {/* 模式切换器 */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button 
              onClick={switchToLogin}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all ${
                currentAuthMode === 'login' 
                  ? `${styles.btnGradient} text-white` 
                  : `text-text-secondary ${styles.modeSwitch}`
              }`}
            >
              登录
            </button>
            <button 
              onClick={switchToRegister}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all ${
                currentAuthMode === 'register' 
                  ? `${styles.btnGradient} text-white` 
                  : `text-text-secondary ${styles.modeSwitch}`
              }`}
            >
              注册
            </button>
          </div>

          {/* 登录表单 */}
          {currentAuthMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-username" className="block text-sm font-medium text-text-primary mb-2">
                  用户名/手机号/邮箱
                </label>
                <input 
                  type="text" 
                  id="login-username" 
                  value={loginFormData.username}
                  onChange={(e) => setLoginFormData(prev => ({ ...prev, username: e.target.value }))}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg transition-all ${styles.formInputFocus}`}
                  placeholder="请输入用户名、手机号或邮箱" 
                  required 
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-text-primary mb-2">
                  密码
                </label>
                <div className="relative">
                  <input 
                    type={showLoginPassword ? 'text' : 'password'} 
                    id="login-password" 
                    value={loginFormData.password}
                    onChange={(e) => setLoginFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg transition-all ${styles.formInputFocus}`}
                    placeholder="请输入密码" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={`fas ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={loginFormData.rememberMe}
                    onChange={(e) => setLoginFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" 
                  />
                  <span className="ml-2 text-sm text-text-secondary">记住密码</span>
                </label>
                <button 
                  type="button" 
                  onClick={switchToForgotPassword}
                  className="text-sm text-primary hover:underline"
                >
                  忘记密码？
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || loading}
                className={`w-full text-white py-3 px-4 rounded-lg font-medium ${styles.btnGradient} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading || loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>登录中...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>登录
                  </>
                )}
              </button>
            </form>
          )}

          {/* 注册表单 */}
          {currentAuthMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label htmlFor="register-username" className="block text-sm font-medium text-text-primary mb-2">
                  用户名
                </label>
                <input 
                  type="text" 
                  id="register-username" 
                  value={registerFormData.username}
                  onChange={(e) => setRegisterFormData(prev => ({ ...prev, username: e.target.value }))}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg transition-all ${styles.formInputFocus}`}
                  placeholder="请输入用户名" 
                  required 
                />
              </div>

              <div>
                <label htmlFor="register-phone" className="block text-sm font-medium text-text-primary mb-2">
                  手机号
                </label>
                <input 
                  type="tel" 
                  id="register-phone" 
                  value={registerFormData.phone}
                  onChange={(e) => setRegisterFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg transition-all ${styles.formInputFocus}`}
                  placeholder="请输入手机号" 
                  required 
                />
              </div>

              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-text-primary mb-2">
                  邮箱
                </label>
                <input 
                  type="email" 
                  id="register-email" 
                  value={registerFormData.email}
                  onChange={(e) => setRegisterFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg transition-all ${styles.formInputFocus}`}
                  placeholder="请输入邮箱" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  图形验证码
                </label>
                <div className="flex space-x-3 items-center">
                  <input 
                    type="text" 
                    id="register-captcha" 
                    value={registerFormData.captcha}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, captcha: e.target.value }))}
                    className={`flex-1 px-4 py-3 border border-gray-300 rounded-lg transition-all ${styles.formInputFocus}`}
                    placeholder="请输入图片中的验证码" 
                    required 
                  />
                  <img
                    src={captchaUrl}
                    alt="captcha"
                    onClick={refreshCaptcha}
                    className="w-28 h-12 border border-gray-300 rounded-lg cursor-pointer object-cover"
                    title="看不清？点击刷新"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-text-primary mb-2">
                  密码
                </label>
                <div className="relative">
                  <input 
                    type={showRegisterPassword ? 'text' : 'password'} 
                    id="register-password" 
                    value={registerFormData.password}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg transition-all ${styles.formInputFocus}`}
                    placeholder="请输入密码（至少6位）" 
                    required 
                    minLength={6}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={`fas ${showRegisterPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="register-confirm-password" className="block text-sm font-medium text-text-primary mb-2">
                  确认密码
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    id="register-confirm-password" 
                    value={registerFormData.confirmPassword}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg transition-all ${styles.formInputFocus}`}
                    placeholder="请再次输入密码" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="flex items-start">
                <input 
                  type="checkbox" 
                  id="agree-terms" 
                  checked={registerFormData.agreeTerms}
                  onChange={(e) => setRegisterFormData(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary mt-1" 
                  required 
                />
                <label htmlFor="agree-terms" className="ml-2 text-sm text-text-secondary">
                  我已阅读并同意
                  <button type="button" className="text-primary hover:underline">《用户协议》</button>
                  和
                  <button type="button" className="text-primary hover:underline">《隐私政策》</button>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || loading}
                className={`w-full text-white py-3 px-4 rounded-lg font-medium ${styles.btnGradient} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading || loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>注册中...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus mr-2"></i>注册
                  </>
                )}
              </button>
            </form>
          )}

          {/* 忘记密码表单 */}
          {currentAuthMode === 'forgot-password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-text-primary mb-2">重置密码</h3>
                <p className="text-sm text-text-secondary">请输入您的手机号或邮箱，我们将发送验证码</p>
              </div>

              <div>
                <label htmlFor="forgot-account" className="block text-sm font-medium text-text-primary mb-2">
                  手机号/邮箱
                </label>
                <input 
                  type="text" 
                  id="forgot-account" 
                  value={forgotPasswordFormData.account}
                  onChange={(e) => setForgotPasswordFormData(prev => ({ ...prev, account: e.target.value }))}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg transition-all ${styles.formInputFocus}`}
                  placeholder="请输入手机号或邮箱" 
                  required 
                />
              </div>

              <div className="flex space-x-3">
                <input 
                  type="text" 
                  id="verification-code" 
                  value={forgotPasswordFormData.verificationCode}
                  onChange={(e) => setForgotPasswordFormData(prev => ({ ...prev, verificationCode: e.target.value }))}
                  className={`flex-1 px-4 py-3 border border-gray-300 rounded-lg transition-all ${styles.formInputFocus}`}
                  placeholder="验证码" 
                  required 
                  maxLength={6}
                />
                <button 
                  type="button" 
                  onClick={handleSendVerificationCode}
                  disabled={codeCountdown > 0}
                  className="px-4 py-3 bg-gray-100 text-text-secondary rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  {codeCountdown > 0 ? `${codeCountdown}秒后重发` : '发送验证码'}
                </button>
              </div>

              <div className="flex space-x-3">
                <button 
                  type="button" 
                  onClick={switchToLogin}
                  className="flex-1 py-3 px-4 border border-gray-300 text-text-secondary rounded-lg hover:border-primary hover:text-primary transition-colors"
                >
                  返回登录
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`flex-1 text-white py-3 px-4 rounded-lg font-medium ${styles.btnGradient}`}
                >
                  下一步
                </button>
              </div>
            </form>
          )}

          {/* 消息提示 */}
          {messageState.visible && (
            <div className="mt-4 p-3 rounded-lg">
              <div className="flex items-center">
                <i className={`mr-2 ${
                  messageState.type === 'success' ? 'fas fa-check-circle text-green-600' :
                  messageState.type === 'error' ? 'fas fa-exclamation-circle text-red-600' :
                  messageState.type === 'warning' ? 'fas fa-exclamation-triangle text-yellow-600' :
                  'fas fa-info-circle text-blue-600'
                }`}></i>
                <span className={
                  messageState.type === 'success' ? 'text-green-600' :
                  messageState.type === 'error' ? 'text-red-600' :
                  messageState.type === 'warning' ? 'text-yellow-600' :
                  'text-blue-600'
                }>
                  {messageState.text}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 底部装饰 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-text-secondary text-sm">
            <i className={`fas fa-heart text-danger mr-1 ${styles.pulseAnimation}`}></i>
            让每个孩子都成为自己成长的主人
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

