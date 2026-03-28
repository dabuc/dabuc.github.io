import type { WuXing, LiuQin } from '../types/index.js';

// ============================================
// 五行相生关系 (我生)
// 木生火, 火生土, 土生金, 金生水, 水生木
// ============================================

export const WUXING_SHENG: Readonly<Record<WuXing, WuXing>> = {
  '木': '火',
  '火': '土',
  '土': '金',
  '金': '水',
  '水': '木',
} as const;

// ============================================
// 五行相克关系 (我克)
// 木克土, 土克水, 水克火, 火克金, 金克木
// ============================================

export const WUXING_KE: Readonly<Record<WuXing, WuXing>> = {
  '木': '土',
  '土': '水',
  '水': '火',
  '火': '金',
  '金': '木',
} as const;

// ============================================
// 五行关系判断函数
// ============================================

/** 判断 from 是否生 to */
export function isSheng(from: WuXing, to: WuXing): boolean {
  return WUXING_SHENG[from] === to;
}

/** 判断 from 是否克 to */
export function isKe(from: WuXing, to: WuXing): boolean {
  return WUXING_KE[from] === to;
}

/** 判断两者是否比和 (同五行) */
export function isBiHe(w1: WuXing, w2: WuXing): boolean {
  return w1 === w2;
}

/** 
 * 计算六亲关系
 * @param yaoWuXing 爻的五行
 * @param gongWuXing 卦宫五行 (代表"我")
 * @returns 六亲名称
 */
export function calculateLiuQin(
  yaoWuXing: WuXing,
  gongWuXing: WuXing
): LiuQin {
  if (isSheng(yaoWuXing, gongWuXing)) return '父母';  // 生我者父母
  if (isSheng(gongWuXing, yaoWuXing)) return '子孙';   // 我生者子孙
  if (isKe(yaoWuXing, gongWuXing)) return '官鬼';      // 克我者官鬼
  if (isKe(gongWuXing, yaoWuXing)) return '妻财';      // 我克者妻财
  return '兄弟'; // 同我者兄弟
}