export interface Summary {
  summary: string;
  opinion: string;
  question: string;
}

export async function gptSummarize({
  endpoint,
  apiKey,
  content,
}: {
  endpoint: string,
  apiKey: string,
  content: string
}): Promise<string> {
  const url = new URL(endpoint);
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: [
            'あなたは旅行関係のシステムを開発するエンジニアです。',
            '以下のニュースをよく読み要約し、見解や解釈を教えて下さい。',
            '',
            '- 要約は内容の新規性や解説を交え、10行程度で書いて下さい。',
            '- 英語のものは日本語に翻訳して下さい。',
            '',
            'また、技術やプロダクションの論点で雑談のテーマを提示して下さい。',
            '雑談のテーマは同僚へ質問する形でかつ、活用方法等の建設的な内容にして下さい。',
            '',
            '出力形式: 下記JSON形式にして下さい。',
            '{',
            '  "summary": "本文の要約",',
            '  "opinion": "見解・解釈",',
            '  "question": "雑談のテーマ"',
            '}',
          ].join('\n')
        },
        {
          role: 'user',
          content,
        },
      ],
      max_tokens: 1600,
    }),
  });
  const data = await response.json();
  console.log('data:', JSON.stringify(data, null, 2));
  const responseMessages = data.choices.at(0).message.content.trim();
  return responseMessages;
}

export function parseGptSummary(text: string): Summary {
  try {
    // Extract the JSON content from the GPT response
    text = text.replace(/```json\n([\s\S]+)\n```/, '$1');
    const data = JSON.parse(text);
    return {
      summary: data.summary,
      opinion: data.opinion,
      question: data.question,
    };
  } catch (e) {
    console.error(e);
    throw new Error('Failed to parse GPT response');
  }
}

