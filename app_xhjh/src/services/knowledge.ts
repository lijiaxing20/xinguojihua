import { api } from '../utils/api';

// 知识库分类
export type KnowledgeCategory = 'parenting' | 'education' | 'psychology' | 'health' | 'activity';

// 知识库文章接口
export interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  category: KnowledgeCategory;
  author_id: number;
  view_count: number;
  status: string;
  createtime: string;
  updatetime: string;
}

// 知识库分类接口
export interface KnowledgeCategoryItem {
  value: KnowledgeCategory;
  label: string;
}

// 知识库服务
export const knowledgeService = {
  // 获取知识库列表
  getArticleList: async (params?: {
    category?: KnowledgeCategory;
    keyword?: string;
    page?: number;
    limit?: number;
  }): Promise<{ list: KnowledgeArticle[]; total: number }> => {
    const response = await api.get<{ list: KnowledgeArticle[]; total: number }>('/knowledge/list', { params });
    return response.data;
  },

  // 获取知识库详情
  getArticleDetail: async (id: number): Promise<KnowledgeArticle> => {
    const response = await api.get<KnowledgeArticle>(`/knowledge/detail/${id}`);
    return response.data;
  },

  // 获取分类列表
  getCategories: async (): Promise<{ list: KnowledgeCategoryItem[] }> => {
    const response = await api.get<{ list: KnowledgeCategoryItem[] }>('/knowledge/categories');
    return response.data;
  },

  // 创建知识库文章（管理员功能）
  createArticle: async (params: {
    title: string;
    content: string;
    category: KnowledgeCategory;
  }): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>('/knowledge/create', params);
    return response.data;
  },
};

