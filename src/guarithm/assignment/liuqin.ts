import type { DiZhi, WuXing, LiuQin } from '../types/index.js';
import { DIZHI_WUXING } from '../constants/ganzhi.js';
import { calculateLiuQin as calculateByWuXing } from '../constants/wuxing.js';

// ============================================
// 六亲计算
// ============================================

/**
 * 根据爻地支和卦宫五行计算六亲
 * @param yaoDiZhi - 爻的地支
 * @param gongWuXing - 卦宫五行
 * @returns 六亲名称
 */
export function calculateLiuQin(yaoDiZhi: DiZhi, gongWuXing: WuXing): LiuQin {
  const yaoWuXing = DIZHI_WUXING[yaoDiZhi];
  return calculateByWuXing(yaoWuXing, gongWuXing);
}

/**
 * 批量计算六亲
 * @param diZhiList - 六爻地支数组 (索引0=上爻)
 * @param gongWuXing - 卦宫五行
 * @returns 六亲数组
 */
export function calculateLiuQinBatch(
  diZhiList: readonly DiZhi[], 
  gongWuXing: WuXing
): readonly LiuQin[] {
  return diZhiList.map(dz => calculateLiuQin(dz, gongWuXing));
}

// ============================================
// 六亲完整性检查
// ============================================

const ALL_LIU_QIN: readonly LiuQin[] = ['父母', '兄弟', '子孙', '妻财', '官鬼'] as const;

/**
 * 检查六亲是否完整
 * @param liuQinList - 已有的六亲列表
 * @returns 是否包含全部5种六亲
 */
export function isLiuQinComplete(liuQinList: readonly LiuQin[]): boolean {
  const existing = new Set(liuQinList);
  return ALL_LIU_QIN.every(lq => existing.has(lq));
}

/**
 * 获取缺失的六亲
 * @param liuQinList - 已有的六亲列表
 * @returns 缺失的六亲数组
 */
export function getMissingLiuQin(liuQinList: readonly LiuQin[]): readonly LiuQin[] {
  const existing = new Set(liuQinList);
  return ALL_LIU_QIN.filter(lq => !existing.has(lq));
}