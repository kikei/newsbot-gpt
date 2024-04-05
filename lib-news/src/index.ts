interface Article {
  title: string;
  description: string;
  url: string;
}

export interface Summary {
  summary: string;
  url: string;
  opinion: string;
  question: string;
}

interface NewsConfig {
  newsApiEndpoint: string;
  openAiEndpoint: string;
  newsApiKey: string;
  openAiApiKey: string;
  keywords: string[];
  articleCount: number;
}

export class NewsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NewsError';
  }
}

export class NewsReporter {
  constructor(private config: NewsConfig) {}

  async getSummary() {
    const articles = await getNews({
      endpoint: this.config.newsApiEndpoint,
      apiKey: this.config.newsApiKey,
      keywords: this.config.keywords
    });
    console.log('articles:', JSON.stringify(articles, null, 2));

    const contents = articles
    .slice(0, this.config.articleCount)
    .map((article, i) => [
      `#${i + 1}`,
      `Title: ${article.title}`,
      `Description: ${article.description}`,
      `URL: ${article.url}`
    ].join('\n'));
    console.log('contents:', contents);

    // for (const article of articles) {
    //   const content = `Title: ${article.title}\nDescription: ${article.description}`;
    //   const summary = await summarize({apiKey: openAIKey!, content});

    //   console.log(JSON.stringify(summary, null, 2));

    //   summaries.push(summary);
    // }
    const summary = await gptSummarize({
      endpoint: this.config.openAiEndpoint,
      apiKey: this.config.openAiApiKey,
      content: contents.join('\n\n'),
    }).then(parseGptSummary);

    return summary;

    // await postToSlack(finalSummary);
    // await postToSlack(JSON.stringify({
    //   summary: '要約内容',
    //   url: '記事のURL',
    //   opinion: '見解',
    //   question: '課題提起',
    // }));
  }
}

/**
 * Get news articles from News API
 * @see https://newsapi.org/docs/endpoints/everything
 */
export async function getNews({
  endpoint,
  apiKey,
  keywords
}: {
  endpoint: string,
  apiKey: string,
  keywords: string[]
}): Promise<Article[]> {
  const now = new Date();
  const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const query = keywords.join(' OR ');
  const url = new URL(endpoint);
  url.searchParams.append('apiKey', apiKey);
  url.searchParams.append('sortBy', 'publishedAt');
  url.searchParams.append('pageSize', '10');
  url.searchParams.append('q', query);
  url.searchParams.append('from', from.toISOString());
  url.searchParams.append('language', 'jp');
  const response = await fetch(url.toString());
  const data = await response.json();

  console.log(
    'url:', url.toString(),
    'news:', JSON.stringify(data, null, 2)
  );

  return data.articles
  // .sort((a: {publishedAt: string}, b: {publishedAt: string}) =>
    //   a.publishedAt.localeCompare(b.publishedAt))
    .map((article: any) => ({
    title: article.title,
    description: article.description,
    url: article.url,
  }));
}

async function gptSummarize({
  endpoint,
  apiKey,
  content
}: {
  endpoint: string,
  apiKey: string,
  content: string
}): Promise<string> {
  console.debug('endpoint:', endpoint, 'apiKey:', apiKey, 'content:', content);
  const url = new URL(endpoint);
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: [
            'あなたは旅行関係のシステムを開発するエンジニアです。',
            '以下のニュースの中から、最も興味深いものを一つだけ選択して下さい。',
            '次に、選んだニュースを要約し、見解や解釈を教えてください。',
            'また、技術的な論点について雑談のテーマを提示して下さい。',
            '雑談のテーマは同僚へ質問する形で出力して下さい。',
            '英語のものは日本語に翻訳して下さい。',
            '',
            '出力形式は下記JSON形式にして下さい。',
            '{',
            '  "summary": "要約内容",',
            '  "url": "記事のURL",',
            '  "opinion": "見解",',
            '  "question": "雑談のテーマ"',
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

function parseGptSummary(text: string): Summary {
  try {
    const data = JSON.parse(text);
    return {
      summary: data.summary,
      url: data.url,
      opinion: data.opinion,
      question: data.question,
    };
  } catch (e) {
    console.error(e);
    throw new NewsError('Failed to parse GPT response');
  }
}
