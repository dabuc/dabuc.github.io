import type {
    TianGan, DiZhi, SanHeType, Season,
    ShenShaName
} from '../types/index.js';
import { DIZHI_ORDER } from './ganzhi.js';

// ============================================
// 表1: 以日干为基准的神煞
// ============================================

/** 贵人 (可能有两个地支) */
export const GUI_REN_TABLE: Readonly<Record<TianGan, readonly DiZhi[]>> = {
    '甲': ['丑', '未'],
    '乙': ['子', '申'],
    '丙': ['亥', '酉'],
    '丁': ['亥', '酉'],
    '戊': ['丑', '未'],
    '己': ['子', '申'],
    '庚': ['午', '寅'],
    '辛': ['午', '寅'],
    '壬': ['卯', '巳'],
    '癸': ['卯', '巳'],
} as const;

/** 禄神 (单一地支) */
export const LU_SHEN_TABLE: Readonly<Record<TianGan, DiZhi>> = {
    '甲': '寅', '乙': '卯',
    '丙': '巳', '丁': '午',
    '戊': '巳', '己': '午',
    '庚': '申', '辛': '酉',
    '壬': '亥', '癸': '子',
} as const;

/** 羊刃 */
export const YANG_REN_TABLE: Readonly<Record<TianGan, DiZhi>> = {
    '甲': '卯', '乙': '寅',
    '丙': '午', '丁': '巳',
    '戊': '午', '己': '巳',
    '庚': '酉', '辛': '申',
    '壬': '子', '癸': '亥',
} as const;

/** 文昌 */
export const WEN_CHANG_TABLE: Readonly<Record<TianGan, DiZhi>> = {
    '甲': '巳', '乙': '午',
    '丙': '申', '丁': '酉',
    '戊': '申', '己': '酉',
    '庚': '亥', '辛': '子',
    '壬': '寅', '癸': '卯',
} as const;

// ============================================
// 表2: 以日支三合局为基准的神煞
// ============================================

/** 地支三合局分组 */
export const SAN_HE_GROUPS: Readonly<Record<SanHeType, readonly DiZhi[]>> = {
    '申子辰': ['申', '子', '辰'],
    '巳酉丑': ['巳', '酉', '丑'],
    '寅午戌': ['寅', '午', '戌'],
    '亥卯未': ['亥', '卯', '未'],
} as const;

/** 根据日支查找所属三合局 */
export function getSanHeType(dayZhi: DiZhi): SanHeType | null {
    for (const [type, branches] of Object.entries(SAN_HE_GROUPS)) {
        if (branches.includes(dayZhi)) {
            return type as SanHeType;
        }
    }
    return null;
}

/** 驿马表 */
export const YI_MA_TABLE: Readonly<Record<SanHeType, DiZhi>> = {
    '申子辰': '寅',
    '巳酉丑': '亥',
    '寅午戌': '申',
    '亥卯未': '巳',
} as const;

/** 桃花表 */
export const TAO_HUA_TABLE: Readonly<Record<SanHeType, DiZhi>> = {
    '申子辰': '酉',
    '巳酉丑': '午',
    '寅午戌': '卯',
    '亥卯未': '子',
} as const;

/** 将星表 */
export const JIANG_XING_TABLE: Readonly<Record<SanHeType, DiZhi>> = {
    '申子辰': '子',
    '巳酉丑': '酉',
    '寅午戌': '午',
    '亥卯未': '卯',
} as const;

/** 劫煞表 */
export const JIE_SHA_TABLE: Readonly<Record<SanHeType, DiZhi>> = {
    '申子辰': '巳',
    '巳酉丑': '寅',
    '寅午戌': '亥',
    '亥卯未': '申',
} as const;

/** 华盖表 */
export const HUA_GAI_TABLE: Readonly<Record<SanHeType, DiZhi>> = {
    '申子辰': '辰',
    '巳酉丑': '丑',
    '寅午戌': '戌',
    '亥卯未': '未',
} as const;

/** 谋星表 */
export const MOU_XING_TABLE: Readonly<Record<SanHeType, DiZhi>> = {
    '申子辰': '戌',
    '巳酉丑': '未',
    '寅午戌': '辰',
    '亥卯未': '丑',
} as const;

/** 灾煞表 */
export const ZAI_SHA_TABLE: Readonly<Record<SanHeType, DiZhi>> = {
    '申子辰': '午',
    '巳酉丑': '卯',
    '寅午戌': '子',
    '亥卯未': '酉',
} as const;

// ============================================
// 表3: 以月支/季节为基准的神煞
// ============================================

/** 天医 (月支的上一位) */
export function getTianYi(monthZhi: DiZhi): DiZhi {
    // 获取月支索引，减1即为上一位
    const idx = DIZHI_ORDER.indexOf(monthZhi);
    const prevIdx = (idx - 1 + 12) % 12;
    return DIZHI_ORDER[prevIdx];
}

/** 天喜 (按季节) */
export const TIAN_XI_TABLE: Readonly<Record<Season, DiZhi>> = {
    '春': '戌',
    '夏': '丑',
    '秋': '辰',
    '冬': '未',
} as const;


// 定义神煞显示顺序
export const SHENSHA_ORDER: ShenShaName[] = [
    '将星', '华盖', '驿马', '灾煞', '谋星', '桃花', '劫煞', '禄神', '羊刃', '文昌', '天医', '天喜', '贵人'
];

// ============================================
// 旬空计算
// ============================================

// /** 旬空地支对表 (按六甲旬) */
// export const XUN_KONG_TABLE: Readonly<Record<string, readonly DiZhi[]>> = {
//     '甲子': ['戌', '亥'],
//     '甲戌': ['申', '酉'],
//     '甲申': ['午', '未'],
//     '甲午': ['辰', '巳'],
//     '甲辰': ['寅', '卯'],
//     '甲寅': ['子', '丑'],
// } as const;

// /** 六甲旬首 */
// export const XUN_SHOU: readonly string[] = [
//     '甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅'
// ] as const;


