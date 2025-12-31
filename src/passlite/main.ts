// main.ts - 适配新的HTML结构
import { generatePassword } from './passlite.ts';

const form = document.getElementById('passwordForm') as HTMLFormElement;
const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
const passwordDisplay = document.getElementById('passwordDisplay') as HTMLDivElement;
const generatedPassword = document.getElementById('generatedPassword') as HTMLDivElement;
const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement;
const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;

// 生成密码
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 收集数据
    const site = (document.getElementById('site') as HTMLInputElement).value.trim();
    const loginName = (document.getElementById('loginName') as HTMLInputElement).value.trim();
    const masterPassword = (document.getElementById('masterPassword') as HTMLInputElement).value;
    const pwdLength = parseInt((document.getElementById('pwdLength') as HTMLInputElement).value);
    const counter = parseInt((document.getElementById('counter') as HTMLInputElement).value);
    
    // 字符类型
    const charsetCheckboxes = document.querySelectorAll('input[name="charset"]:checked');
    const characterSets = Array.from(charsetCheckboxes).map(cb => (cb as HTMLInputElement).value) as ('lower' | 'upper' | 'digits')[];
    
    if (characterSets.length === 0) {
        showError('请至少选择一种字符类型');
        return;
    }
    
    // 符号类型
    const symbolType = (document.getElementById('symbolType') as HTMLSelectElement).value as 'none' | 'modern' | 'basic';
    
    const required = { characterSets, symbolType };
    
    // 加载状态
    generateBtn.disabled = true;
    generateBtn.textContent = '生成中...';
    errorMessage.style.display = 'none';
    
    try {
        const password = await generatePassword(site, loginName, masterPassword, pwdLength, counter, required);
        showPassword(password);
    } catch (error) {
        showError(error instanceof Error ? error.message : '生成失败');
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = '生成密码';
    }
});

// 显示密码
function showPassword(password: string) {
    generatedPassword.textContent = password;
    passwordDisplay.style.display = 'block';
    passwordDisplay.scrollIntoView({ behavior: 'smooth' });
}

// 显示错误
function showError(message: string) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// 复制密码
copyBtn.addEventListener('click', async () => {
    const password = generatedPassword.textContent;
    if (!password) return;
    
    try {
        await navigator.clipboard.writeText(password);
        copyBtn.textContent = '已复制';
        setTimeout(() => {
            copyBtn.textContent = '复制';
        }, 2000);
    } catch (err) {
        showError('复制失败，请手动复制');
    }
});

// 自动填充测试数据
if (import.meta.env.DEV) {
    (document.getElementById('site') as HTMLInputElement).value = 'example.com';
    (document.getElementById('loginName') as HTMLInputElement).value = 'user@example.com';
}