

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';
import { wishService, Wish } from '../../services/wish';
import { useFamilyStore } from '../../store/familyStore';
import { statisticsService } from '../../services/statistics';
import { useToast } from '../../components/Toast';

interface WishData {
  id: string;
  name: string;
  description: string;
  childName: string;
  childAvatar: string;
  submitTime: string;
  suggestedEnergy: number;
  currentEnergy: number;
}

const WishReviewModal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { familyMembers } = useFamilyStore();
  const { success, error: showError, warning } = useToast();
  const [wishData, setWishData] = useState<WishData | null>(null);
  const [energyValue, setEnergyValue] = useState<number>(200);
  const [comment, setComment] = useState<string>('');
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '审核心愿 - 星火计划';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // 加载心愿数据
  useEffect(() => {
    const fetchWishDetail = async () => {
      const wishId = searchParams.get('wishId');
      if (!wishId) {
        setError('参数错误：缺少心愿ID');
        return;
      }

      setLoading(true);
      try {
        // 1. 获取心愿详情
        const wish = await wishService.getWishDetail(Number(wishId));
        
        // 2. 获取提交心愿的孩子信息
        const child = familyMembers.find(m => m.user_id === wish.user_id);
        const childName = child?.nickname || '孩子';
        const childAvatar = child?.avatar || 'https://s.coze.cn/image/m7gdB20EvGA/'; // 默认头像

        // 3. 获取孩子当前能量值
        let currentEnergy = 0;
        try {
          const stats = await statisticsService.getDashboardStats({ user_id: wish.user_id });
          currentEnergy = stats.total.total_energy;
        } catch (err) {
          console.error('获取能量值失败', err);
        }

        // 4. 格式化时间
        const submitTime = new Date(Number(wish.createtime) * 1000).toLocaleDateString();

        setWishData({
          id: String(wish.id),
          name: wish.wish_name,
          description: wish.description || '',
          childName,
          childAvatar,
          submitTime: `${submitTime}提交`,
          suggestedEnergy: wish.required_energy,
          currentEnergy
        });
        setEnergyValue(wish.required_energy || 200);
      } catch (err: any) {
        setError(err.message || '获取心愿详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchWishDetail();
  }, [searchParams, familyMembers]);

  // 关闭弹窗
  const handleCloseModal = () => {
    navigate(-1); // 返回上一页
  };

  // 能量值建议按钮点击
  const handleEnergySuggestionClick = (value: number) => {
    setEnergyValue(value);
  };

  // 能量值输入变化
  const handleEnergyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setEnergyValue(value);
  };

  // 审核意见输入变化
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  // 通过审核
  const handleApprove = () => {
    if (!energyValue || energyValue < 1) {
      warning('请设置有效的能量值');
      return;
    }
    if (!wishData) return;

    setIsApproving(true);

    wishService.reviewWish(Number(wishData.id), {
      action: 'approve',
      required_energy: energyValue
    }).then(() => {
      success('心愿审核通过！');
      navigate(-1);
    }).catch(err => {
      showError(err.message || '审核失败');
    }).finally(() => {
      setIsApproving(false);
    });
  };

  // 拒绝审核
  const handleReject = () => {
    if (!confirm('确定要拒绝这个心愿吗？')) {
      return;
    }
    if (!wishData) return;

    setIsRejecting(true);

    wishService.reviewWish(Number(wishData.id), {
      action: 'reject',
      reason: comment
    }).then(() => {
      success('心愿已拒绝');
      navigate(-1);
    }).catch(err => {
      showError(err.message || '操作失败');
    }).finally(() => {
      setIsRejecting(false);
    });
  };

  // 背景点击关闭
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // ESC键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-3">
          <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
          <span className="text-gray-700 font-medium">加载中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">出错了</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={handleCloseModal}
            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  if (!wishData) {
    return null;
  }

  return (
    <div className={styles.pageWrapper}>
      {/* 模态弹窗背景 */}
      <div 
        className={`fixed inset-0 ${styles.modalBackdrop} z-50 flex items-center justify-center p-4`}
        onClick={handleBackdropClick}
      >
        {/* 心愿审核弹窗 */}
        <div className={`bg-white rounded-2xl shadow-modal w-full max-w-md ${styles.modalEnter}`}>
          {/* 弹窗头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <i className="fas fa-heart text-white text-lg"></i>
              </div>
              <h2 className="text-xl font-semibold text-text-primary">审核心愿</h2>
            </div>
            <button 
              onClick={handleCloseModal}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          {/* 弹窗内容区 */}
          <div className="p-6">
            {/* 心愿信息展示 */}
            <div className="mb-6">
              <div className="flex items-start space-x-4 mb-4">
                <img 
                  src={wishData.childAvatar}
                  alt={`${wishData.childName}头像`} 
                  className="w-12 h-12 rounded-full border-2 border-gray-200" 
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">{wishData.childName}</h3>
                  <p className="text-sm text-text-secondary">{wishData.submitTime}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-text-primary mb-2">心愿内容</h4>
                <h3 className="text-lg font-bold text-purple-700 mb-2">{wishData.name}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {wishData.description}
                </p>
              </div>
            </div>

            {/* 能量值设置 */}
            <div className="mb-6">
              <label htmlFor="energy-input" className="block text-sm font-medium text-text-primary mb-3">
                设置所需能量值
                <span className="text-xs text-text-secondary ml-2">(建议：50-500能量值)</span>
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  id="energy-input" 
                  name="energy"
                  className={`w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus} text-lg font-semibold`}
                  value={energyValue} 
                  min="1" 
                  max="1000" 
                  step="10"
                  onChange={handleEnergyInputChange}
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-text-secondary">
                  <i className="fas fa-star text-yellow-500 mr-1"></i>能量
                </span>
              </div>
              
              {/* 能量值建议 */}
              <div className="mt-3 flex flex-wrap gap-2">
                {[100, 150, 200, 250, 300].map((value) => (
                  <button 
                    key={value}
                    onClick={() => handleEnergySuggestionClick(value)}
                    className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                      energyValue === value
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* 审核意见 */}
            <div className="mb-6">
              <label htmlFor="comment-input" className="block text-sm font-medium text-text-primary mb-3">
                审核意见 <span className="text-xs text-text-secondary">(可选)</span>
              </label>
              <textarea 
                id="comment-input" 
                name="comment" 
                rows={3}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus} resize-none`}
                placeholder="给孩子写一些鼓励的话或说明审核理由..."
                value={comment}
                onChange={handleCommentChange}
              />
            </div>

            {/* 当前能量值提示 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <i className="fas fa-info-circle text-blue-500"></i>
                <span className="text-sm font-medium text-blue-700">当前能量值</span>
              </div>
              <p className="text-sm text-blue-600">
                {wishData.childName}目前有 <span className="font-bold text-lg">{wishData.currentEnergy.toLocaleString()}</span> 能量值，足够实现这个心愿。
              </p>
            </div>
          </div>

          {/* 操作按钮区 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button 
              onClick={handleReject}
              disabled={isRejecting}
              className={`${styles.btnDanger} text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2`}
            >
              {isRejecting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>处理中...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-times"></i>
                  <span>拒绝</span>
                </>
              )}
            </button>
            <button 
              onClick={handleApprove}
              disabled={isApproving}
              className={`${styles.btnSuccess} text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2`}
            >
              {isApproving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>处理中...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  <span>通过</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishReviewModal;

