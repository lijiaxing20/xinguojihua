import { api } from '../utils/api';

// 上传文件响应
export interface UploadResponse {
  url: string; // 相对路径
  fullurl: string; // 完整 URL
}

// 上传选项
export interface UploadOptions {
  onProgress?: (progress: number) => void;
  accept?: string; // 文件类型限制，如 'image/*', 'video/*'
  maxSize?: number; // 最大文件大小（字节）
}

// 文件上传服务
export const uploadService = {
  // 上传文件
  upload: async (file: File, options?: UploadOptions): Promise<UploadResponse> => {
    // 检查文件大小
    if (options?.maxSize && file.size > options.maxSize) {
      throw new Error(`文件大小不能超过 ${(options.maxSize / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // 检查文件类型
    if (options?.accept) {
      const acceptTypes = options.accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      
      const isValid = acceptTypes.some(accept => {
        if (accept === '*/*') return true;
        if (accept.endsWith('/*')) {
          const baseType = accept.split('/')[0];
          return fileType.startsWith(baseType + '/');
        }
        return fileType === accept || fileName.endsWith(accept.replace('*', ''));
      });
      
      if (!isValid) {
        throw new Error(`不支持的文件类型，请上传 ${options.accept} 格式的文件`);
      }
    }
    
    try {
      const response = await api.upload(
        '/common/upload',
        file,
        options?.onProgress
      );
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || '文件上传失败');
    }
  },
  
  // 上传图片
  uploadImage: async (file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
    return uploadService.upload(file, {
      accept: 'image/*',
      maxSize: 10 * 1024 * 1024, // 10MB
      onProgress,
    });
  },
  
  // 上传视频
  uploadVideo: async (file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
    return uploadService.upload(file, {
      accept: 'video/*',
      maxSize: 100 * 1024 * 1024, // 100MB
      onProgress,
    });
  },
  
  // 批量上传
  uploadMultiple: async (
    files: File[],
    options?: UploadOptions
  ): Promise<UploadResponse[]> => {
    const uploadPromises = files.map(file => uploadService.upload(file, options));
    return Promise.all(uploadPromises);
  },
  
  // 获取验证码图片 URL
  getCaptchaUrl: (id: string = 'captcha'): string => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://www.xinghuojihua.com';
    return `${baseURL}/api/common/captcha?id=${id}`;
  },
};

