/**
 * 统一的任务相关类型定义
 * 所有任务相关的类型都应该从这里导入，确保类型一致性
 */

// 任务状态
export type TaskStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'rejected';

// 任务分类
export type TaskCategory = 'habit' | 'learning' | 'interest' | 'family';

// 任务接口
export interface Task {
  id: number;
  family_id: number;
  creator_user_id: number;
  assignee_user_id?: number;
  task_name: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  target_date?: string;
  createtime: number;
  updatetime: number;
  energy_value?: number; // 能量值
  checkins?: TaskCheckin[]; // 打卡记录
  // 兼容旧字段名
  name?: string; // 任务名称的别名
  energy?: number; // 能量值的别名
  targetDate?: string; // target_date 的别名
}

// 任务打卡接口
export interface TaskCheckin {
  id: number;
  task_id: number;
  user_id: number;
  checkin_time: string;
  content_type: 'text' | 'image' | 'video' | 'diary';
  content_url?: string;
  text_content?: string;
  energy_awarded?: number;
  badge_awarded_id?: number;
  parent_feedback?: ParentFeedback;
}

// 家长反馈接口
export interface ParentFeedback {
  id: number;
  checkin_id: number;
  parent_user_id: number;
  feedback_content: string;
  emoji_type?: 'like' | 'hug' | 'cheer' | 'praise';
  created_at: string;
}

// 作品接口
export interface Work {
  id: number;
  user_id: number;
  checkin_time: number;
  content_type: string;
  content_url: string;
  text_content: string;
  task_name: string;
}

// 任务列表参数
export interface TaskListParams {
  page?: number;
  pageSize?: number;
  status?: TaskStatus;
  category?: TaskCategory;
  sortBy?: 'createtime' | 'updatetime' | 'energy_value' | 'task_name';
  sortOrder?: 'desc' | 'asc';
}

// 任务创建参数
export interface TaskCreateParams {
  task_name: string;
  description?: string;
  category: TaskCategory;
  target_date?: string;
  energy_value?: number;
  assignee_user_id?: number;
}

// 任务打卡参数
export interface TaskCheckinParams {
  task_id: number;
  content_type: 'text' | 'image' | 'video' | 'diary';
  content_url?: string;
  text_content?: string;
}

// 家长反馈参数
export interface ParentFeedbackParams {
  checkin_id: number;
  feedback_content: string;
  emoji_type?: 'like' | 'hug' | 'cheer' | 'praise';
}
