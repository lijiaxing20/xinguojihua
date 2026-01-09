import { api } from '../utils/api';

// 仪表盘统计数据接口
export interface DashboardStatistics {
  today: {
    task_completed: number;
    checkin_count: number;
    energy_earned: number;
  };
  week: {
    task_completed: number;
    checkin_count: number;
    energy_earned: number;
  };
  total: {
    total_tasks: number;
    pending_tasks: number;
    in_progress_tasks: number;
    completed_tasks: number;
    total_checkins: number;
    total_energy: number;
    total_badges: number;
    fulfilled_wishes: number;
  };
  category_distribution: Array<{
    count: number;
    category: string;
  }>;
  checkin_trend: Array<{
    date: string;
    count: number;
  }>;
  recent_pending_tasks?: Array<{
    id: number;
    title: string;
    createtime: number;
  }>;
  recent_in_progress_tasks?: Array<{
    id: number;
    title: string;
    updatetime: number;
  }>;
  recent_badges?: Array<{
    id: number;
    badge_name: string;
    badge_type: string;
    icon: string;
    description: string;
    awarded_at: number;
  }>;
  recent_feedback?: Array<{
    id: number;
    feedback_content: string;
    emoji_type: string;
    createtime: number;
    parent_name: string;
    parent_avatar: string;
    task_name: string;
    task_id: number;
  }>;
}

// 家庭统计接口
export interface FamilyStatistics {
  children: Array<{
    user_id: number;
    nickname: string;
    avatar: string;
    total_tasks: number;
    completed_tasks: number;
    total_energy: number;
    total_badges: number;
  }>;
}

// 统计服务
export const statisticsService = {
  // 获取仪表盘统计数据
  getDashboardStats: async (params?: {
    user_id?: number;
  }): Promise<DashboardStatistics> => {
    const response = await api.get<DashboardStatistics>('/statistics/dashboard', { params });
    return response.data;
  },

  // 获取家庭统计（家长端）
  getFamilyStats: async (): Promise<FamilyStatistics> => {
    const response = await api.get<FamilyStatistics>('/statistics/family');
    return response.data;
  },
};

