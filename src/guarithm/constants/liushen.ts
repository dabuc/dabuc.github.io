import type { LiuShen, TianGan } from '../types/index.js';

// ============================================
// 六神固定顺序 (从初爻到上爻的排列顺序)
// ============================================

export const LIUSHEN_ORDER: readonly LiuShen[] = [
  '青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'
] as const;

// ============================================
// 日干与起始六神的映射
// ============================================

export const LIUSHEN_TIANGAN_MAP: Readonly<Record<TianGan, LiuShen>> = {
  '甲': '青龙', '乙': '青龙',
  '丙': '朱雀', '丁': '朱雀',
  '戊': '勾陈',
  '己': '螣蛇',
  '庚': '白虎', '辛': '白虎',
  '壬': '玄武', '癸': '玄武',
} as const;

/** 根据日干获取起始六神 */
export function getStartLiuShen(dayGan: TianGan): LiuShen {
  return LIUSHEN_TIANGAN_MAP[dayGan];
}

// ============================================
// 内部函数: 从初爻到上爻排列六神
// ============================================

/**
 * 获取六神排列 (从初爻到上爻)
 * @param dayGan 日干
 * @returns 长度为6的数组，索引0=初爻，索引5=上爻
 */
function arrangeFromChuToShang(dayGan: TianGan): readonly LiuShen[] {
  const startShen = getStartLiuShen(dayGan);
  const startIdx = LIUSHEN_ORDER.indexOf(startShen);
  
  const result: LiuShen[] = [];
  for (let i = 0; i < 6; i++) {
    const idx = (startIdx + i) % 6;
    result.push(LIUSHEN_ORDER[idx]);
  }
  
  return result as readonly LiuShen[];
}

// ============================================
// 对外接口: 从上爻到初爻排列六神
// ============================================

/**
 * 获取完整的六神排列 (从上爻到初爻)
 * 
 * 六爻排盘表格中，六神从上爻(第一行)排到初爻(第六行)
 * 所以返回数组顺序为: [上爻, 五爻, 四爻, 三爻, 二爻, 初爻]
 * 
 * @param dayGan 日干
 * @returns 长度为6的数组，索引0=上爻，索引5=初爻
 */
export function arrangeLiuShen(dayGan: TianGan): readonly LiuShen[] {
  const fromChuToShang = arrangeFromChuToShang(dayGan);
  // 反转为从上爻到初爻
  return [...fromChuToShang].reverse() as readonly LiuShen[];
}