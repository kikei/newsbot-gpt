import { describe, it, mock } from 'node:test';
import assert from 'node:assert';

import { gptPickArticle } from '@/pickup';

describe('gptPickArticle', () => {
  it('should pick an article', async () => {
    mock.method(global, 'fetch', () => Promise.resolve({
        json: () => Promise.resolve({
          choices: [
            {
              message: {
                content: `\`\`\`json
  {
    "title": "Article 1",
    "summary": "Description 1",
    "url": "https://example.com/article1"
  }
\`\`\`
`
              }
            }
          ]
        })
      }));

    const endpoint = 'https://api.openai.com/v1/chat/completions';
    const apiKey = '';
    const content = `\
#1
Title: Article 1
Description: Description 1
URL: https://example.com/article1

#2
Title: Article 2
Description: Description 2
URL: https://example.com/article2
`;
    const article = await gptPickArticle({endpoint, apiKey, content});
    console.log('article:', article);
    assert.deepStrictEqual(article, `\`\`\`json
  {
    "title": "Article 1",
    "summary": "Description 1",
    "url": "https://example.com/article1"
  }
\`\`\``);
  });
});
