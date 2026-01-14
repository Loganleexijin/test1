import { Router } from 'express';

const router = Router();

// Configuration
const API_KEY = 'aa75539a-ddc6-4442-97b5-8d2d8d4be7c4';
const MODEL_ID = 'doubao-seed-1-8-251228';
const ENDPOINT_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

export const SYSTEM_PROMPT =
  '你是断食营养专家。分析食物图片，返回JSON。无markdown，无额外文字。';

export const buildUserPrompt = (currentState: string) =>
  `状态:${currentState}。返回JSON格式:{"foodName":"食物名(8字内)","calories":热量整数,"tags":["标签1","标签2","标签3"],"advice":"断食建议(25字内)","nextStep":"行动建议(18字内)"}`;

router.post('/analyze', async (req, res) => {
  const startTime = Date.now();
  let apiCallTime = 0;
  let processingTime = 0;
  
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

    // Call Doubao API
    const apiStartTime = Date.now();
    const apiResponse = await fetch(ENDPOINT_URL, {
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
      })
    });

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

export default router;
