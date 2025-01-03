import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';

import { Article, getNews } from './news';
import { Summary, gptSummarize, parseGptSummary } from './summary';
import { Pickup, gptPickArticle, parseGptPickup } from './pickup';

export interface NewsConfig {
  newsApiEndpoint: string;
  openAiEndpoint: string;
  newsApiKey: string;
  openAiApiKey: string;
  keywords: string[];
  articleCount: number;
}

export interface NewsReport {
  url: string;
  title: string;
  summary: string;
  opinion: string;
  question: string;
}

export class NewsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NewsError';
  }
}

export class NewsReporter {
  constructor(private config: NewsConfig) {}

  async getSummary(): Promise<NewsReport> {
    const articles = await this.getNews()
    console.log('articles:', JSON.stringify(articles, null, 2));

    const pickup = await this.pickup(articles);

    const content = await fetchReadableArticle(pickup.url);
    console.log('content:', content);

    const summary = await this.summarize({
      title: pickup.title,
      content
    });
    return {
      url: pickup.url,
      title: pickup.title,
      summary: summary.summary,
      opinion: summary.opinion,
      question: summary.question,
    };

    // await postToSlack(finalSummary);
    // await postToSlack(JSON.stringify({
    //   summary: '要約内容',
    //   url: '記事のURL',
    //   opinion: '見解',
    //   question: '課題提起',
    // }));
  }

  async getNews() {
    const articles = await getNews({
      endpoint: this.config.newsApiEndpoint,
      apiKey: this.config.newsApiKey,
      keywords: this.config.keywords
    });
    return articles;
  }

  async pickup(articles: Article[]): Promise<Pickup> {
    const memos = articles
      .slice(0, this.config.articleCount)
      .map((article, i) => [
        `#${i + 1}`,
        `Title: ${article.title}`,
        `Description: ${article.description}`,
        `URL: ${article.url}`
      ].join('\n'));

    try {
      const article = await gptPickArticle({
        endpoint: this.config.openAiEndpoint,
        apiKey: this.config.openAiApiKey,
        content: memos.join('\n\n'),
      }).then(parseGptPickup);
      return article;
    } catch (e) {
      console.error(e);
      throw new NewsError('Failed to pick up an article');
    }
  }

  async summarize({title, content}: {
    title: string,
    content: string
  }): Promise<Summary> {
    try {
      const summary = await gptSummarize({
        endpoint: this.config.openAiEndpoint,
        apiKey: this.config.openAiApiKey,
        content: [
          `# ${title}`,
          content
        ].join('\n'),
      }).then(parseGptSummary);
      return summary;
    } catch (e) {
      console.error(e);
      throw new NewsError('Failed to summarize an article');
    }
  }
}

export async function fetchReadableArticle(url: string): Promise<string> {
  const article = await fetchArticle(url);
  const dom = new JSDOM(article, {url});
  const reader = new Readability(dom.window.document);
  const doc = reader.parse();
  if (!doc)
    throw new NewsError(`Failed to parse readable article: ${url}`);
  const turndown = new TurndownService();
  const md = turndown.turndown(doc.content);
  return md;
}

async function fetchArticle(url: string): Promise<string> {
  return fetch(url).then(response => response.text());
}
