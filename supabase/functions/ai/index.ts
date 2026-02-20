const MODEL_ID = Deno.env.get("DOUBAO_MODEL_ID") ?? "doubao-seed-1-8-251228";
const ENDPOINT_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

const SYSTEM_PROMPT = "你是断食营养专家。分析食物图片，返回JSON。无markdown，无额外文字。";

const buildUserPrompt = (currentState: string) =>
  `状态:${currentState}。返回JSON格式:{"foodName":"食物名(8字内)","calories":热量整数,"macros":{"protein":"蛋白质(如15g)","fat":"脂肪(如10g)","carbs":"碳水(如45g)"},"tags":["标签1","标签2","标签3"],"advice":"断食建议(25字内)","nextStep":"行动建议(18字内)"}`;

type Json = Record<string, unknown>;

function jsonResponse(
  body: unknown,
  init?: ResponseInit & { cors?: boolean },
): Response {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  if (init?.cors !== false) {
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Headers", "authorization, apikey, content-type");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  }
  return new Response(JSON.stringify(body), { ...init, headers });
}

function getBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

async function verifyUser(req: Request): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, status: 500, message: "Supabase 环境未配置" };
  }

  const token = getBearerToken(req);
  if (!token) return { ok: false, status: 401, message: "请先登录再使用 AI 分析" };

  const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) return { ok: false, status: 401, message: "登录已过期，请重新登录" };
  return { ok: true };
}

function stripPossibleCodeBlock(text: string): string {
  let s = text.trim();
  if (s.startsWith("```json")) s = s.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  else if (s.startsWith("```")) s = s.replace(/^```\n?/, "").replace(/\n?```$/, "");
  return s.trim();
}

async function callDoubao(apiKey: string, payload: Json, timeoutMs: number): Promise<Json> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(ENDPOINT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const errorText = await resp.text().catch(() => "");
      throw new Error(`AI 服务暂时不可用 (${resp.status}) ${errorText}`.trim());
    }

    return (await resp.json()) as Json;
  } finally {
    clearTimeout(timeoutId);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return jsonResponse({ ok: true }, { status: 200 });
  }

  if (req.method !== "POST") {
    return jsonResponse({ message: "Method not allowed" }, { status: 405 });
  }

  const key = Deno.env.get("DOUBAO_API_KEY");
  if (!key) {
    return jsonResponse({ message: "服务器配置错误：缺少 AI API 密钥" }, { status: 500 });
  }

  const authCheck = await verifyUser(req);
  if (!authCheck.ok) {
    return jsonResponse({ message: authCheck.message }, { status: authCheck.status });
  }

  const startTime = Date.now();
  const timeoutMs = 25_000;

  let body: Json;
  try {
    body = (await req.json()) as Json;
  } catch {
    return jsonResponse({ message: "请求体必须是 JSON" }, { status: 400 });
  }

  try {
    if (Array.isArray(body.meals)) {
      const meals = body.meals as Array<{ type?: string; foodName?: string; calories?: number }>;
      if (meals.length === 0) return jsonResponse({ message: "没有饮食记录可分析" }, { status: 400 });

      const mealsText = meals
        .map((m) => {
          const type = m.type === "breakfast"
            ? "早餐"
            : m.type === "lunch"
            ? "午餐"
            : m.type === "dinner"
            ? "晚餐"
            : "加餐";
          const name = m.foodName ?? "未知";
          const calories = typeof m.calories === "number" ? m.calories : 0;
          return `- ${type}: ${name} (${calories}大卡)`;
        })
        .join("\n");

      const prompt = `基于以下今日饮食记录生成分析报告：
${mealsText}

请返回严格的JSON格式（不要Markdown）：
{
  "totalCalories": 整数(总热量),
  "nutritionalEvaluation": {
    "score": 整数(0-100分),
    "summary": "一句话点评(30字内)",
    "deficiencies": ["缺乏项1", "缺乏项2"],
    "excesses": ["过量项1", "过量项2"]
  },
  "advice": "针对性的改善建议(100字以内，温暖专业的语气)"
}`;

      const data = await callDoubao(
        key,
        {
          model: MODEL_ID,
          messages: [
            { role: "system", content: "你是专业的营养师。请根据用户的饮食记录提供客观、科学的分析和建议。返回纯JSON。" },
            { role: "user", content: prompt },
          ],
          stream: false,
        },
        timeoutMs,
      );

      const content = (((data as any).choices?.[0]?.message?.content) ?? "") as string;
      if (!content) throw new Error("AI 未返回有效内容");

      const jsonStr = stripPossibleCodeBlock(content);
      const result = JSON.parse(jsonStr) as Json;
      return jsonResponse(result, { status: 200 });
    }

    const image = typeof body.image === "string" ? body.image : null;
    if (!image) return jsonResponse({ message: "看起来这不是食物，或者图片太模糊了。请再拍一张试试！" }, { status: 400 });

    const currentState = typeof body.currentState === "string" && body.currentState.trim().length > 0
      ? body.currentState.trim()
      : "准备开食";

    const userPrompt = buildUserPrompt(currentState);
    const data = await callDoubao(
      key,
      {
        model: MODEL_ID,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        stream: false,
      },
      timeoutMs,
    );

    const content = (((data as any).choices?.[0]?.message?.content) ?? "") as string;
    if (!content) throw new Error("AI 未返回有效内容");

    const jsonStr = stripPossibleCodeBlock(content);
    const result = JSON.parse(jsonStr) as Json;
    if (!result.foodName || typeof result.calories !== "number") {
      throw new Error("AI 返回数据格式不完整");
    }

    void startTime;
    return jsonResponse(result, { status: 200 });
  } catch (e) {
    const totalTime = Date.now() - startTime;
    if (e instanceof Error && e.name === "AbortError") {
      return jsonResponse({ message: "分析超时，请稍后重试" }, { status: 504, headers: { "x-total-time": `${totalTime}` } });
    }
    const message = e instanceof Error ? e.message : "分析服务暂时繁忙，请稍后再试";
    return jsonResponse({ message }, { status: 500, headers: { "x-total-time": `${totalTime}` } });
  }
});
