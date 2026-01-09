import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
// import { useAuthStore } from '../store/authStore'; // Avoid circular dependency

// API 基础配置
// 开发环境下通过 Vite 代理转发到后端，避免跨域和 Session 不一致问题
// 生产环境可通过 VITE_API_BASE_URL 配置完整域名
const API_PREFIX = '/api';
const API_BASE_URL =
  import.meta.env.DEV
    ? 'http://www.xinghuojihua.com'
    : (import.meta.env.VITE_API_BASE_URL || '');

// FastAdmin API 响应格式
export interface ApiResponse<T = any> {
  code: number; // 1=成功, 0=失败
  msg: string;
  data: T;
}

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get token from localStorage to avoid circular dependency with authStore
const getToken = () => {
  try {
    const storage = localStorage.getItem('auth-storage');
    if (storage) {
      const parsed = JSON.parse(storage);
      const token = parsed.state?.token;
      // console.log('DEBUG: getToken type:', typeof token, 'value:', token ? token.substring(0, 10) + '...' : 'null');
      return typeof token === 'string' ? token : null;
    }
  } catch (e) {
    // Ignore error
  }
  return null;
};

// 请求拦截器 - 添加 Token
apiClient.interceptors.request.use(
  (config) => {
    // 从 store 获取 token
    try {
      const token = getToken();
      if (token) {
        // Clone headers to avoid issues with AxiosHeaders object
        config.headers = config.headers || {};
        (config.headers as any)['token'] = token;

        // 同时支持 token 参数方式
        const method = config.method?.toLowerCase() || 'get';
        if (method === 'get') {
          config.params = config.params || {};
          config.params.token = token;
        } else {
          config.data = config.data || {};
          if (typeof config.data === 'object' && !(config.data instanceof FormData)) {
            config.data.token = token;
          }
        }
      }
    } catch (e) {
      // Ignore error in interceptor to prevent request failure
      console.error('Token injection failed', e);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理响应
apiClient.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    // 例如，如果后端返回的数据结构是 { code, msg, data }，可以在这里统一处理
    if (response.data.code === 0) {
      // 业务逻辑失败，可以根据需要抛出错误或返回特定值
      return Promise.reject(new Error(response.data.msg || 'Error'));
    }
    
    return response.data;
  },
  (error: AxiosError) => {
    // HTTP 错误处理
    if (error.response) {
      const { status, data } = error.response;
      
      // 401 未授权，清除 token 并跳转登录
      if (status === 401) {
        handleTokenExpired();
        return Promise.reject(new Error('登录已过期，请重新登录'));
      }
      
      // 403 无权限
      if (status === 403) {
        return Promise.reject(new Error('无权限访问'));
      }
      
      // 其他错误
      const apiData = data as any;
      return Promise.reject(new Error(apiData?.msg || `请求失败: ${status}`));
    }
    
    // 网络错误
    if (error.request) {
      return Promise.reject(new Error('网络连接失败，请检查网络'));
    }
    
    return Promise.reject(error);
  }
);

// 处理 Token 过期的函数
function handleTokenExpired() {
  // 延迟执行，避免多个请求同时触发
  setTimeout(() => {
    // 检查是否已在处理，避免重复执行
    if ((window as any).isHandlingTokenExpiration) return;
    (window as any).isHandlingTokenExpiration = true;

    // 触发事件，通知 App 组件清除认证状态
    window.dispatchEvent(new Event('auth-expired'));

    // 延迟一小段时间再跳转，确保状态清除完成
    setTimeout(() => {
      window.location.href = '/login';
      (window as any).isHandlingTokenExpiration = false;
    }, 100);
  }, 200);
}

// API 请求方法封装
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiClient.get(url, config);
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiClient.post(url, data, config);
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiClient.put(url, data, config);
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiClient.delete(url, config);
  },
  
  // 文件上传
  upload: (url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<{ url: string; fullurl: string }>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },
};

export default apiClient;

