/**
 * HexagramEngine 手动验证脚本
 */

import { HexagramEngine } from './engine.js';
import type { YaoInput } from '../types/index.js';

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

function assertNotNull<T>(value: T | null, message: string): T {
  if (value === null) {
    throw new Error(`❌ ${message} - 值为null`);
  }
  console.log(`✅ ${message}`);
  return value;
}

export function verifyHexagramEngine(): void {
  console.log('\n========== HexagramEngine 验证开始 ==========\n');
  
  const engine = new HexagramEngine();
  
  // ==========================================
  // 测试1: 水泽节 (678879)
  // ==========================================
  console.log('--- 测试: 水泽节 (678879) ---');
  {
    const digits: readonly YaoInput[] = [6, 7, 8, 8, 7, 9];
    const result = engine.determineBenGua(digits);
    
    assertEqual(result.name, '水泽节', '卦名应为水泽节');
    assertEqual(result.code, '010011', '编码应为010011');
    assertEqual(result.gong, '坎宫', '卦宫应为坎宫');
    assertEqual(result.gongWuXing, '水', '卦宫五行应为水');
    assertEqual(result.guaCi, '一世', '卦次应为一世');
    assertEqual(result.sequence, 60, '卦序应为60');
    assertEqual(result.upperGua, '坎', '上经卦应为坎');
    assertEqual(result.lowerGua, '兑', '下经卦应为兑');
    assertEqual(result.yaoCodes, [0, 1, 0, 0, 1, 1], '爻编码应为[0,1,0,0,1,1]');
    assertEqual(result.dongYaoIndices, [0, 5], '动爻应为上爻(0)和初爻(5)');
  }
  
  // ==========================================
  // 测试2: 天风姤
  // ==========================================
  console.log('\n--- 测试: 天风姤 ---');
  {
    const digits: readonly YaoInput[] = [9, 9, 9, 9, 9, 8];
    const result = engine.determineBenGua(digits);
    
    assertEqual(result.name, '天风姤', '卦名应为天风姤');
    assertEqual(result.code, '111110', '编码应为111110');
    assertEqual(result.gong, '乾宫', '卦宫应为乾宫');
    assertEqual(result.upperGua, '乾', '上经卦应为乾');
    assertEqual(result.lowerGua, '巽', '下经卦应为巽');
  }
  
  // ==========================================
  // 测试3: 静卦 (无动爻)
  // ==========================================
  console.log('\n--- 测试: 静卦 (无动爻) ---');
  {
    const digits: readonly YaoInput[] = [7, 8, 8, 8, 8, 7];
    const result = engine.determineBenGua(digits);
    
    assertEqual(result.dongYaoIndices.length, 0, '动爻数量应为0');
    
    const bianGua = engine.generateBianGua(result);
    assertTrue(bianGua === null, '静卦应变卦为null');
  }
  
  // ==========================================
  // 测试4: 变卦生成 (水泽节 → 风水涣)
  // ==========================================
  console.log('\n--- 测试: 变卦生成 ---');
  {
    const digits: readonly YaoInput[] = [6, 7, 8, 8, 7, 9];
    const benGua = engine.determineBenGua(digits);
    const bianGua = assertNotNull(
      engine.generateBianGua(benGua),
      '应生成变卦'
    );
    
    assertEqual(bianGua.name, '风水涣', '变卦应为风水涣');
    assertEqual(bianGua.code, '110010', '变卦编码应为110010');
    assertEqual(bianGua.gong, '离宫', '变卦卦宫应为离宫');
  }
  
  // ==========================================
  // 测试5: 全动爻 (乾为天 → 坤为地)
  // ==========================================
  console.log('\n--- 测试: 全动爻 ---');
  {
    const digits: readonly YaoInput[] = [9, 9, 9, 9, 9, 9];
    const benGua = engine.determineBenGua(digits);
    const bianGua = assertNotNull(
      engine.generateBianGua(benGua),
      '应生成变卦'
    );
    
    assertEqual(benGua.name, '乾为天', '本卦应为乾为天');
    assertEqual(bianGua.name, '坤为地', '变卦应为坤为地');
    assertEqual(bianGua.code, '000000', '变卦编码应为000000');
  }
  
  // ==========================================
  // 测试6: 世应位置计算
  // ==========================================
  console.log('\n--- 测试: 世应位置 ---');
  {
    // 一世卦: 世在初爻(数组索引5)，应在四爻(数组索引2)
    let pos = engine.getShiYingPositions('一世');
    assertEqual(pos.shi, 5, '一世卦世爻应在数组索引5(初爻)');
    assertEqual(pos.ying, 2, '一世卦应爻应在数组索引2(四爻)');
    
    // 二世卦: 世在二爻(4)，应在五爻(1)
    pos = engine.getShiYingPositions('二世');
    assertEqual(pos.shi, 4, '二世卦世爻应在数组索引4(二爻)');
    assertEqual(pos.ying, 1, '二世卦应爻应在数组索引1(五爻)');
    
    // 三世卦: 世在三爻(3)，应在上爻(0)
    pos = engine.getShiYingPositions('三世');
    assertEqual(pos.shi, 3, '三世卦世爻应在数组索引3(三爻)');
    assertEqual(pos.ying, 0, '三世卦应爻应在数组索引0(上爻)');
    
    // 四世卦: 世在四爻(2)，应在初爻(5)
    pos = engine.getShiYingPositions('四世');
    assertEqual(pos.shi, 2, '四世卦世爻应在数组索引2(四爻)');
    assertEqual(pos.ying, 5, '四世卦应爻应在数组索引5(初爻)');
    
    // 五世卦: 世在五爻(1)，应在二爻(4)
    pos = engine.getShiYingPositions('五世');
    assertEqual(pos.shi, 1, '五世卦世爻应在数组索引1(五爻)');
    assertEqual(pos.ying, 4, '五世卦应爻应在数组索引4(二爻)');
    
    // 本宫卦: 世在上爻(0)，应在三爻(3)
    pos = engine.getShiYingPositions('本宫');
    assertEqual(pos.shi, 0, '本宫卦世爻应在数组索引0(上爻)');
    assertEqual(pos.ying, 3, '本宫卦应爻应在数组索引3(三爻)');
    
    // 游魂卦: 世在四爻(2)，应在初爻(5)
    pos = engine.getShiYingPositions('游魂');
    assertEqual(pos.shi, 2, '游魂卦世爻应在数组索引2(四爻)');
    assertEqual(pos.ying, 5, '游魂卦应爻应在数组索引5(初爻)');
    
    // 归魂卦: 世在三爻(3)，应在上爻(0)
    pos = engine.getShiYingPositions('归魂');
    assertEqual(pos.shi, 3, '归魂卦世爻应在数组索引3(三爻)');
    assertEqual(pos.ying, 0, '归魂卦应爻应在数组索引0(上爻)');
  }
  
  // ==========================================
  // 测试7: 本宫卦查找
  // ==========================================
  console.log('\n--- 测试: 本宫卦查找 ---');
  {
    const kanGong = engine.findBenGongGua('坎宫');
    assertEqual(kanGong.name, '坎为水', '坎宫本宫卦应为坎为水');
    assertEqual(kanGong.guaCi, '本宫', '应为八纯卦');
    
    const qianGong = engine.findBenGongGua('乾宫');
    assertEqual(qianGong.name, '乾为天', '乾宫本宫卦应为乾为天');
    
    const kunGong = engine.findBenGongGua('坤宫');
    assertEqual(kunGong.name, '坤为地', '坤宫本宫卦应为坤为地');
  }
  
  console.log('\n========== 所有验证通过! ==========\n');
}

// 直接运行验证
verifyHexagramEngine();