export interface Article {
  title: string;
  description: string;
  url: string;
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

  console.debug(
    'url:', url.toString(),
    'news:', JSON.stringify(data, null, 2),
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

