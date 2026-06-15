# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SSPU ACM 官网 — 上海第二工业大学程序设计竞赛协会的静态网站。纯 HTML/CSS/JS 项目，无构建工具、无包管理器、无框架。

## Running & Deploying

```bash
# 本地预览（任选一种）
start index.html                          # 直接浏览器打开
python -m http.server 8080                # Python HTTP 服务器
# 或使用 VS Code Live Server 插件

# Docker 部署
docker build -t acmwebsite .
docker run -p 8080:80 acmwebsite
```

## Architecture

### 页面结构

四页静态站：`index.html`（首页）、`about.html`（关于协会）、`hall_of_fame.html`（荣誉殿堂）、`news.html`（动态公告）。

### 组件注入模式

每个 HTML 页面通过 `<div id="header-placeholder">` 和 `<div id="footer-placeholder">` 占位。`js/components.js` 在 `DOMContentLoaded` 时用 `outerHTML` 替换为完整 header/footer。修改导航栏或页脚只需编辑 `components.js` 中的 `injectHeader()` / `injectFooter()`。

### CSS 设计系统

`css/style.css`（~1777 行）包含全部样式：

- **主题系统**：通过 `[data-theme="dark"]` / `[data-theme="light"]` CSS 变量驱动，`localStorage` 持久化
- **品牌色**：SSPU 蓝 `--sspu-blue-base`（HSL 217, 91%, 60%）、SSPU 绿 `--sspu-green-base`（HSL 161, 84%, 48%）
- **UI 风格**：毛玻璃（glassmorphism）卡片 + `backdrop-filter: blur(12px)`
- **断点**：`1024px`（平板）、`768px`（手机）
- **字体**：Google Fonts `Outfit` + `Plus Jakarta Sans`
- **关键类**：`.glass-card`、`.btn-primary`、`.btn-secondary`、`.section-title`、`.container`

### JS 模块

| 文件 | 职责 |
|------|------|
| `js/components.js` | Header/Footer 注入 + 导航高亮 |
| `js/main.js` | 主题切换、移动导航、视差滚动、打字机效果、轮播、统计计数器 |
| `js/playground.js` | 算法可视化器（冒泡排序、选择排序），含代码行高亮和中文步骤解释 |

### 外部依赖（CDN）

- Font Awesome 6.4.0（`cdn.bootcdn.net`）
- Google Fonts（CSS `@import`）

## Conventions

- **语言**：页面内容和注释为中文，代码变量名用英文
- **主题切换**：通过 `document.documentElement.setAttribute('data-theme', ...)` 控制，新组件必须使用 CSS 变量而非硬编码颜色
- **新增页面**：必须包含 `header-placeholder` 和 `footer-placeholder` div，并引入 `components.js`
- **图片资源**：`images/contest/` 存比赛 Logo，`images/prize/` 存获奖照片和成员头像
