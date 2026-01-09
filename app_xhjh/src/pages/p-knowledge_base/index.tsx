

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';
import { Header } from '../../components/Header';
import { knowledgeService, KnowledgeArticle, KnowledgeCategory } from '../../services/knowledge';

interface Article {
  id: string;
  title: string;
  author: string;
  date: string;
  category: string;
  categoryColor: string;
  summary: string;
  views: string;
  likes: string;
  comments: string;
  imageUrl: string;
  content: string;
}

const categoryMap: { [key: string]: { label: string; color: string } } = {
  'parenting': { label: '育儿技巧', color: 'bg-red-100 text-red-800' },
  'education': { label: '学习教育', color: 'bg-blue-100 text-blue-800' },
  'psychology': { label: '心理健康', color: 'bg-purple-100 text-purple-800' },
  'health': { label: '身体健康', color: 'bg-green-100 text-green-800' },
  'activity': { label: '亲子活动', color: 'bg-yellow-100 text-yellow-800' },
  'growth-mindset': { label: '成长型思维', color: 'bg-blue-100 text-blue-800' }, // Mapping for existing mock data if any
  'curiosity': { label: '好奇心培养', color: 'bg-green-100 text-green-800' },
  'goal-setting': { label: '目标设定', color: 'bg-yellow-100 text-yellow-800' },
  'emotional-intelligence': { label: '情商培养', color: 'bg-purple-100 text-purple-800' },
  'parenting-skills': { label: '育儿技巧', color: 'bg-red-100 text-red-800' }
};

const KnowledgeBasePage: React.FC = () => {
  const [articleSearchTerm, setArticleSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('publish_time');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '知识库 - 星火计划';
    
    fetchArticles();

    return () => { document.title = originalTitle; };
  }, [articleSearchTerm, selectedCategory, currentPage, pageSize]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await knowledgeService.getArticleList({
        category: selectedCategory as KnowledgeCategory || undefined,
        keyword: articleSearchTerm || undefined,
        page: currentPage,
        limit: pageSize
      });
      
      const mappedArticles: Article[] = res.list.map(item => {
        const categoryInfo = categoryMap[item.category] || { label: item.category, color: 'bg-gray-100 text-gray-800' };
        return {
          id: item.id.toString(),
          title: item.title,
          author: '星火导师', // Backend doesn't return author name yet
          date: item.createtime.split(' ')[0],
          category: categoryInfo.label,
          categoryColor: categoryInfo.color,
          summary: item.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...',
          views: item.view_count.toString(),
          likes: '0', // Mock
          comments: '0', // Mock
          imageUrl: 'https://s.coze.cn/image/TXSgY27J7TE/', // Placeholder
          content: item.content
        };
      });
      
      setArticles(mappedArticles);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // 模拟文章数据
  // const articlesData: Article[] = [...]; // Removed static data

  // 筛选和排序文章
  const filteredAndSortedArticles = articles; // Use fetched articles directly


  // 处理文章点击
  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setShowArticleModal(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setShowArticleModal(false);
    setSelectedArticle(null);
  };

  // 处理页面点击
  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // 处理上一页/下一页
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredAndSortedArticles.length / pageSize);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 处理每页显示数量变更
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // 处理刷新
  const handleRefresh = () => {
    // 这里可以添加刷新逻辑
    console.log('刷新页面');
  };

  // 处理全局搜索
  const handleGlobalSearch = (value: string) => {
    setGlobalSearchTerm(value);
    console.log('全局搜索：', value);
  };

  // 处理通知点击
  const handleNotificationClick = () => {
    console.log('查看通知');
  };

  // 计算分页信息
  const totalArticles = filteredAndSortedArticles.length;
  const totalPages = Math.ceil(totalArticles / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalArticles);
  const currentArticles = filteredAndSortedArticles.slice(startIndex, endIndex);

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <Header />

      <div className="flex pt-16">
        {/* 左侧菜单 */}
        <aside className="fixed left-0 top-16 bottom-0 w-60 bg-sidebar-gradient shadow-lg overflow-y-auto">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/parent-dashboard" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-tachometer-alt w-5"></i>
                  <span>仪表盘</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/task-list" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-tasks w-5"></i>
                  <span>任务</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/wish-list" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-heart w-5"></i>
                  <span>心愿</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/family-honor-wall" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-trophy w-5"></i>
                  <span>家庭荣誉墙</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/growth-report" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-chart-line w-5"></i>
                  <span>成长报告</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/knowledge-base" 
                  className={`${styles.sidebarItem} ${styles.active} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all`}
                >
                  <i className="fas fa-book w-5"></i>
                  <span>知识库</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/family-manage" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-users w-5"></i>
                  <span>家庭管理</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/user-profile" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-user w-5"></i>
                  <span>个人资料</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/settings" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-cog w-5"></i>
                  <span>设置</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 ml-60 p-6">
          {/* 页面头部 */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">知识库</h2>
                <nav className="text-sm text-text-secondary">
                  <span>知识库</span>
                </nav>
              </div>
            </div>
          </div>

          {/* 工具栏区域 */}
          <section className="mb-6">
            <div className="bg-white rounded-2xl shadow-card p-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* 搜索框 */}
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="搜索文章标题、内容..." 
                      value={articleSearchTerm}
                      onChange={(e) => setArticleSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
                
                {/* 分类筛选 */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="category-filter" className="text-sm font-medium text-text-secondary">分类：</label>
                  <select 
                    id="category-filter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">全部分类</option>
                    <option value="growth-mindset">成长型思维</option>
                    <option value="curiosity">好奇心培养</option>
                    <option value="goal-setting">目标设定</option>
                    <option value="emotional-intelligence">情商培养</option>
                    <option value="parenting-skills">育儿技巧</option>
                  </select>
                </div>
                
                {/* 排序选项 */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="sort-filter" className="text-sm font-medium text-text-secondary">排序：</label>
                  <select 
                    id="sort-filter"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="publish_time">按发布时间</option>
                    <option value="popularity">按热门度</option>
                    <option value="title">按标题</option>
                  </select>
                </div>
                
                {/* 刷新按钮 */}
                <button 
                  onClick={handleRefresh}
                  className="p-2 text-gray-600 hover:text-primary transition-colors"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>
            </div>
          </section>

          {/* 文章列表 */}
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">育儿知识文章</h3>
                <div className="text-sm text-text-secondary">
                  共 <span>{totalArticles}</span> 篇文章
                </div>
              </div>
              
              <div className="space-y-4">
                {currentArticles.map((article) => (
                  <div 
                    key={article.id}
                    onClick={() => handleArticleClick(article)}
                    className={`${styles.articleCard} border border-gray-200 rounded-lg p-4 hover:border-primary transition-all cursor-pointer`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${article.categoryColor}`}>
                            {article.category}
                          </span>
                          <span className="text-xs text-text-secondary">作者：{article.author}</span>
                          <span className="text-xs text-text-secondary">•</span>
                          <span className="text-xs text-text-secondary">{article.date}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-text-primary mb-2 hover:text-primary transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                          {article.summary}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-text-secondary">
                          <span><i className="fas fa-eye mr-1"></i>{article.views} 阅读</span>
                          <span><i className="fas fa-thumbs-up mr-1"></i>{article.likes} 点赞</span>
                          <span><i className="fas fa-comment mr-1"></i>{article.comments} 评论</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <img 
                          src={article.imageUrl} 
                          alt={`${article.category}文章配图`} 
                          className="w-24 h-16 rounded-lg object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 分页区域 */}
          <section>
            <div className="bg-white rounded-2xl shadow-card p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-secondary">
                  显示第 <span>{startIndex + 1}</span> - <span>{endIndex}</span> 条，共 <span>{totalArticles}</span> 条记录
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-chevron-left mr-1"></i>上一页
                  </button>
                  
                  <div className="flex space-x-1">
                    {[1, 2, 3, '...', totalPages].map((page) => (
                      typeof page === 'number' ? (
                        <button
                          key={page}
                          onClick={() => handlePageClick(page)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-primary text-white'
                              : 'border border-gray-300 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key="ellipsis" className="px-3 py-1 text-sm text-text-secondary">...</span>
                      )
                    ))}
                  </div>
                  
                  <button 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页<i className="fas fa-chevron-right ml-1"></i>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-text-secondary">每页显示：</span>
                  <select 
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* 文章详情模态弹窗 */}
      {showArticleModal && selectedArticle && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={handleCloseModal}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-text-primary">{selectedArticle.title}</h3>
                  <button 
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className="fas fa-times text-lg"></i>
                  </button>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-text-secondary">
                  <span>作者：{selectedArticle.author}</span>
                  <span>{selectedArticle.date}</span>
                  <span><i className="fas fa-eye mr-1"></i>{selectedArticle.views}</span>
                </div>
              </div>
              
              <div className="p-6">
                <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
              </div>
              
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-colors">
                      <i className="fas fa-thumbs-up"></i>
                      <span>点赞</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-colors">
                      <i className="fas fa-share"></i>
                      <span>分享</span>
                    </button>
                  </div>
                  <button className={`${styles.btnGradient} text-white px-6 py-2 rounded-lg text-sm font-medium`}>
                    收藏文章
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBasePage;

