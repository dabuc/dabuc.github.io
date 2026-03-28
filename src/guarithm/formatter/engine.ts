import type { PaiPanResult } from '../types/index.js';
import { toJSON, type PaiPanJSON } from './json.js';
import { toMarkdown } from './markdown.js';

// ============================================
// 输出格式类型
// ============================================

export type OutputFormat = 'json' | 'markdown' | 'both';

export interface FormattedOutput {
  readonly json?: PaiPanJSON;
  readonly markdown?: string;
}

// ============================================
// OutputFormatter 核心类
// ============================================

export class OutputFormatter {
  
  /**
   * 转换为 JSON 格式
   */
  toJSON(result: PaiPanResult): PaiPanJSON {
    return toJSON(result);
  }
  
  /**
   * 转换为 Markdown 表格格式
   */
  toMarkdown(result: PaiPanResult): string {
    return toMarkdown(result);
  }
  
  /**
   * 同时输出多种格式
   */
  format(result: PaiPanResult, format: OutputFormat): FormattedOutput {
    switch (format) {
      case 'json':
        return { json: this.toJSON(result) };
      case 'markdown':
        return { markdown: this.toMarkdown(result) };
      case 'both':
        return {
          json: this.toJSON(result),
          markdown: this.toMarkdown(result),
        };
      default:
        throw new Error(`不支持的输出格式: ${format}`);
    }
  }
  
  /**
   * 序列化为 JSON 字符串
   */
  stringifyJSON(result: PaiPanResult, pretty = true): string {
    const json = this.toJSON(result);
    return JSON.stringify(json, null, pretty ? 2 : undefined);
  }
}

// ============================================
// 单例导出
// ============================================

export const outputFormatter = new OutputFormatter();