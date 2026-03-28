import { CalculationError } from '../errors/index.js';
import type { DiZhi, TianGan, WuXing, Season } from '../types/index.js';


// ============================================
// 地支顺序与分类
// ============================================

/** 十二地支完整顺序 */
export const DIZHI_ORDER: readonly DiZhi[] = [
  '子', '丑', '寅', '卯', '辰', '巳', 
  '午', '未', '申', '酉', '戌', '亥'
] as const;

/** 阳地支 (奇数位) */
export const YANG_DIZHI: readonly DiZhi[] = ['子', '寅', '辰', '午', '申', '戌'] as const;

/** 阴地支 (偶数位) */
export const YIN_DIZHI: readonly DiZhi[] = ['丑', '卯', '巳', '未', '酉', '亥'] as const;

/** 判断地支阴阳 */
export function isYangDiZhi(dz: DiZhi): boolean {
  return YANG_DIZHI.includes(dz);
}

/** 判断地支阴阳 */
export function isYinDiZhi(dz: DiZhi): boolean {
  return YIN_DIZHI.includes(dz);
}

// ============================================
// 天干顺序
// ============================================

export const TIANGAN_ORDER: readonly TianGan[] = [
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'
] as const;

// ============================================
// 地支五行属性
// ============================================

export const DIZHI_WUXING: Readonly<Record<DiZhi, WuXing>> = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '申': '金', '酉': '金',
  '子': '水', '亥': '水',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
} as const;

/** 获取地支五行 */
export function getDiZhiWuXing(dz: DiZhi): WuXing {
  return DIZHI_WUXING[dz];
}

// ============================================
// 天干五行属性
// ============================================

export const TIANGAN_WUXING: Readonly<Record<TianGan, WuXing>> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
} as const;

/** 获取天干五行 */
export function getTianGanWuXing(tg: TianGan): WuXing {
  return TIANGAN_WUXING[tg];
}

// ============================================
// 地支与月份/季节的对应
// ============================================

/** 月支对应的季节 */
export const DIZHI_SEASON: Readonly<Record<DiZhi, Season>> = {
  '寅': '春', '卯': '春', '辰': '春',
  '巳': '夏', '午': '夏', '未': '夏',
  '申': '秋', '酉': '秋', '戌': '秋',
  '亥': '冬', '子': '冬', '丑': '冬',
} as const;

/** 获取月支所在季节 */
export function getSeason(monthZhi: DiZhi): Season {
  return DIZHI_SEASON[monthZhi];
}

// ============================================
// 地支索引工具函数
// ============================================

/** 获取地支在十二地支中的索引 (0-11) */
export function getDiZhiIndex(dz: DiZhi): number {
  return DIZHI_ORDER.indexOf(dz);
}

/** 获取天干索引 (0-9) */
export function getTianGanIndex(tg: TianGan): number {
  return TIANGAN_ORDER.indexOf(tg);
}

/** 按步长获取下一个地支 (支持正负步长) */
export function getNextDiZhi(dz: DiZhi, step: number): DiZhi {
  const currentIdx = getDiZhiIndex(dz);
  const newIdx = (currentIdx + step + 12) % 12;
  return DIZHI_ORDER[newIdx];
}


// ============================================
// 旬空计算
// ============================================

/**
 * 计算旬空
 * 以日干支查旬空，六甲旬中空亡
 */
export function calculateXunKong(dayGanZhi: string): readonly DiZhi[] {
  const gan = dayGanZhi[0] as TianGan;
  const zhi = dayGanZhi[1] as DiZhi;

  const ganIdx = getTianGanIndex(gan);
  const zhiIdx = getDiZhiIndex(zhi);

  // 直接计算旬首地支索引
  // 旬首地支 = 地支索引 - 天干索引 (取模12)
  // 因为甲子日起，天干地支同步推进
  const xunShouZhiIdx = (zhiIdx - ganIdx + 12) % 12;
  const xunShouZhi = DIZHI_ORDER[xunShouZhiIdx];

  // 旬空表
  const xunKongTable: Record<string, readonly DiZhi[]> = {
    '子': ['戌', '亥'], // 甲子旬
    '戌': ['申', '酉'], // 甲戌旬
    '申': ['午', '未'], // 甲申旬
    '午': ['辰', '巳'], // 甲午旬
    '辰': ['寅', '卯'], // 甲辰旬
    '寅': ['子', '丑'], // 甲寅旬
  };

  const result = xunKongTable[xunShouZhi];
  if (!result) {
    throw new CalculationError('旬空', `无法计算${dayGanZhi}的旬空`);
  }

  return result;
}