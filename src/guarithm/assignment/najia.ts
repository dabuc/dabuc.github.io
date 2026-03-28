import type { BaGua, DiZhi } from '../types/index.js';
import {
  CHUN_GUA_START_DIZHI, YANG_GUA, YANG_DIZHI, YIN_DIZHI
} from '../constants/index.js';
import { CalculationError } from '../errors/index.js';

// ============================================
// 八纯卦地支配置缓存
// ============================================

type ChunGuaDiZhiConfig = {
  readonly upper: readonly DiZhi[]; // 上三爻 [上爻, 五爻, 四爻]
  readonly lower: readonly DiZhi[]; // 下三爻 [三爻, 二爻, 初爻]
};

const chunGuaCache = new Map<BaGua, ChunGuaDiZhiConfig>();

// ============================================
// 计算八纯卦的地支配置
// ============================================

/**
 * 计算八纯卦的六爻地支
 * 规则:
 * 1. 阳卦(乾震坎艮)配阳地支(子寅辰午申戌)，顺行
 * 2. 阴卦(巽离兑坤)配阴地支(丑卯巳未酉亥)，逆行
 * 3. 从初爻开始，按阴阳顺逆排列
 */
function calculateChunGuaDiZhi(gua: BaGua): ChunGuaDiZhiConfig {
  const startDiZhi = CHUN_GUA_START_DIZHI[gua];
  const isYang = YANG_GUA.includes(gua);
  const diZhiPool = isYang ? YANG_DIZHI : YIN_DIZHI;

  const startIdx = diZhiPool.indexOf(startDiZhi);
  if (startIdx === -1) {
    throw new CalculationError('纳甲', `无效的起始地支: ${startDiZhi}`);
  }

  // 计算六个爻的地支 (从初爻到上爻)
  const allSix: DiZhi[] = [];
  for (let i = 0; i < 6; i++) {
    const poolIdx = isYang
      ? (startIdx + i) % 6      // 阳顺: +1
      : (startIdx - i + 6) % 6; // 阴逆: -1

    allSix.push(diZhiPool[poolIdx]);
  }

  // 分割为下三爻(初二三)和上三爻(四五六/上)
  // allSix[0]=初爻, allSix[1]=二爻, allSix[2]=三爻
  // allSix[3]=四爻, allSix[4]=五爻, allSix[5]=上爻

  return {
    lower: [allSix[2], allSix[1], allSix[0]], // 三爻、二爻、初爻
    upper: [allSix[5], allSix[4], allSix[3]], // 上爻、五爻、四爻
  };
}

/**
 * 获取八纯卦地支配置 (带缓存)
 */
export function getChunGuaDiZhi(gua: BaGua): ChunGuaDiZhiConfig {
  if (!chunGuaCache.has(gua)) {
    chunGuaCache.set(gua, calculateChunGuaDiZhi(gua));
  }
  return chunGuaCache.get(gua)!;
}

// ============================================
// 纳甲: 为任意卦排地支
// ============================================

/**
 * 为六爻卦排列地支
 * 规则: 上下经卦分别查找对应的八纯卦，复制其地支配置
 * 
 * @param upperGua - 上经卦
 * @param lowerGua - 下经卦
 * @returns 六爻地支数组，索引0=上爻，索引5=初爻
 */
export function arrangeDiZhi(upperGua: BaGua, lowerGua: BaGua): readonly DiZhi[] {
  const upperConfig = getChunGuaDiZhi(upperGua);
  const lowerConfig = getChunGuaDiZhi(lowerGua);

  // 合并: 上三爻 + 下三爻 = [上爻,五爻,四爻, 三爻,二爻,初爻]
  return [
    ...upperConfig.upper,   // 上爻、五爻、四爻
    ...lowerConfig.lower,   // 三爻、二爻、初爻
  ];
}
