export interface Pickup {
  title: string;
  url: string;
}

export async function gptPickArticle({
  endpoint,
  apiKey,
  content
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
            '以下のニュースの中から、最も興味深いものを一つだけ選択して下さい。',
            '',
            '選択すべきニュース:',
            '- テクノロジー寄りのもの',
            '- プログラミングに関わるもの',
            '- ライフハックなど',
            '- 旅行に関するもの',
            '',
            '選択すべきでないニュース:',
            '- ビジネス寄りのもの',
            '',
            '出力形式: 下記JSON形式にして下さい。',
            '{',
            '  "title": "記事のタイトル",',
            '  "url": "記事のURL",',
            '}',
          ].join('\n')
        },
        {role: 'user', content},
      ],
      max_tokens: 800,
    }),
  });
  const data = await response.json();
  console.log('data:', JSON.stringify(data, null, 2));
  const responseMessages = data.choices.at(0).message.content.trim();
  return responseMessages;
}

export function parseGptPickup(text: string): Pickup {
  try {
    // Extract the JSON content from the GPT response
    text = text.replace(/```json\n([\s\S]+)\n```/, '$1');
    const data = JSON.parse(text);
    return {
      title: data.title,
      url: data.url,
    };
  } catch (e) {
    console.error(e);
    throw new Error('Failed to parse GPT response');
  }
}

