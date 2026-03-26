/**
 * 公考数据爬虫 - 从公开网站抓取报录比和分数线
 * 
 * 使用方式：
 *   node scripts/crawl-exam-data.js
 * 
 * 数据源：
 *   1. 国家公务员局（scs.gov.cn）- 公告与政策
 *   2. 公开培训平台的整理数据
 * 
 * 输出：data/crawled-stats.json
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      timeout: 15000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.setEncoding('utf-8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject).on('timeout', () => reject(new Error('请求超时')));
  });
}

// 从 HTML 中提取纯文本
function extractText(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 从文本中提取数字数据
function extractNumbers(text, keyword) {
  const patterns = [
    new RegExp(`${keyword}[^\\d]*(\\d[\\d,.]+)`, 'g'),
    new RegExp(`(\\d[\\d,.]+)[^\\d]*${keyword}`, 'g')
  ];
  const results = [];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const num = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(num)) results.push(num);
    }
  }
  return results;
}

async function crawlGovData() {
  console.log('🔍 正在尝试抓取国家公务员局公告数据...');
  
  const results = { 
    crawlTime: new Date().toISOString(),
    sources: [],
    data: {} 
  };

  // 数据源1: 国家公务员局公告页
  try {
    const url = 'http://bm.scs.gov.cn/pp/gkweb/core/web/ui/business/article/articleList.html?_page=1';
    console.log(`  📡 请求: ${url}`);
    const res = await fetch(url);
    
    if (res.status === 200) {
      const text = extractText(res.body);
      results.sources.push({ url, status: 'success', length: text.length });
      
      // 提取报名人数相关数据
      const applicants = extractNumbers(text, '报名');
      const positions = extractNumbers(text, '职位');
      
      if (applicants.length > 0) {
        results.data.latestApplicants = applicants;
      }
      if (positions.length > 0) {
        results.data.latestPositions = positions;
      }
      
      console.log(`  ✅ 成功获取 ${text.length} 字符内容`);
    } else {
      results.sources.push({ url, status: 'failed', code: res.status });
      console.log(`  ⚠️ 请求返回 ${res.status}`);
    }
  } catch (err) {
    console.log(`  ❌ 国家公务员局抓取失败: ${err.message}`);
    results.sources.push({ url: 'scs.gov.cn', status: 'error', error: err.message });
  }

  // 数据源2: 尝试从公开API获取职位统计
  try {
    const url2 = 'https://gwy.chinagwy.org/';
    console.log(`  📡 请求: ${url2}`);
    const res2 = await fetch(url2);
    
    if (res2.status === 200) {
      const text = extractText(res2.body);
      results.sources.push({ url: url2, status: 'success', length: text.length });
      
      // 提取分数线相关数据
      const scoreLines = extractNumbers(text, '分数线');
      const ratios = extractNumbers(text, '报录比');
      
      if (scoreLines.length > 0) results.data.scoreLines = scoreLines;
      if (ratios.length > 0) results.data.ratios = ratios;
      
      console.log(`  ✅ 成功获取 ${text.length} 字符`);
    }
  } catch (err) {
    console.log(`  ⚠️ 备用源抓取失败: ${err.message}`);
  }

  return results;
}

async function main() {
  console.log('========================================');
  console.log('  公考数据爬虫 v1.0');
  console.log('========================================\n');

  const crawled = await crawlGovData();

  // 合并到已有的 exam-stats 基础数据中
  const baseStatsPath = path.join(__dirname, '..', 'data', 'exam-stats.json');
  let baseStats = {};
  if (fs.existsSync(baseStatsPath)) {
    baseStats = JSON.parse(fs.readFileSync(baseStatsPath, 'utf-8'));
  }

  // 保存爬取的原始结果
  const outputPath = path.join(__dirname, '..', 'data', 'crawled-stats.json');
  fs.writeFileSync(outputPath, JSON.stringify(crawled, null, 2), 'utf-8');
  console.log(`\n💾 爬取结果已保存到: ${outputPath}`);
  
  console.log('\n📊 爬取摘要:');
  console.log(`  数据源数量: ${crawled.sources.length}`);
  console.log(`  成功: ${crawled.sources.filter(s => s.status === 'success').length}`);
  console.log(`  失败: ${crawled.sources.filter(s => s.status !== 'success').length}`);
  
  if (Object.keys(crawled.data).length === 0) {
    console.log('\n⚠️ 本次未爬到增量数据。这通常是因为:');
    console.log('  1. 目标网站结构已变更，需要更新解析逻辑');
    console.log('  2. 网络限制（部分政府网站限制频率）');
    console.log('  3. 数据在特定时间段才公开（如报名期间）');
    console.log('\n💡 建议: 优先使用手动导入方式，运行 scripts/parse-jobs.js 解析下载的职位表');
  }
}

main().catch(console.error);
