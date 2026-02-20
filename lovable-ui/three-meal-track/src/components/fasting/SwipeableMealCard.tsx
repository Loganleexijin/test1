import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Trash2 } from "lucide-react";
import { MealCard, type MealType, type MealStatus } from "./MealCard";
import { DeleteMealAlert } from "./DeleteMealAlert";

interface SwipeableMealCardProps {
  type: MealType;
  status: MealStatus;
  time?: string;
  foodName?: string;
  calories?: number;
  imageUrl?: string;
  tags?: string[];
  isLoading?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  /** 是否播放引导弹动动画 */
  showHint?: boolean;
}

const SWIPE_THRESHOLD = 80;
const HINT_STORAGE_KEY = "meal-swipe-hint-shown";

export function SwipeableMealCard({
  type,
  status,
  time,
  foodName,
  calories,
  imageUrl,
  tags,
  isLoading,
  onClick,
  onDelete,
  showHint = false,
}: SwipeableMealCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isSwiped, setIsSwiped] = useState(false);
  const hasAnimated = useRef(false);

  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const deleteScale = useTransform(x, [0, SWIPE_THRESHOLD], [0.6, 1]);

  // 引导弹动：首次进入时自动播放一次
  useEffect(() => {
    if (!showHint || hasAnimated.current) return;
    if (status !== "recorded") return;

    const alreadyShown = sessionStorage.getItem(HINT_STORAGE_KEY);
    if (alreadyShown) return;

    hasAnimated.current = true;
    const timer = setTimeout(() => {
      animate(x, [0, 48, -6, 0], {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
        times: [0, 0.4, 0.7, 1],
      });
      sessionStorage.setItem(HINT_STORAGE_KEY, "true");
    }, 800);

    return () => clearTimeout(timer);
  }, [showHint, status, x]);

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 400) {
      // 滑动到位，锁定展示删除按钮
      animate(x, SWIPE_THRESHOLD + 10, { type: "spring", stiffness: 400, damping: 30 });
      setIsSwiped(true);
    } else {
      // 弹回
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
      setIsSwiped(false);
    }
  };

  const handleReset = () => {
    animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    setIsSwiped(false);
  };

  const handleDeleteClick = () => {
    setDeleteOpen(true);
  };

  const isRecorded = status === "recorded";

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        {/* 删除底层 */}
        <motion.div
          className="absolute inset-0 flex items-center rounded-2xl bg-destructive/10"
          style={{ opacity: deleteOpacity }}
        >
          <motion.button
            onClick={handleDeleteClick}
            className="flex flex-col items-center justify-center gap-1 pl-4 w-20"
            style={{ scale: deleteScale }}
          >
            <div className="p-2 bg-destructive/15 rounded-full">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-xs font-medium text-destructive">删除</span>
          </motion.button>
        </motion.div>

        {/* 可拖拽的卡片层 */}
        <motion.div
          style={{ x }}
          drag={isRecorded ? "x" : false}
          dragConstraints={{ left: 0, right: SWIPE_THRESHOLD + 20 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          onClick={(e) => {
            if (isSwiped) {
              e.stopPropagation();
              handleReset();
              return;
            }
            onClick?.();
          }}
          className="relative z-10"
        >
          <MealCard
            type={type}
            status={status}
            time={time}
            foodName={foodName}
            calories={calories}
            imageUrl={imageUrl}
            tags={tags}
            isLoading={isLoading}
          />
        </motion.div>
      </div>

      {/* 删除确认弹框 */}
      <DeleteMealAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        mealName={foodName}
        onConfirm={() => {
          handleReset();
          onDelete?.();
        }}
        onCancel={handleReset}
      />
    </>
  );
}
