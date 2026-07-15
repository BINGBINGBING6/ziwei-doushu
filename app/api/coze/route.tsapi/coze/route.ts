import { NextResponse } from 'next/server';
// 1. 正确导入排盘核心引擎
import { generateChart } from '@/lib/ziwei/algorithm';
// 2. 正确导入格局分析与命宫摘要大师
import { detectPatterns, getMingGongSummary } from '@/lib/ziwei/patterns';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year, month, day, hour, gender, target_year } = body;
    
    // 处理性别参数 (底层算法需要英文的 'male' 或 'female')
    const mappedGender = (gender === '男' || gender === 'male') ? 'male' : 'female';

    // 调用核心算法生成原始命盘
    const chart = generateChart({
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(hour),
      gender: mappedGender
    });
    
    // 获取倪海夏体系的核心格局与命宫摘要
    const patterns = detectPatterns(chart);
    const mingGong = getMingGongSummary(chart);

    // 精简返回给大模型（AI）的数据，提取精华，去掉冗余代码防超载
    const result = {
      lunar_info: chart.lunarInfo,
      wuxing_ju: chart.wuxingJuName, // 五行局（如水二局）
      ming_gong_core: mingGong, // 命宫精简结论（星曜、关键字、特性）
      patterns: patterns, // 触发的核心格局（AI 断大吉/大凶的依据）
      // 列出12宫，供 AI 结合 target_year 推断应期
      palaces: chart.palaces.map(p => ({
        name: p.name, // 宫位名称（如夫妻宫、财帛宫）
        stars: p.stars.map(s => `${s.name}(${s.type})`), // 星曜分布
        daxian_age: p.daXianAge // 该宫位对应的大限年龄段
      })),
      target_year: target_year // 用户询问的具体年份
    };

    return NextResponse.json({ success: true, data: result });
    
  } catch (error) {
    console.error("排盘错误:", error);
    return NextResponse.json({ success: false, error: '排盘失败，请检查输入的参数格式' }, { status: 500 });
  }
}
