import type { PaiPanResult, Yao } from '../types/index.js';

// ============================================
// Markdown 表格生成
// ============================================

/**
 * 生成完整的 Markdown 排盘输出
 * 格式参考需求文档示例
 */
export function toMarkdown(result: PaiPanResult): string {
  const lines: string[] = [];

  // 1. 神煞行
  const shenShaLine = result.shenSha.displayString;
  lines.push(shenShaLine);
  lines.push('');

  // 2. 干支信息
  const xunKongStr = result.ganZhi.xunKong.join('');
  lines.push(`干支：${result.ganZhi.month}月　${result.ganZhi.day}日 (旬空：${xunKongStr})`);
  lines.push('');

  // 3. 卦象表格
  const table = formatGuaTable(result);
  lines.push(table);

  return lines.join('\n');
}

/**
 * 格式化卦象表格
 */
function formatGuaTable(result: PaiPanResult): string {
  const { benGua, bianGua } = result;

  // 表头
  const benGongName = benGua.info.gong;
  const bianGongName = bianGua?.info.gong ?? '';

  let header: string;
  if (bianGua) {
    header = `|     |     | ${benGongName}：${benGua.info.name}      | ${bianGongName}：${bianGua.info.name}    |`;
  } else {
    header = `|     |     | ${benGongName}：${benGua.info.name}      |           |`;
  }

  // 分隔行
  const separator = '| --- | --- | ----------- | --------- |';

  // 列标题
  const colHeader = '| 六神  | 伏神  | 本卦          | 变卦        |';

  const lines: string[] = [header, separator, colHeader];

  // 六爻行 (从上爻到初爻)
  for (let i = 0; i < 6; i++) {
    const row = formatYaoRow(benGua.yao[i], bianGua?.yao[i] ?? null);
    lines.push(row);
  }

  return lines.join('\n');
}

/**
 * 格式化单行爻数据
 */
function formatYaoRow(
  benYao: Yao,
  bianYao: Yao | null
): string {
  // 六神列
  const liuShen = benYao.liuShen;

  // 伏神列
  const fuShen = benYao.fuShen ? benYao.fuShen.displayText : '';

  // 本卦列: 六亲地支五行 + 阴阳符号 + 世应标记 + 动爻标记
  const benText = formatYaoText(benYao);

  // 变卦列
  const bianText = bianYao ? formatYaoText(bianYao) : '';

  return `| ${liuShen}  | ${fuShen}  | ${benText}      | ${bianText}        |`;
}

/**
 * 格式化单爻文本
 * 格式: "兄弟子水 ⚋×  应" 或 "官鬼戌土 ⚊"
 */
function formatYaoText(yao: Yao): string {
  const baseText = `${yao.liuQin}${yao.diZhi}${yao.wuXing}`;

  // 阴阳符号
  let symbol: string;
  if (yao.isDong) {
    // 动爻
    symbol = yao.yinYang === 1 ? '⚊○' : '⚋×';
  } else {
    symbol = yao.yinYang === 1 ? '⚊' : '⚋';
  }

  // 世应标记
  const shiYing = yao.shiYing ? `  ${yao.shiYing}` : '';

  // 组合: 需要调整空格以对齐表格
  return `${baseText} ${symbol}${shiYing}`;
}