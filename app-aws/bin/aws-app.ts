#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NewsBotStack } from '../lib/news-bot-stack';

import * as dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();

const config = getConfig();

new NewsBotStack(app, 'NewsBotStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
    ...config
});

function getConfig() {
    const newsApiKey = process.env.NEWS_API_KEY;
    if (!newsApiKey) {
        throw new Error('NEWS_API_KEY is required');
    }

    const openAiApiKey = process.env.OPENAI_API_KEY;
    if (!openAiApiKey) {
        throw new Error('OPENAI_API_KEY is required');
    }

    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackWebhookUrl) {
        throw new Error('SLACK_WEBHOOK_URL is required');
    }

    return {
        newsApiKey,
        openAiApiKey,
        slackWebhookUrl
    };
}
