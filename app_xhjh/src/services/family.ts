import { api } from '../utils/api';

// 家庭成员角色
export type FamilyRole = 'parent' | 'child';

// 家庭成员接口
export interface FamilyMember {
  id: number;
  user_id: number;
  role: FamilyRole;
  nickname: string;
  avatar: string;
  joined_at: number;
  is_creator?: boolean;
}

// 家庭信息接口
export interface Family {
  id: number;
  family_name: string;
  creator_user_id: number;
  members: FamilyMember[];
  settings?: any;
}

// 家庭服务
export const familyService = {
  // 获取我的家庭信息
  getFamilyInfo: async (): Promise<{ has_family: boolean; family?: Family }> => {
    const response = await api.get<{ has_family: boolean; family?: Family }>('/family/info');
    return response.data;
  },

  // 创建家庭
  createFamily: async (params: {
    family_name?: string;
  }): Promise<{ family_id: number; family_name: string }> => {
    const response = await api.post<{ family_id: number; family_name: string }>('/family/create', params);
    return response.data;
  },

  // 邀请家庭成员
  inviteMember: async (params: {
    user_id: number;
    role: FamilyRole;
  }): Promise<void> => {
    await api.post('/family/invite', params);
  },

  // 直接创建孩子账号
  createChild: async (data: { nickname: string; gender: number; birthday?: string; avatar?: string }): Promise<{ user_id: number; nickname: string; avatar: string }> => {
    const response = await api.post('/family/create-child', data);
    return response.data;
  },

  // 通过联系方式邀请
  inviteByContact: async (params: {
    contact: string; // 手机号或邮箱
    role: FamilyRole;
  }): Promise<void> => {
    await api.post('/family/inviteByContact', params);
  },

  // 获取家庭成员列表
  getMembers: async (): Promise<{ list: FamilyMember[] }> => {
    const response = await api.get<{ list: FamilyMember[] }>('/family/members');
    return response.data;
  },

  // 更新成员信息
  updateMember: async (params: {
    user_id: number;
    nickname?: string;
    avatar?: string;
    role?: FamilyRole;
  }): Promise<void> => {
    await api.post('/family/updateMember', params);
  },

  // 移除家庭成员
  removeMember: async (params: {
    user_id: number;
  }): Promise<void> => {
    await api.post('/family/removeMember', params);
  },

  // 退出家庭
  leaveFamily: async (): Promise<void> => {
    await api.post('/family/leave');
  },

  // 解散家庭
  dissolveFamily: async (): Promise<void> => {
    await api.post('/family/dissolve');
  },

  // 更新家庭设置
  updateSettings: async (settings: any): Promise<void> => {
    await api.post('/family/update-settings', { settings });
  },

  // 搜索用户（用于邀请）
  searchUser: async (params: {
    keyword: string;
  }): Promise<{
    list: Array<{
      id: number;
      nickname: string;
      username: string;
      avatar: string;
      mobile?: string;
      email?: string;
      has_family: boolean;
    }>;
  }> => {
    const response = await api.get<{
      list: Array<{
        id: number;
        nickname: string;
        username: string;
        avatar: string;
        mobile?: string;
        email?: string;
        has_family: boolean;
      }>;
    }>('/family/searchUser', { params });
    return response.data;
  },
};

