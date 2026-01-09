import React from 'react';
import { Badge } from '../services/badge';

interface BadgeCardProps {
  badge: Badge;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge, onClick, size = 'medium' }) => {
  // 尺寸配置
  const sizeConfig = {
    small: {
      card: 'w-20 h-20 p-2',
      icon: 'text-2xl',
      text: 'text-xs',
    },
    medium: {
      card: 'w-32 h-32 p-4',
      icon: 'text-4xl',
      text: 'text-sm',
    },
    large: {
      card: 'w-48 h-48 p-6',
      icon: 'text-6xl',
      text: 'text-base',
    },
  };

  const config = sizeConfig[size];

  // 根据类型确定图标
  const getIconClass = (badgeType: string) => {
    const iconMap: Record<string, string> = {
      'persistence': 'fa-calendar-check',
      'exploration': 'fa-compass',
      'creativity': 'fa-lightbulb',
      'energy': 'fa-bolt',
    };
    return iconMap[badgeType] || 'fa-trophy';
  };

  // 根据类型确定颜色
  const getColorClass = (badgeType: string) => {
    const colorMap: Record<string, string> = {
      'persistence': 'from-green-400 to-green-600',
      'exploration': 'from-blue-400 to-blue-600',
      'creativity': 'from-orange-400 to-orange-600',
      'energy': 'from-yellow-400 to-yellow-600',
    };
    return colorMap[badgeType] || 'from-purple-400 to-purple-600';
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${config.card}
        relative rounded-2xl shadow-lg cursor-pointer
        transition-all duration-300 hover:scale-105 hover:shadow-xl
        ${badge.is_achieved ? 'opacity-100' : 'opacity-60 grayscale'}
      `}
    >
      {/* 背景渐变 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getColorClass(badge.badge_type)} rounded-2xl opacity-10`}></div>

      {/* 图标 */}
      {badge.icon || badge.icon_url ? (
        <img
          src={badge.icon || badge.icon_url}
          alt={badge.badge_name}
          className="w-full h-full object-contain relative z-10"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
          <i className={`fas ${getIconClass(badge.badge_type)} ${config.icon} text-transparent bg-clip-text bg-gradient-to-br ${getColorClass(badge.badge_type)}`}></i>
          {size !== 'small' && (
            <p className={`${config.text} font-semibold text-gray-700 mt-2 text-center leading-tight`}>
              {badge.badge_name}
            </p>
          )}
        </div>
      )}

      {/* 已获得标记 */}
      {badge.is_achieved && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <i className="fas fa-check text-white text-xs"></i>
        </div>
      )}
    </div>
  );
};

export default BadgeCard;
