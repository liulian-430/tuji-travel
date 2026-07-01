import { Sparkles } from 'lucide-react';

/**
 * 通用骨架条
 */
export function SkeletonBar({
  className = '',
  rounded = 'rounded-lg',
}: {
  className?: string;
  rounded?: string;
}) {
  return <div className={`skeleton ${rounded} ${className}`} />;
}

/**
 * AI 生成行程时的加载状态
 * 包含：脉冲光环、生成中提示文字（动态省略号）、行程骨架预览
 */
export default function AILoadingState({ days = 2 }: { days?: number }) {
  const dotDelays = ['0s', '0.2s', '0.4s'];

  return (
    <div className="flex flex-col items-center">
      {/* 脉冲光环 + AI 图标 */}
      <div className="relative w-24 h-24 flex items-center justify-center mb-6 mt-4">
        <div className="absolute inset-0 rounded-full bg-gradient-primary/30 ai-pulse-ring" />
        <div className="absolute inset-2 rounded-full bg-gradient-primary/20 ai-pulse-ring" style={{ animationDelay: '0.5s' }} />
        <div className="relative w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary-mid/40">
          <Sparkles size={28} className="text-white" />
        </div>
      </div>

      {/* 生成中文字 */}
      <div className="flex items-center gap-1 mb-2">
        <h3 className="text-lg font-bold gradient-text">AI 正在为你规划行程</h3>
        <span className="flex gap-0.5 ml-1">
          {dotDelays.map((d, i) => (
            <span
              key={i}
              className="ai-dot w-1.5 h-1.5 rounded-full bg-primary-mid inline-block"
              style={{ animationDelay: d }}
            />
          ))}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-8">智能匹配景点、美食与住宿，优化每日路线</p>

      {/* 行程骨架预览 */}
      <div className="w-full space-y-6">
        {Array.from({ length: Math.max(1, days) }).map((_, idx) => (
          <div key={idx} className="relative pl-12">
            <div className="absolute left-[2.625rem] top-3 w-3 h-3 rounded-full bg-gradient-primary/40" />
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-4">
                <SkeletonBar className="h-5 w-20" />
                <SkeletonBar className="h-4 w-24" />
              </div>
              <div className="space-y-4">
                <SkeletonItineraryItem />
                <SkeletonItineraryItem />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonItineraryItem() {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-start gap-3">
        <SkeletonBar className="w-16 h-16 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <SkeletonBar className="h-4 w-10" rounded="rounded" />
            <SkeletonBar className="h-3 w-16" rounded="rounded" />
          </div>
          <SkeletonBar className="h-4 w-32" />
          <SkeletonBar className="h-3 w-40" />
        </div>
      </div>
    </div>
  );
}
