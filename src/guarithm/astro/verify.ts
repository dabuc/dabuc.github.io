/**
 * AstroEngine 手动验证脚本
 */
import type { DiZhi } from '../types/index.js';
import { AstroEngine } from './engine.js';


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

export function verifyAstroEngine(): void {
  console.log('\n========== AstroEngine 验证开始 ==========\n');

  const engine = new AstroEngine();

  // ==========================================
  // 测试1: 甲戌日神煞计算
  // ==========================================
  console.log('--- 测试: 寅月甲戌日神煞 ---');
  {
    const monthZhi = '寅';
    const dayGanZhi = '甲戌';

    const result = engine.calculateShenSha(monthZhi, dayGanZhi);
    const xunkong = engine.calculateXunKong(dayGanZhi);

    // 验证旬空 (甲戌旬: 申酉空)
    assertEqual(xunkong, ['申', '酉'], '甲戌日旬空应为申酉');

    // 检查神煞映射
    const shenShaList = (dz: string) => result.map.get(dz as DiZhi) ?? [];

    assertTrue(shenShaList('丑').includes('贵人'), '丑应有贵人');
    assertTrue(shenShaList('未').includes('贵人'), '未应有贵人');
    assertTrue(shenShaList('寅').includes('禄神'), '寅应有禄神');
    assertTrue(shenShaList('卯').includes('羊刃'), '卯应有羊刃');
    assertTrue(shenShaList('巳').includes('文昌'), '巳应有文昌');

    assertTrue(shenShaList('申').includes('驿马'), '申应有驿马');
    assertTrue(shenShaList('卯').includes('桃花'), '卯应有桃花');
    assertTrue(shenShaList('午').includes('将星'), '午应有将星');
    assertTrue(shenShaList('亥').includes('劫煞'), '亥应有劫煞');
    assertTrue(shenShaList('戌').includes('华盖'), '戌应有华盖');
    assertTrue(shenShaList('辰').includes('谋星'), '辰应有谋星');
    assertTrue(shenShaList('子').includes('灾煞'), '子应有灾煞');

    assertTrue(shenShaList('丑').includes('天医'), '丑应有天医');
    assertTrue(shenShaList('戌').includes('天喜'), '戌应有天喜');

    // 格式化输出
    const display = engine.formatDisplay(result.map);
    console.log('\n神煞显示:', display);

    // 验证包含关键神煞
    assertTrue(display.includes('将星－午'), '显示应包含将星－午');
    assertTrue(display.includes('华盖－戌'), '显示应包含华盖－戌');
    assertTrue(display.includes('贵人－丑、未'), '显示应包含贵人－丑、未');
  }

  // ==========================================
  // 测试2: 不同日干贵人
  // ==========================================
  console.log('\n--- 测试: 不同日干贵人 ---');
  {
    // 甲戊日: 丑未
    let result = engine.calculateShenSha('寅', '甲子');
    assertTrue(
      (result.map.get('丑') ?? []).includes('贵人'),
      '甲日贵人应在丑'
    );

    // 乙己日: 子申
    result = engine.calculateShenSha('寅', '乙丑');
    assertTrue(
      (result.map.get('子') ?? []).includes('贵人'),
      '乙日贵人应在子'
    );
    assertTrue(
      (result.map.get('申') ?? []).includes('贵人'),
      '乙日贵人应在申'
    );

    // 丙丁日: 亥酉
    result = engine.calculateShenSha('寅', '丙寅');
    assertTrue(
      (result.map.get('亥') ?? []).includes('贵人'),
      '丙日贵人应在亥'
    );
  }

  // ==========================================
  // 测试3: 不同日支三合局神煞
  // ==========================================
  console.log('\n--- 测试: 三合局神煞 ---');
  {
    // 申子辰日
    let result = engine.calculateShenSha('申', '甲子');
    assertTrue(
      (result.map.get('寅') ?? []).includes('驿马'),
      '申子辰日驿马应在寅'
    );
    assertTrue(
      (result.map.get('酉') ?? []).includes('桃花'),
      '申子辰日桃花应在酉'
    );

    // 巳酉丑日
    result = engine.calculateShenSha('巳', '乙巳');
    assertTrue(
      (result.map.get('亥') ?? []).includes('驿马'),
      '巳酉丑日驿马应在亥'
    );
    assertTrue(
      (result.map.get('午') ?? []).includes('桃花'),
      '巳酉丑日桃花应在午'
    );
  }

  // ==========================================
  // 测试4: 季节神煞
  // ==========================================
  console.log('\n--- 测试: 季节天喜 ---');
  {
    // 春季 (寅卯辰): 天喜在戌
    let result = engine.calculateShenSha('寅', '甲子');
    assertTrue(
      (result.map.get('戌') ?? []).includes('天喜'),
      '春季天喜应在戌'
    );

    // 夏季 (巳午未): 天喜在丑
    result = engine.calculateShenSha('巳', '甲子');
    assertTrue(
      (result.map.get('丑') ?? []).includes('天喜'),
      '夏季天喜应在丑'
    );

    // 秋季 (申酉戌): 天喜在辰
    result = engine.calculateShenSha('申', '甲子');
    assertTrue(
      (result.map.get('辰') ?? []).includes('天喜'),
      '秋季天喜应在辰'
    );

    // 冬季 (亥子丑): 天喜在未
    result = engine.calculateShenSha('亥', '甲子');
    assertTrue(
      (result.map.get('未') ?? []).includes('天喜'),
      '冬季天喜应在未'
    );
  }

  // ==========================================
  // 测试5: 天医计算
  // ==========================================
  console.log('\n--- 测试: 天医 ---');
  {
    // 寅月: 天医在丑
    let result = engine.calculateShenSha('寅', '甲子');
    assertTrue(
      (result.map.get('丑') ?? []).includes('天医'),
      '寅月天医应在丑'
    );

    // 卯月: 天医在寅
    result = engine.calculateShenSha('卯', '甲子');
    assertTrue(
      (result.map.get('寅') ?? []).includes('天医'),
      '卯月天医应在寅'
    );

    // 子月: 天医在亥
    result = engine.calculateShenSha('子', '甲子');
    assertTrue(
      (result.map.get('亥') ?? []).includes('天医'),
      '子月天医应在亥'
    );
  }

  console.log('\n========== AstroEngine 验证完成 ==========\n');
}

// 直接运行验证
verifyAstroEngine();