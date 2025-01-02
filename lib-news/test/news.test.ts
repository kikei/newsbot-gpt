import { describe, it, mock } from 'node:test';
import assert from 'node:assert';

import { getNews } from '@/news';

describe('getNews', () => {
  it('should get news articles', async () => {
    mock.method(global, 'fetch', () => Promise.resolve({
      json: () => Promise.resolve({
        articles: [
          {
            title: 'Article 1',
            description: 'Description 1',
            url: 'https://example.com/article1'
          },
          {
            title: 'Article 2',
            description: 'Description 2',
            url: 'https://example.com/article2'
          },
        ]
      })
    }));

    const endpoint = 'https://newsapi.org/v2/everything';
    const apiKey = '';
    const keywords = [''];
    const articles = await getNews({endpoint, apiKey, keywords});
    assert.deepStrictEqual(articles, [
      {
        title: 'Article 1',
        description: 'Description 1',
        url: 'https://example.com/article1'
      },
      {
        title: 'Article 2',
        description: 'Description 2',
        url: 'https://example.com/article2'
      },
    ]);
  });
});
