import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  iconSize?: number;
}

/**
 * 统一空状态组件
 * 用于各页面（行程、收藏、消费记录、搜索结果等）的空数据展示
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
  iconSize = 36,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 py-12 ${className}`}>
      <div className="w-20 h-20 mb-4 rounded-full bg-gradient-primary/10 flex items-center justify-center shadow-inner">
        <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary-mid/20">
          <Icon size={iconSize} className="text-white" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-xs leading-relaxed">{description}</p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="gradient-button text-sm px-6 py-2.5"
        >
          {actionText}
        </button>
      )}
      {!actionText && description && <div className="h-2" />}
    </div>
  );
}

/**
 * 紧凑版空状态（用于卡片内部、列表区域）
 */
export function EmptyStateCompact({
  icon: Icon,
  title,
  description,
  className = '',
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-8 px-4 ${className}`}>
      <div className="w-12 h-12 mb-3 rounded-full bg-gradient-primary/10 flex items-center justify-center">
        <Icon size={22} className="text-primary-mid" />
      </div>
      <p className="font-medium text-gray-600 mb-1">{title}</p>
      {description && <p className="text-xs text-gray-400">{description}</p>}
    </div>
  );
}

/**
 * ReactNode 类型导出，便于其他组件按需扩展
 */
export type { ReactNode };
