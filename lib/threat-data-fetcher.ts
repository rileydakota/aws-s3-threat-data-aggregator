import * as lambda from "@aws-cdk/aws-lambda-nodejs";
import { PolicyStatement } from "@aws-cdk/aws-iam";
import { Rule, Schedule, CronOptions } from "@aws-cdk/aws-events";
import { LambdaFunction } from "@aws-cdk/aws-events-targets";
import { Bucket } from "@aws-cdk/aws-s3";
import * as cdk from "@aws-cdk/core";

export enum Interval {
  Hourly = 0,
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
}

export interface ThreatDataFetcherProps {
  Bucket: Bucket;
  DataSourceUrl: string;
  DataSourceName: string;
  Interval: Interval;
}

export class ThreatDataFetcher extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: ThreatDataFetcherProps) {
    super(scope, id);

    const ThreatDataFetcher = new lambda.NodejsFunction(
      this,
      "ThreatDataFetcherFunction",
      {
        handler: "handler",
        entry: "lib/functions/threat-data-fetcher-function.ts",
        environment: {
          BUCKET_NAME: props.Bucket.bucketName,
          DATA_SOURCE_URL: props.DataSourceUrl,
          DATA_SOURCE_NAME: props.DataSourceName,
        },
      }
    );
    ThreatDataFetcher.addToRolePolicy(
      new PolicyStatement({
        actions: ["s3:PutObject"],
        resources: [`${props.Bucket.bucketArn}/${props.DataSourceName}/*`],
      })
    );
    const LambdaTarget = new LambdaFunction(ThreatDataFetcher);

    let TriggerSchedule: CronOptions = {};

    switch (props.Interval) {
      case 0:
        TriggerSchedule = { minute: "0", hour: "0-23" };
        break;
      case 1:
        TriggerSchedule = { minute: "0", hour: "0" };
        break;
      case 2:
        TriggerSchedule = { weekDay: "0" };
        break;
      case 3:
        TriggerSchedule = { month: "0-11" };
        break;
    }

    const LmabdaTrigger = new Rule(this, "ThreatDataFetcherTrigger", {
      schedule: Schedule.cron(TriggerSchedule),
      targets: [LambdaTarget],
    });
  }
}
