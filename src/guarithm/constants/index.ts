// ============================================
// Constants 模块统一导出
// 	Constants 静态数据仓库,存储经卦编码、64卦基础信息、干支五行映射、神煞查找表、纳甲规则等只读配置
// ============================================

// 类型导出 (使用 type 关键字符合 verbatimModuleSyntax)
export type {
    BaGua, DiZhi, TianGan, WuXing, LiuQin, LiuShen,
    YaoCode, YaoInput, GuaCi, ShiYingType, ShenShaName,
    Season, SanHeType, Gua64Record, GuaInfo, Yao, FuShen,
    PaiPanInput, GanZhiInfo, GuaResult, PaiPanResult
} from '../types/index.js';

// 八卦与编码
export {
    BAGUA_CODES, YANG_GUA, YIN_GUA,
    isYangGua, isYinGua,
    CHUN_GUA_START_DIZHI,
    BAGUA_CUO, BAGUA_ZONG
} from './bagua.js';

// 干支系统
export {
    DIZHI_ORDER, YANG_DIZHI, YIN_DIZHI,
    TIANGAN_ORDER, DIZHI_WUXING, TIANGAN_WUXING,
    DIZHI_SEASON, getSeason,
    getDiZhiIndex, getTianGanIndex, getNextDiZhi,
    isYangDiZhi, isYinDiZhi,
    getDiZhiWuXing, getTianGanWuXing,calculateXunKong
} from './ganzhi.js';

// 五行生克
export {
    WUXING_SHENG, WUXING_KE,
    isSheng, isKe, isBiHe, calculateLiuQin
} from './wuxing.js';

// 六神
export {
    LIUSHEN_ORDER, LIUSHEN_TIANGAN_MAP,
    getStartLiuShen, arrangeLiuShen
} from './liushen.js';

// 世应
export {
    SHI_YAO_MAP,
    getShiYaoIndex, getYingYaoIndex, getShiYingPositions
} from './shiying.js';

// 神煞
export {
    // 日干神煞
    GUI_REN_TABLE, LU_SHEN_TABLE, YANG_REN_TABLE, WEN_CHANG_TABLE,
    // 日支神煞
    SAN_HE_GROUPS, getSanHeType,
    YI_MA_TABLE, TAO_HUA_TABLE, JIANG_XING_TABLE,
    JIE_SHA_TABLE, HUA_GAI_TABLE, MOU_XING_TABLE, ZAI_SHA_TABLE,
    // 月支神煞
    getTianYi, TIAN_XI_TABLE,
    // // 旬空
    // XUN_KONG_TABLE, XUN_SHOU
} from './shensha.js';

// 64卦数据
export {
    GUA64_DATA,
    GUA64_BY_CODE, GUA64_BY_NAME, GUA64_BY_SEQUENCE, GUA64_BY_GONG,
    getBenGongGua
} from './gua64.js';