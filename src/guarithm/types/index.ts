// ============================================
// 基础枚举类型 - 使用 const enum 提升性能
// ============================================

/** 八卦名称 */
export type BaGua = '乾' | '震' | '坎' | '艮' | '巽' | '离' | '兑' | '坤';

/** 十二地支 */
export type DiZhi = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

/** 十天干 */
export type TianGan = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

/** 五行属性 */
export type WuXing = '金' | '木' | '水' | '火' | '土';

/** 六亲关系 */
export type LiuQin = '父母' | '兄弟' | '子孙' | '妻财' | '官鬼';

/** 六神名称 */
export type LiuShen = '青龙' | '朱雀' | '勾陈' | '螣蛇' | '白虎' | '玄武';

/** 世应标记 */
export type ShiYingType = '世' | '应' | null;

/** 卦次类型 */
export type GuaCi = '本宫' | '一世' | '二世' | '三世' | '四世' | '五世' | '游魂' | '归魂';

/** 爻编码 (1=阳爻, 0=阴爻) */
export type YaoCode = 1 | 0;

/** 输入数字 (6=老阴动, 7=少阳, 8=少阴, 9=老阳动) */
export type YaoInput = 6 | 7 | 8 | 9;

/** 神煞名称 */
export type ShenShaName =
    | '贵人' | '禄神' | '羊刃' | '文昌' | '驿马' | '桃花'
    | '将星' | '劫煞' | '华盖' | '谋星' | '灾煞' | '天医' | '天喜';

/** 季节 */
export type Season = '春' | '夏' | '秋' | '冬';

/** 地支三合局类型 */
export type SanHeType = '申子辰' | '巳酉丑' | '寅午戌' | '亥卯未';

// ============================================
// 复合类型
// ============================================

/** 64卦数据库记录 (原始JSON结构) */
export interface Gua64Record {
    readonly 宫名: string;
    readonly 五行: WuXing;
    readonly 卦名: string;
    readonly 卦序: number;
    readonly 卦次: GuaCi;
    readonly 上卦: BaGua;
    readonly 下卦: BaGua;
    readonly 编码: string; // 6位二进制字符串，如"010011"
}

/** 内部使用的卦信息 (派生类型) */
export interface GuaInfo {
    readonly code: string;        // 6位编码
    readonly name: string;        // 卦名
    readonly sequence: number;    // 卦序(1-64)
    readonly gong: string;        // 卦宫名
    readonly gongWuXing: WuXing;  // 卦宫五行
    readonly guaCi: GuaCi;        // 卦次
    readonly upperGua: BaGua;     // 上经卦
    readonly lowerGua: BaGua;     // 下经卦
    readonly yaoCodes: readonly YaoCode[];  // 6爻编码 [上爻...初爻]
}

/** 爻的完整属性 */
export interface Yao {
    readonly position: number;      // 0=初爻, 5=上爻
    readonly yinYang: YaoCode;      // 阴阳属性
    readonly diZhi: DiZhi;         // 地支
    readonly wuXing: WuXing;       // 五行
    readonly liuQin: LiuQin;        // 六亲
    readonly liuShen: LiuShen;      // 六神
    readonly shiYing: ShiYingType;  // 世应标记
    readonly isDong: boolean;       // 是否动爻
    readonly fuShen: FuShen | null; // 伏神信息
}

/** 伏神信息 */
export interface FuShen {
    readonly liuQin: LiuQin;     // 六亲
    readonly diZhi: DiZhi;       // 地支
    readonly wuXing: WuXing;     // 五行
    readonly displayText: string; // 显示文本如"妻财戌土"
}

/** 神煞映射表类型 */
export type ShenShaMap = ReadonlyMap<DiZhi, readonly ShenShaName[]>;

// 神煞信息
export interface ShenShaInfo {
    readonly map: ShenShaMap;
    readonly displayString: string;
}

/** 排盘输入参数 */
export interface PaiPanInput {
    readonly digits: readonly YaoInput[];  // 6位数字
    readonly monthZhi: DiZhi;            // 月支
    readonly dayGanZhi: string;          // 日干支，如"甲戌"
}

/** 干支信息 */
export interface GanZhiInfo {
    readonly month: DiZhi;     // 月支
    readonly day: string;       // 日干支
    readonly xunKong: readonly DiZhi[]; // 旬空
}

/** 单卦结果 */
export interface GuaResult {
    readonly info: GuaInfo;
    readonly yao: readonly Yao[];
    readonly shiYaoIndex: number;  // 世爻索引
    readonly yingYaoIndex: number; // 应爻索引
}

/** 完整排盘结果 */
export interface PaiPanResult {
    readonly input: PaiPanInput;
    readonly ganZhi: GanZhiInfo;
    readonly shenSha:ShenShaInfo;
    readonly benGua: GuaResult;
    readonly bianGua: GuaResult | null;
}