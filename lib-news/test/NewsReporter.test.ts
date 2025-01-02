import { describe, it, mock } from 'node:test';
import assert from 'node:assert';

import { fetchReadableArticle } from '@/NewsReporter';

describe('fetchReadableArticle', () => {
  it('should fetch a readable article', async () => {
    mock.method(global, 'fetch', () => Promise.resolve({
      text: () => Promise.resolve(`\
<html>
  <head>
    <title>Article 1</title>
  </head>
  <body>
    <header>
      <h1>Article 1</h1>
      <p>Description 1</p>
    </header>
    <article>
      <h2>Heading 2</h2>
      <p>Description 2</p>
    </article>
    <footer>
      <p>Footer</p>
    </footer>
  </body>
</html>`)
    }));
    const content = await fetchReadableArticle('https://example.com/article1');
    assert.strictEqual(content, `\
<div id="readability-page-1" class="page">
    <header>
      
      <p>Description 1</p>
    </header>
    <article>
      <h2>Heading 2</h2>
      <p>Description 2</p>
    </article>
    
  
</div>`);
  });
});
