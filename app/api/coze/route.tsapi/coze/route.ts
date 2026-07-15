import { NextResponse } from 'next/server';
import { getAstrologyAstrolabe } from '@/lib/ziwei/algorithm';
import { getPatterns } from '@/lib/ziwei/patterns';

export async function POST(request: Request) {
  try {
    const { solarDateStr, gender, targetYear } = await request.json();
    
    // 1. 获取核心命盘
    const astrolabe = getAstrologyAstrolabe(solarDateStr, gender);
    
    // 2. 获取大师级格局判断
    const patterns = getPatterns(astrolabe);
    
    // 3. 为“测算时间”量身定制：提取流年（预测年份）的数据
    // 如果用户传了目标年份（如2026），就去命盘里找那一年的运势宫位
    let yearlyData = null;
    if (targetYear) {
        const yearStr = targetYear.toString();
        // 获取流年宫位，包含那一年的四化星等重要信息
        yearlyData = astrolabe.palaces.find(p => p.decadal?.year === yearStr || p.name.includes(yearStr));
    }

    // 4. 精简返回给大模型的数据
    const result = {
      bazi: astrolabe.chineseDate,
      five_elements: astrolabe.fiveElementsClass,
      destiny_palace: astrolabe.palaces.find(p => p.isDestiny),
      patterns: patterns, // 极其重要的格局
      target_year_luck: yearlyData // 预测事件发生时间的核心依据
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: '排盘出错，请检查输入格式' }, { status: 500 });
  }
}
