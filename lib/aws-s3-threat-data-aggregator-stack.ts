import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import { Interval, ThreatDataFetcher } from "./threat-data-fetcher";

export class AwsS3ThreatDataAggregatorStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ThreatDataBucket = new s3.Bucket(this, "ThreatDataBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    //TOR Data

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

    //IPSUM Data

    const IpsumDataFetcher = new ThreatDataFetcher(this, "IpsumDataFetcher", {
      Bucket: ThreatDataBucket,
      DataSourceUrl:
        "https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt",
      DataSourceName: "IPSUM",
      Interval: Interval.Daily,
    });

    // Binary Defense Data

    const BinaryDefenseFetcher = new ThreatDataFetcher(this, "BinaryDefenseFetcher", {
      Bucket: ThreatDataBucket,
      DataSourceUrl: "https://www.binarydefense.com/banlist.txt",
      DataSourceName: "BINARY_DEFENSE",
      Interval: Interval.Daily
    })


  }
}
