#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { AwsS3ThreatDataAggregatorStack } from '../lib/aws-s3-threat-data-aggregator-stack';

const app = new cdk.App();
new AwsS3ThreatDataAggregatorStack(app, 'AwsS3ThreatDataAggregatorStack');
