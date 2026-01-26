import { Router } from 'express';

const router = Router();

const MODEL_ID = 'doubao-seed-1-8-251228';
const ENDPOINT_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

export const SYSTEM_PROMPT =
  '你是断食营养专家。分析食物图片，返回JSON。无markdown，无额外文字。';

export const buildUserPrompt = (currentState: string) =>
  `状态:${currentState}。返回JSON格式:{"foodName":"食物名(8字内)","calories":热量整数,"macros":{"protein":"蛋白质(如15g)","fat":"脂肪(如10g)","carbs":"碳水(如45g)"},"tags":["标签1","标签2","标签3"],"advice":"断食建议(25字内)","nextStep":"行动建议(18字内)"}`;

router.post('/analyze', async (req, res) => {
  // Get API key at runtime to ensure env vars are loaded
  const API_KEY = process.env.DOUBAO_API_KEY;
  if (!API_KEY) {
    console.error('Error: DOUBAO_API_KEY is not set.');
    return res.status(500).json({
      error: true,
      message: '服务器配置错误：缺少 AI API 密钥',
    });
  }

  const startTime = Date.now();
  let apiCallTime = 0;
  let processingTime = 0;
  const timeoutMs = 25000;
  
  try {
    const { image, currentState } = req.body as { image?: string; currentState?: string };

    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        error: true,
        message: '看起来这不是食物，或者图片太模糊了。请再拍一张试试！',
      });
    }

    const normalizedState = typeof currentState === 'string' && currentState.trim().length > 0 ? currentState.trim() : '准备开食';
    const userPrompt = buildUserPrompt(normalizedState);

    const processingStartTime = Date.now();

    // Call Doubao API with timeout
    const apiStartTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    let apiResponse;
    try {
      apiResponse = await fetch(ENDPOINT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: userPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: image
                  }
                }
              ]
            }
          ],
          stream: false
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    apiCallTime = Date.now() - apiStartTime;

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Doubao API Error:', apiResponse.status, errorText);
      throw new Error(`AI 服务暂时不可用 (${apiResponse.status})`);
    }

    const data = await apiResponse.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('AI 未返回有效内容');
    }

    // Parse JSON from content (handle potential markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch (e) {
      console.error('JSON Parse Error:', e, jsonStr);
      throw new Error('无法解析 AI 分析结果');
    }

    // Validate result structure
    if (!result.foodName || typeof result.calories !== 'number') {
      throw new Error('AI 返回数据格式不完整');
    }

    processingTime = Date.now() - processingStartTime;
    const totalTime = Date.now() - startTime;

    console.log('Performance Metrics:', {
      totalTime: `${totalTime}ms`,
      apiCallTime: `${apiCallTime}ms`,
      processingTime: `${processingTime}ms`,
      model: MODEL_ID
    });

    res.json(result);

  } catch (error) {
    const totalTime = Date.now() - startTime;
    if (error instanceof Error && error.name === 'AbortError') {
      res.status(504).json({
        error: true,
        message: '分析超时，请稍后重试',
      });
      return;
    }
    console.error('AI Analysis error:', error);
    console.error('Performance Metrics (Error):', {
      totalTime: `${totalTime}ms`,
      apiCallTime: `${apiCallTime}ms`,
      processingTime: `${processingTime}ms`
    });
    res.status(500).json({
      error: true,
      message: error instanceof Error ? error.message : '分析服务暂时繁忙，请稍后再试',
    });
  }
});

router.post('/analyze-day', async (req, res) => {
  const API_KEY = process.env.DOUBAO_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: true, message: '服务器配置错误：缺少 AI API 密钥' });
  }

  try {
    const { meals } = req.body as {
      meals?: Array<{ type?: string; foodName?: string; calories?: number }>;
    };
    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      return res.status(400).json({ error: true, message: '没有饮食记录可分析' });
    }

    const mealsText = meals.map((m) => 
      `- ${m.type === 'breakfast' ? '早餐' : m.type === 'lunch' ? '午餐' : m.type === 'dinner' ? '晚餐' : '加餐'}: ${m.foodName || '未知'} (${m.calories ?? 0}大卡)`
    ).join('\n');

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

    const apiResponse = await fetch(ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: 'system', content: '你是专业的营养师。请根据用户的饮食记录提供客观、科学的分析和建议。返回纯JSON。' },
          { role: 'user', content: prompt }
        ],
        stream: false
      })
    });

    if (!apiResponse.ok) {
      throw new Error(`AI 服务暂时不可用 (${apiResponse.status})`);
    }

    const data = await apiResponse.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) throw new Error('AI 未返回有效内容');

    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const result = JSON.parse(jsonStr);
    res.json(result);

  } catch (error) {
    console.error('Day Analysis Error:', error);
    res.status(500).json({
      error: true,
      message: error instanceof Error ? error.message : '分析失败'
    });
  }
});

export default router;
