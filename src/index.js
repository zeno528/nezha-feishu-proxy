var VERSION = '1.0.2';

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
    var bodyStr = JSON.stringify(body);
    bodyStr = formatDateTime(bodyStr);
    bodyStr = updateCardColor(body, bodyStr);
    var feishuResponse = await fetch(FEISHU_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr,
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
    .logo{font-size:28px;font-weight:700;margin-bottom:8px;color:#fff}
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
    .arch{
      font-size:12px;color:#484f58;margin-bottom:24px;
      padding:10px;background:#161b22;border-radius:8px;
      font-family:monospace;word-break:break-all;
    }
    a{color:#58a6ff;text-decoration:none;font-size:13px}
    a:hover{text-decoration:underline}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">nezha-feishu-proxy</div>
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
    <div class="arch">&#21738;&#21522;&#38754;&#26495; &#8594; Cloudflare Worker &#8594; &#39134;&#20070; Webhook</div>
    <a href="https://github.com/zeno528/nezha-feishu-proxy" target="_blank">GitHub</a>
  </div>
</body>
</html>`;
}

/**
 * 将 Go time.String() 格式替换为简洁格式
 * 匹配: 2026-04-28 23:19:16.077279618 +0800 CST
 * 替换: 2026-04-28 23:19
 */
function formatDateTime(jsonStr) {
  return jsonStr.replace(
    /([0-9]{4}-[0-9]{2}-[0-9]{2}) ([0-9]{2}:[0-9]{2}):[0-9]{2}[.][0-9]+ [+-][0-9]{4} [A-Za-z]+/g,
    '$1 $2'
  );
}

/**
 * 根据告警类型动态修改卡片颜色
 * [正常]/[恢复] → 绿色
 * [异常]/[告警]/[事件]/离线 → 红色
 */
function updateCardColor(obj, jsonStr) {
  if (!obj.card || !obj.card.header) return jsonStr;
  var content = jsonStr;
  var hasRecovery = content.indexOf('[正常]') !== -1 || // [正常]
                    content.indexOf('[恢复]') !== -1;   // [恢复]
  var hasAlert = content.indexOf('[异常]') !== -1 ||   // [异常]
                 content.indexOf('[告警]') !== -1 ||   // [告警]
                 content.indexOf('[事件]') !== -1 ||   // [事件]
                 content.indexOf('离线') !== -1;       // 离线
  if (!hasRecovery && !hasAlert) return jsonStr;
  obj.card.header.template = hasRecovery ? 'green' : 'red';
  return JSON.stringify(obj);
}
