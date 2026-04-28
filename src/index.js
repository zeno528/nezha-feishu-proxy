var VERSION = '1.0.8';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'GET') {
    return new Response(getStatusPage(), {
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
    });
  }
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  try {
    var body = await request.json();
    formatDateTime(body);
    updateCard(body);
    var feishuResponse = await fetch(FEISHU_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    var result = await feishuResponse.json();
    return new Response(JSON.stringify(result), {
      status: feishuResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function getStatusPage() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>nezha-feishu-proxy</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
      background:#0f1117;color:#e0e0e0;
      min-height:100vh;display:flex;align-items:center;justify-content:center;
    }
    .card{
      background:#1a1d27;border-radius:16px;padding:48px 40px;
      max-width:460px;width:90%;text-align:center;
      box-shadow:0 8px 32px rgba(0,0,0,.4);
    }
    .logo{
      font-size:26px;font-weight:700;color:#F8FAFC;margin-bottom:8px;
      font-family:'Space Grotesk','SF Mono',SFMono-Regular,Consolas,monospace;
      letter-spacing:-.3px;
    }
    .version{
      display:inline-block;background:#2d333b;border-radius:12px;
      padding:3px 12px;font-size:13px;color:#8b949e;margin-bottom:28px;
    }
    .status{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:32px}
    .dot{
      width:10px;height:10px;border-radius:50%;background:#3fb950;
      box-shadow:0 0 8px #3fb950;animation:pulse 2s infinite;
    }
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    .status-text{font-size:15px;color:#3fb950;font-weight:500}
    .divider{height:1px;background:#2d333b;margin:0 -8px 28px}
    .features{text-align:left;margin-bottom:28px}
    .features .item{
      display:flex;align-items:center;gap:10px;
      padding:8px 0;font-size:14px;color:#8b949e;
    }
    .features .icon{font-size:16px;width:24px;text-align:center}
    .flow{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:24px;flex-wrap:wrap}
    .flow .node{
      font-size:12px;padding:6px 14px;border-radius:8px;
      font-weight:500;white-space:nowrap;
    }
    .flow .n1{background:#1c2d1c;color:#3fb950;border:1px solid #2d4a2d}
    .flow .n2{background:#2d1f0e;color:#f0883e;border:1px solid #4a3520}
    .flow .n3{background:#0e2d4a;color:#58a6ff;border:1px solid #1a3a5c}
    .flow .arrow{color:#484f58;font-size:14px}
    a{color:#58a6ff;text-decoration:none;font-size:13px;display:inline-flex;align-items:center;gap:5px}
    a:hover{text-decoration:underline}
    a img{width:14px;height:14px}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Nezha-Feishu-Proxy</div>
    <div class="version">v${VERSION}</div>
    <div class="status">
      <div class="dot"></div>
      <div class="status-text">Service Online</div>
    </div>
    <div class="divider"></div>
    <div class="features">
      <div class="item"><span class="icon">&#9200;</span>Go time.String() &#8594; &#8203;yyyy-MM-dd HH:mm</div>
      <div class="item"><span class="icon">&#127912;</span>&#21160;&#24577;&#21345;&#29255;&#39068;&#33394; &#8226; &#32511;&#33394;&#24674;&#22797; / &#32418;&#33394;&#21578;&#35686;</div>
      <div class="item"><span class="icon">&#128232;</span>&#21345;&#29255;&#32467;&#26500;&#21407;&#26679;&#36716;&#21457;&#39134;&#20070;</div>
    </div>
    <div class="flow">
      <span class="node n1">&#21738;&#21522;&#38754;&#26495;</span>
      <span class="arrow">&#8594;</span>
      <span class="node n2">Cloudflare Worker</span>
      <span class="arrow">&#8594;</span>
      <span class="node n3">&#39134;&#20070; Webhook</span>
    </div>
    <div style="display:flex;gap:16px;justify-content:center">
      <a href="https://nezha.hellohub.top" target="_blank"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjMwIDE3IDE1NiAxNzAiPjxwYXRoIGZpbGw9IiMwQTk0RjIiIGQ9Ik0zMCAxN3Y2MS44NEw3My41ODggMTA2IDE3NyA0My4wODJsLTcuMzM2LS41NDJWMTd6Ii8+PHBhdGggZmlsbD0iIzAzMzhENiIgZD0iTTc3LjQyIDEzOS44NDVMMzAgMTA5Ljk0M3Y0Mi42TDk5LjU4NSAxODdsNjkuNTgyLTM0LjQ1N1Y3NS4zOEwxODYgNDh6Ii8+PC9zdmc+">哪吒面板</a>
      <a href="https://github.com/zeno528/nezha-feishu-proxy" target="_blank"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiI+PHBhdGggZmlsbD0iI2UwZTBlMCIgZD0iTTggMEMzLjU4IDAgMCAzLjU4IDAgOGMwIDMuNTQgMi4yOSA2LjUzIDUuNDcgNy41OS40LjA3LjU1LS4xNy41NS0uMzggMC0uMTktLjAxLS44Mi0uMDEtMS40OS0yLjAxLjM3LTIuNTMtLjQ5LTIuNjktLjk0LS4wOS0uMjMtLjQ4LS45NC0uODItMS4xMy0uMjgtLjE1LS42OC0uNTItLjAxLS41My42My0uMDEgMS4wOC41OCAxLjIzLjgyLjcyIDEuMjEgMS44Ny44NyAyLjMzLjY2LjA3LS41Mi4yOC0uODcuNTEtMS4wNy0xLjc4LS4yLTMuNjQtLjg5LTMuNjQtMy45NSAwLS44Ny4zMS0xLjU5LjgyLTIuMTUtLjA4LS4yLS4zNi0xLjAyLjA4LTIuMTIgMCAwIC42Ny0uMjEgMi4yLjgyLjY0LS4xOCAxLjMyLS4yNyAyLS4yNy42OCAwIDEuMzYuMDkgMiAuMjcgMS41My0xLjA0IDIuMi0uODIgMi4yLS44Mi40NCAxLjEuMTYgMS45Mi4wOCAyLjEyLjUxLjU2LjgyIDEuMjcuODIgMi4xNSAwIDMuMDctMS44NyAzLjc1LTMuNjUgMy45NS4yOS4yNS41NC43My41NCAxLjQ4IDAgMS4wNy0uMDEgMS45My0uMDEgMi4yIDAgLjIxLjE1LjQ2LjU1LjM4QTguMDEzIDguMDEzIDAgMDAxNiA4YzAtNC40Mi0zLjU4LTgtOC04eiIvPjwvc3ZnPg==">GitHub</a>
      <a href="https://dash.cloudflare.com" target="_blank"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHBhdGggZmlsbD0iI0YzODAyMCIgZD0iTTMxLjUgMzIuNUgxMi42Yy0uNCAwLS43LS4zLS43LS43cy4zLS43LjctLjdoMTguMmwxLjItNC41SDE0LjhjLS40IDAtLjctLjMtLjctLjdzLjMtLjcuNy0uN2gxOGwxLjItNC41SDE2LjVjLTMuNSAwLTYuNCAyLjUtNyA1LjhsLTEuMiA1LjdjLS4yIDEgMCAyIC41IDIuOC42LjkgMS41IDEuNCAyLjUgMS40aDIwLjdsLTAuNS0zLjl6Ii8+PHBhdGggZmlsbD0iI0YzODAyMCIgZD0iTTQwLjggMjcuM2MtLjYtLjktMS41LTEuNC0yLjUtMS40aC0yLjNsLTEuMiA0LjVoMi4zYy40IDAgLjcuMy43LjdzLS4zLjctLjcuN2gtMi44bC0xLjIgNC41aDNjMy41IDAgNi40LTIuNSA3LTUuOGwuNC0xLjhjLjItMSAwLTItLjUtMi44bC0yLjIgMS40eiIvPjwvc3ZnPg==">Workers</a>
    </div>
  </div>
</body>
</html>`;
}

// Go time.String() 格式: 2026-04-28 23:19:16.077279618 +0800 CST
var TIME_RE = /([0-9]{4}-[0-9]{2}-[0-9]{2}) ([0-9]{2}:[0-9]{2}):[0-9]{2}[.][0-9]+ [+-][0-9]{4} [A-Za-z]+/g;

/**
 * 深度遍历对象，替换所有字符串中的时间格式
 */
function formatDateTime(obj) {
  if (typeof obj === 'string') {
    return obj.replace(TIME_RE, '$1 $2');
  }
  if (obj && typeof obj === 'object') {
    for (var key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(TIME_RE, '$1 $2');
      } else if (typeof obj[key] === 'object') {
        formatDateTime(obj[key]);
      }
    }
  }
  return obj;
}

/**
 * 根据告警类型修改卡片颜色和标题
 * [正常]/[恢复] → 绿色 + 标题含"恢复"
 * [异常]/[告警]/[事件]/离线 → 红色 + 标题含"告警"
 */
function updateCard(obj) {
  if (!obj.card || !obj.card.header) return;
  var content = JSON.stringify(obj);
  var hasRecovery = content.indexOf('[正常]') !== -1 ||
                    content.indexOf('[恢复]') !== -1;
  var hasAlert = content.indexOf('[异常]') !== -1 ||
                 content.indexOf('[告警]') !== -1 ||
                 content.indexOf('[事件]') !== -1 ||
                 content.indexOf('离线') !== -1;
  if (!hasRecovery && !hasAlert) return;

  // 飞书卡片 header.title 是 {tag, content} 对象，不是字符串
  var titleObj = obj.card.header.title;
  var titleText = typeof titleObj === 'string' ? titleObj :
                  (titleObj && titleObj.content) || '';

  // 替换 🖥️ 图标，用 ✅/🔴 区分恢复和告警
  if (hasRecovery) {
    obj.card.header.template = 'green';
    titleText = titleText.replace('🖥️', '✅').replace('状态通知', '已恢复');
  } else {
    obj.card.header.template = 'red';
    if (content.indexOf('离线') !== -1) {
      titleText = titleText.replace('🖥️', '🔴').replace('状态通知', '离线');
    } else {
      titleText = titleText.replace('🖥️', '🔴').replace('状态通知', '告警');
    }
  }

  if (typeof titleObj === 'string') {
    obj.card.header.title = titleText;
  } else if (titleObj) {
    titleObj.content = titleText;
  }
}
