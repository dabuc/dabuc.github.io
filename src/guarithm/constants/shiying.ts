import type { GuaCi } from '../types/index.js';

// ============================================
// 卦次到世爻索引的映射
// 数组索引: 0=上爻, 1=五爻, 2=四爻, 3=三爻, 4=二爻, 5=初爻
// ============================================

export const SHI_YAO_MAP: Readonly<Record<GuaCi, number>> = {
  '本宫': 0, // 上爻 (数组索引0)
  '一世': 5, // 初爻 (数组索引5)
  '二世': 4, // 二爻 (数组索引4)
  '三世': 3, // 三爻 (数组索引3)
  '四世': 2, // 四爻 (数组索引2)
  '五世': 1, // 五爻 (数组索引1)
  '游魂': 2, // 四爻 (数组索引2)
  '归魂': 3, // 三爻 (数组索引3)
} as const;

/** 获取世爻索引 (数组索引) */
export function getShiYaoIndex(guaCi: GuaCi): number {
  return SHI_YAO_MAP[guaCi];
}

/** 
 * 计算应爻索引 (数组索引)
 * 应爻与世爻相隔三位 (数组循环)
 * 上爻(0)↔四爻(3), 五爻(1)↔二爻(4), 四爻(2)↔初爻(5)
 */
export function getYingYaoIndex(shiIndex: number): number {
  return (shiIndex + 3) % 6;
}

/** 
 * 同时获取世应索引
 */
export function getShiYingPositions(guaCi: GuaCi): { shi: number; ying: number } {
  const shi = getShiYaoIndex(guaCi);
  const ying = getYingYaoIndex(shi);
  return { shi, ying };
}