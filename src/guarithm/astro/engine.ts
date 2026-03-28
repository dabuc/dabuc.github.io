import type { TianGan, DiZhi, ShenShaInfo, ShenShaMap } from '../types/index.js';
import {
  calculateAllShenSha,
  formatShenShaDisplay
} from './shensha.js';
import {
  GUI_REN_TABLE, LU_SHEN_TABLE, YANG_REN_TABLE, WEN_CHANG_TABLE
} from '../constants/shensha.js';
import { calculateXunKong } from '../constants/ganzhi.js'

// ============================================
// AstroEngine 核心类
// ============================================

export class AstroEngine {

  /**
   * 计算所有神煞
   */
  calculateShenSha(monthZhi: DiZhi, dayGanZhi: string): ShenShaInfo {
    return calculateAllShenSha(monthZhi, dayGanZhi);
  }

  /**
   * 计算旬空
   */
  calculateXunKong(dayGanZhi: string): readonly DiZhi[] {
    return calculateXunKong(dayGanZhi);
  }

  /**
   * 格式化神煞显示
   */
  formatDisplay(result: ShenShaMap): string {
    return formatShenShaDisplay(result);
  }

  // ============================================
  // 单个神煞查询 (便捷方法)
  // ============================================

  /**
   * 获取贵人 (可能有多个)
   */
  getGuiRen(dayGan: TianGan): readonly DiZhi[] {
    return GUI_REN_TABLE[dayGan];
  }

  /**
   * 获取禄神
   */
  getLuShen(dayGan: TianGan): DiZhi {
    return LU_SHEN_TABLE[dayGan];
  }

  /**
   * 获取羊刃
   */
  getYangRen(dayGan: TianGan): DiZhi {
    return YANG_REN_TABLE[dayGan];
  }

  /**
   * 获取文昌
   */
  getWenChang(dayGan: TianGan): DiZhi {
    return WEN_CHANG_TABLE[dayGan];
  }
}

// ============================================
// 单例导出
// ============================================

export const astroEngine = new AstroEngine();