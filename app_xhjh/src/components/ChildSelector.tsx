import React, { useEffect, useState, useRef } from 'react';
import { useFamilyStore } from '../store/familyStore';
import { FamilyMember } from '../services/family';

export const ChildSelector: React.FC = () => {
  const { currentChild, setCurrentChild, familyMembers, refreshFamilyMembers } = useFamilyStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshFamilyMembers();
    // 监听自定义事件以刷新列表（例如添加孩子后）
    const handleRefresh = () => refreshFamilyMembers();
    window.addEventListener('refreshFamilyMembers', handleRefresh);
    return () => window.removeEventListener('refreshFamilyMembers', handleRefresh);
  }, [refreshFamilyMembers]);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (child: FamilyMember) => {
    setCurrentChild(child);
    setIsOpen(false);
  };

  if (familyMembers.length === 0) {
    return (
       <div className="relative mr-4">
        <button className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full text-gray-500 cursor-not-allowed" title="请先在家庭成员管理中添加孩子">
            <i className="fas fa-child text-gray-400"></i>
            <span className="text-sm">暂无孩子</span>
        </button>
       </div>
    );
  }

  return (
    <div className="relative mr-4" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-shadow border border-transparent hover:border-blue-100"
      >
        <img
          src={currentChild?.avatar || "https://s.coze.cn/image/8PgWsnjOnjc/"} 
          alt={currentChild?.nickname || "孩子"}
          className="w-8 h-8 rounded-full object-cover border border-gray-100"
        />
        <span className="text-sm font-medium text-gray-700">{currentChild?.nickname || "选择孩子"}</span>
        <i className={`fas fa-chevron-down text-xs text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl z-50 py-2 border border-gray-100 overflow-hidden ring-1 ring-black ring-opacity-5">
            <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <span className="text-xs text-gray-400 font-medium">切换孩子</span>
            </div>
          {familyMembers.map(child => (
            <button
              key={child.user_id}
              onClick={() => handleSelect(child)}
              className={`flex items-center w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors ${currentChild?.user_id === child.user_id ? 'bg-blue-50' : ''}`}
            >
              <img 
                src={child.avatar || "https://s.coze.cn/image/8PgWsnjOnjc/"} 
                className="w-8 h-8 rounded-full mr-3 object-cover border border-gray-200"
                alt={child.nickname}
              />
              <div className="flex-1 overflow-hidden">
                  <div className={`text-sm font-medium truncate ${currentChild?.user_id === child.user_id ? 'text-blue-700' : 'text-gray-700'}`}>{child.nickname}</div>
              </div>
              {currentChild?.user_id === child.user_id && <i className="fas fa-check text-xs text-blue-600 ml-2"></i>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
