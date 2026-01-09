import { api } from '../utils/api';

export interface Badge {
  id: number;
  badge_name: string;
  badge_type: string;
  icon: string;
  icon_url?: string;
  description: string;
  awarded_at?: number;
  energy_threshold?: number;
  task_count_threshold?: number;
  is_achieved?: boolean;
}

export interface BadgeCategory {
  type: string;
  name: string;
  description: string;
  icon: string;
}

export const badgeService = {
  // 获取用户徽章列表
  getUserBadges: async (userId?: number): Promise<Badge[]> => {
    const response = await api.get<Badge[]>('/badge/user_badges', { params: { user_id: userId } });
    return response.data;
  },

  // 获取所有可用勋章列表（包含获得状态）
  getAllBadges: async (): Promise<Badge[]> => {
    const response = await api.get<Badge[]>('/badge/list');
    return response.data;
  },

  // 获取勋章详情
  getBadgeDetail: async (id: number): Promise<Badge> => {
    const response = await api.get<Badge>(`/badge/detail`, { params: { id } });
    return response.data;
  },

  // 获取勋章分类
  getBadgeCategories: async (): Promise<BadgeCategory[]> => {
    const response = await api.get<BadgeCategory[]>('/badge/categories');
    return response.data;
  },
};
