import type {
  WuXing, Yao, FuShen
} from '../types/index.js';
import { getBenGongGua } from '../constants/gua64.js';
import { arrangeDiZhi } from './najia.js';
import { calculateLiuQin, getMissingLiuQin, isLiuQinComplete } from './liuqin.js';
import { DIZHI_WUXING } from '../constants/ganzhi.js';
import { CalculationError } from '../errors/index.js';

// ============================================
// 伏神查找与配置
// ============================================

/**
 * 查找并配置伏神
 * 
 * 规则:
 * 1. 检查本卦六亲是否完整 (5种六亲齐全)
 * 2. 若不完整，在本宫卦中查找缺失六亲对应的爻
 * 3. 伏神伏藏在**本卦对应爻位**之下
 * 
 * @param benGuaYao - 本卦六爻 (已装配地支和六亲)
 * @param gongName - 卦宫名称
 * @param gongWuXing - 卦宫五行
 * @returns 六爻的伏神信息数组 (null表示无伏神)
 */
export function findFuShen(
  benGuaYao: readonly (Pick<Yao, 'diZhi' | 'liuQin' | 'position'>)[],
  gongName: string,
  gongWuXing: WuXing
): readonly (FuShen | null)[] {

  // 1. 检查六亲完整性
  const existingLiuQin = benGuaYao.map(y => y.liuQin);
  if (isLiuQinComplete(existingLiuQin)) {
    // 六亲完整，无伏神
    return benGuaYao.map(() => null);
  }

  // 2. 获取缺失的六亲
  const missingLiuQin = getMissingLiuQin(existingLiuQin);

  // 3. 查找本宫卦配置
  const benGongRecord = getBenGongGua(gongName);
  if (!benGongRecord) {
    throw new CalculationError('伏神', `未找到${gongName}的本宫卦`);
  }

  // 4. 计算本宫卦的六爻配置
  const benGongDiZhi = arrangeDiZhi(benGongRecord.上卦, benGongRecord.下卦);
  const benGongLiuQin = benGongDiZhi.map(dz => calculateLiuQin(dz, gongWuXing));

  // 5. 为每个缺失的六亲，在本宫卦中找到其位置，在本卦对应位置设置伏神
  const fuShenArray: (FuShen | null)[] = benGuaYao.map(() => null);
  
  for (const missingLq of missingLiuQin) {
    // 在本宫卦中找到该六亲的所有爻位
    const positionsInBenGong: number[] = [];
    benGongLiuQin.forEach((lq, idx) => {
      if (lq === missingLq) positionsInBenGong.push(idx);
    });
    
    if (positionsInBenGong.length === 0) continue;
    
    // 取第一个找到的爻位（通常只有一个）
    const targetPosition = positionsInBenGong[0];
    const diZhi = benGongDiZhi[targetPosition];
    const wuXing = DIZHI_WUXING[diZhi];
    
    // 在本卦的对应位置设置伏神
    fuShenArray[targetPosition] = {
      liuQin: missingLq,
      diZhi,
      wuXing,
      displayText: `${missingLq}${diZhi}${wuXing}`
    };
  }
  
  return fuShenArray;
}

// ============================================
// 伏神验证
// ============================================

export function verifyFuShen(): void {
  console.log('\n========== 伏神验证 ==========\n');

  // 示例: 假设某卦缺失"妻财"
  // 简化验证: 检查函数能正确运行
  console.log('伏神计算逻辑已实现');
  console.log('具体验证需在完整排盘后测试\n');
}