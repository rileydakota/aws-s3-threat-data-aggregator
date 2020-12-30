#  AWS S3 Threat Data Aggregator

Lots of good free Threat Intelligence data out there (credit to [awesome-threat-intelligence](https://github.com/hslatman/awesome-threat-intelligence) for allowing me to find them). Getting all of these in a single place and kept up to date can be a bit toilsome. I wrote this as I needed a solution for making these accessible to our SIEM without fear of throttling/inavailability, as well as an excuse to exercise my typescript & CDK skills.

TLDR: You need to wrangle a bunch of threat data from various web urls into a central location for your Security Automation or SIEM - this is what you want!

The CDK Stack in [lib/aws-s3-threat-data-aggregator-stack.ts](lib/aws-s3-threat-data-aggregator-stack.ts) creates an S3 bucket - which is where we send the data, as well as two seperate Data Agregators - one for current [Tor Exit Nodes](https://blog.torproject.org/changes-tor-exit-list-service) and the other for the [IPsum](https://github.com/stamparm/ipsum) threat intelligence list.

The aggregator itself consists of:   
- an Eventbridge cron rule
- a Lambda Function that GETs the specified URL and uploads it to the S3 bucket in a path specific to that dataset as data.txt (eg TOR_EXIT_NODES/data.txt)

## Usage

This is exposed as a CDK Construct local to the project [`ThreatDataFetcher`](lib/threat-data-fetcher.ts)

Examples:

```typescript
import { Interval, ThreatDataFetcher } from "./threat-data-fetcher";

...
...
    const ThreatDataBucket = new s3.Bucket(this, "ThreatDataBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    const TorExitNodeFetcher = new ThreatDataFetcher(
      this,
      "TorExitNodeFetcher",
      {
        Bucket: ThreatDataBucket,
        DataSourceUrl: "https://check.torproject.org/torbulkexitlist",
        DataSourceName: "TOR_EXIT_NODES",
        Interval: Interval.Hourly,
      }
    );

```

The construct requires the following parameters:
- Bucket: expects an AWS-CDK [Bucket](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-s3.Bucket.html) object
- DataSourceUrl: This is the URL where the data is located
- DataSourceName: The name of the data source. This will be used an a prefix for the key of the file in S3, as well as to properly restrict the privileges of the IAM Role for each function to only the required S3 Prefixes 
- Interval: expects an Interval enum (exported from the construct file). Supports specifying Hourly, Daily, Weekly, or Monthly data collection intervals

## To-Do