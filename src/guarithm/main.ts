import { paiPan, type PaiPanInput, type DiZhi, type Yao } from './index.js';

// DOM 元素
const monthZhiSelect = document.getElementById('monthZhi') as HTMLSelectElement;
const dayGanSelect = document.getElementById('dayGan') as HTMLSelectElement;
const dayZhiSelect = document.getElementById('dayZhi') as HTMLSelectElement;
const digitsInput = document.getElementById('digits') as HTMLInputElement;
const calculateBtn = document.getElementById('calculateBtn') as HTMLButtonElement;
const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement;
const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
const resultContainer = document.getElementById('resultContainer') as HTMLDivElement;
const resultContent = document.getElementById('resultContent') as HTMLDivElement;

// 有效干支组合
const VALID_GAN_ZHI_PAIRS: Record<string, string[]> = {
    '甲': ['子', '寅', '辰', '午', '申', '戌'],
    '乙': ['丑', '卯', '巳', '未', '酉', '亥'],
    '丙': ['子', '寅', '辰', '午', '申', '戌'],
    '丁': ['丑', '卯', '巳', '未', '酉', '亥'],
    '戊': ['子', '寅', '辰', '午', '申', '戌'],
    '己': ['丑', '卯', '巳', '未', '酉', '亥'],
    '庚': ['子', '寅', '辰', '午', '申', '戌'],
    '辛': ['丑', '卯', '巳', '未', '酉', '亥'],
    '壬': ['子', '寅', '辰', '午', '申', '戌'],
    '癸': ['丑', '卯', '巳', '未', '酉', '亥']
};

// 当前排盘结果和 Markdown
let currentResult: any = null;
let currentMarkdown = '';

// 爻位名称映射
const POSITION_NAMES: string[] = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

// 更新日支选项
function updateDayZhiOptions() {
    const dayGan = dayGanSelect.value;
    const validZhi = VALID_GAN_ZHI_PAIRS[dayGan];
    const currentValue = dayZhiSelect.value;
    
    dayZhiSelect.innerHTML = '';
    validZhi.forEach(zhi => {
        const option = document.createElement('option');
        option.value = zhi;
        option.textContent = zhi;
        dayZhiSelect.appendChild(option);
    });
    
    // 如果当前选择的值在有效列表中，保留；否则设置为第一个
    if (currentValue && validZhi.includes(currentValue)) {
        dayZhiSelect.value = currentValue;
    } else {
        dayZhiSelect.value = validZhi[0];
    }
}

// 获取输入参数
function getInputParams(): PaiPanInput | null {
    const digitsStr = digitsInput.value.trim();
    
    if (!/^[6-9]{6}$/.test(digitsStr)) {
        alert('请输入6位数字，每位为6、7、8、9');
        return null;
    }
    
    const digits = digitsStr.split('').map(d => parseInt(d, 10)) as any[];
    const monthZhi = monthZhiSelect.value as DiZhi;
    const dayGan = dayGanSelect.value;
    const dayZhi = dayZhiSelect.value;
    const dayGanZhi = dayGan + dayZhi;
    
    // 验证干支组合是否有效
    const validZhi = VALID_GAN_ZHI_PAIRS[dayGan];
    if (!validZhi.includes(dayZhi)) {
        alert(`无效的日干支组合：${dayGan}${dayZhi}。${dayGan}日只能配 ${validZhi.join('、')}`);
        return null;
    }
    
    return { digits, monthZhi, dayGanZhi };
}

// 获取爻的显示符号
function getYaoSymbol(yao: Yao): string {
    if (yao.isDong) {
        return yao.yinYang === 1 ? '⚊○' : '⚋×';
    }
    return yao.yinYang === 1 ? '⚊' : '⚋';
}

// 获取爻的完整显示文本
function getYaoText(yao: Yao): string {
    const base = `${yao.liuQin}${yao.diZhi}${yao.wuXing}`;
    const symbol = getYaoSymbol(yao);
    const shiYing = yao.shiYing ? ` ${yao.shiYing}` : '';
    return `${base} ${symbol}${shiYing}`;
}

// 格式化爻文本，添加世应标记样式
function formatYaoTextWithMarkers(text: string): string {
    let result = text;
    if (result.includes('世')) {
        result = result.replace('世', '<span class="shiying-mark shi-mark">世</span>');
    }
    if (result.includes('应')) {
        result = result.replace('应', '<span class="shiying-mark ying-mark">应</span>');
    }
    result = result.replace('⚋×', '<span class="dong-symbol">⚋×</span>');
    result = result.replace('⚊○', '<span class="dong-symbol">⚊○</span>');
    return result;
}

// 构建排盘表格 HTML
function buildResultHTML(result: any): string {
    const rawData = result.getRawData();
    const benGua = rawData.benGua;
    const bianGua = rawData.bianGua;
    const hasBianGua = bianGua !== null;
    
    // 神煞行
    const shenShaHtml = `<div class="shensha-line">${rawData.shenSha.displayString.replace(/ /g, '　')}</div>`;
    
    // 干支行
    const xunKongStr = rawData.ganZhi.xunKong.join('、');
    const ganzhiHtml = `<div class="ganzhi-info">干支：${rawData.ganZhi.month}月　${rawData.ganZhi.day}日 (旬空：${xunKongStr})</div>`;
    
    // 表格
    let tableHtml = '<table class="result-table">';
    
    // 卦宫信息行
    tableHtml += `<tr class="gua-title">`;
    tableHtml += `<th style="width: 80px;">六神</th>`;
    tableHtml += `<th style="width: 80px;">伏神</th>`;
    tableHtml += `<th>${benGua.info.gong}：${benGua.info.name}</th>`;
    tableHtml += hasBianGua ? `<th>${bianGua.info.gong}：${bianGua.info.name}</th>` : `<th></th>`;
    tableHtml += `</tr>`;
    
    // 表头行
    tableHtml += `<tr class="table-header">`;
    tableHtml += `<th>六神</th>`;
    tableHtml += `<th>伏神</th>`;
    tableHtml += `<th>本卦</th>`;
    tableHtml += hasBianGua ? `<th>变卦</th>` : `<th></th>`;
    tableHtml += `</tr>`;
    
    // 六爻行 (索引0=上爻, 5=初爻)
    for (let i = 0; i < 6; i++) {
        const benYao = benGua.yao[i];
        const bianYao = hasBianGua ? bianGua.yao[i] : null;
        
        const liuShen = benYao.liuShen;
        const fuShen = benYao.fuShen ? benYao.fuShen.displayText : '';
        const benText = getYaoText(benYao);
        const bianText = bianYao ? getYaoText(bianYao) : '';
        
        const benClass = benYao.isDong ? 'dong-yao' : '';
        const bianClass = bianYao?.isDong ? 'dong-yao' : '';
        
        tableHtml += `<tr class="yao-row">`;
        tableHtml += `<td class="${benClass}">${liuShen}</td>`;
        tableHtml += `<td>${fuShen}</td>`;
        tableHtml += `<td class="${benClass}">${formatYaoTextWithMarkers(benText)}</td>`;
        tableHtml += `<td class="${bianClass}">${bianText ? formatYaoTextWithMarkers(bianText) : ''}</td>`;
        tableHtml += `</tr>`;
    }
    
    tableHtml += '</table>';
    
    return shenShaHtml + ganzhiHtml + tableHtml;
}

// 显示排盘结果
function displayResult(result: any) {
    const html = buildResultHTML(result);
    resultContent.innerHTML = html;
    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 显示复制成功提示
function showCopyToast() {
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = '✅ 已复制 Markdown 格式排盘结果';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// 复制 Markdown
async function copyMarkdown() {
    if (!currentMarkdown) {
        alert('没有可复制的内容');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(currentMarkdown);
        showCopyToast();
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = currentMarkdown;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showCopyToast();
    }
}

// 执行排盘
function performPaiPan() {
    const params = getInputParams();
    if (!params) return;
    
    try {
        const result = paiPan(params);
        currentResult = result;
        currentMarkdown = result.toMarkdown();
        
        displayResult(result);
        copyBtn.disabled = false;
        
        console.log('排盘成功:', {
            本卦: result.benGuaName,
            变卦: result.bianGuaName
        });
    } catch (error) {
        console.error('排盘失败:', error);
        alert(`排盘失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
}

// 重置表单
function resetForm() {
    monthZhiSelect.value = '子';
    dayGanSelect.value = '甲';
    updateDayZhiOptions(); // 更新日支选项
    digitsInput.value = '';
    resultContainer.style.display = 'none';
    currentResult = null;
    currentMarkdown = '';
    copyBtn.disabled = true;
}

// 初始化
function init() {
    // 日干变化时，更新日支选项
    dayGanSelect.addEventListener('change', updateDayZhiOptions);
    
    // 初始化日支选项
    updateDayZhiOptions();
    
    calculateBtn.addEventListener('click', performPaiPan);
    copyBtn.addEventListener('click', copyMarkdown);
    resetBtn.addEventListener('click', resetForm);
    
    digitsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performPaiPan();
    });
    
    digitsInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        target.value = target.value.replace(/[^6-9]/g, '').slice(0, 6);
    });
}

init();