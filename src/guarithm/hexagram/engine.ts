import type {
  YaoInput, YaoCode, GuaInfo, BaGua, GuaCi, Gua64Record
} from '../types/index.js';
import { InvalidHexagramError, CalculationError } from '../errors/index.js';
import {
  GUA64_BY_CODE, getBenGongGua, BAGUA_CODES
} from '../constants/index.js';
import {
  getShiYaoIndex, getYingYaoIndex
} from '../constants/index.js';

// ============================================
// 本卦计算结果 (内部扩展类型)
// ============================================

interface BenGuaInternal extends GuaInfo {
  /** 动爻索引列表 (0=上爻, 5=初爻) */
  readonly dongYaoIndices: readonly number[];
}

// ============================================
// 核心引擎类
// ============================================

export class HexagramEngine {

  /**
   * 根据6位数字输入确定本卦
   * @param digits - 6位数字 (6,7,8,9)，从左到右对应上爻到初爻
   * @returns 本卦详细信息，包含动爻标记
   */
  determineBenGua(digits: readonly YaoInput[]): BenGuaInternal {
    // 1. 提取阴阳编码并识别动爻
    const { yaoCodes, dongYaoIndices } = this.parseDigits(digits);

    // 2. 生成6位二进制编码字符串
    const code = yaoCodes.join('');

    // 3. 在64卦数据库中查找
    const record = GUA64_BY_CODE.get(code);
    if (!record) {
      throw new InvalidHexagramError(code);
    }

    // 4. 解析爻编码为上卦下卦
    const upperCode = code.slice(0, 3); // 上爻、五爻、四爻
    const lowerCode = code.slice(3, 6);   // 三爻、二爻、初爻

    // 5. 查找对应的经卦名称
    const upperGua = this.findBaGuaByCode(upperCode);
    const lowerGua = this.findBaGuaByCode(lowerCode);

    // 6. 组装完整结果
    return {
      code,
      name: record.卦名,
      sequence: record.卦序,
      gong: record.宫名,
      gongWuXing: record.五行,
      guaCi: record.卦次,
      upperGua,
      lowerGua,
      yaoCodes: yaoCodes as readonly YaoCode[],
      dongYaoIndices: dongYaoIndices as readonly number[],
    };
  }

  /**
   * 根据动爻生成变卦
   * @param benGua - 本卦信息
   * @returns 变卦信息，若无动爻则返回null
   */
  generateBianGua(benGua: BenGuaInternal): GuaInfo | null {
    const dongYaoIndices = benGua.dongYaoIndices;

    // 无动爻，无变卦
    if (dongYaoIndices.length === 0) {
      return null;
    }

    // 1. 变爻: 阳变阴，阴变阳
    const bianYaoCodes: YaoCode[] = [...benGua.yaoCodes];
    dongYaoIndices.forEach(idx => {
      bianYaoCodes[idx] = bianYaoCodes[idx] === 1 ? 0 : 1;
    });

    // 2. 生成变卦编码
    const bianCode = bianYaoCodes.join('');

    // 3. 查找变卦信息
    const record = GUA64_BY_CODE.get(bianCode);
    if (!record) {
      throw new InvalidHexagramError(bianCode);
    }

    // 4. 解析上下经卦
    const upperCode = bianCode.slice(0, 3);
    const lowerCode = bianCode.slice(3, 6);
    const upperGua = this.findBaGuaByCode(upperCode);
    const lowerGua = this.findBaGuaByCode(lowerCode);

    return {
      code: bianCode,
      name: record.卦名,
      sequence: record.卦序,
      gong: record.宫名,
      gongWuXing: record.五行,
      guaCi: record.卦次,
      upperGua,
      lowerGua,
      yaoCodes: bianYaoCodes as readonly YaoCode[],
    };
  }

  /**
   * 计算世爻位置
   * @param guaCi - 卦次
   * @returns 世爻索引 (0=初爻, 5=上爻)
   */
  calculateShiYaoIndex(guaCi: GuaCi): number {
    return getShiYaoIndex(guaCi);
  }

  /**
   * 计算应爻位置
   * @param shiIndex - 世爻索引
   * @returns 应爻索引
   */
  calculateYingYaoIndex(shiIndex: number): number {
    return getYingYaoIndex(shiIndex);
  }

  /**
   * 同时获取世应位置
   */
  getShiYingPositions(guaCi: GuaCi): { shi: number; ying: number } {
    const shi = this.calculateShiYaoIndex(guaCi);
    const ying = this.calculateYingYaoIndex(shi);
    return { shi, ying };
  }

  /**
   * 查找本宫卦 (八纯卦)
   * @param gongName - 卦宫名称，如"坎宫"
   */
  findBenGongGua(gongName: string): GuaInfo {
    const record = getBenGongGua(gongName);
    if (!record) {
      throw new CalculationError('查找本宫卦', `未找到${gongName}的本宫卦`);
    }

    return this.recordToGuaInfo(record);
  }

  // ============================================
  // 私有辅助方法
  // ============================================

  /**
   * 解析输入数字为阴阳编码和动爻索引
   * 输入顺序: 从左到右 = 上爻到初爻
   * 返回数组索引: 0=上爻, 5=初爻
   */
  private parseDigits(digits: readonly YaoInput[]): {
    yaoCodes: YaoCode[];
    dongYaoIndices: number[];
  } {
    const yaoCodes: YaoCode[] = [];
    const dongYaoIndices: number[] = [];

    digits.forEach((d, idx) => {
      // 阴阳判断: 7,9为阳(1); 6,8为阴(0)
      const yinYang: YaoCode = (d === 7 || d === 9) ? 1 : 0;
      yaoCodes.push(yinYang);

      // 动爻判断: 6(老阴), 9(老阳)
      if (d === 6 || d === 9) {
        dongYaoIndices.push(idx); // idx 0=上爻, 5=初爻
      }
    });

    return { yaoCodes, dongYaoIndices };
  }

  /**
   * 根据3位编码查找经卦名称
   */
  private findBaGuaByCode(code: string): BaGua {
    for (const [gua, guaCode] of Object.entries(BAGUA_CODES)) {
      if (guaCode === code) {
        return gua as BaGua;
      }
    }
    throw new CalculationError('查找经卦', `无效的经卦编码: ${code}`);
  }

  /**
   * 将记录转换为GuaInfo
   */
  private recordToGuaInfo(record: Gua64Record): GuaInfo {
    const code = record.编码;
    const upperCode = code.slice(0, 3);
    const lowerCode = code.slice(3, 6);

    const yaoCodes: YaoCode[] = code.split('').map(c => (c === '1' ? 1 : 0));

    return {
      code,
      name: record.卦名,
      sequence: record.卦序,
      gong: record.宫名,
      gongWuXing: record.五行,
      guaCi: record.卦次,
      upperGua: this.findBaGuaByCode(upperCode),
      lowerGua: this.findBaGuaByCode(lowerCode),
      yaoCodes: yaoCodes as readonly YaoCode[],
    };
  }
}

// ============================================
// 单例导出
// ============================================

export const hexagramEngine = new HexagramEngine();