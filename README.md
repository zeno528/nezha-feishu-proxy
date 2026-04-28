# nezha-feishu-proxy

哪吒监控通知飞书代理，部署在 Cloudflare Worker 上。

## 功能

- **时间格式优化** — 将 Go `time.String()` 的长格式（`2026-04-28 23:19:16.077279618 +0800 CST`）替换为简洁格式（`2026-04-28 23:19`）
- **透明代理** — 不改动卡片结构，只处理时间字段，原样转发给飞书

## 架构

```
哪吒面板 → Cloudflare Worker → 飞书 Webhook
```

## 部署

```bash
# 1. 安装依赖
npm install

# 2. 设置飞书 Webhook 地址（密钥）
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

## 环境变量

| 变量 | 说明 | 设置方式 |
|:-----|:-----|:---------|
| `FEISHU_WEBHOOK_URL` | 飞书 Webhook 地址 | `wrangler secret put` |

## 后续扩展

- 告警去重/防刷
- 根据告警类型动态改卡片颜色
- 多渠道转发
- 告警静默时段
- 告警统计记录（KV/D1）
