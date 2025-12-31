// 1. 定义类型
type CharSetKey = 'lower' | 'upper' | 'digits'; // 基础字符集
type SymbolType = 'none' | 'modern' | 'basic';  // 符号选项（三选一）

// 2. 分开定义常量对象
const baseSubsets: Record<CharSetKey, string> = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789"
};

const symbolSubsets: Record<Exclude<SymbolType, 'none'>, string> = {
  modern: "!#$%&()*+,-./:;=?@[]^_{}~",  // //推荐默认（现代 Web 应用）
  basic: "!@#$%^&*()"                   // 传统符号,最大兼容（银行/政府/老旧系统）
};

// 3. 配置接口
interface PasswordOptions {
  characterSets: CharSetKey[];
  symbolType: SymbolType;
}

// 4. 生成函数
function generateCharset(options: PasswordOptions): string {
  // 基础部分
  let charset = options.characterSets.map(key => baseSubsets[key]).join('');

  // 符号部分（明确的二选一）
  if (options.symbolType !== 'none') {
    charset += symbolSubsets[options.symbolType];
  }

  return charset;
}

// 计算迭代次数函数
function calculateIterations(counter: number): number {
  const BASE_ITERATIONS = 100000;// 一个合理的基准值
  const iterations = BASE_ITERATIONS + counter;
  // 设置合理上限，防止counter过大导致性能问题
  const MAX_ITERATIONS = 1000000;
  return Math.min(iterations, MAX_ITERATIONS);
}

// PBKDF2 密钥派生函数
async function deriveKeyPBKDF2(site: string, loginName: string, passwordData: Uint8Array<ArrayBuffer>, length: number, counter: number): Promise<Uint8Array> {

  // 添加分隔符，防止如 "example" + "com" 和 "ex" + "amplecom" 产生相同盐值
  let saltString = `${site}|${loginName}|${length}|${counter}`;

  const encoder = new TextEncoder();

  // 直接生成盐值Uint8Array
  const saltBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(saltString));
  const salt = new Uint8Array(saltBuffer); // ← 这就是正确的盐值格式

  //  计算总字节数
  const totalBytes = Math.ceil(length * 2.8) + 96; // 安全余量

  const keyMaterial = await crypto.subtle.importKey('raw', passwordData, { name: 'PBKDF2' }, false, ['deriveBits']);

  const iterations = calculateIterations(counter);

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    totalBytes * 8 // 转换为比特
  );

  return new Uint8Array(derivedBits);

}

/**
 * 从共享的随机字节池中，为指定字符集无偏地选取一个字符。
 * 会复用被其他字符集拒绝的字节，提高随机字节利用率。
 * 
 * @param charset 当前要选取的字符集字符串
 * @param randomBytesPool 共享的随机字节池 (Uint8Array)
 * @param usedFlags 标记池中哪些字节已被使用的布尔数组
 * @returns 从字符集中选取的单个字符
 * @throws 如果没有足够可用的字节，则抛出错误
 */
function pickOneFromSetWithPool(
  charset: string,
  randomBytesPool: Uint8Array,
  usedFlags: boolean[]
): string {
  // 计算拒绝采样阈值，确保均匀分布
  const threshold = 256 - (256 % charset.length);

  // 遍历字节池
  for (let i = 0; i < randomBytesPool.length; i++) {
    // 如果该字节已被其他字符集“消耗”，则跳过
    if (usedFlags[i]) {
      continue;
    }

    const byte = randomBytesPool[i];

    // 关键：只有当字节小于阈值时才“消耗”它
    if (byte < threshold) {
      usedFlags[i] = true; // 标记为已用
      const charIndex = byte % charset.length;
      return charset[charIndex];
    }

    // 重要：即使 byte >= threshold，也不标记 usedFlags[i] = true
    // 这个字节虽然当前字符集不能用，但可能适合其他字符集
    // 这是“池”设计的关键优化！
  }

  // 如果遍历完都没找到可用字节
  throw new Error("Not enough usable bytes in pool");
}

/**
 * 使用共享的随机字节池，生成剩余的密码字符。
 * 从字节池开头遍历，跳过已被占用的位置，选取符合条件的字符填充至指定长度。
 * 
 * @param targetLength 需要生成的剩余字符数量
 * @param charset 用于生成字符的字符集
 * @param randomBytesPool 共享的随机字节池 (Uint8Array)
 * @param usedFlags 标记字节是否已被使用的布尔数组，将被原地修改
 * @returns 由字符组成的数组
 * @throws 如果可用字节不足，则抛出错误
 */
function fillRemaining(
  targetLength: number,
  charset: string,
  randomBytesPool: Uint8Array,
  usedFlags: boolean[]
): string[] {
  // 计算拒绝采样阈值，确保均匀分布
  const threshold = 256 - (256 % charset.length);
  const result: string[] = [];
  let byteIndex = 0; // 遍历字节池的索引

  // 循环直到生成足够字符或遍历完字节池
  while (result.length < targetLength && byteIndex < randomBytesPool.length) {
    // 如果该字节已被占用（例如，被之前的 pickOneFromSetWithPool 使用），则跳过
    if (usedFlags[byteIndex]) {
      byteIndex++;
      continue;
    }

    const currentByte = randomBytesPool[byteIndex];

    // 只有字节值小于阈值时才使用
    if (currentByte < threshold) {
      const charIndex = currentByte % charset.length;
      result.push(charset[charIndex]);
      usedFlags[byteIndex] = true; // 标记为已使用
    }
    // 关键：如果 currentByte >= threshold，不标记 usedFlags，也不消耗它
    // 它可能在后续其他逻辑中，对其他字符集有用

    byteIndex++; // 无论是否使用，都检查下一个字节
  }

  // 检查是否成功生成了足够数量的字符
  if (result.length < targetLength) {
    const usedCount = usedFlags.filter(used => used).length;
    throw new Error(
      `无法生成足够的字符。需要 ${targetLength} 个，但只生成了 ${result.length} 个。` +
      `（随机池大小: ${randomBytesPool.length}, 已用字节: ${usedCount}）`
    );
  }

  return result;
}

// 数组洗牌函数
// 注：shuffle 从 secretBytes 的末尾向前消费字节，
// 而字符选择使用其前部。在 totalBytes = ceil(2.8 * L) + 96 的配置下，
// 两者在实践中不可能重叠；即使发生重叠，
// 由于字节值是确定性的，也不会影响安全性。
function shuffleArraySecure<T>(array: T[], randomBytes: Uint8Array): T[] {
  const shuffled = [...array];
  let byteIndex = randomBytes.length - 1;

  for (let i = shuffled.length - 1; i > 0; i--) {
    const range = i + 1;
    const threshold = 256 - (256 % range);

    let b: number;
    while (true) {
      if (byteIndex < 0) {
        throw new Error("Not enough bytes for secure shuffle");
      }
      b = randomBytes[byteIndex];
      byteIndex--; // 消耗这个字节（无论是否合格）

      if (b < threshold) {
        const j = b % range;
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        break;
      }
      // 否则继续（已消耗该字节）
    }
  }

  return shuffled;
}


function mapBytesToCharset(secretBytes: Uint8Array, required: PasswordOptions, pwdStrLength: number): string[] {



  // 2. 构建最终使用的字符集
  const fullCharset = generateCharset(required);
  const used = new Array(secretBytes.length).fill(false);


  // 3. 关键步骤：如果要求了符号，确保至少有一个符号字符
  const passwordParts: string[] = [];

  if (required.symbolType !== 'none') {
    // 从符号集中选一个字符
    const symbolCharset = symbolSubsets[required.symbolType];
    const symbolChar = pickOneFromSetWithPool(symbolCharset, secretBytes, used);
    passwordParts.push(symbolChar);
  }

  // 4. 从每个要求的基础字符集中各选一个字符
  for (const charSetKey of required.characterSets) {
    const charset = baseSubsets[charSetKey];
    const char = pickOneFromSetWithPool(charset, secretBytes, used);
    passwordParts.push(char);
  }

  // 5. 用完整字符集填充剩余长度
  const remainingLength = pwdStrLength - passwordParts.length;
  const remainingChars = fillRemaining(remainingLength, fullCharset, secretBytes, used);

  const allChars = [...passwordParts, ...remainingChars];

  // 6. 打乱顺序，防止可预测性
  // 使用时
  const shuffled = shuffleArraySecure(allChars, secretBytes);

  return shuffled;
}

// 验证配置函数
function validateOptions(options: PasswordOptions, pwdStrLength: number, counter: number): void {

  if (counter < 1) {
    throw new Error("counter 必须大于等于 1");
  }
  // 只验证业务逻辑，不验证类型
  const minLength = options.characterSets.length + (options.symbolType !== 'none' ? 1 : 0);

  if (minLength === 0) {
    throw new Error("必须至少选择一种字符类型");
  }

  if (pwdStrLength < minLength) {
    throw new Error(`密码长度至少需要 ${minLength} 个字符`);
  }

  // 可选：检查重复（因为 ['lower', 'lower'] 在类型上是允许的）
  if (new Set(options.characterSets).size !== options.characterSets.length) {
    throw new Error("基础字符集有重复");
  }

  // 4. 检查最大长度限制
  const MAX_LENGTH = 128; // 或根据你的需求设定

  if (pwdStrLength > MAX_LENGTH) {
    throw new Error(`密码长度不能超过 ${MAX_LENGTH} 个字符`);
  }
}

async function generatePassword(site: string, loginName: string, masterPassword: string, pwdStrLength: number, counter: number, required: PasswordOptions): Promise<string> {
  // 验证配置
  validateOptions(required, pwdStrLength, counter);

  const encoder = new TextEncoder();
  const passwordData = encoder.encode(masterPassword);
  let secretBytes: Uint8Array | null = null;

  try {
    secretBytes = await deriveKeyPBKDF2(site, loginName, passwordData, pwdStrLength, counter);
    const passwordChars = mapBytesToCharset(secretBytes, required, pwdStrLength);
    return passwordChars.join('');
  } finally {
    // 安全清理，避免空指针
    if (secretBytes && secretBytes.length > 0) {
      secretBytes.fill(0);
    }
    if (passwordData && passwordData.length > 0) {
      passwordData.fill(0);
    }
  }
}

export { generatePassword };