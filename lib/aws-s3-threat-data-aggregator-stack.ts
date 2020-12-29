import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';

export class AwsS3ThreatDataAggregatorStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ThreatDataBucket = new s3.Bucket(this, 'ThreatDataBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
    });
    const ThreatDataFetcher = new lambda.NodejsFunction(this, 'ThreatDataFetcherFunction', {
      handler: 'handler',
      entry: 'lib/functions/threat-data-fetcher-function.ts',
      environment: {
        BUCKET_NAME: ThreatDataBucket.bucketName,
        DATA_SOURCE_URL: 'https://check.torproject.org/torbulkexitlist',
        DATA_SOURCE_NAME: 'TOR_EXIT_NODES'
      }
    });
    ThreatDataFetcher.addToRolePolicy( new PolicyStatement({
      actions: ['s3:PutObject'],
      resources: [`${ThreatDataBucket.bucketArn}/TOR_EXIT_NODES/*`]
    }))
    const LambdaTarget = new LambdaFunction(ThreatDataFetcher)
    const LmabdaTrigger = new Rule(this, 'ThreatDataFetcherTrigger', {
      schedule: Schedule.cron({minute: '0', hour: '0-23'}),
      targets: [LambdaTarget]
    })
    
  }
}
