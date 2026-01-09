import { api } from '../utils/api';

export interface EnergyBalance {
  user_id: number;
  energy: number;
}

export interface EnergyLog {
  id: number;
  change_amount: number;
  before: number;
  after: number;
  reason: string;
  reason_text: string;
  related_id?: number;
  createtime: number;
  createtime_text: string;
}

export interface EnergyStatistics {
  current_energy: number;
  today_income: number;
  today_expense: number;
  week_income: number;
  month_income: number;
  total_income: number;
  total_expense: number;
  trend: Array<{
    date: string;
    income: number;
    expense: number;
  }>;
}

export interface EnergyLogsResponse {
  list: EnergyLog[];
  total: number;
  page: number;
  limit: number;
}

export const energyService = {
  // 获取用户当前能量值余额
  getBalance: async (userId?: number): Promise<EnergyBalance> => {
    const response = await api.get<EnergyBalance>('/energy/balance', { params: { user_id: userId } });
    return response.data;
  },

  // 获取能量值收支记录
  getLogs: async (params?: {
    user_id?: number;
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
    reason?: string;
  }): Promise<EnergyLogsResponse> => {
    const response = await api.get<EnergyLogsResponse>('/energy/logs', { params });
    return response.data;
  },

  // 获取能量值统计数据
  getStatistics: async (userId?: number): Promise<EnergyStatistics> => {
    const response = await api.get<EnergyStatistics>('/energy/statistics', { params: { user_id: userId } });
    return response.data;
  },
};
