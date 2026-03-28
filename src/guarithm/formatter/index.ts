// ============================================
// OutputFormatter 模块导出
// OutputFormatter 结果序列化,将内部对象转换为标准JSON或Markdown表格格式
// ============================================

export { 
  OutputFormatter, 
  outputFormatter,
  type OutputFormat,
  type FormattedOutput
} from './engine.js';

export {
  toJSON,
  type PaiPanJSON,
  type YaoJSON,
  type GuaJSON,
  type ShenShaJSON
} from './json.js';

export {
  toMarkdown
} from './markdown.js';