import type { YaoInput, DiZhi, TianGan } from '../types/index.js';
import { InvalidInputError } from '../errors/index.js';
import { DIZHI_ORDER, TIANGAN_ORDER } from '../constants/ganzhi.js';

// ============================================
// 输入验证函数
// ============================================

/** 验证6位数字输入 */
export function validateDigits(input: unknown): asserts input is YaoInput[] {
  if (!Array.isArray(input)) {
    throw new InvalidInputError('数字序列必须是数组');
  }
  
  if (input.length !== 6) {
    throw new InvalidInputError(`数字序列必须是6位，实际收到${input.length}位`);
  }
  
  const validNumbers = [6, 7, 8, 9];
  for (let i = 0; i < input.length; i++) {
    const num = input[i];
    if (!validNumbers.includes(num as number)) {
      throw new InvalidInputError(
        `第${i + 1}位数字无效: ${num}，必须是6(老阴)、7(少阳)、8(少阴)、9(老阳)`
      );
    }
  }
}

/** 验证月支 */
export function validateMonthZhi(input: unknown): asserts input is DiZhi {
  if (typeof input !== 'string') {
    throw new InvalidInputError('月支必须是字符串');
  }
  
  if (!DIZHI_ORDER.includes(input as DiZhi)) {
    throw new InvalidInputError(
      `无效的月支: ${input}，必须是十二地支之一`
    );
  }
}

/** 验证日干支格式 */
export function validateDayGanZhi(input: unknown): asserts input is string {
  if (typeof input !== 'string') {
    throw new InvalidInputError('日干支必须是字符串');
  }
  
  if (input.length !== 2) {
    throw new InvalidInputError(`日干支必须是2位，如"甲戌"，收到"${input}"`);
  }
  
  const gan = input[0] as TianGan;
  const zhi = input[1] as DiZhi;
  
  if (!TIANGAN_ORDER.includes(gan)) {
    throw new InvalidInputError(`无效的天干: ${gan}`);
  }
  
  if (!DIZHI_ORDER.includes(zhi)) {
    throw new InvalidInputError(`无效的地支: ${zhi}`);
  }
}

/** 解析日干支 */
export function parseDayGanZhi(dayGanZhi: string): { gan: TianGan; zhi: DiZhi } {
  validateDayGanZhi(dayGanZhi);
  return {
    gan: dayGanZhi[0] as TianGan,
    zhi: dayGanZhi[1] as DiZhi
  };
}