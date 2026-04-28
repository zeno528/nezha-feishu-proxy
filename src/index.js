/**
 * Nezha Feishu Proxy - 哪吒监控通知飞书代理
 * 
 * 功能：拦截哪吒面板的通知，优化时间格式后转发给飞书 Webhook
 * 部署：Cloudflare Worker
 */

export default {
  async fetch(request, env) {
    // 只接受 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const body = await request.json();

      // 格式化时间：替换所有 Go time.String() 格式的时间
      // 输入: "2026-04-28 23:19:16.077279618 +0800 CST"
      // 输出: "2026-04-28 23:19"
      const formattedBody = formatDateTime(JSON.stringify(body));

      // 转发给飞书 Webhook
      const feishuResponse = await fetch(env.FEISHU_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: formattedBody,
      });

      const result = await feishuResponse.json();

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
  },
};

/**
 * 将 Go time.String() 格式替换为简洁格式
 * 匹配: 2026-04-28 23:19:16.077279618 +0800 CST
 * 替换: 2026-04-28 23:19
 */
function formatDateTime(jsonStr) {
  // Go time.String() 格式: YYYY-MM-DD HH:MM:SS.nnnnnnnnn +ZZZZ TimeZone
  return jsonStr.replace(
    /(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}):\d{2}\.\d+ [+-]\d{4} \w+/g,
    '$1 $2'
  );
}
