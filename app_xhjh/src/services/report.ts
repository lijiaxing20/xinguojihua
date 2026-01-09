import { api } from '../utils/api';

export interface ReportStats {
    task: {
        total: number;
        completed: number;
        completion_rate: number;
        checkin_count: number;
        by_category: { category: string; count: number }[];
    };
    energy: {
        earned: number;
        spent: number;
        current: number;
    };
    badge: {
        new: number;
        total: number;
        list: {
            id: number;
            badge_name: string;
            icon: string;
            description: string;
            awarded_at: number;
        }[];
    };
    wish: {
        total: number;
        fulfilled: number;
    };
    daily_trend: {
        date: string;
        checkin_count: number;
        energy_earned: number;
    }[];
    week_start?: string;
    week_end?: string;
    month?: string;
}

export const reportService = {
    getWeeklyReport: async (params?: { user_id?: number; week_start?: string }): Promise<ReportStats> => {
        const response = await api.get<ReportStats>('/report/weekly', { params });
        return response.data;
    },
    getMonthlyReport: async (params?: { user_id?: number; month?: string }): Promise<ReportStats> => {
        const response = await api.get<ReportStats>('/report/monthly', { params });
        return response.data;
    }
};
