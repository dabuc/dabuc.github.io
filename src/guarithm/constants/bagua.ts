import type { BaGua, YaoCode, DiZhi } from '../types/index.js';

// ============================================
// 经卦的3位编码映射 (上爻到初爻)
// 阳爻=1，阴爻=0
// ============================================

export const BAGUA_CODES: Readonly<Record<BaGua, `${YaoCode}${YaoCode}${YaoCode}`>> = {
  '乾': '111', // 三阳
  '震': '001', // 下阳上阴
  '坎': '010', // 中阳
  '艮': '100', // 上阳
  '巽': '110', // 下阴
  '离': '101', // 中阴
  '兑': '011', // 上阴
  '坤': '000', // 三阴
} as const;

// ============================================
// 八卦阴阳分类
// ============================================

/** 阳卦组：乾、震、坎、艮 */
export const YANG_GUA: readonly BaGua[] = ['乾', '震', '坎', '艮'] as const;

/** 阴卦组：巽、离、兑、坤 */
export const YIN_GUA: readonly BaGua[] = ['巽', '离', '兑', '坤'] as const;

/** 判断卦的阴阳属性 */
export function isYangGua(gua: BaGua): boolean {
  return YANG_GUA.includes(gua);
}

/** 判断卦的阴阳属性 */
export function isYinGua(gua: BaGua): boolean {
  return YIN_GUA.includes(gua);
}

// ============================================
// 八纯卦地支起始映射 (纳甲起点)
// ============================================

export const CHUN_GUA_START_DIZHI: Readonly<Record<BaGua, DiZhi>> = {
  '乾': '子',
  '震': '子',
  '坎': '寅',
  '艮': '辰',
  '巽': '丑',
  '离': '卯',
  '兑': '巳',
  '坤': '未',
} as const;

// ============================================
// 经卦互卦关系 (用于特定计算)
// ============================================

/** 经卦的错卦 (阴阳全变) */
export const BAGUA_CUO: Readonly<Record<BaGua, BaGua>> = {
  '乾': '坤', '坤': '乾',
  '震': '巽', '巽': '震',
  '坎': '离', '离': '坎',
  '艮': '兑', '兑': '艮',
} as const;

/** 经卦的综卦 (上下颠倒) */
export const BAGUA_ZONG: Readonly<Record<BaGua, BaGua>> = {
  '乾': '乾', '坤': '坤',
  '震': '艮', '艮': '震',
  '坎': '坎', '离': '离',
  '巽': '兑', '兑': '巽',
} as const;