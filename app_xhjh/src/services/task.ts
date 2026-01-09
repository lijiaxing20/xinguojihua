import { api } from '../utils/api';
// 导入统一的类型定义
import type {
  Task,
  TaskStatus,
  TaskCategory,
  TaskCheckin,
  ParentFeedback,
  TaskListParams,
  TaskCreateParams,
  TaskCheckinParams,
  ParentFeedbackParams,
} from '../types/task';

// 重新导出类型，供其他模块使用
export type {
  Task,
  TaskStatus,
  TaskCategory,
  TaskCheckin,
  ParentFeedback,
  TaskListParams,
  TaskCreateParams,
  TaskCheckinParams,
  ParentFeedbackParams,
};

// 作品接口（保留在这里，因为只在服务层使用）
export interface Work {
  id: number;
  user_id: number;
  checkin_time: number;
  content_type: string;
  content_url: string;
  text_content: string;
  task_name: string;
  category: string;
  child_name: string;
  child_avatar: string;
}

// 任务服务
export const taskService = {
  // 获取任务列表
  getTaskList: async (params?: {
    status?: TaskStatus;
    category?: TaskCategory;
    keyword?: string;
    assignee_id?: number;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<{ list: Task[]; total: number }> => {
    const response = await api.get<{ list: Task[]; total: number }>('/task/list', { params });
    return response.data;
  },
  
  // 获取任务详情
  getTaskDetail: async (taskId: number): Promise<Task> => {
    const response = await api.get<Task>(`/task/detail/${taskId}`);
    return response.data;
  },
  
  // 创建任务（孩子端）
  createTask: async (params: {
    task_name: string;
    description?: string;
    category: TaskCategory;
    target_date?: string;
  }): Promise<Task> => {
    const response = await api.post<Task>('/task/create', params);
    return response.data;
  },
  
  // 更新任务
  updateTask: async (params: {
    id: number;
    task_name?: string;
    description?: string;
    category?: TaskCategory;
    target_date?: string;
    energy_value?: number;
  }): Promise<Task> => {
    const response = await api.post<Task>('/task/update', params);
    return response.data;
  },

  // 建议任务（家长端）
  suggestTask: async (params: {
    task_name: string;
    description?: string;
    category: TaskCategory;
    target_date?: string;
    assignee_user_id: number; // 分配给哪个孩子
    energy_value?: number;
  }): Promise<Task> => {
    const response = await api.post<Task>('/task/suggest', params);
    return response.data;
  },
  
  // 确认任务（家长端）
  confirmTask: async (taskId: number, action: 'confirm' | 'reject', suggestion?: string): Promise<void> => {
    await api.post(`/task/confirm/${taskId}`, { action, suggestion });
  },
  
  // 任务打卡
  checkinTask: async (taskId: number, params: {
    content_type: 'text' | 'image' | 'video' | 'diary';
    content_url?: string;
    text_content?: string;
  }): Promise<TaskCheckin> => {
    const response = await api.post<TaskCheckin>(`/task/checkin/${taskId}`, params);
    return response.data;
  },
  
  // 提供家长反馈
  provideFeedback: async (checkinId: number, params: {
    feedback_content: string;
    emoji_type?: 'like' | 'hug' | 'cheer' | 'praise';
  }): Promise<ParentFeedback> => {
    const response = await api.post<ParentFeedback>(`/task/feedback/${checkinId}`, params);
    return response.data;
  },
  
  // 删除任务
  deleteTask: async (taskId: number): Promise<void> => {
    await api.delete(`/task/delete/${taskId}`);
  },
  // 获取作品墙
  getWorks: async (params?: {
    user_id?: number;
    page?: number;
    limit?: number;
  }): Promise<{ list: Work[]; total: number }> => {
    const response = await api.get<{ list: Work[]; total: number }>('/task/works', { params });
    return response.data;
  },
};

