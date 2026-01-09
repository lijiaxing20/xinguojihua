import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserInfo } from '../services/auth';
import { authService } from '../services/auth';

// 认证状态接口
interface AuthState {
  // 状态
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  token: string | null;
  loading: boolean;
  isHydrated: boolean; // 新增状态，用于标记是否已完成状态恢复
  
  // 方法
  login: (account: string, password: string) => Promise<void>;
  mobileLogin: (mobile: string, captcha: string) => Promise<void>;
  register: (params: {
    username: string;
    password: string;
    email?: string;
    mobile?: string;
    captcha: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUserInfo: (userInfo: Partial<UserInfo>) => void;
  refreshUserInfo: () => Promise<void>;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

// 创建认证状态管理
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      isAuthenticated: false,
      userInfo: null,
      token: null,
      loading: false,
      isHydrated: false, // 新增状态，用于标记是否已完成状态恢复
      
      // 登录
      login: async (account: string, password: string) => {
        set({ loading: true });
        try {
          const { userinfo, token } = await authService.login({ account, password });
          
          set({
            isAuthenticated: true,
            userInfo: userinfo,
            token,
            loading: false,
          });
        } catch (error: any) {
          set({ loading: false });
          throw error;
        }
      },
      
      // 手机验证码登录
      mobileLogin: async (mobile: string, captcha: string) => {
        set({ loading: true });
        try {
          const { userinfo, token } = await authService.mobileLogin(mobile, captcha);
          
          set({
            isAuthenticated: true,
            userInfo: userinfo,
            token,
            loading: false,
          });
        } catch (error: any) {
          set({ loading: false });
          throw error;
        }
      },
      
      // 注册
      register: async (params) => {
        set({ loading: true });
        try {
          const { userinfo, token } = await authService.register(params);
          
          set({
            isAuthenticated: true,
            userInfo: userinfo,
            token,
            loading: false,
          });
        } catch (error: any) {
          set({ loading: false });
          throw error;
        }
      },
      
      // 退出登录
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().clearAuth();
        }
      },
      
      // 更新用户信息（本地）
      updateUserInfo: (userInfo: Partial<UserInfo>) => {
        const currentUserInfo = get().userInfo;
        if (currentUserInfo) {
          set({
            userInfo: { ...currentUserInfo, ...userInfo },
          });
        }
      },
      
      // 刷新用户信息（从服务器）
      refreshUserInfo: async () => {
        try {
          const userInfo = await authService.getUserInfo();
          set({ userInfo });
        } catch (error) {
          console.error('Refresh user info error:', error);
          // 不要在这里盲目清除认证状态，API 拦截器会处理 401 错误
          // 只有在明确需要时才清除
        }
      },
      
      // 设置 Token
      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },
      
      // 清除认证状态
      clearAuth: () => {
        set({
          isAuthenticated: false,
          userInfo: null,
          token: null,
        });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
      partialize: (state) => ({
        // 只持久化必要的字段
        token: state.token,
        userInfo: state.userInfo,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

