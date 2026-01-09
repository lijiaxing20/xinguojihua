import { api } from '../utils/api';

// 心愿状态
export type WishStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled';

// 心愿接口
export interface Wish {
  id: number;
  user_id: number;
  family_id: number;
  wish_name: string;
  description?: string;
  required_energy: number;
  status: WishStatus;
  createtime: number;
  updatetime: number;
}

// 心愿服务
export const wishService = {
  // 获取心愿列表
  getWishList: async (params?: {
    status?: WishStatus;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    keyword?: string;
    user_id?: number;
  }): Promise<{ list: Wish[]; total: number }> => {
    const response = await api.get<{ list: Wish[]; total: number }>('/wish/list', { params });
    return response.data;
  },
  
  // 获取心愿详情
  getWishDetail: async (wishId: number): Promise<Wish> => {
    const response = await api.get<Wish>(`/wish/detail/${wishId}`);
    return response.data;
  },
  
  // 创建心愿（孩子端或家长代创建）
  createWish: async (params: {
    wish_name: string;
    description?: string;
    required_energy?: number; // 建议能量值，最终由家长审核
    user_id?: number; // 目标用户ID（家长代创建时必填）
  }): Promise<Wish> => {
    const response = await api.post<Wish>('/wish/create', params);
    return response.data;
  },
  
  // 审核心愿（家长端）
  reviewWish: async (wishId: number, params: {
    action: 'approve' | 'reject';
    required_energy?: number; // 家长设定的能量值
    reason?: string; // 拒绝原因
  }): Promise<Wish> => {
    const response = await api.post<Wish>(`/wish/review/${wishId}`, params);
    return response.data;
  },
  
  // 申请实现心愿（孩子端）
  fulfillWish: async (wishId: number): Promise<Wish> => {
    const response = await api.post<Wish>(`/wish/fulfill/${wishId}`);
    return response.data;
  },
  
  // 确认心愿实现（家长端）
  confirmFulfillment: async (wishId: number): Promise<Wish> => {
    const response = await api.post<Wish>(`/wish/confirm/${wishId}`);
    return response.data;
  },
  
  // 编辑心愿
  updateWish: async (wishId: number, params: Partial<{
    wish_name: string;
    description: string;
    required_energy: number;
  }>): Promise<Wish> => {
    const response = await api.post<Wish>('/wish/update', {
      id: wishId,
      ...params
    });
    return response.data;
  },
  
  // 删除心愿
  deleteWish: async (wishId: number): Promise<void> => {
    await api.delete(`/wish/delete/${wishId}`);
  },
};

