/**
 * Constants 模块验证脚本
 * 验证所有静态常量定义的正确性
 */

import {
  // 八卦
  BAGUA_CODES, YANG_GUA, YIN_GUA, isYangGua, isYinGua,
  CHUN_GUA_START_DIZHI,
  // 干支
  DIZHI_ORDER, YANG_DIZHI, YIN_DIZHI, TIANGAN_ORDER,

  isYangDiZhi, isYinDiZhi,
  getDiZhiWuXing, getTianGanWuXing,
  getDiZhiIndex, getTianGanIndex,
  // 五行
  isSheng, isKe, calculateLiuQin,
  // 六神
  LIUSHEN_ORDER, getStartLiuShen, arrangeLiuShen,
  // 世应
  getShiYaoIndex, getYingYaoIndex, getShiYingPositions,
  // 神煞
  GUI_REN_TABLE, LU_SHEN_TABLE, YANG_REN_TABLE, WEN_CHANG_TABLE,
  getSanHeType,
  YI_MA_TABLE, TAO_HUA_TABLE, JIANG_XING_TABLE,
  getTianYi, TIAN_XI_TABLE,
  calculateXunKong,
  // 64卦
  GUA64_DATA, GUA64_BY_CODE, GUA64_BY_NAME, GUA64_BY_SEQUENCE, GUA64_BY_GONG,
  getBenGongGua
} from './index.js';


// ============================================
// 断言工具
// ============================================

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

// ============================================
// 验证函数
// ============================================

/**
 * 验证八卦编码
 */
function verifyBaguaCodes(): void {
  console.log('\n--- 验证: 八卦编码 ---');

  // 验证经卦编码 (1=阳, 0=阴, 顺序: 上爻→初爻)
  assertEqual(BAGUA_CODES['乾'], '111', '乾卦应为三阳111');
  assertEqual(BAGUA_CODES['坤'], '000', '坤卦应为三阴000');
  assertEqual(BAGUA_CODES['震'], '001', '震卦应为001');
  assertEqual(BAGUA_CODES['巽'], '110', '巽卦应为110');
  assertEqual(BAGUA_CODES['坎'], '010', '坎卦应为010');
  assertEqual(BAGUA_CODES['离'], '101', '离卦应为101');
  assertEqual(BAGUA_CODES['艮'], '100', '艮卦应为100');
  assertEqual(BAGUA_CODES['兑'], '011', '兑卦应为011');

  // 验证阴阳分类
  assertTrue(YANG_GUA.includes('乾'), '乾应为阳卦');
  assertTrue(YANG_GUA.includes('震'), '震应为阳卦');
  assertTrue(YANG_GUA.includes('坎'), '坎应为阳卦');
  assertTrue(YANG_GUA.includes('艮'), '艮应为阳卦');
  assertTrue(YIN_GUA.includes('巽'), '巽应为阴卦');
  assertTrue(YIN_GUA.includes('离'), '离应为阴卦');
  assertTrue(YIN_GUA.includes('兑'), '兑应为阴卦');
  assertTrue(YIN_GUA.includes('坤'), '坤应为阴卦');

  // 验证判断函数
  assertTrue(isYangGua('乾'), 'isYangGua(乾)应为true');
  assertTrue(isYinGua('坤'), 'isYinGua(坤)应为true');
  assertTrue(!isYangGua('巽'), 'isYangGua(巽)应为false');
  assertTrue(!isYinGua('乾'), 'isYinGua(乾)应为false');
}

/**
 * 验证八纯卦地支起始
 */
function verifyChunGuaStart(): void {
  console.log('\n--- 验证: 八纯卦地支起始 ---');

  // 阳卦起子顺行
  assertEqual(CHUN_GUA_START_DIZHI['乾'], '子', '乾卦起子');
  assertEqual(CHUN_GUA_START_DIZHI['震'], '子', '震卦起子');
  assertEqual(CHUN_GUA_START_DIZHI['坎'], '寅', '坎卦起寅');
  assertEqual(CHUN_GUA_START_DIZHI['艮'], '辰', '艮卦起辰');

  // 阴卦起未逆行
  assertEqual(CHUN_GUA_START_DIZHI['坤'], '未', '坤卦起未');
  assertEqual(CHUN_GUA_START_DIZHI['巽'], '丑', '巽卦起丑');
  assertEqual(CHUN_GUA_START_DIZHI['离'], '卯', '离卦起卯');
  assertEqual(CHUN_GUA_START_DIZHI['兑'], '巳', '兑卦起巳');
}

/**
 * 验证干支系统
 */
function verifyGanZhi(): void {
  console.log('\n--- 验证: 干支系统 ---');

  // 地支顺序
  assertEqual(DIZHI_ORDER.length, 12, '地支应有12个');
  assertEqual(DIZHI_ORDER[0], '子', '地支首位为子');
  assertEqual(DIZHI_ORDER[11], '亥', '地支末位为亥');

  // 阴阳分类
  assertEqual(YANG_DIZHI, ['子', '寅', '辰', '午', '申', '戌'], '阳地支');
  assertEqual(YIN_DIZHI, ['丑', '卯', '巳', '未', '酉', '亥'], '阴地支');

  // 天干顺序
  assertEqual(TIANGAN_ORDER.length, 10, '天干应有10个');
  assertEqual(TIANGAN_ORDER[0], '甲', '天干首位为甲');
  assertEqual(TIANGAN_ORDER[9], '癸', '天干末位为癸');

  // 地支五行
  assertEqual(getDiZhiWuXing('寅'), '木', '寅为木');
  assertEqual(getDiZhiWuXing('卯'), '木', '卯为木');
  assertEqual(getDiZhiWuXing('巳'), '火', '巳为火');
  assertEqual(getDiZhiWuXing('午'), '火', '午为火');
  assertEqual(getDiZhiWuXing('申'), '金', '申为金');
  assertEqual(getDiZhiWuXing('酉'), '金', '酉为金');
  assertEqual(getDiZhiWuXing('子'), '水', '子为水');
  assertEqual(getDiZhiWuXing('亥'), '水', '亥为水');
  assertEqual(getDiZhiWuXing('辰'), '土', '辰为土');
  assertEqual(getDiZhiWuXing('戌'), '土', '戌为土');
  assertEqual(getDiZhiWuXing('丑'), '土', '丑为土');
  assertEqual(getDiZhiWuXing('未'), '土', '未为土');

  // 天干五行
  assertEqual(getTianGanWuXing('甲'), '木', '甲为木');
  assertEqual(getTianGanWuXing('乙'), '木', '乙为木');
  assertEqual(getTianGanWuXing('丙'), '火', '丙为火');
  assertEqual(getTianGanWuXing('丁'), '火', '丁为火');
  assertEqual(getTianGanWuXing('戊'), '土', '戊为土');
  assertEqual(getTianGanWuXing('己'), '土', '己为土');
  assertEqual(getTianGanWuXing('庚'), '金', '庚为金');
  assertEqual(getTianGanWuXing('辛'), '金', '辛为金');
  assertEqual(getTianGanWuXing('壬'), '水', '壬为水');
  assertEqual(getTianGanWuXing('癸'), '水', '癸为水');

  // 索引函数
  assertEqual(getDiZhiIndex('子'), 0, '子索引为0');
  assertEqual(getDiZhiIndex('亥'), 11, '亥索引为11');
  assertEqual(getTianGanIndex('甲'), 0, '甲索引为0');
  assertEqual(getTianGanIndex('癸'), 9, '癸索引为9');

  // 阴阳判断
  assertTrue(isYangDiZhi('子'), '子为阳地支');
  assertTrue(isYinDiZhi('丑'), '丑为阴地支');
  assertTrue(!isYangDiZhi('卯'), '卯不为阳地支');
  assertTrue(!isYinDiZhi('午'), '午不为阴地支');
}

/**
 * 验证五行生克
 */
function verifyWuXing(): void {
  console.log('\n--- 验证: 五行生克 ---');

  // 相生: 木→火→土→金→水→木
  assertTrue(isSheng('木', '火'), '木生火');
  assertTrue(isSheng('火', '土'), '火生土');
  assertTrue(isSheng('土', '金'), '土生金');
  assertTrue(isSheng('金', '水'), '金生水');
  assertTrue(isSheng('水', '木'), '水生木');

  // 相克: 木→土→水→火→金→木
  assertTrue(isKe('木', '土'), '木克土');
  assertTrue(isKe('土', '水'), '土克水');
  assertTrue(isKe('水', '火'), '水克火');
  assertTrue(isKe('火', '金'), '火克金');
  assertTrue(isKe('金', '木'), '金克木');

  // 六亲计算 (以坎宫水为例)
  assertEqual(calculateLiuQin('水', '水'), '兄弟', '同我者兄弟');
  assertEqual(calculateLiuQin('金', '水'), '父母', '生我者父母');
  assertEqual(calculateLiuQin('木', '水'), '子孙', '我生者子孙');
  assertEqual(calculateLiuQin('火', '水'), '妻财', '我克者妻财');
  assertEqual(calculateLiuQin('土', '水'), '官鬼', '克我者官鬼');
}

/**
 * 验证六神
 */
function verifyLiuShen(): void {
  console.log('\n--- 验证: 六神 ---');

  // 六神顺序 (从初爻到上爻)
  assertEqual(LIUSHEN_ORDER, ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'], '六神顺序');

  // 日干起六神
  assertEqual(getStartLiuShen('甲'), '青龙', '甲日起青龙');
  assertEqual(getStartLiuShen('乙'), '青龙', '乙日起青龙');
  assertEqual(getStartLiuShen('丙'), '朱雀', '丙日起朱雀');
  assertEqual(getStartLiuShen('丁'), '朱雀', '丁日起朱雀');
  assertEqual(getStartLiuShen('戊'), '勾陈', '戊日起勾陈');
  assertEqual(getStartLiuShen('己'), '螣蛇', '己日起螣蛇');
  assertEqual(getStartLiuShen('庚'), '白虎', '庚日起白虎');
  assertEqual(getStartLiuShen('辛'), '白虎', '辛日起白虎');
  assertEqual(getStartLiuShen('壬'), '玄武', '壬日起玄武');
  assertEqual(getStartLiuShen('癸'), '玄武', '癸日起玄武');

  // 六神排列 (数组顺序: 上爻→初爻)
  const jiaShen = arrangeLiuShen('甲');
  assertEqual(jiaShen, ['玄武', '白虎', '螣蛇', '勾陈', '朱雀', '青龙'], '甲日六神(上→初)');

  const bingShen = arrangeLiuShen('丙');
  assertEqual(bingShen, ['青龙', '玄武', '白虎', '螣蛇', '勾陈', '朱雀'], '丙日六神(上→初)');
}

/**
 * 验证世应映射
 */
function verifyShiYing(): void {
  console.log('\n--- 验证: 世应映射 ---');

  // 数组索引: 0=上爻, 5=初爻
  assertEqual(getShiYaoIndex('本宫'), 0, '本宫卦世在上爻(0)');
  assertEqual(getShiYaoIndex('一世'), 5, '一世卦世在初爻(5)');
  assertEqual(getShiYaoIndex('二世'), 4, '二世卦世在二爻(4)');
  assertEqual(getShiYaoIndex('三世'), 3, '三世卦世在三爻(3)');
  assertEqual(getShiYaoIndex('四世'), 2, '四世卦世在四爻(2)');
  assertEqual(getShiYaoIndex('五世'), 1, '五世卦世在五爻(1)');
  assertEqual(getShiYaoIndex('游魂'), 2, '游魂卦世在四爻(2)');
  assertEqual(getShiYaoIndex('归魂'), 3, '归魂卦世在三爻(3)');

  // 应爻计算 (相隔三位)
  assertEqual(getYingYaoIndex(0), 3, '上爻世应在三爻');
  assertEqual(getYingYaoIndex(5), 2, '初爻世应在四爻');
  assertEqual(getYingYaoIndex(3), 0, '三爻世应在上爻');

  // 组合查询
  const yiShi = getShiYingPositions('一世');
  assertEqual(yiShi.shi, 5, '一世卦世爻索引');
  assertEqual(yiShi.ying, 2, '一世卦应爻索引');
}

/**
 * 验证神煞表
 */
function verifyShenShaTables(): void {
  console.log('\n--- 验证: 神煞表 ---');

  // 贵人 (甲戊: 丑未)
  assertEqual(GUI_REN_TABLE['甲'], ['丑', '未'], '甲日贵人');
  assertEqual(GUI_REN_TABLE['戊'], ['丑', '未'], '戊日贵人');
  assertEqual(GUI_REN_TABLE['乙'], ['子', '申'], '乙日贵人');
  assertEqual(GUI_REN_TABLE['丙'], ['亥', '酉'], '丙日贵人');

  // 禄神
  assertEqual(LU_SHEN_TABLE['甲'], '寅', '甲禄在寅');
  assertEqual(LU_SHEN_TABLE['乙'], '卯', '乙禄在卯');
  assertEqual(LU_SHEN_TABLE['丙'], '巳', '丙禄在巳');

  // 羊刃
  assertEqual(YANG_REN_TABLE['甲'], '卯', '甲刃在卯');
  assertEqual(YANG_REN_TABLE['乙'], '寅', '乙刃在寅');

  // 文昌
  assertEqual(WEN_CHANG_TABLE['甲'], '巳', '甲文昌在巳');
  assertEqual(WEN_CHANG_TABLE['乙'], '午', '乙文昌在午');

  // 三合局
  assertEqual(getSanHeType('子'), '申子辰', '子属申子辰局');
  assertEqual(getSanHeType('酉'), '巳酉丑', '酉属巳酉丑局');
  assertEqual(getSanHeType('午'), '寅午戌', '午属寅午戌局');
  assertEqual(getSanHeType('卯'), '亥卯未', '卯属亥卯未局');

  // 日支神煞 (申子辰日)
  assertEqual(YI_MA_TABLE['申子辰'], '寅', '申子辰日驿马在寅');
  assertEqual(TAO_HUA_TABLE['申子辰'], '酉', '申子辰日桃花在酉');
  assertEqual(JIANG_XING_TABLE['申子辰'], '子', '申子辰日将星在子');

  // 天医 (月支前一位)
  assertEqual(getTianYi('寅'), '丑', '寅月天医在丑');
  assertEqual(getTianYi('卯'), '寅', '卯月天医在寅');

  // 天喜 (季节)
  assertEqual(TIAN_XI_TABLE['春'], '戌', '春季天喜在戌');
  assertEqual(TIAN_XI_TABLE['夏'], '丑', '夏季天喜在丑');
  assertEqual(TIAN_XI_TABLE['秋'], '辰', '秋季天喜在辰');
  assertEqual(TIAN_XI_TABLE['冬'], '未', '冬季天喜在未');

  // 旬空
  assertEqual(calculateXunKong('甲子'), ['戌', '亥'], '甲子旬空戌亥');
  assertEqual(calculateXunKong('甲戌'), ['申', '酉'], '甲戌旬空申酉');
  assertEqual(calculateXunKong('甲申'), ['午', '未'], '甲申旬空午未');
}

/**
 * 验证64卦数据
 */
function verifyGua64(): void {
  console.log('\n--- 验证: 64卦数据 ---');

  // 数据完整性
  assertEqual(GUA64_DATA.length, 64, '64卦数据应有64条');

  // 查询索引
  assertTrue(GUA64_BY_CODE.has('111111'), '应有乾卦编码');
  assertTrue(GUA64_BY_NAME.has('乾为天'), '应有乾卦名称');
  assertTrue(GUA64_BY_SEQUENCE.has(1), '应有卦序1');

  // 按编码查询
  const qian = GUA64_BY_CODE.get('111111');
  assertTrue(qian !== undefined, '111111应为乾卦');
  assertEqual(qian?.卦名, '乾为天', '编码111111为乾为天');
  assertEqual(qian?.宫名, '乾宫', '乾卦属乾宫');

  // 按卦宫分组
  const qianGong = GUA64_BY_GONG.get('乾宫');
  assertEqual(qianGong?.length, 8, '乾宫应有8卦');

  // 查找本宫卦
  const kanBenGong = getBenGongGua('坎宫');
  assertEqual(kanBenGong?.卦名, '坎为水', '坎宫本宫为坎为水');
  assertEqual(kanBenGong?.卦次, '本宫', '应为八纯卦');

  // 验证水泽节 (示例卦)
  const jie = GUA64_BY_CODE.get('010011');
  assertEqual(jie?.卦名, '水泽节', '010011为水泽节');
  assertEqual(jie?.卦次, '一世', '水泽节为一世卦');
  assertEqual(jie?.上卦, '坎', '水泽节上卦为坎');
  assertEqual(jie?.下卦, '兑', '水泽节下卦为兑');
}

// ============================================
// 主验证函数
// ============================================

export function verifyConstants(): void {
  console.log('\n========== Constants 模块验证开始 ==========\n');

  verifyBaguaCodes();
  verifyChunGuaStart();
  verifyGanZhi();
  verifyWuXing();
  verifyLiuShen();
  verifyShiYing();
  verifyShenShaTables();
  verifyGua64();

  console.log('\n========== Constants 模块验证完成 ==========\n');
}

// 直接运行验证
verifyConstants();