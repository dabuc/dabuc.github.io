/**
 * 系统完整验证
 */

import { paiPan, paiPanQuick, VERSION } from './index.js';
import type { PaiPanInput, YaoInput } from './types/index.js';

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`❌ ${message}\n预期: ${JSON.stringify(expected)}\n实际: ${JSON.stringify(actual)}`);
  }
  console.log(`✅ ${message}`);
}

function assertTrue(condition: boolean, message: string): void {
  if (!condition) throw new Error(`❌ ${message}`);
  console.log(`✅ ${message}`);
}

export function verifySystem(): void {
  console.log('\n========================================');
  console.log(`六爻排盘系统 v${VERSION} 验证`);
  console.log('========================================\n');
  
  // ========================================
  // 测试1: 水泽节 (需求文档示例)
  // ========================================
  console.log('--- 测试: 水泽节 678879 寅月甲戌日 ---');
  {
    const input: PaiPanInput = {
      digits: [6, 7, 8, 8, 7, 9] as readonly YaoInput[],
      monthZhi: '寅',
      dayGanZhi: '甲戌'
    };
    
    const result = paiPan(input);
    
    // 基础验证
    assertEqual(result.benGuaName, '水泽节', '本卦应为水泽节');
    assertEqual(result.bianGuaName, '风水涣', '变卦应为风水涣');
    assertEqual(result.benGuaGong, '坎宫', '卦宫应为坎宫');
    assertEqual(result.xunKong, ['申', '酉'], '旬空应为申酉');
    
    // 世应验证 (一世卦: 世初爻，应四爻)
    assertEqual(result.shiYao.position, 5, '世爻应在初爻(索引5)');
    assertEqual(result.yingYao.position, 2, '应爻应在四爻(索引2)');
    
    // 动爻验证
    assertEqual(result.dongYao.length, 2, '应有2个动爻');
    assertTrue(result.dongYao.some(y => y.position === 0), '上爻应为动爻');
    assertTrue(result.dongYao.some(y => y.position === 5), '初爻应为动爻');
    
    // 神煞验证
    assertTrue(result.getShenSha('午').includes('将星'), '午应有将星');
    assertTrue(result.getShenSha('戌').includes('华盖'), '戌应有华盖');
    assertTrue(result.getShenSha('申').includes('驿马'), '申应有驿马');
    
    // 输出验证
    const md = result.toMarkdown();
    assertTrue(md.includes('水泽节'), 'Markdown应包含水泽节');
    assertTrue(md.includes('风水涣'), 'Markdown应包含风水涣');
    assertTrue(md.includes('⚋×'), 'Markdown应包含动阴符号');
    
    const json = result.toJSON();
    assertEqual(json.benGua.name, '水泽节', 'JSON本卦名正确');
    
    console.log('\n排盘结果预览:');
    console.log(result.shenShaDisplay);
    console.log(`\n世爻: ${result.shiYao.liuShen} ${result.shiYao.liuQin}${result.shiYao.diZhi}${result.shiYao.wuXing} 世`);
    console.log(`应爻: ${result.yingYao.liuShen} ${result.yingYao.liuQin}${result.yingYao.diZhi}${result.yingYao.wuXing} 应`);
  }
  
  // ========================================
  // 测试2: 快速调用
  // ========================================
  console.log('\n--- 测试: paiPanQuick 快速调用 ---');
  {
    const result = paiPanQuick('999999', '子', '甲子');
    assertEqual(result.benGuaName, '乾为天', '999999应为乾为天');
    assertEqual(result.bianGuaName, '坤为地', '全动应变为坤为地');
  }
  
  // ========================================
  // 测试3: 静卦
  // ========================================
  console.log('\n--- 测试: 静卦 (无变卦) ---');
  {
    const result = paiPanQuick('777777', '寅', '甲子');
    assertEqual(result.bianGuaName, null, '静卦应变卦为null');
    assertEqual(result.dongYao.length, 0, '静卦应无动爻');
  }
  
  // ========================================
  // 测试4: 不同卦宫验证
  // ========================================
  console.log('\n--- 测试: 不同卦宫 ---');
  {
    // 乾宫卦: 天风姤
    const result = paiPanQuick('111110', '午', '丙午');
    assertEqual(result.benGuaName, '天风姤', '111110应为天风姤');
    assertEqual(result.benGuaGong, '乾宫', '应为乾宫');
    assertEqual(result.shiYao.position, 5, '一世卦世在初爻(数组索引5)');
    
    // 坤宫卦: 地雷复
// 坤宫卦: 地雷复 (000001 → 888887)
// 上坤000 + 下震001 = 000001
const result2 = paiPanQuick('000001', '酉', '辛酉');
assertEqual(result2.benGuaName, '地雷复', '000001应为地雷复');
assertEqual(result2.benGuaGong, '坤宫', '应为坤宫');
  }
  
  console.log('\n========================================');
  console.log('所有验证通过! 系统运行正常。');
  console.log('========================================\n');
}

// ============================================
// 运行验证 (修正版)
// ============================================

// 方式1: 直接调用 (推荐)
verifySystem();

// 方式2: 如果需要通过命令行判断，使用环境变量或显式标志
// if (process.env.RUN_VERIFY === 'true') {
//   verifySystem();
// }