import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. 接收前端传过来的命盘/宫位数据
    const body = await request.json();
    
    // 2. 调取你配置好的大模型 API 钥匙
    const apiKey = process.env.LLM_API_KEY; 
    
    if (!apiKey) {
      return NextResponse.json({ error: '网站站长尚未配置 API Key' }, { status: 500 });
    }

    // 3. 构建给大模型的大师提示词 (Prompt)
    const prompt = `你是一位隐居多年的紫微斗数大师，深谙倪海夏《天纪》体系。
    现在有一位用户正在查看他的命盘，前端传来的命理数据如下：
    ${JSON.stringify(body)}
    
    请根据上述数据中体现的星曜、宫位、四化等信息，给出一段专业、精准、温暖且通俗易懂的解读。
    要求：
    1. 铁口直断，指出核心吉凶，不要模棱两可。
    2. 如果有凶险，必须给出倪海夏体系的化解建议。
    3. 直接输出解读的纯文本内容，不要包含 markdown 格式的冗余符号，字数控制在 300 字左右。`;

    // 4. 调用 DeepSeek 大模型 (如果你用其他模型，修改这里的 apiUrl 和 model)
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // 5. 把大师的解读传回给前端页面显示
    // 注意：不同的前端可能接收字段名不同，这里多传几个兼容字段
    return NextResponse.json({ success: true, data: reply, content: reply, text: reply });

  } catch (error) {
    console.error("解读接口报错:", error);
    return NextResponse.json({ error: '哎呀，大师正在休息，解读失败请稍后重试' }, { status: 500 });
  }
}
