/**
 * AssignmentEngine 手动验证脚本
 */

import { AssignmentEngine } from './engine.js';
import { hexagramEngine } from '../hexagram/engine.js';
import { arrangeDiZhi, getChunGuaDiZhi } from './najia.js';
import { calculateLiuQin } from './liuqin.js';
import { arrangeLiuShen } from '../constants/liushen.js';
import type { YaoInput, TianGan } from '../types/index.js';

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `❌ ${message}\n   预期: ${JSON.stringify(expected)}\n   实际: ${JSON.stringify(actual)}`
    );
  }
  console.log(`✅ ${message}`);
}

// function assertEqual<T>(actual: T, expected: T, msg: string): void {
//   if (JSON.stringify(actual) !== JSON.stringify(expected)) {
//     throw new Error(`${msg}失败: 预期${JSON.stringify(expected)}, 实际${JSON.stringify(actual)}`);
//   }
// }

// ============================================
// 验证函数: 检查纳甲结果
// ============================================

/** 验证八纯卦地支配置 */
export function verifyNaJia(): void {
  console.log('\n========== 纳甲验证 ==========\n');

  // 验证乾卦 (阳顺: 子寅辰午申戌)
  const qian = getChunGuaDiZhi('乾');
  console.log('乾卦:', qian);
  // 上爻=戌, 五爻=申, 四爻=午, 三爻=辰, 二爻=寅, 初爻=子
  assertEqual(qian.upper, ['戌', '申', '午'], '乾上三爻');
  assertEqual(qian.lower, ['辰', '寅', '子'], '乾下三爻');

  // 验证坤卦 (阴逆: 未巳卯丑亥酉)
  const kun = getChunGuaDiZhi('坤');
  console.log('坤卦:', kun);
  // 上爻=酉, 五爻=亥, 四爻=丑, 三爻=卯, 二爻=巳, 初爻=未
  assertEqual(kun.upper, ['酉', '亥', '丑'], '坤上三爻');
  assertEqual(kun.lower, ['卯', '巳', '未'], '坤下三爻');

  // 验证坎卦 (阳顺起寅: 寅辰午申戌子)
  const kan = getChunGuaDiZhi('坎');
  console.log('坎卦:', kan);
  assertEqual(kan.upper, ['子', '戌', '申'], '坎上三爻');
  assertEqual(kan.lower, ['午', '辰', '寅'], '坎下三爻');

  // 验证离卦 (阴逆起卯: 卯丑亥酉未巳)
  const li = getChunGuaDiZhi('离');
  console.log('离卦:', li);
  assertEqual(li.upper, ['巳', '未', '酉'], '离上三爻');
  assertEqual(li.lower, ['亥', '丑', '卯'], '离下三爻');

  // 验证水泽节 (坎上兑下)
  const jie = arrangeDiZhi('坎', '兑');
  console.log('水泽节地支:', jie);
  // 坎上: 子戌申, 兑下: 丑卯巳 (三爻丑、二爻卯、初爻巳)
  assertEqual(jie, ['子', '戌', '申', '丑', '卯', '巳'], '水泽节六爻');

  // 验证水地比 (坎上坤下)
  const bi = arrangeDiZhi('坎', '坤');
  console.log('水地比地支:', bi);
  assertEqual(bi, ['子', '戌', '申', '卯', '巳', '未'], '水地比六爻');

  console.log('\n✅ 纳甲验证通过\n');
}




export function verifyAssignmentEngine(): void {
  console.log('\n========== AssignmentEngine 验证开始 ==========\n');
  
  const engine = new AssignmentEngine();
  
  // ==========================================
  // 先验证纳甲基础
  // ==========================================
  
  verifyNaJia();
  
  // ==========================================
  // 测试1: 水泽节装卦 (寅月甲戌日)
  // ==========================================
  console.log('--- 测试: 水泽节完整装卦 ---');
  {
    const digits: readonly YaoInput[] = [6, 7, 8, 8, 7, 9];
    const dayGan: TianGan = '甲';
    
    // 获取卦信息
    const benGua = hexagramEngine.determineBenGua(digits);
    const bianGua = hexagramEngine.generateBianGua(benGua);
    
    // 装本卦
    const benGuaYao = engine.assignBenGua(
      benGua,
      dayGan,
      benGua.dongYaoIndices
    );
    
    console.log('本卦:', benGua.name);
    console.log('卦宫:', benGua.gong, benGua.gongWuXing);
    
    // 验证六爻装配
    console.log('\n本卦六爻:');
    benGuaYao.forEach((yao, idx) => {
      const posName = ['上爻', '五爻', '四爻', '三爻', '二爻', '初爻'][idx];
      const dongMark = yao.isDong ? '⚋×' : (yao.yinYang === 1 ? '⚊' : '⚋');
      const shiYing = yao.shiYing ? ` ${yao.shiYing}` : '';
      const fuShen = yao.fuShen ? ` (伏:${yao.fuShen.displayText})` : '';
      
      console.log(
        `${posName}: ${yao.liuShen} ${yao.liuQin}${yao.diZhi}${yao.wuXing} ${dongMark}${shiYing}${fuShen}`
      );
    });
    
    // ========================================
    // 验证关键爻位 (基于实际纳甲结果)
    // ========================================
    
    // 数组索引: 0=上爻, 1=五爻, 2=四爻, 3=三爻, 4=二爻, 5=初爻
    // 水泽节: 坎上[子戌申] + 兑下[丑卯巳] = [子,戌,申,丑,卯,巳]
    
    // 上爻 (索引0): 子，兄弟，玄武，动爻，非世应
    const shangYao = benGuaYao[0];
    assertEqual(shangYao.diZhi, '子', '上爻地支应为子');
    assertEqual(shangYao.liuQin, '兄弟', '上爻六亲应为兄弟(子水同坎宫水)');
    assertEqual(shangYao.liuShen, '玄武', '甲日玄武起上爻');
    assertEqual(shangYao.isDong, true, '上爻应为动爻(6)');
    assertEqual(shangYao.shiYing, null, '上爻非世应');
    
    // 五爻 (索引1): 戌，官鬼，白虎
    const wuYao = benGuaYao[1];
    assertEqual(wuYao.diZhi, '戌', '五爻地支应为戌');
    assertEqual(wuYao.liuQin, '官鬼', '五爻六亲应为官鬼(戌土克坎水)');
    assertEqual(wuYao.liuShen, '白虎', '甲日五爻白虎');
    
    // 四爻 (索引2): 申，父母，螣蛇，应爻
    const siYao = benGuaYao[2];
    assertEqual(siYao.diZhi, '申', '四爻地支应为申');
    assertEqual(siYao.liuQin, '父母', '四爻六亲应为父母(申金生坎水)');
    assertEqual(siYao.liuShen, '螣蛇', '甲日四爻螣蛇');
    assertEqual(siYao.shiYing, '应', '四爻为应爻(世在初爻，应相隔三位)');
    
    // 三爻 (索引3): 丑，官鬼，勾陈
    const sanYao = benGuaYao[3];
    assertEqual(sanYao.diZhi, '丑', '三爻地支应为丑');
    assertEqual(sanYao.liuQin, '官鬼', '三爻六亲应为官鬼(丑土克坎水)');
    assertEqual(sanYao.liuShen, '勾陈', '甲日三爻勾陈');
    
    // 二爻 (索引4): 卯，子孙，朱雀
    const erYao = benGuaYao[4];
    assertEqual(erYao.diZhi, '卯', '二爻地支应为卯');
    assertEqual(erYao.liuQin, '子孙', '二爻六亲应为子孙(卯木泄坎水)');
    assertEqual(erYao.liuShen, '朱雀', '甲日二爻朱雀');
    
    // 初爻 (索引5): 巳，妻财，青龙，动爻，世爻
    // 注意: 巳火克坎水，故为妻财；一世卦世在初爻
    const chuYao = benGuaYao[5];
    assertEqual(chuYao.diZhi, '巳', '初爻地支应为巳(兑卦阴起巳逆行)');
    assertEqual(chuYao.liuQin, '妻财', '初爻六亲应为妻财(巳火被坎水克)');
    assertEqual(chuYao.liuShen, '青龙', '甲日初爻青龙');
    assertEqual(chuYao.isDong, true, '初爻应为动爻(9)');
    assertEqual(chuYao.shiYing, '世', '初爻为世爻(一世卦世在初爻)');
    
    // 装变卦验证
    if (bianGua) {
      const bianGuaYao = engine.assignBianGua(bianGua, dayGan,benGua.gongWuXing);
      console.log('\n变卦:', bianGua.name);
      console.log('变卦六爻:');
      bianGuaYao.forEach((yao, idx) => {
        const posName = ['上爻', '五爻', '四爻', '三爻', '二爻', '初爻'][idx];
        console.log(
          `${posName}: ${yao.liuShen} ${yao.liuQin}${yao.diZhi}${yao.wuXing} ${yao.yinYang === 1 ? '⚊' : '⚋'}`
        );
      });
      
      // 变卦风水涣: 巽上[卯巳未] + 坎下[午辰寅] = [卯,巳,未,午,辰,寅]
      assertEqual(bianGuaYao[0].diZhi, '卯', '变卦上爻应为卯');
      assertEqual(bianGuaYao[5].diZhi, '寅', '变卦初爻应为寅');
    }
  }
  
  // ==========================================
  // 测试2: 六亲计算验证
  // ==========================================
  console.log('\n--- 测试: 六亲计算 ---');
  {
    // 坎宫属水
    const gongWuXing = '水';
    
    // 同我者兄弟 (水)
    assertEqual(calculateLiuQin('子', gongWuXing), '兄弟', '子水在坎宫为兄弟');
    assertEqual(calculateLiuQin('亥', gongWuXing), '兄弟', '亥水在坎宫为兄弟');
    
    // 我生者子孙 (木)
    assertEqual(calculateLiuQin('寅', gongWuXing), '子孙', '寅木在坎宫为子孙');
    assertEqual(calculateLiuQin('卯', gongWuXing), '子孙', '卯木在坎宫为子孙');
    
    // 我克者妻财 (火)
    assertEqual(calculateLiuQin('巳', gongWuXing), '妻财', '巳火在坎宫为妻财');
    assertEqual(calculateLiuQin('午', gongWuXing), '妻财', '午火在坎宫为妻财');
    
    // 生我者父母 (金)
    assertEqual(calculateLiuQin('申', gongWuXing), '父母', '申金在坎宫为父母');
    assertEqual(calculateLiuQin('酉', gongWuXing), '父母', '酉金在坎宫为父母');
    
    // 克我者官鬼 (土)
    assertEqual(calculateLiuQin('辰', gongWuXing), '官鬼', '辰土在坎宫为官鬼');
    assertEqual(calculateLiuQin('戌', gongWuXing), '官鬼', '戌土在坎宫为官鬼');
    assertEqual(calculateLiuQin('丑', gongWuXing), '官鬼', '丑土在坎宫为官鬼');
    assertEqual(calculateLiuQin('未', gongWuXing), '官鬼', '未土在坎宫为官鬼');
  }
  
  // ==========================================
  // 测试3: 六神排列验证
  // ==========================================
  console.log('\n--- 测试: 六神排列 ---');
  {
    // 甲日: 青龙起初爻，逆排至上爻
    // 数组顺序 [上爻,五爻,四爻,三爻,二爻,初爻] = [玄武,白虎,螣蛇,勾陈,朱雀,青龙]
    const jiaShen = arrangeLiuShen('甲');
    console.log('甲日六神 (上→初):', jiaShen);
    assertEqual(jiaShen, ['玄武', '白虎', '螣蛇', '勾陈', '朱雀', '青龙'], '甲日六神排列');
    
    // 丙日: 朱雀起初爻
    // [青龙,玄武,白虎,螣蛇,勾陈,朱雀]
    const bingShen = arrangeLiuShen('丙');
    console.log('丙日六神 (上→初):', bingShen);
    assertEqual(bingShen, ['青龙', '玄武', '白虎', '螣蛇', '勾陈', '朱雀'], '丙日六神排列');
  }
  
  console.log('\n========== AssignmentEngine 验证完成 ==========\n');
}

// 直接运行验证
verifyAssignmentEngine();