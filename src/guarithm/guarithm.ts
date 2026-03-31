import { paiPan, type PaiPanInput, type DiZhi, type Yao } from './index.js';

// DOM 元素
const monthZhiSelect = document.getElementById('monthZhi') as HTMLSelectElement;
const dayGanSelect = document.getElementById('dayGan') as HTMLSelectElement;
const dayZhiSelect = document.getElementById('dayZhi') as HTMLSelectElement;
const digitsInput = document.getElementById('digits') as HTMLInputElement;
const calculateBtn = document.getElementById('calculateBtn') as HTMLButtonElement;
const shareBtn = document.getElementById('shareBtn') as HTMLButtonElement;
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

// // 爻位名称映射
// const POSITION_NAMES: string[] = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

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

// 从 URL 参数加载配置
function loadFromURL(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    const month = urlParams.get('month');
    const gan = urlParams.get('gan');
    const zhi = urlParams.get('zhi');
    const digits = urlParams.get('digits');
    
    if (month && gan && zhi && digits) {
        // 验证参数有效性
        const validMonths = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        const validGans = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        
        if (validMonths.includes(month) && validGans.includes(gan) && /^[6-9]{6}$/.test(digits)) {
            monthZhiSelect.value = month;
            dayGanSelect.value = gan;
            updateDayZhiOptions(); // 更新日支选项
            dayZhiSelect.value = zhi;
            digitsInput.value = digits;
            return true;
        }
    }
    return false;
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

// 生成分享链接
function generateShareURL(): string {
    const month = monthZhiSelect.value;
    const gan = dayGanSelect.value;
    const zhi = dayZhiSelect.value;
    const digits = digitsInput.value;
    
    const url = new URL(window.location.href);
    url.searchParams.set('month', month);
    url.searchParams.set('gan', gan);
    url.searchParams.set('zhi', zhi);
    url.searchParams.set('digits', digits);
    
    return url.toString();
}


// 统一的复制到剪贴板函数
async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('复制失败:', err);
        return false;
    }
}

// 分享功能
async function shareResult() {
    const digits = digitsInput.value.trim();
    if (!digits) {
        alert('请先进行排盘');
        return;
    }
    
    const shareURL = generateShareURL();
    
    // 优先使用 Web Share API（移动端）
    if (navigator.share) {
        try {
            await navigator.share({
                title: '六爻排盘结果',
                text: `${monthZhiSelect.value}月 ${dayGanSelect.value}${dayZhiSelect.value}日 ${digits}`,
                url: shareURL
            });
        } catch (err) {
            // 用户取消分享，不做任何处理
            if (err instanceof Error && err.name !== 'AbortError') {
                // 其他错误，降级到复制链接
                await copyToClipboard(shareURL);
                showCopyToast('✅ 分享链接已复制到剪贴板');
            }
        }
    } else {
        // 降级：复制链接到剪贴板
        const success = await copyToClipboard(shareURL);
        if (success) {
            showCopyToast('✅ 分享链接已复制到剪贴板');
        } else {
            showCopyToast('❌ 复制失败，请手动复制链接');
        }
    }
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

// 格式化爻文本，添加世应标记和动爻符号样式
function formatYaoTextWithMarkers(text: string): string {
    let result = text;
    
    // 处理世应标记
    if (result.includes('世')) {
        result = result.replace('世', '<span class="shiying-mark shi-mark">世</span>');
    }
    if (result.includes('应')) {
        result = result.replace('应', '<span class="shiying-mark ying-mark">应</span>');
    }
    
    // 处理动爻符号：× 用黑色加粗，○ 用红色加粗
    result = result.replace(/×/g, '<span class="dong-symbol" data-symbol="×">×</span>');
    result = result.replace(/○/g, '<span class="dong-symbol" data-symbol="○">○</span>');
    
    return result;
}

// 构建排盘表格 HTML
function buildResultHTML(result: any): string {
    const rawData = result.getRawData();
    const benGua = rawData.benGua;
    const bianGua = rawData.bianGua;
    const hasBianGua = bianGua !== null;
    
    const shenShaHtml = `<div class="shensha-line">${rawData.shenSha.displayString.replace(/ /g, '　')}</div>`;
    
    const xunKongStr = rawData.ganZhi.xunKong.join('');
    const ganzhiHtml = `<div class="ganzhi-info">干支：${rawData.ganZhi.month}月　${rawData.ganZhi.day}日 (旬空：${xunKongStr})</div>`;
    
    let tableHtml = '<table class="result-table">';
    
    // 卦宫信息行
    tableHtml += '<tr class="gua-title">';
    tableHtml += '<th colspan="2"></th>';
    tableHtml += `<th class="gua-info">${benGua.info.gong}：${benGua.info.name}</th>`;
    tableHtml += hasBianGua ? `<th class="gua-info">${bianGua.info.gong}：${bianGua.info.name}</th>` : '<th></th>';
    tableHtml += '</tr>';
    
    // 表头行
    tableHtml += '<tr class="table-header">';
    tableHtml += '<th>六神</th>';
    tableHtml += '<th>伏神</th>';
    tableHtml += '<th>本卦</th>';
    tableHtml += hasBianGua ? '<th>变卦</th>' : '<th></th>';
    tableHtml += '</tr>';
    
    // 六爻行
    for (let i = 0; i < 6; i++) {
        const benYao = benGua.yao[i];
        const bianYao = hasBianGua ? bianGua.yao[i] : null;
        
        const liuShen = benYao.liuShen;
        const fuShen = benYao.fuShen ? benYao.fuShen.displayText : '';
        const benText = getYaoText(benYao);
        const bianText = bianYao ? getYaoText(bianYao) : '';
        
        tableHtml += '<tr class="yao-row">';
        tableHtml += `<td>${liuShen}</td>`;
        tableHtml += `<td>${fuShen || '—'}</td>`;
        tableHtml += `<td>${formatYaoTextWithMarkers(benText)}</td>`;
        tableHtml += `<td>${bianText ? formatYaoTextWithMarkers(bianText) : ''}</td>`;
        tableHtml += '</tr>';
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

// 显示提示
function showCopyToast(message: string) {
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// 复制 Markdown
async function copyMarkdown() {
    if (!currentMarkdown) {
        alert('没有可复制的内容');
        return;
    }
    
    const success = await copyToClipboard(currentMarkdown);
    if (success) {
        showCopyToast('✅ 已复制 Markdown 格式排盘结果');
    } else {
        showCopyToast('❌ 复制失败，请手动复制');
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
        
        // 启用按钮
        shareBtn.disabled = false;
        copyBtn.disabled = false;
        
        // 更新 URL（不刷新页面）
        const shareURL = generateShareURL();
        window.history.replaceState({}, '', shareURL);
        
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
    shareBtn.disabled = true;
    copyBtn.disabled = true;
    
    // 清除 URL 参数
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, '', url);
}

// 初始化
function init() {
    // 日干变化时，更新日支选项
    dayGanSelect.addEventListener('change', updateDayZhiOptions);
    
    // 初始化日支选项
    updateDayZhiOptions();
    
    calculateBtn.addEventListener('click', performPaiPan);
    shareBtn.addEventListener('click', shareResult);
    copyBtn.addEventListener('click', copyMarkdown);
    resetBtn.addEventListener('click', resetForm);
    
    digitsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performPaiPan();
    });
    
    digitsInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        target.value = target.value.replace(/[^6-9]/g, '').slice(0, 6);
    });
    
    // 从 URL 加载参数并自动排盘
    if (loadFromURL()) {
        performPaiPan();
    }
}

init();