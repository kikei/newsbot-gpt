import {NewsReporter} from '@my-module/lib-news';

import {
  ScheduledHandler,
} from 'aws-lambda';

const NEWS_API_ENDPOINT = 'https://newsapi.org/v2/everything';
const OPEN_AI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

const newsApiKey = process.env.NEWS_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

if (!newsApiKey) {
  throw new Error('NEWS_API_KEY is required');
}

if (!openAiApiKey) {
  throw new Error('OPENAI_API_KEY is required');
}

if (!slackWebhookUrl) {
  throw new Error('SLACK_WEBHOOK_URL is required');
}

// Invoked by CloudWatch Event Rule
export const handler: ScheduledHandler = async () => {

  const newsReporter = new NewsReporter({
    newsApiEndpoint: NEWS_API_ENDPOINT,
    openAiEndpoint: OPEN_AI_ENDPOINT,
    newsApiKey,
    openAiApiKey,
    keywords: [
      'node.js', 'typescript', 'javascript',
      'aws',
      'salesforce',
      'slack',
      'tourism', 'hotspring',
      // 'travel', 'tourism', 'hotel', 'accommodation', 'hotspring',
    ],
    articleCount: 5,
  });

  const summary = await newsReporter.getSummary();
  console.log('summary:', JSON.stringify(summary, null, 2));

  await postToSlack(JSON.stringify(summary, null, 2));
}

async function postToSlack(body: string): Promise<void> {
  const response = await fetch(slackWebhookUrl!, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json'
    },
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
}
