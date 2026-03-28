/**
 * 错误类型定义
 */

export class LiuYiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** 输入验证错误 */
export class InvalidInputError extends LiuYiError {
  constructor(message: string) {
    super(`输入错误: ${message}`);
  }
}

/** 无效的卦编码 */
export class InvalidHexagramError extends LiuYiError {
  constructor(code: string) {
    super(`无效的卦编码: ${code}，无法找到对应的64卦记录`);
  }
}

/** 数据缺失错误 */
export class MissingDataError extends LiuYiError {
  constructor(dataType: string, key: string) {
    super(`缺失${dataType}数据: ${key}`);
  }
}

/** 计算逻辑错误 */
export class CalculationError extends LiuYiError {
  constructor(operation: string, reason: string) {
    super(`计算错误[${operation}]: ${reason}`);
  }
}