import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as targets from 'aws-cdk-lib/aws-events-targets';

interface NewsBotStackProps extends cdk.StackProps {
  newsApiKey: string;
  openAiApiKey: string;
  slackWebhookUrl: string;
}

export class NewsBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NewsBotStackProps) {
    super(scope, id, props);

    // CloudWatch Event -> Lambda
    const rule = new events.Rule(this, 'Rule', {
      // Run every day at 9am JST
      schedule: events.Schedule.expression('cron(0 1 * * ? *)')
    });

    // Use NodeJsFunction to create a Lambda function
    const fn = new nodejs.NodejsFunction(this, 'Function', {
      entry: 'src/handler.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      environment: {
        NEWS_API_KEY: props.newsApiKey,
        OPENAI_API_KEY: props.openAiApiKey,
        SLACK_WEBHOOK_URL: props.slackWebhookUrl
      },
    });

    // Invoke the Lambda function every day at 9am JST
    rule.addTarget(new targets.LambdaFunction(fn));
  }
}
