import type {
  Yao, GuaInfo, TianGan, ShiYingType, FuShen,
  WuXing
} from '../types/index.js';
import { arrangeDiZhi } from './najia.js';
import { calculateLiuQinBatch } from './liuqin.js';
import { arrangeLiuShen } from '../constants/liushen.js';
import { findFuShen } from './fushen.js';
import { DIZHI_WUXING } from '../constants/ganzhi.js';
import { getShiYingPositions } from '../constants/index.js';

// ============================================
// AssignmentEngine 核心类
// AssignmentEngine 装卦逻辑 执行纳甲排地支、计算六亲、排列六神、检测并配置伏神
// ============================================

export class AssignmentEngine {

  /**
   * 执行完整装卦流程
   * 
   * @param guaInfo - 卦象基础信息 (本卦或变卦)
   * @param dayGan - 日干 (用于排六神)
   * @param gongWuXing - 用于计算六亲的宫五行 
   * @param isBenGua - 是否为本卦 (影响伏神逻辑)
   * @param dongYaoIndices - 动爻索引列表 (仅本卦需要)
   * @returns 装配完成的六爻数组，索引0=上爻
   */
  assignYaoAttributes(
    guaInfo: GuaInfo,
    dayGan: TianGan,
    gongWuXing: WuXing,
    isBenGua: boolean,
    dongYaoIndices: readonly number[] = []
  ): readonly Yao[] {

    // 1. 纳甲: 排地支
    const diZhiList = arrangeDiZhi(guaInfo.upperGua, guaInfo.lowerGua);

    // 2. 计算六亲
    const liuQinList = calculateLiuQinBatch(diZhiList, gongWuXing);

    // 3. 排六神
    const liuShenList = arrangeLiuShen(dayGan);

    // 4. 确定世应
    const { shi, ying } = getShiYingPositions(guaInfo.guaCi);

    // 5. 伏神处理 (仅本卦)
    let fuShenList: readonly (FuShen | null)[] = [];
    if (isBenGua) {
      fuShenList = findFuShen(
        diZhiList.map((diZhi, idx) => ({
          position: idx,
          diZhi,
          liuQin: liuQinList[idx]
        })),
        guaInfo.gong,
        guaInfo.gongWuXing
      );
    }

    // 5. 基础爻装配
    const result = diZhiList.map((diZhi, idx) => ({
      position: idx,
      yinYang: guaInfo.yaoCodes[idx],
      diZhi,
      wuXing: DIZHI_WUXING[diZhi],
      liuQin: liuQinList[idx],
      liuShen: liuShenList[idx],
      shiYing: this.determineShiYing(idx, shi, ying),
      isDong: dongYaoIndices.includes(idx),
      fuShen: fuShenList[idx] ?? null
    }));

    return result as readonly Yao[];
  }

  /**
   * 为本卦装卦 (包含伏神和动爻标记)
   */
  assignBenGua(
    guaInfo: GuaInfo,
    dayGan: TianGan,
    dongYaoIndices: readonly number[]
  ): readonly Yao[] {
    return this.assignYaoAttributes(guaInfo, dayGan, guaInfo.gongWuXing, true, dongYaoIndices);
  }

  /**
   * 为变卦装卦 (无伏神，无动爻)
   */
  assignBianGua(
    guaInfo: GuaInfo,
    dayGan: TianGan,
    benGuaGongWuXing: WuXing
  ): readonly Yao[] {
    return this.assignYaoAttributes(guaInfo, dayGan, benGuaGongWuXing, false, []);
  }

  // ============================================
  // 私有辅助方法
  // ============================================

  /**
   * 确定世应标记
   */
  private determineShiYing(
    position: number,
    shiIndex: number,
    yingIndex: number
  ): ShiYingType {
    if (position === shiIndex) return '世';
    if (position === yingIndex) return '应';
    return null;
  }
}

// ============================================
// 单例导出
// ============================================

export const assignmentEngine = new AssignmentEngine();