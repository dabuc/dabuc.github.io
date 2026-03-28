// ============================================
// HexagramEngine 模块导出
// HexagramEngine 卦象计算核心,根据输入数字确定本卦、生成变卦、确定世应位置、查找卦宫五行属性
// ============================================

export { 
  HexagramEngine, 
  hexagramEngine 
} from './engine.js';

// 导出相关错误类型
export { 
  InvalidHexagramError, 
  CalculationError 
} from '../errors/index.js';