import type { 
  PaiPanResult, Yao, GuaResult, ShenShaMap, DiZhi 
} from '../types/index.js';

// ============================================
// JSON 输出结构定义
// ============================================

export interface YaoJSON {
  readonly position: number;      // 爻位编号 (0=初爻, 5=上爻)
  readonly name: string;            // 完整名称，如"兄弟子水"
  readonly yinYang: '阳' | '阴';    // 阴阳显示
  readonly dong: boolean;         // 是否动爻
  readonly liuShen: string;        // 六神
  readonly shiYing: '世' | '应' | null;
  readonly fuShen: string | null; // 伏神文本
}

export interface GuaJSON {
  readonly name: string;            // 卦名
  readonly gong: string;            // 卦宫
  readonly wuXing: string;          // 卦宫五行
  readonly guaCi: string;           // 卦次
  readonly code: string;            // 二进制编码
  readonly shiYao: number;          // 世爻位置 (0=初爻, 5=上爻)
  readonly yingYao: number;         // 应爻位置 (0=初爻, 5=上爻)
  readonly yao: readonly YaoJSON[]; // 六爻 (按爻位编号排序)
}

export interface ShenShaJSON {
  readonly xunKong: readonly string[]; // 旬空地支
  readonly byDiZhi: Record<string, readonly string[]>; // 地支→神煞数组
  readonly byType: Record<string, readonly string[]>;  // 神煞→地支数组
}

export interface PaiPanJSON {
  readonly metadata: {
    readonly inputDigits: string;   // 原始输入，如"678879"
    readonly inputMonth: string;      // 月支
    readonly inputDay: string;        // 日干支
    readonly generatedAt: string;     // 生成时间 ISO 格式
  };
  readonly ganZhi: {
    readonly month: string;         // 月支
    readonly day: string;           // 日干支
    readonly xunKong: readonly string[]; // 旬空
  };
  readonly shenSha: ShenShaJSON;
  readonly benGua: GuaJSON;
  readonly bianGua: GuaJSON | null;
}

// ============================================
// 转换函数
// ============================================

/**
 * 将排盘结果转换为 JSON 格式
 */
export function toJSON(result: PaiPanResult): PaiPanJSON {
  return {
    metadata: {
      inputDigits: result.input.digits.join(''),
      inputMonth: result.input.monthZhi,
      inputDay: result.input.dayGanZhi,
      generatedAt: new Date().toISOString(),
    },
    ganZhi: {
      month: result.ganZhi.month,
      day: result.ganZhi.day,
      xunKong: result.ganZhi.xunKong,
    },
    shenSha: convertShenSha(result.shenSha.map, result.shenSha.xunKong),
    benGua: convertGua(result.benGua, true),
    bianGua: result.bianGua ? convertGua(result.bianGua, false) : null,
  };
}

/**
 * 转换神煞数据
 */
function convertShenSha(
  map: ShenShaMap, 
  xunKong: readonly DiZhi[]
): ShenShaJSON {
  // 地支→神煞
  const byDiZhi: Record<string, readonly string[]> = {};
  for (const [dz, list] of map) {
    byDiZhi[dz] = list;
  }
  
  // 神煞→地支 (反向索引)
  const byType: Record<string, string[]> = {};
  for (const [dz, list] of map) {
    for (const ss of list) {
      if (!byType[ss]) byType[ss] = [];
      byType[ss].push(dz);
    }
  }
  
  return {
    xunKong,
    byDiZhi,
    byType: Object.fromEntries(
      Object.entries(byType).map(([k, v]) => [k, Object.freeze(v)])
    ),
  };
}

/**
 * 转换卦数据
 * 将内部数组索引转换为爻位编号 (0=初爻, 5=上爻)
 */
function convertGua(gua: GuaResult, isBenGua: boolean): GuaJSON {
  // 内部索引: 0=上爻, 5=初爻
  // 爻位编号: 0=初爻, 5=上爻
  // 转换: 爻位编号 = 5 - 内部索引
  
  return {
    name: gua.info.name,
    gong: gua.info.gong,
    wuXing: gua.info.gongWuXing,
    guaCi: gua.info.guaCi,
    code: gua.info.code,
    shiYao: 5 - gua.shiYaoIndex,    // 转换为爻位编号
    yingYao: 5 - gua.yingYaoIndex,  // 转换为爻位编号
    // 爻数组按爻位编号排序 (0=初爻在前，5=上爻在后)
    yao: gua.yao.map((yao, idx) => convertYao(yao, 5 - idx, isBenGua)).reverse(),
  };
}

/**
 * 转换单爻数据
 * @param yao 爻数据
 * @param position 爻位编号 (0=初爻, 5=上爻)
 */
function convertYao(yao: Yao, position: number, isBenGua: boolean): YaoJSON {
  const name = `${yao.liuQin}${yao.diZhi}${yao.wuXing}`;
  
  return {
    position,
    name,
    yinYang: yao.yinYang === 1 ? '阳' : '阴',
    dong: yao.isDong,
    liuShen: yao.liuShen,
    shiYing: yao.shiYing,
    fuShen: yao.fuShen ? yao.fuShen.displayText : null,
  };
}