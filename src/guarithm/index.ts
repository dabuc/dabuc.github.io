/**
 * 六爻排盘系统 - 主入口
 * 
 * 使用示例:
 * ```typescript
 * import { paiPan, PaiPanInput } from './index.js';
 * 
 * const input: PaiPanInput = {
 *   digits: [6, 7, 8, 8, 7, 9],
 *   monthZhi: '寅',
 *   dayGanZhi: '甲戌'
 * };
 * 
 * const result = paiPan(input);
 * console.log(result.toMarkdown());
 * ```
 */

import type { 
  PaiPanInput, 
  PaiPanResult as InternalResult,
  YaoInput,
  DiZhi 
} from './types/index.js';

import { 
  InvalidInputError 
} from './errors/index.js';

import { validateDigits, validateMonthZhi, validateDayGanZhi } from './utils/validators.js';
import { hexagramEngine } from './hexagram/engine.js';
import { assignmentEngine } from './assignment/engine.js';
import { astroEngine } from './astro/engine.js';
import { outputFormatter } from './formatter/engine.js';


// ============================================
// 重新导出类型 (修正版)
// ============================================

export type {
  // 基础类型
  PaiPanInput,
  YaoInput,
  DiZhi,
  TianGan,
  WuXing,
  LiuQin,
  LiuShen,
  GuaInfo,
  Yao,
  ShenShaName
} from './types/index.js';

// 格式化相关类型
export type { 
  PaiPanJSON,
  YaoJSON,
  GuaJSON,
  ShenShaJSON
} from './formatter/json.js';

export type { 
  OutputFormat,
  FormattedOutput
} from './formatter/engine.js';

// ============================================
// 增强的 PaiPanResult 类
// ============================================

/**
 * 排盘结果封装类
 * 提供便捷的数据访问和输出方法
 */
export class PaiPanResult {
  /** 内部原始数据 */
  private readonly _data: InternalResult;
  
  constructor(data: InternalResult) {
    this._data = Object.freeze(data);
  }
  
  // ------------------------------------------
  // 基础数据访问
  // ------------------------------------------
  
  /** 原始输入参数 */
  get input(): Readonly<PaiPanInput> {
    return this._data.input;
  }
  
  /** 月支 */
  get monthZhi(): DiZhi {
    return this._data.ganZhi.month;
  }
  
  /** 日干支 */
  get dayGanZhi(): string {
    return this._data.ganZhi.day;
  }
  
  /** 旬空 */
  get xunKong(): readonly DiZhi[] {
    return this._data.ganZhi.xunKong;
  }
  
  /** 本卦名称 */
  get benGuaName(): string {
    return this._data.benGua.info.name;
  }
  
  /** 本卦卦宫 */
  get benGuaGong(): string {
    return this._data.benGua.info.gong;
  }
  
  /** 变卦名称 (若无变卦返回 null) */
  get bianGuaName(): string | null {
    return this._data.bianGua?.info.name ?? null;
  }
  
  // ------------------------------------------
  // 神煞查询
  // ------------------------------------------
  
  /** 
   * 获取指定地支的所有神煞
   */
  getShenSha(diZhi: DiZhi): readonly import('./types/index.js').ShenShaName[] {
    return this._data.shenSha.map.get(diZhi) ?? [];
  }
  
  /** 
   * 获取指定神煞所在的地支
   */
  findShenSha(name: import('./types/index.js').ShenShaName): readonly DiZhi[] {
    const result: DiZhi[] = [];
    for (const [dz, list] of this._data.shenSha.map) {
      if (list.includes(name)) {
        result.push(dz);
      }
    }
    return result;
  }
  
  /** 神煞显示字符串 */
  get shenShaDisplay(): string {
    return this._data.shenSha.displayString;
  }
  
  // ------------------------------------------
  // 爻位查询
  // ------------------------------------------
  
  /**
   * 获取指定爻位的信息
   * @param position 0=上爻, 5=初爻
   */
  getYao(position: number, type: 'ben' | 'bian' = 'ben'): import('./types/index.js').Yao | null {
    const gua = type === 'ben' ? this._data.benGua : this._data.bianGua;
    return gua?.yao[position] ?? null;
  }
  
  /** 世爻 */
  get shiYao(): import('./types/index.js').Yao {
    return this._data.benGua.yao[this._data.benGua.shiYaoIndex];
  }
  
  /** 应爻 */
  get yingYao(): import('./types/index.js').Yao {
    return this._data.benGua.yao[this._data.benGua.yingYaoIndex];
  }
  
  /** 动爻列表 */
  get dongYao(): readonly import('./types/index.js').Yao[] {
    return this._data.benGua.yao.filter(y => y.isDong);
  }
  
  // ------------------------------------------
  // 输出方法
  // ------------------------------------------
  
  /** 转换为 JSON 对象 */
  toJSON(): import('./formatter/json.js').PaiPanJSON {
    return outputFormatter.toJSON(this._data);
  }
  
  /** 转换为 JSON 字符串 */
  toJSONString(pretty = true): string {
    return outputFormatter.stringifyJSON(this._data, pretty);
  }
  
  /** 转换为 Markdown 表格 */
  toMarkdown(): string {
    return outputFormatter.toMarkdown(this._data);
  }
  
  // ------------------------------------------
  // 原始数据访问 (高级用法)
  // ------------------------------------------
  
  /** 获取完整内部数据结构 */
  getRawData(): InternalResult {
    return this._data;
  }
}

// ============================================
// 主排盘函数
// ============================================

/**
 * 六爻排盘主函数
 */
export function paiPan(input: PaiPanInput): PaiPanResult {
  // 1. 验证输入
  validateDigits(input.digits);
  validateMonthZhi(input.monthZhi);
  validateDayGanZhi(input.dayGanZhi);
  
  // 2. 计算本卦
  const benGuaInfo = hexagramEngine.determineBenGua(input.digits);
  
  // 3. 计算变卦
  const bianGuaInfo = hexagramEngine.generateBianGua(benGuaInfo);
  
  // 4. 提取日干
  const dayGan = input.dayGanZhi[0] as import('./types/index.js').TianGan;
  
  // 5. 装本卦
  const benGuaYao = assignmentEngine.assignBenGua(
    benGuaInfo,
    dayGan,
    benGuaInfo.dongYaoIndices
  );
  
  // 6. 装变卦 (如果有)
  const bianGuaYao = bianGuaInfo 
    ? assignmentEngine.assignBianGua(bianGuaInfo, dayGan,benGuaInfo.gongWuXing)
    : null;
  
  // 7. 计算神煞
  const shenShaResult = astroEngine.calculateShenSha(
    input.monthZhi,
    input.dayGanZhi
  );

  //8. 计算旬空
  const xunKong = astroEngine.calculateXunKong(input.dayGanZhi);
  
  // 9. 获取世应位置
  const { shi, ying } = hexagramEngine.getShiYingPositions(benGuaInfo.guaCi);
  
  // 10. 组装完整结果
  const rawResult: InternalResult = {
    input,
    ganZhi: {
      month: input.monthZhi,
      day: input.dayGanZhi,
      xunKong: xunKong,
    },
    shenSha: shenShaResult,
    benGua: {
      info: benGuaInfo,
      yao: benGuaYao,
      shiYaoIndex: shi,
      yingYaoIndex: ying,
    },
    bianGua: bianGuaInfo && bianGuaYao ? {
      info: bianGuaInfo,
      yao: bianGuaYao,
      shiYaoIndex: shi,
      yingYaoIndex: ying,
    } : null,
  };
  
  // 10. 返回封装结果
  return new PaiPanResult(rawResult);
}

// ============================================
// 便捷函数
// ============================================

/**
 * 快速排盘 - 字符串输入版本
 */
/**
 * 快速排盘 - 字符串输入版本
 * 支持两种格式:
 * 1. 完整数字: "678879" (6=老阴动, 7=少阳, 8=少阴, 9=老阳动)
 * 2. 二进制简写: "000001" (0=少阴8, 1=少阳7; 无动爻)
 * 
 * @param digitsStr 6位数字字符串
 * @param monthZhi 月支，如"寅"
 * @param dayGanZhi 日干支，如"甲戌"
 */
export function paiPanQuick(
  digitsStr: string,
  monthZhi: string,
  dayGanZhi: string
): PaiPanResult {
  // 验证长度
  if (digitsStr.length !== 6) {
    throw new InvalidInputError(`数字序列必须是6位，实际收到${digitsStr.length}位`);
  }
  
  // 转换数字
  const digits: YaoInput[] = digitsStr.split('').map((c, idx) => {
    const num = parseInt(c, 10);
    
    // 完整数字格式 (6,7,8,9)
    if (num >= 6 && num <= 9) {
      return num as YaoInput;
    }
    
    // 二进制简写格式 (0,1)
    // 0 → 8 (少阴，阴爻，静)
    // 1 → 7 (少阳，阳爻，静)
    if (num === 0) return 8 as YaoInput;
    if (num === 1) return 7 as YaoInput;
    
    // 其他数字无效
    throw new InvalidInputError(
      `第${idx + 1}位数字无效: ${c}，必须是6(老阴)、7(少阳)、8(少阴)、9(老阳)、0(简写阴)、1(简写阳)`
    );
  });
  
  return paiPan({
    digits,
    monthZhi: monthZhi as DiZhi,
    dayGanZhi,
  });
}

// ============================================
// 版本信息
// ============================================

export const VERSION = '1.0.0';

// ============================================
// 默认导出
// ============================================

export default paiPan;