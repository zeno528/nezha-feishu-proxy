addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
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
