// 本地存储工具类

// localStorage 封装
export const storage = {
  // 设置
  set: <T>(key: string, value: T): void => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },
  
  // 获取
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue || null;
    }
  },
  
  // 删除
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },
  
  // 清空
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
  
  // 检查是否存在
  has: (key: string): boolean => {
    return localStorage.getItem(key) !== null;
  },
};

// IndexedDB 封装（用于存储大量数据）
class IndexedDBStorage {
  private dbName: string = 'xinghuojihua_db';
  private version: number = 1;
  private db: IDBDatabase | null = null;
  
  // 初始化数据库
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not supported'));
        return;
      }
      
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }
  
  // 存储文件
  async saveFile(file: File, metadata?: Record<string, any>): Promise<number> {
    if (!this.db) {
      await this.init();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const request = store.add({
          file: e.target?.result,
          name: file.name,
          type: file.type,
          size: file.size,
          metadata: metadata || {},
          createdAt: new Date().toISOString(),
        });
        
        request.onsuccess = () => {
          resolve(request.result as number);
        };
        
        request.onerror = () => {
          reject(new Error('Failed to save file'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }
  
  // 获取文件
  async getFile(id: number): Promise<File | null> {
    if (!this.db) {
      await this.init();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const blob = new Blob([result.file], { type: result.type });
          const file = new File([blob], result.name, { type: result.type });
          resolve(file);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => {
        reject(new Error('Failed to get file'));
      };
    });
  }
  
  // 缓存数据
  async setCache(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.db) {
      await this.init();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      const data = {
        key,
        value,
        expiresAt: ttl ? Date.now() + ttl : null,
      };
      
      const request = store.put(data);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error('Failed to set cache'));
      };
    });
  }
  
  // 获取缓存
  async getCache<T>(key: string): Promise<T | null> {
    if (!this.db) {
      await this.init();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // 检查是否过期
          if (result.expiresAt && Date.now() > result.expiresAt) {
            // 删除过期缓存
            store.delete(key);
            resolve(null);
          } else {
            resolve(result.value as T);
          }
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => {
        reject(new Error('Failed to get cache'));
      };
    });
  }
  
  // 删除缓存
  async deleteCache(key: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.delete(key);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error('Failed to delete cache'));
      };
    });
  }
}

// 导出 IndexedDB 实例
export const indexedDBStorage = new IndexedDBStorage();

