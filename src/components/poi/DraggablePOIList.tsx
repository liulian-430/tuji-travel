import { useRef, useState, useEffect } from 'react';
import { GripVertical, Bus, TrainFront, Car, ArrowDown, Edit3 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import SwipeableCard from '../ui/SwipeableCard';
import type { TripPOI } from '@/data/mock';
import { calculateTransport, formatDuration, formatDistance } from '@/utils/transport';

interface DraggablePOIListProps {
  pois: TripPOI[];
  typeColors: Record<string, string>;
  typeLabels: Record<string, string>;
  dayButtonColors: string[];
  viewMode: 'all' | number;
  selectedPoi: string | null;
  onPoiClick: (poi: TripPOI) => void;
  onDelete: (poiId: string) => void;
  onMoveDay: (poiId: string) => void;
  getDayForPoi: (poiId: string) => number | null;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

// 丝滑弹性缓动曲线
const SMOOTH_EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const BOUNCE_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export default function DraggablePOIList({
  pois,
  typeColors,
  typeLabels,
  dayButtonColors,
  viewMode,
  selectedPoi,
  onPoiClick,
  onDelete,
  onMoveDay,
  getDayForPoi,
  onReorder,
}: DraggablePOIListProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [selectedTransportIndex, setSelectedTransportIndex] = useState<number | null>(null);
  const [cardHeight, setCardHeight] = useState(120);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // 拖拽预览淡入淡出
  const [dragPreviewOpacity, setDragPreviewOpacity] = useState(0);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insertIndexRef = useRef<number | null>(null);
  const draggingIndexRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const scrollRafRef = useRef<number | null>(null);
  const scrollDirectionRef = useRef<number>(0); // -1 上滑, 1 下滑, 0 停止

  // 向上查找最近的可滚动祖先元素
  const getScrollParent = (): HTMLElement | Window => {
    let el: HTMLElement | null = containerRef.current?.parentElement || null;
    while (el) {
      const style = getComputedStyle(el);
      if (
        (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
        el.scrollHeight > el.clientHeight
      ) {
        return el;
      }
      el = el.parentElement;
    }
    return window;
  };

  // 自动滚动循环
  const startAutoScroll = (direction: number) => {
    if (scrollDirectionRef.current === direction && scrollRafRef.current !== null) return;
    scrollDirectionRef.current = direction;
    if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);

    const scrollParent = getScrollParent();
    const SPEED = 14;

    const tick = () => {
      if (scrollDirectionRef.current === 0) {
        scrollRafRef.current = null;
        return;
      }
      if (scrollParent === window) {
        window.scrollBy(0, SPEED * scrollDirectionRef.current);
      } else {
        (scrollParent as HTMLElement).scrollBy(0, SPEED * scrollDirectionRef.current);
      }
      scrollRafRef.current = requestAnimationFrame(tick);
    };
    scrollRafRef.current = requestAnimationFrame(tick);
  };

  const stopAutoScroll = () => {
    scrollDirectionRef.current = 0;
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }
  };

  const updateInsertIndex = (clientY: number) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeY = clientY - containerRect.top;

    let newInsertIdx = 0;

    for (let i = 0; i < cardRefs.current.length; i++) {
      const cardEl = cardRefs.current[i];
      if (!cardEl) continue;

      const cardRect = cardEl.getBoundingClientRect();
      const cardTop = cardRect.top - containerRect.top;
      const cardBottom = cardTop + cardRect.height;
      const cardMid = (cardTop + cardBottom) / 2;

      if (relativeY < cardMid) {
        newInsertIdx = i;
        break;
      }
      newInsertIdx = i + 1;
    }

    newInsertIdx = Math.max(0, Math.min(pois.length, newInsertIdx));

    if (newInsertIdx !== insertIndexRef.current) {
      insertIndexRef.current = newInsertIdx;
      setInsertIndex(newInsertIdx);
    }
  };

  const handlePointerDown = (e: React.PointerEvent, idx: number) => {
    if (viewMode === 'all') return;

    const target = e.currentTarget as HTMLElement;
    const cardRect = target.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top,
    });

    setCardHeight(cardRect.height);

    startPosRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;

    longPressTimerRef.current = setTimeout(() => {
      setDraggingIndex(idx);
      draggingIndexRef.current = idx;
      isDraggingRef.current = true;
      setInsertIndex(idx);
      insertIndexRef.current = idx;
      setDragPosition({ x: e.clientX, y: e.clientY });

      if (target.setPointerCapture) {
        target.setPointerCapture(e.pointerId);
      }
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';

      // 淡入拖拽预览
      requestAnimationFrame(() => {
        setDragPreviewOpacity(1);
      });
    }, 200);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (longPressTimerRef.current && !isDraggingRef.current) {
      const dx = Math.abs(e.clientX - startPosRef.current.x);
      const dy = Math.abs(e.clientY - startPosRef.current.y);
      if (dx > 8 || dy > 8) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    if (!isDraggingRef.current) return;

    e.preventDefault();
    setDragPosition({ x: e.clientX, y: e.clientY });
    updateInsertIndex(e.clientY);

    // 拖到屏幕顶端/底端时自动滚动
    const EDGE = 90;
    const viewH = window.innerHeight;
    if (e.clientY < EDGE) {
      // 接近顶部，向上滚动
      startAutoScroll(-1);
    } else if (e.clientY > viewH - EDGE) {
      // 接近底部，向下滚动
      startAutoScroll(1);
    } else {
      stopAutoScroll();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!isDraggingRef.current) {
      return;
    }

    isDraggingRef.current = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    stopAutoScroll();

    const fromIdx = draggingIndexRef.current;
    const toIdx = insertIndexRef.current;

    // 先淡出预览
    setDragPreviewOpacity(0);

    if (fromIdx !== null && toIdx !== null && fromIdx !== toIdx) {
      const actualToIdx = toIdx > fromIdx ? toIdx - 1 : toIdx;
      onReorder(fromIdx, actualToIdx);
    }

    // 延迟清理状态，让淡出动画完成
    setTimeout(() => {
      setDraggingIndex(null);
      draggingIndexRef.current = null;
      setInsertIndex(null);
      insertIndexRef.current = null;
      setDragPosition({ x: 0, y: 0 });
    }, 200);
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    stopAutoScroll();

    setDragPreviewOpacity(0);

    setTimeout(() => {
      setDraggingIndex(null);
      draggingIndexRef.current = null;
      setInsertIndex(null);
      insertIndexRef.current = null;
      setDragPosition({ x: 0, y: 0 });
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      stopAutoScroll();
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, []);

  const renderPOICard = (poi: TripPOI, index: number, isDragging: boolean = false) => {
    const isSelected = selectedPoi === poi.id;
    const dayColorIndex = index % dayButtonColors.length;
    const day = getDayForPoi(poi.id);
    const isUnscheduled = !day;

    return (
      <GlassCard className={`overflow-hidden ${isDragging ? 'shadow-2xl ring-2 ring-primary-mid/40' : ''}`}>
        <div className="flex items-start gap-3 p-4">
          {viewMode !== 'all' && (
            <div className="flex flex-col items-center justify-center pt-1">
              <GripVertical
                size={18}
                className={`transition-colors duration-300 ${isDragging ? 'text-primary-mid' : 'text-gray-300'}`}
              />
            </div>
          )}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 bg-gradient-to-br ${
              isUnscheduled ? 'from-amber-400 to-orange-500' : dayButtonColors[dayColorIndex]
            }`}
          >
            {isUnscheduled ? '?' : index + 1}
          </div>

          <img
            src={poi.image}
            alt={poi.name}
            className={`w-20 h-20 rounded-lg object-cover flex-shrink-0 ${isUnscheduled ? 'opacity-80' : ''}`}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded border ${typeColors[poi.type]}`}>
                {typeLabels[poi.type]}
              </span>
              {isUnscheduled && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 font-medium">
                  待安排
                </span>
              )}
              {poi.duration && <span className="text-xs text-gray-500">{poi.duration}</span>}
            </div>
            <h4 className="font-medium text-gray-800 truncate">{poi.name}</h4>
            {poi.price > 0 && <p className="text-sm text-primary-mid mt-1">¥{poi.price}</p>}
          </div>

          {!isDragging && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveDay(poi.id);
              }}
              className={`flex items-center gap-1 text-xs hover:text-primary-mid transition-colors px-2 py-1 rounded-lg hover:bg-primary-mid/10 ${
                isUnscheduled ? 'text-amber-600 bg-amber-50' : 'text-gray-500'
              }`}
            >
              <span className="font-medium">{day ? `Day${day}` : '去安排'}</span>
              <Edit3 size={12} className={isUnscheduled ? 'text-amber-500' : 'text-gray-400'} />
            </button>
          )}
        </div>
      </GlassCard>
    );
  };

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {pois.map((poi, index) => {
        const isSelected = selectedPoi === poi.id;
        const isDragging = draggingIndex === index;
        const showInsertAbove = insertIndex === index && draggingIndex !== null && draggingIndex !== index;
        const showTransport = viewMode !== 'all' && index < pois.length - 1;
        const transportInfo = showTransport ? calculateTransport(poi, pois[index + 1]) : null;
        const isTransportExpanded = selectedTransportIndex === index;

        return (
          <div key={poi.id} className="relative">
            {/* 撑开占位 — 始终渲染，高度从0过渡到目标高度 */}
            <div
              className="overflow-hidden"
              style={{
                height: showInsertAbove ? `${cardHeight}px` : '0px',
                marginBottom: showInsertAbove ? '16px' : '0px',
                transition: `height 0.35s ${BOUNCE_EASE}, margin-bottom 0.35s ${BOUNCE_EASE}`,
              }}
            >
              <div
                className="rounded-2xl border-2 border-dashed border-primary-mid/50 bg-primary-mid/10 flex items-center justify-center"
                style={{ height: `${cardHeight}px` }}
              >
                <div className="text-primary-mid/50 text-sm font-medium">放到这里</div>
              </div>
            </div>

            <div
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              style={{
                touchAction: 'none',
                opacity: isDragging ? 0.35 : 1,
                transform: isDragging ? 'scale(0.96)' : 'scale(1)',
                transition: `opacity 0.25s ${SMOOTH_EASE}, transform 0.25s ${BOUNCE_EASE}`,
                willChange: 'opacity, transform',
              }}
              onPointerDown={(e) => handlePointerDown(e, index)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              <SwipeableCard onDelete={() => onDelete(poi.id)}>
                <div
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-primary-mid rounded-2xl' : ''
                  } ${viewMode !== 'all' ? 'active:scale-[0.98]' : ''}`}
                  onClick={() => onPoiClick(poi)}
                >
                  {renderPOICard(poi, index)}
                </div>
              </SwipeableCard>
            </div>

            {showTransport && transportInfo && (
              <div
                className={`mx-4 my-2 transition-all duration-300 ease-out cursor-pointer ${
                  isTransportExpanded ? '' : 'hover:bg-white/30'
                }`}
                onClick={() => setSelectedTransportIndex(isTransportExpanded ? null : index)}
              >
                <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-mid/10">
                    <Bus size={16} className="text-primary-mid" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {formatDistance(transportInfo.distance)}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-sm text-gray-600">
                        公交约{formatDuration(transportInfo.transitDuration)}
                      </span>
                    </div>
                  </div>
                  <ArrowDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-300 ${SMOOTH_EASE} ${
                      isTransportExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {isTransportExpanded && (
                  <div className="mt-2 grid grid-cols-3 gap-2 animate-slide-down">
                    <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-center">
                      <Bus size={18} className="mx-auto mb-1 text-green-600" />
                      <p className="text-xs font-medium text-green-700">公交</p>
                      <p className="text-xs text-green-600">{formatDuration(transportInfo.transitDuration)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                      <TrainFront size={18} className="mx-auto mb-1 text-blue-600" />
                      <p className="text-xs font-medium text-blue-700">地铁</p>
                      <p className="text-xs text-blue-600">
                        {formatDuration(Math.ceil(transportInfo.transitDuration * 0.8))}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-center">
                      <Car size={18} className="mx-auto mb-1 text-orange-600" />
                      <p className="text-xs font-medium text-orange-700">打车</p>
                      <p className="text-xs text-orange-600">¥{transportInfo.taxiCost}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* 末尾撑开占位 */}
      <div
        className="overflow-hidden"
        style={{
          height:
            insertIndex === pois.length && draggingIndex !== null && draggingIndex !== pois.length
              ? `${cardHeight}px`
              : '0px',
          marginBottom:
            insertIndex === pois.length && draggingIndex !== null && draggingIndex !== pois.length
              ? '16px'
              : '0px',
          transition: `height 0.35s ${BOUNCE_EASE}, margin-bottom 0.35s ${BOUNCE_EASE}`,
        }}
      >
        <div
          className="rounded-2xl border-2 border-dashed border-primary-mid/50 bg-primary-mid/10 flex items-center justify-center"
          style={{ height: `${cardHeight}px` }}
        >
          <div className="text-primary-mid/50 text-sm font-medium">放到这里</div>
        </div>
      </div>

      {/* 拖拽跟随卡片 — 无 transition 完全跟手，仅 opacity 有淡入淡出 */}
      {draggingIndex !== null && pois[draggingIndex] && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: dragPosition.x - dragOffset.x,
            top: dragPosition.y - dragOffset.y,
            width: cardRefs.current[draggingIndex]?.offsetWidth || 320,
            transform: 'translate3d(0, 0, 0) scale(1.06)',
            opacity: dragPreviewOpacity,
            transition: `opacity 0.2s ${SMOOTH_EASE}`,
            willChange: 'transform, opacity',
          }}
        >
          {renderPOICard(pois[draggingIndex], draggingIndex, true)}
        </div>
      )}
    </div>
  );
}
