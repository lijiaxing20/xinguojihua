import { api } from '../utils/api';

// 用户信息接口
export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  email?: string;
  mobile?: string;
  avatar?: string;
  bio?: string;
  role?: 'parent' | 'child';
  [key: string]: any;
}

// 登录参数
export interface LoginParams {
  account: string; // 用户名/手机号/邮箱
  password: string;
}

// 注册参数
export interface RegisterParams {
  username: string;
  password: string;
  email?: string;
  mobile?: string;
  captcha: string; // 图形验证码
}

// 重置密码参数
export interface ResetPasswordParams {
  mobile?: string;
  email?: string;
  newpassword: string;
  captcha: string;
  type?: 'mobile' | 'email';
}

// 认证服务
export const authService = {
  // 登录
  login: async (params: LoginParams): Promise<{ userinfo: UserInfo; token: string }> => {
    const response = await api.post<{ userinfo: UserInfo }>('/user/login', {
      account: params.account,
      password: params.password,
    });

    // 后端返回的 token 嵌套在 userinfo 对象中
    const userinfo = response.data.userinfo;
    const token = userinfo.token || '';

    return {
      userinfo,
      token,
    };
  },
  
  // 手机验证码登录
  mobileLogin: async (mobile: string, captcha: string): Promise<{ userinfo: UserInfo; token: string }> => {
    const response = await api.post<{ userinfo: UserInfo }>('/user/mobilelogin', {
      mobile,
      captcha,
    });

    // 后端返回的 token 嵌套在 userinfo 对象中
    const userinfo = response.data.userinfo;
    const token = userinfo.token || '';

    return {
      userinfo,
      token,
    };
  },
  
  // 注册
  register: async (params: RegisterParams): Promise<{ userinfo: UserInfo; token: string }> => {
    const response = await api.post<{ userinfo: UserInfo }>('/user/register', {
      username: params.username,
      password: params.password,
      email: params.email,
      mobile: params.mobile,
      captcha: params.captcha,
    });

    // 后端返回的 token 嵌套在 userinfo 对象中
    const userinfo = response.data.userinfo;
    const token = userinfo.token || '';

    return {
      userinfo,
      token,
    };
  },
  
  // 退出登录
  logout: async (): Promise<void> => {
    try {
      await api.post('/user/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
  
  // 获取用户信息
  getUserInfo: async (): Promise<UserInfo> => {
    const response = await api.get<{ userinfo: UserInfo }>('/user/index');
    return response.data.userinfo;
  },
  
  // 更新用户资料
  updateProfile: async (params: {
    avatar?: string;
    username?: string;
    nickname?: string;
    bio?: string;
    gender?: string | number;
    birthday?: string;
  }): Promise<void> => {
    await api.post('/user/profile', params);
  },
  
  // 修改邮箱
  changeEmail: async (email: string, captcha: string): Promise<void> => {
    await api.post('/user/changeemail', { email, captcha });
  },
  
  // 修改手机号
  changeMobile: async (mobile: string, captcha: string): Promise<void> => {
    await api.post('/user/changemobile', { mobile, captcha });
  },
  
  // 重置密码
  resetPassword: async (params: ResetPasswordParams): Promise<void> => {
    await api.post('/user/resetpwd', {
      type: params.type || 'mobile',
      mobile: params.mobile,
      email: params.email,
      newpassword: params.newpassword,
      captcha: params.captcha,
    });
  },

  // 修改密码（需要当前密码）
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post('/user/changepwd', {
      oldpassword: oldPassword,
      newpassword: newPassword,
    });
  },
  
  // 检查 Token 是否有效
  checkToken: async (): Promise<{ token: string; expires_in: number }> => {
    const response = await api.get<{ token: string; expires_in: number }>('/token/check');
    return response.data;
  },
  
  // 刷新 Token
  refreshToken: async (): Promise<{ token: string; expires_in: number }> => {
    const response = await api.get<{ token: string; expires_in: number }>('/token/refresh');
    return response.data;
  },
};

