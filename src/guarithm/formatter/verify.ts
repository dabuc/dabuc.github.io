/**
 * OutputFormatter 手动验证脚本
 */

import { OutputFormatter } from './engine.js';
import { hexagramEngine } from '../hexagram/engine.js';
import { assignmentEngine } from '../assignment/engine.js';
import { astroEngine } from '../astro/engine.js';
import type { YaoInput, PaiPanInput } from '../types/index.js';

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `❌ ${message}\n   预期: ${JSON.stringify(expected)}\n   实际: ${JSON.stringify(actual)}`
    );
  }
  console.log(`✅ ${message}`);
}

function assertTrue(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ ${message}`);
  }
  console.log(`✅ ${message}`);
}

function assertContains(text: string, substring: string, message: string): void {
  if (!text.includes(substring)) {
    throw new Error(`❌ ${message}\n   文本中未找到: ${substring}`);
  }
  console.log(`✅ ${message}`);
}

export function verifyOutputFormatter(): void {
  console.log('\n========== OutputFormatter 验证开始 ==========\n');

  const formatter = new OutputFormatter();

  // ==========================================
  // 构造完整排盘数据 (水泽节 678879 寅月甲戌日)
  // ==========================================
  const input: PaiPanInput = {
    digits: [6, 7, 8, 8, 7, 9] as readonly YaoInput[],
    monthZhi: '寅',
    dayGanZhi: '甲戌',
  };

  // 计算卦象
  const benGuaInfo = hexagramEngine.determineBenGua(input.digits);
  const bianGuaInfo = hexagramEngine.generateBianGua(benGuaInfo);
  const dayGan = '甲' as import('../types/index.js').TianGan;

  // 装卦
  const benGuaYao = assignmentEngine.assignBenGua(
    benGuaInfo,
    dayGan,
    benGuaInfo.dongYaoIndices
  );
  const bianGuaYao = bianGuaInfo
    ? assignmentEngine.assignBianGua(bianGuaInfo, dayGan,benGuaInfo.gongWuXing)
    : null;

  // 计算神煞
  const shenSha = astroEngine.calculateShenSha(input.monthZhi, input.dayGanZhi);

  // 组装完整结果
  const { shi, ying } = hexagramEngine.getShiYingPositions(benGuaInfo.guaCi);

    //8. 计算旬空
  const xunKong = astroEngine.calculateXunKong(input.dayGanZhi);

  const paiPanResult = {
    input,
    ganZhi: {
      month: input.monthZhi,
      day: input.dayGanZhi,
      xunKong: xunKong,
    },
    shenSha:shenSha,
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
  } as import('../types/index.js').PaiPanResult;

  // ==========================================
  // 测试1: JSON 输出
  // ==========================================
  console.log('--- 测试: JSON 输出 ---');
  {
    const json = formatter.toJSON(paiPanResult);

    // 验证元数据
    assertEqual(json.metadata.inputDigits, '678879', 'JSON应包含正确输入数字');
    assertEqual(json.metadata.inputMonth, '寅', 'JSON应包含正确月支');
    assertEqual(json.metadata.inputDay, '甲戌', 'JSON应包含正确日干支');

    // 验证干支
    assertEqual(json.ganZhi.month, '寅', 'JSON干支月支应为寅');
    assertEqual(json.ganZhi.xunKong, ['申', '酉'], 'JSON旬空应为申酉');

    // 验证本卦
    assertEqual(json.benGua.name, '水泽节', 'JSON本卦名应为水泽节');
    assertEqual(json.benGua.gong, '坎宫', 'JSON本卦宫应为坎宫');
    assertEqual(json.benGua.shiYao, 0, 'JSON世爻应在初爻(0)');
    assertEqual(json.benGua.yingYao, 3, 'JSON应爻应在四爻(3)');

    // 验证爻数组
    assertEqual(json.benGua.yao.length, 6, 'JSON应有6爻');
    assertEqual(json.benGua.yao[0].position, 0, '第一爻位置应为0(上爻)');
    assertEqual(json.benGua.yao[5].position, 5, '第六爻位置应为5(初爻)');

    // 验证动爻
    assertEqual(json.benGua.yao[0].dong, true, '上爻应为动爻');
    assertEqual(json.benGua.yao[5].dong, true, '初爻应为动爻');
    assertEqual(json.benGua.yao[1].dong, false, '五爻不应为动爻');

    // 验证世应
    assertEqual(json.benGua.yao[0].shiYing, '世', '初爻应为世');
    assertEqual(json.benGua.yao[3].shiYing, '应', '四爻应为应');

    // 验证变卦
    assertTrue(json.bianGua !== null, 'JSON应有变卦');
    assertEqual(json.bianGua!.name, '风水涣', 'JSON变卦应为风水涣');

    // 验证神煞
    assertTrue('申' in json.shenSha.byDiZhi, 'JSON神煞应包含申');
    assertTrue(json.shenSha.byDiZhi['申'].includes('驿马'), '申应有驿马');

    console.log('\nJSON结构验证通过');
    console.log('JSON示例:', JSON.stringify(json, null, 2).substring(0, 500) + '...');
  }

  // ==========================================
  // 测试2: Markdown 输出
  // ==========================================
  console.log('\n--- 测试: Markdown 输出 ---');
  {
    const md = formatter.toMarkdown(paiPanResult);

    console.log('生成的Markdown:');
    console.log('---');
    console.log(md);
    console.log('---');

    // 验证关键内容
    assertContains(md, '坎宫：水泽节', 'Markdown应包含本卦信息');
    assertContains(md, '离宫：风水涣', 'Markdown应包含变卦信息');
    assertContains(md, '将星－午', 'Markdown应包含将星');
    assertContains(md, '华盖－戌', 'Markdown应包含华盖');
    assertContains(md, '旬空：申酉', 'Markdown应包含旬空');
    assertContains(md, '兄弟子水', 'Markdown应包含兄弟子水');
    assertContains(md, '玄武', 'Markdown应包含玄武');
    assertContains(md, '青龙', 'Markdown应包含青龙');

    // 验证表格结构
    assertContains(md, '| 六神  | 伏神  | 本卦', 'Markdown应有正确表头');
    assertContains(md, '| --- | --- |', 'Markdown应有分隔行');
  }

  // ==========================================
  // 测试3: 字符串化 JSON
  // ==========================================
  console.log('\n--- 测试: JSON 字符串化 ---');
  {
    const jsonStr = formatter.stringifyJSON(paiPanResult, true);
    assertTrue(jsonStr.includes('"name": "水泽节"'), 'JSON字符串应包含卦名');
    assertTrue(jsonStr.includes('\n'), '美化后的JSON应包含换行');

    const compactStr = formatter.stringifyJSON(paiPanResult, false);
    assertTrue(!compactStr.includes('\n  '), '压缩后的JSON不应有多余空格');
  }

  // ==========================================
  // 测试4: 多种格式输出
  // ==========================================
  console.log('\n--- 测试: 多格式输出 ---');
  {
    const both = formatter.format(paiPanResult, 'both');
    assertTrue(both.json !== undefined, 'both格式应包含json');
    assertTrue(both.markdown !== undefined, 'both格式应包含markdown');
  }

  console.log('\n========== OutputFormatter 验证完成 ==========\n');
}

// 直接运行验证
verifyOutputFormatter();