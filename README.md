# nezha-feishu-proxy

[![GitHub release](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzeno528%2Fnezha-feishu-proxy%2Fmain%2Fpackage.json&query=%24.version&label=version)](https://github.com/zeno528/nezha-feishu-proxy/releases)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E?logo=javascript&logoColor=black)]()
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)

哪吒监控通知飞书代理，部署在 Cloudflare Worker 上。

## 功能

### ✅ 时间格式优化
将 Go `time.String()` 的长格式替换为简洁格式：
- 输入：`2026-04-28 23:19:16.077279618 +0800 CST`
- 输出：`2026-04-28 23:19`

### ✅ 动态卡片颜色
根据告警类型自动切换标题栏颜色：
- 🟢 **绿色** — 恢复通知（内容含 `[正常]`）
- 🔴 **红色** — 告警通知（内容含 `[异常]`、`[告警]`、`离线`）

### 🔮 后续扩展（规划中）
- 告警去重/防刷
- 多渠道转发（飞书+Telegram）
- 告警静默时段
- 告警统计记录（KV/D1）

## 架构

```
哪吒面板 → Cloudflare Worker (本代理) → 飞书 Webhook
```

代理只做两件事：优化时间格式 + 动态改颜色，卡片结构原样转发。

## 部署

```bash
# 1. 安装依赖
npm install

# 2. 设置飞书 Webhook 地址（密钥，不会出现在代码中）
npx wrangler secret put FEISHU_WEBHOOK_URL
# 输入: https://open.feishu.cn/open-apis/bot/v2/hook/xxx

# 3. 部署
npx wrangler deploy
```

## 哪吒面板配置

在通知规则的 URL 中填入 Worker 地址：
```
https://nezha-feishu-proxy.<你的子域>.workers.dev
```

request_body 不需要改动，代理会自动处理。

## 环境变量

| 变量 | 说明 | 设置方式 |
|:-----|:-----|:---------|
| `FEISHU_WEBHOOK_URL` | 飞书 Webhook 地址 | `wrangler secret put`（加密存储） |

## 安全

- 仓库中**不包含**任何密钥、Token、Webhook URL
- 飞书 Webhook 地址通过 Cloudflare Secret 加密存储
- 只接受 POST 请求，其他方法返回 405
