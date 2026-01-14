import { FastingStage } from '@/types';

export const FASTING_STAGES: FastingStage[] = [
  {
    id: 'phase1',
    name: '能量储存中',
    nameEn: 'Anabolic Phase',
    rangeStart: 0,
    rangeEnd: 4,
    color: 'hsl(35, 90%, 55%)',
    description: '消化吸收，胰岛素上升',
    detail: '你刚刚享用完一顿美餐，身体正在消化食物并吸收营养。此时胰岛素水平升高，身体处于“合成模式”。',
  },
  {
    id: 'phase2',
    name: '血糖平稳期',
    nameEn: 'Catabolic Phase',
    rangeStart: 4,
    rangeEnd: 12,
    color: 'hsl(160, 55%, 45%)',
    description: '胰岛素下降，糖原消耗',
    detail: '食物已经消化完毕。胰岛素水平开始下降，身体不再储存脂肪，转而消耗之前储存的糖原。这是通往燃脂模式的必经之路。',
    tip: '若6-8小时饥饿：喝水或黑咖啡，常在20分钟内缓解。',
  },
  {
    id: 'phase3',
    name: '🔥 脂肪燃烧',
    nameEn: 'Fat Burning',
    rangeStart: 12,
    rangeEnd: 18,
    color: 'hsl(225, 80%, 55%)',
    description: '糖原耗尽，燃脂启动',
    detail: '恭喜！你的身体刚刚切换了“燃料来源”。肝糖原逐渐耗尽，身体开始直接分解脂肪来获取能量。这是 16:8 断食的核心目标区。',
  },
  {
    id: 'phase4',
    name: '✨ 细胞净化',
    nameEn: 'Ketosis / Autophagy',
    rangeStart: 18,
    rangeEnd: 24,
    color: 'hsl(45, 90%, 60%)',
    description: '深度修复，自噬启动',
    detail: '你进入了深度修复状态。这就好比身体开启了“大扫除”模式（细胞自噬），清理受损的细胞部件，回收蛋白质。这是抗衰老和焕发活力的关键阶段。',
  },
  {
    id: 'phase5',
    name: '生长激素激增',
    nameEn: 'Deep Repair',
    rangeStart: 24,
    rangeEnd: null,
    color: 'hsl(265, 75%, 55%)',
    description: '深度修复与重建',
    detail: '断食超过 24 小时后，生长激素水平显著提升，身体进入更深层的修复与重建状态。请量力而行，出现不适及时停止。',
  }
];

export const getCurrentStage = (elapsedHours: number): FastingStage => {
  return FASTING_STAGES.find(stage => 
    elapsedHours >= stage.rangeStart && 
    (stage.rangeEnd === null || elapsedHours < stage.rangeEnd)
  ) || FASTING_STAGES[FASTING_STAGES.length - 1];
};

export const getNextStage = (currentStageId: string): FastingStage | null => {
  const index = FASTING_STAGES.findIndex(s => s.id === currentStageId);
  if (index === -1 || index === FASTING_STAGES.length - 1) return null;
  return FASTING_STAGES[index + 1];
};

export const shouldTriggerFatBurningCue = (prevElapsedSeconds: number, nextElapsedSeconds: number) => {
  const threshold = 12 * 3600;
  return prevElapsedSeconds < threshold && nextElapsedSeconds >= threshold;
};
