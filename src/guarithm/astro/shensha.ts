import type {
  TianGan, DiZhi, ShenShaName, ShenShaMap, ShenShaInfo
} from '../types/index.js';
import {
  GUI_REN_TABLE, LU_SHEN_TABLE, YANG_REN_TABLE, WEN_CHANG_TABLE,
  YI_MA_TABLE, TAO_HUA_TABLE, JIANG_XING_TABLE, JIE_SHA_TABLE,
  HUA_GAI_TABLE, MOU_XING_TABLE, ZAI_SHA_TABLE,
  TIAN_XI_TABLE, getSanHeType,SHENSHA_ORDER
} from '../constants/shensha.js';
import { getSeason, getDiZhiIndex, DIZHI_ORDER } from '../constants/ganzhi.js';
import { CalculationError } from '../errors/index.js';

// ============================================
// 神煞映射表构建器
// ============================================

type ShenShaMapBuilder = Map<DiZhi, ShenShaName[]>;

function addShenSha(
  map: ShenShaMapBuilder,
  diZhi: DiZhi | readonly DiZhi[],
  name: ShenShaName
): void {
  const branches = Array.isArray(diZhi) ? diZhi : [diZhi];
  for (const dz of branches) {
    const existing = map.get(dz) ?? [];
    if (!existing.includes(name)) {
      map.set(dz, [...existing, name]);
    }
  }
}

// ============================================
// 日干神煞计算
// ============================================

/**
 * 计算日干相关神煞 (贵人、禄神、羊刃、文昌)
 */
function calculateDayGanShenSha(
  dayGan: TianGan,
  map: ShenShaMapBuilder
): void {
  // 贵人 (1-2个地支)
  addShenSha(map, GUI_REN_TABLE[dayGan], '贵人');

  // 禄神
  addShenSha(map, LU_SHEN_TABLE[dayGan], '禄神');

  // 羊刃
  addShenSha(map, YANG_REN_TABLE[dayGan], '羊刃');

  // 文昌
  addShenSha(map, WEN_CHANG_TABLE[dayGan], '文昌');
}

// ============================================
// 日支神煞计算
// ============================================

/**
 * 计算日支相关神煞 (驿马、桃花、将星、劫煞、华盖、谋星、灾煞)
 */
function calculateDayZhiShenSha(
  dayZhi: DiZhi,
  map: ShenShaMapBuilder
): void {
  const sanHeType = getSanHeType(dayZhi);
  if (!sanHeType) {
    throw new CalculationError('神煞', `无法确定日支${dayZhi}的三合局`);
  }

  // 驿马
  addShenSha(map, YI_MA_TABLE[sanHeType], '驿马');

  // 桃花
  addShenSha(map, TAO_HUA_TABLE[sanHeType], '桃花');

  // 将星
  addShenSha(map, JIANG_XING_TABLE[sanHeType], '将星');

  // 劫煞
  addShenSha(map, JIE_SHA_TABLE[sanHeType], '劫煞');

  // 华盖
  addShenSha(map, HUA_GAI_TABLE[sanHeType], '华盖');

  // 谋星
  addShenSha(map, MOU_XING_TABLE[sanHeType], '谋星');

  // 灾煞
  addShenSha(map, ZAI_SHA_TABLE[sanHeType], '灾煞');
}

// ============================================
// 月支神煞计算
// ============================================

/**
 * 计算月支相关神煞 (天医、天喜)
 */
function calculateMonthZhiShenSha(
  monthZhi: DiZhi,
  map: ShenShaMapBuilder
): void {
  // 天医: 月支的前一位
  const monthIdx = getDiZhiIndex(monthZhi);
  const tianYiIdx = (monthIdx - 1 + 12) % 12;
  addShenSha(map, DIZHI_ORDER[tianYiIdx], '天医');

  // 天喜: 按季节
  const season = getSeason(monthZhi);
  addShenSha(map, TIAN_XI_TABLE[season], '天喜');
}

// ============================================
// 主计算函数
// ============================================

/**
 * 计算所有神煞
 * @param monthZhi - 月支
 * @param dayGanZhi - 日干支 (如"甲戌")
 * @returns 神煞结果
 */
export function calculateAllShenSha(
  monthZhi: DiZhi,
  dayGanZhi: string
): ShenShaInfo {
  const dayGan = dayGanZhi[0] as TianGan;
  const dayZhi = dayGanZhi[1] as DiZhi;

  const map: ShenShaMapBuilder = new Map();

  // 1. 日干神煞
  calculateDayGanShenSha(dayGan, map);

  // 2. 日支神煞
  calculateDayZhiShenSha(dayZhi, map);

  // 3. 月支神煞
  calculateMonthZhiShenSha(monthZhi, map);

  // 转换为只读
  const readonlyMap: Map<DiZhi, readonly ShenShaName[]> = new Map();
  for (const [key, value] of map) {
    readonlyMap.set(key, Object.freeze([...value]));
  }

  const displayString = formatShenShaDisplay(readonlyMap);

  return {
    map: readonlyMap,
    displayString: displayString
  };
}

// ============================================
// 格式化输出
// ============================================

/**
 * 格式化神煞为显示字符串
 * 格式: "将星－午 华盖－戌 驿马－申..."
 */
export function formatShenShaDisplay(
  result: ShenShaMap
): string {
  // 按地支分组转按神煞分组
  const byShenSha = new Map<ShenShaName, DiZhi[]>();

  for (const [diZhi, shenShaList] of result) {
    for (const ss of shenShaList) {
      const existing = byShenSha.get(ss) ?? [];
      existing.push(diZhi);
      byShenSha.set(ss, existing);
    }
  }

  // // 定义神煞显示顺序
  // const order: ShenShaName[] = [
  //   '将星', '华盖', '驿马', '灾煞', '谋星', '桃花',
  //   '劫煞', '禄神', '羊刃', '文昌', '天医', '天喜', '贵人'
  // ];

  const parts: string[] = [];
  for (const ss of SHENSHA_ORDER) {
    const branches = byShenSha.get(ss);
    if (branches) {
      parts.push(`${ss}－${branches.join('、')}`);
    }
  }

  return parts.join(' ');
}




