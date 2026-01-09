import { create } from 'zustand';
import { Notification } from '../services/notification';
import { notificationService } from '../services/notification';

// 通知状态接口
interface NotificationState {
  // 状态
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  polling: boolean;
  
  // 方法
  fetchNotifications: (params?: {
    type?: Notification['type'];
    status?: Notification['status'];
    page?: number;
    limit?: number;
  }) => Promise<void>;
  markAsRead: (ids: number[]) => Promise<void>;
  deleteNotifications: (ids: number[]) => Promise<void>;
  getUnreadCount: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
}

// 创建通知状态管理
export const useNotificationStore = create<NotificationState>((set, get) => ({
  // 初始状态
  notifications: [],
  unreadCount: 0,
  loading: false,
  polling: false,
  
  // 获取通知列表
  fetchNotifications: async (params) => {
    set({ loading: true });
    try {
      const result = await notificationService.getNotifications(params);
      set({
        notifications: result.list,
        loading: false,
      });
    } catch (error) {
      console.error('Fetch notifications error:', error);
      set({ loading: false });
    }
  },
  
  // 标记为已读
  markAsRead: async (ids: number[]) => {
    try {
      await notificationService.markAsRead(ids);
      
      // 更新本地状态
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          ids.includes(notif.id) ? { ...notif, status: 'read' as const, readtime: Math.floor(Date.now() / 1000) } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - ids.length),
      }));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  },
  
  // 删除通知
  deleteNotifications: async (ids: number[]) => {
    try {
      await notificationService.deleteNotifications(ids);
      
      // 更新本地状态
      set((state) => {
        const deletedIds = new Set(ids);
        const remaining = state.notifications.filter((notif) => !deletedIds.has(notif.id));
        const deletedUnread = state.notifications.filter(
          (notif) => deletedIds.has(notif.id) && notif.status === 'unread'
        ).length;
        
        return {
          notifications: remaining,
          unreadCount: Math.max(0, state.unreadCount - deletedUnread),
        };
      });
    } catch (error) {
      console.error('Delete notifications error:', error);
    }
  },
  
  // 获取未读数量
  getUnreadCount: async () => {
    try {
      const count = await notificationService.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      console.error('Get unread count error:', error);
    }
  },
  
  // 开始轮询
  startPolling: () => {
    if (get().polling) {
      return;
    }
    
    set({ polling: true });
    
    // 请求浏览器通知权限
    notificationService.requestPermission();
    
    // 开始轮询
    notificationService.startPolling((newNotifications) => {
      // 添加新通知
      set((state) => ({
        notifications: [...newNotifications, ...state.notifications],
        unreadCount: state.unreadCount + newNotifications.length,
      }));
      
      // 显示浏览器通知
      newNotifications.forEach((notif) => {
        notificationService.showBrowserNotification(notif);
      });
    });
    
    // 立即获取一次未读数量
    get().getUnreadCount();
  },
  
  // 停止轮询
  stopPolling: () => {
    notificationService.stopPolling();
    set({ polling: false });
  },
  
  // 添加通知（用于本地添加）
  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.status === 'unread' ? state.unreadCount + 1 : state.unreadCount,
    }));
  },
  
  // 清空通知
  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
}));

