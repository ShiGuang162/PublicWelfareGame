/**
 * 急救先锋 — 海报生成脚本
 * 使用 HTML Canvas API 生成 800x1200 竖版海报 PNG
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const W = 800;
const H = 1200;

// 生成 SVG，然后用命令行工具转 PNG
// 直接用 SVG 输出，更可控
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- 背景渐变 -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFF5F0"/>
      <stop offset="40%" stop-color="#FFF8F5"/>
      <stop offset="100%" stop-color="#FFF0EC"/>
    </linearGradient>

    <!-- 红色渐变 - 动脉 -->
    <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#C62828"/>
      <stop offset="100%" stop-color="#E53935"/>
    </linearGradient>

    <!-- 金色渐变 -->
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFD54F"/>
      <stop offset="100%" stop-color="#FFB300"/>
    </linearGradient>

    <!-- 网格图案 - 医用纱布纹理 -->
    <pattern id="gauze" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="none"/>
      <line x1="0" y1="6" x2="12" y2="6" stroke="#E53935" stroke-width="0.3" stroke-opacity="0.08"/>
      <line x1="6" y1="0" x2="6" y2="12" stroke="#E53935" stroke-width="0.3" stroke-opacity="0.08"/>
    </pattern>

    <!-- 点状图案 - 生命体征监测 -->
    <pattern id="vitalDots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="1" fill="#E53935" fill-opacity="0.12"/>
    </pattern>

    <!-- 半色调 -->
    <pattern id="halftone" width="8" height="8" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="2.5" fill="#E53935" fill-opacity="0.06"/>
      <circle cx="0" cy="0" r="1.2" fill="#E53935" fill-opacity="0.04"/>
      <circle cx="8" cy="8" r="1.2" fill="#E53935" fill-opacity="0.04"/>
    </pattern>

    <!-- 径向脉冲 -->
    <radialGradient id="pulse1" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#E53935" stop-opacity="0.25"/>
      <stop offset="60%" stop-color="#E53935" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#E53935" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="pulse2" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#E53935" stop-opacity="0.15"/>
      <stop offset="40%" stop-color="#E53935" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#E53935" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="goldGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#FFD54F" stop-opacity="0.4"/>
      <stop offset="50%" stop-color="#FFD54F" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#FFD54F" stop-opacity="0"/>
    </radialGradient>

    <!-- 剪切路径 -->
    <clipPath id="clipMain">
      <rect x="0" y="0" width="800" height="1200"/>
    </clipPath>
  </defs>

  <!-- ===== 背景层 ===== -->
  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
  <rect width="${W}" height="${H}" fill="url(#halftone)"/>

  <!-- ===== 大圆环 - 脉冲 ===== -->
  <circle cx="400" cy="280" r="300" fill="url(#pulse1)"/>
  <circle cx="400" cy="280" r="200" fill="url(#pulse1)"/>
  <circle cx="400" cy="280" r="120" fill="url(#pulse2)"/>

  <!-- ===== ECG 波形装饰 ===== -->
  <g opacity="0.12">
    <!-- 大 ECG -->
    <polyline points="120,450 200,450 210,450 215,350 220,550 225,450 230,450 235,300 240,600 245,450 250,450 680,450"
      fill="none" stroke="#E53935" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- 小 ECG -->
    <polyline points="140,750 200,750 208,750 212,680 216,820 220,750 224,750 228,650 232,850 236,750 240,750 660,750"
      fill="none" stroke="#E53935" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- 底部 ECG -->
    <polyline points="100,1020 220,1020 228,1020 232,930 236,1110 240,1020 244,1020 248,900 252,1140 256,1020 260,1020 700,1020"
      fill="none" stroke="#E53935" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- ===== 标题区域 ===== -->
  <!-- 红色竖条装饰 -->
  <rect x="60" y="160" width="6" height="320" rx="3" fill="url(#redGrad)"/>

  <!-- 主标题 -->
  <text x="90" y="250" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="96" font-weight="900" letter-spacing="8" fill="#C62828">
    急救先锋
  </text>

  <!-- 英文副标题 -->
  <text x="95" y="310" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="22" font-weight="600" letter-spacing="12" fill="#E53935" fill-opacity="0.6">
    FIRST AID HERO
  </text>

  <!-- 副标题 -->
  <text x="95" y="365" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="20" font-weight="400" letter-spacing="4" fill="#888888">
    小 红 花 公 益 急 救 闯 关
  </text>

  <!-- 分隔线 -->
  <line x1="90" y1="390" x2="340" y2="390" stroke="#E53935" stroke-width="2" stroke-opacity="0.3"/>
  <circle cx="340" cy="390" r="4" fill="#FFD54F"/>

  <!-- 标语 -->
  <text x="95" y="435" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="16" font-weight="500" letter-spacing="3" fill="#666666">
    用游戏传递公益力量
  </text>

  <!-- ===== 中央视觉区：红十字 + 小红花 ===== -->
  <g transform="translate(580, 240)">
    <!-- 红十字背景 -->
    <circle cx="0" cy="0" r="72" fill="none" stroke="#C62828" stroke-width="3" stroke-opacity="0.2"/>
    <circle cx="0" cy="0" r="62" fill="#C62828" fill-opacity="0.06"/>
    
    <!-- 黄金光晕 -->
    <circle cx="10" cy="20" r="40" fill="url(#goldGlow)"/>

    <!-- 小红花 — 花瓣 -->
    <g transform="translate(10, 20)">
      <!-- 外层花瓣 -->
      <ellipse cx="0" cy="-28" rx="14" ry="22" fill="#E53935" transform="rotate(0)" opacity="0.9"/>
      <ellipse cx="0" cy="-28" rx="14" ry="22" fill="#E53935" transform="rotate(72)" opacity="0.85"/>
      <ellipse cx="0" cy="-28" rx="14" ry="22" fill="#E53935" transform="rotate(144)" opacity="0.8"/>
      <ellipse cx="0" cy="-28" rx="14" ry="22" fill="#E53935" transform="rotate(216)" opacity="0.85"/>
      <ellipse cx="0" cy="-28" rx="14" ry="22" fill="#E53935" transform="rotate(288)" opacity="0.9"/>
      <!-- 内层花瓣 -->
      <ellipse cx="0" cy="-18" rx="9" ry="14" fill="#C62828" transform="rotate(36)" opacity="0.8"/>
      <ellipse cx="0" cy="-18" rx="9" ry="14" fill="#C62828" transform="rotate(108)" opacity="0.75"/>
      <ellipse cx="0" cy="-18" rx="9" ry="14" fill="#C62828" transform="rotate(180)" opacity="0.75"/>
      <ellipse cx="0" cy="-18" rx="9" ry="14" fill="#C62828" transform="rotate(252)" opacity="0.8"/>
      <ellipse cx="0" cy="-18" rx="9" ry="14" fill="#C62828" transform="rotate(324)" opacity="0.8"/>
      <!-- 花蕊 -->
      <circle cx="0" cy="0" r="8" fill="#FFD54F"/>
      <circle cx="0" cy="0" r="5" fill="#FFB300"/>
      <circle cx="-2" cy="-2" r="1.5" fill="#FFE082" opacity="0.8"/>
      <circle cx="2" cy="1" r="1.5" fill="#FFE082" opacity="0.8"/>
    </g>
    
    <!-- 花瓣掉落 -->
    <ellipse cx="-35" cy="55" rx="6" ry="10" fill="#E53935" opacity="0.25" transform="rotate(-25, -35, 55)"/>
    <ellipse cx="45" cy="40" rx="5" ry="8" fill="#E53935" opacity="0.2" transform="rotate(15, 45, 40)"/>
  </g>

  <!-- ===== 中间信息区 ===== -->
  <g transform="translate(70, 550)">
    <!-- 段位展示 -->
    <rect x="0" y="0" width="660" height="55" rx="8" fill="#C62828" fill-opacity="0.04"/>
    <text x="20" y="20" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="13" fill="#888" letter-spacing="2">段位阶梯</text>
    <g transform="translate(20, 32)">
      <text font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="18" fill="#E53935" font-weight="700" opacity="0.8">
        青铜 · 白银 · 黄金 · 铂金 · 钻石 · 急救大师
      </text>
    </g>
  </g>

  <!-- 关卡展示 -->
  <g transform="translate(70, 630)">
    <text x="0" y="0" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="12" fill="#999" letter-spacing="3">八大急救主题</text>
    
    <g transform="translate(0, 18)">
      <!-- 第1行 -->
      <rect x="0" y="0" width="150" height="42" rx="6" fill="white" stroke="#E53935" stroke-width="1" stroke-opacity="0.12"/>
      <text x="15" y="27" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="13" fill="#c62828" font-weight="600">❤️ 心肺复苏</text>
      
      <rect x="162" y="0" width="150" height="42" rx="6" fill="white" stroke="#E53935" stroke-width="1" stroke-opacity="0.12"/>
      <text x="177" y="27" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="13" fill="#c62828" font-weight="600">🩹 止血包扎</text>
      
      <rect x="324" y="0" width="150" height="42" rx="6" fill="white" stroke="#E53935" stroke-width="1" stroke-opacity="0.12"/>
      <text x="339" y="27" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="13" fill="#c62828" font-weight="600">🔥 火灾逃生</text>
      
      <rect x="486" y="0" width="150" height="42" rx="6" fill="white" stroke="#E53935" stroke-width="1" stroke-opacity="0.12"/>
      <text x="501" y="27" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="13" fill="#c62828" font-weight="600">🌊 溺水救援</text>
    </g>
    
    <g transform="translate(0, 52)">
      <rect x="0" y="0" width="150" height="42" rx="6" fill="white" stroke="#E53935" stroke-width="1" stroke-opacity="0.12"/>
      <text x="15" y="27" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="13" fill="#c62828" font-weight="600">☀️ 中暑急救</text>
      
      <rect x="162" y="0" width="150" height="42" rx="6" fill="white" stroke="#E53935" stroke-width="1" stroke-opacity="0.12"/>
      <text x="177" y="27" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="13" fill="#c62828" font-weight="600">🗣️ 异物卡喉</text>
      
      <rect x="324" y="0" width="150" height="42" rx="6" fill="white" stroke="#E53935" stroke-width="1" stroke-opacity="0.12"/>
      <text x="339" y="27" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="13" fill="#c62828" font-weight="600">🏠 地震避险</text>
      
      <rect x="486" y="0" width="150" height="42" rx="6" fill="white" stroke="#E53935" stroke-width="1" stroke-opacity="0.12"/>
      <text x="501" y="27" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="13" fill="#c62828" font-weight="600">⚡ 触电急救</text>
    </g>
  </g>

  <!-- ===== 底部信息 ===== -->
  <g transform="translate(70, 760)">
    <!-- 统计数字 -->
    <g>
      <text x="0" y="0" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="48" font-weight="900" fill="#E53935" opacity="0.8">40</text>
      <text x="0" y="20" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="12" fill="#999" letter-spacing="2">道急救题目</text>
    </g>
    <g transform="translate(140, 0)">
      <text x="0" y="0" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="48" font-weight="900" fill="#E53935" opacity="0.8">6</text>
      <text x="0" y="20" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="12" fill="#999" letter-spacing="2">段位进阶</text>
    </g>
    <g transform="translate(280, 0)">
      <text x="0" y="0" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="48" font-weight="900" fill="#E53935" opacity="0.8">8</text>
      <text x="0" y="20" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="12" fill="#999" letter-spacing="2">关卡挑战</text>
    </g>
  </g>

  <!-- ===== 数据亮点条 ===== -->
  <g transform="translate(70, 860)">
    <rect x="0" y="0" width="660" height="3" rx="1.5" fill="#E53935" fill-opacity="0.1"/>
    <rect x="0" y="0" width="490" height="3" rx="1.5" fill="#E53935" fill-opacity="0.25"/>
    
    <text x="0" y="30" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="11" fill="#aaa" letter-spacing="1">
      竞技闯关  ·  全年龄段  ·  H5 跨平台  ·  零依赖部署  ·  权威急救知识  ·  公益教育
    </text>
  </g>

  <!-- ===== 底部 slogan ===== -->
  <g transform="translate(400, 970)">
    <text x="0" y="0" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="18" font-weight="600" letter-spacing="6" fill="#C62828" fill-opacity="0.5" text-anchor="middle">
      守护生命 从游戏开始
    </text>
  </g>

  <!-- 底部彩色装饰条 -->
  <g>
    <rect x="0" y="1050" width="120" height="4" rx="2" fill="#E53935"/>
    <rect x="125" y="1050" width="120" height="4" rx="2" fill="#C62828"/>
    <rect x="250" y="1050" width="120" height="4" rx="2" fill="#FFD54F"/>
    <rect x="375" y="1050" width="120" height="4" rx="2" fill="#FFB300"/>
    <rect x="500" y="1050" width="120" height="4" rx="2" fill="#E53935"/>
    <rect x="625" y="1050" width="120" height="4" rx="2" fill="#C62828"/>
  </g>

  <!-- ===== 右下角标签 ===== -->
  <g transform="translate(660, 1050)">
    <text font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="9" fill="#bbb" letter-spacing="2">腾讯云黑客松</text>
    <text x="0" y="14" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" font-size="9" fill="#ccc" letter-spacing="1">小红花 · 公益游戏</text>
  </g>

  <!-- ===== 装饰：心跳点 ===== -->
  <circle cx="680" cy="870" r="3" fill="#E53935" opacity="0.3"/>
  <circle cx="700" cy="870" r="3" fill="#E53935" opacity="0.2"/>
  <circle cx="720" cy="870" r="3" fill="#E53935" opacity="0.15"/>
  
  <circle cx="660" cy="900" r="2" fill="#E53935" opacity="0.2"/>
  <circle cx="680" cy="900" r="2" fill="#E53935" opacity="0.15"/>
</svg>`;

// 写入 SVG 文件
const svgPath = path.join(__dirname, 'poster.svg');
fs.writeFileSync(svgPath, svg, 'utf-8');
console.log('SVG poster created at:', svgPath);

// 尝试用 sips (macOS) 转 PNG
const { execSync } = require('child_process');
try {
  const pngPath = path.join(__dirname, 'poster.png');
  execSync(`qlmanage -t -s 1600 -o /tmp/poster_preview "${svgPath}"`, { stdio: 'ignore' });
  const tmpPng = '/tmp/poster_preview/poster.svg.png';
  if (fs.existsSync(tmpPng)) {
    fs.copyFileSync(tmpPng, pngPath);
    fs.unlinkSync(tmpPng);
    console.log('PNG poster created at:', pngPath);
  } else {
    // 备用：用 rs-convert 或直接告诉用户 SVG 已生成
    console.log('PNG conversion requires additional tools. SVG file is ready for use.');
  }
} catch (e) {
  console.log('PNG conversion skipped. SVG file available at:', svgPath);
}
console.log('Done.');
