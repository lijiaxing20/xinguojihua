import { api } from '../utils/api';

// 通知类型
export type NotificationType = 'task' | 'wish' | 'feedback' | 'system';

// 通知状态
export type NotificationStatus = 'unread' | 'read';

// 通知接口
export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  status: NotificationStatus;
  relatedId?: number; // 关联的 ID（如任务 ID、心愿 ID）
  createtime: number;
  readtime?: number;
}

// 通知服务
class NotificationService {
  private pollingInterval: number | null = null;
  private pollingCallback: ((notifications: Notification[]) => void) | null = null;
  private lastCheckTime: number = Date.now();
  
  // 获取通知列表
  async getNotifications(params?: {
    type?: NotificationType;
    status?: NotificationStatus;
    page?: number;
    limit?: number;
  }): Promise<{ list: Notification[]; total: number }> {
    try {
      const response = await api.get<{ list: Notification[]; total: number }>('/notification/list', {
        params,
      });
      return response.data;
    } catch (error) {
      // 如果接口不存在，返回空列表
      console.warn('Notification API not available:', error);
      return { list: [], total: 0 };
    }
  }
  
  // 标记为已读
  async markAsRead(ids: number[]): Promise<void> {
    try {
      await api.post('/notification/read', { ids });
    } catch (error) {
      console.warn('Mark notification as read failed:', error);
    }
  }
  
  // 删除通知
  async deleteNotifications(ids: number[]): Promise<void> {
    try {
      await api.post('/notification/delete', { ids });
    } catch (error) {
      console.warn('Delete notification failed:', error);
    }
  }
  
  // 获取未读数量
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<{ count: number }>('/notification/unreadCount');
      return response.data.count || 0;
    } catch (error) {
      console.warn('Get unread count failed:', error);
      return 0;
    }
  }
  
  // 开始轮询（每 30 秒检查一次）
  startPolling(callback: (notifications: Notification[]) => void, interval: number = 30000): void {
    this.pollingCallback = callback;
    
    // 立即执行一次
    this.checkNotifications();
    
    // 设置定时器
    this.pollingInterval = window.setInterval(() => {
      this.checkNotifications();
    }, interval);
  }
  
  // 停止轮询
  stopPolling(): void {
    if (this.pollingInterval !== null) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.pollingCallback = null;
  }
  
  // 检查新通知
  private async checkNotifications(): Promise<void> {
    try {
      const response = await this.getNotifications({
        status: 'unread',
        limit: 10,
      });
      
      // 只通知新通知（基于时间戳）
      const newNotifications = response.list.filter(
        (notif) => notif.createtime > this.lastCheckTime
      );
      
      if (newNotifications.length > 0 && this.pollingCallback) {
        this.pollingCallback(newNotifications);
      }
      
      this.lastCheckTime = Date.now();
    } catch (error) {
      console.error('Check notifications error:', error);
    }
  }
  
  // 显示浏览器通知（需要用户授权）
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }
  
  // 显示浏览器通知
  showBrowserNotification(notification: Notification): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }
    
    new Notification(notification.title, {
      body: notification.content,
      icon: '/favicon.ico',
      tag: `notification-${notification.id}`,
    });
  }
}

// 导出单例
export const notificationService = new NotificationService();

