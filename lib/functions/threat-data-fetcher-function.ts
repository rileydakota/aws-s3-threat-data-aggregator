import * as axios from 'axios'
import S3 from 'aws-sdk/clients/s3'



//https://check.torproject.org/torbulkexitlist
//https://intercept.sh/threatlists/ -token required
//https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt -probably needs to be its own alert - aggregates aton of threat intel data


async function GetTorExitNodes(url: string ) {
   console.info(`making GET request to specified URL ${url}`)
   const result = await axios.default.get(url)
   return result.data
}



export const handler = async (event: any) => {
   const bucket: string = process.env.BUCKET_NAME!
   const dataSourceUrl: string = process.env.DATA_SOURCE_URL!
   const dataSourceName: string = process.env.DATA_SOURCE_NAME!

   console.info(`saving data to bucket: ${bucket}`)
   console.info(`target URL: ${dataSourceUrl}`)
   console.info(`specified Data Source Name: ${dataSourceName}`)

   

   const data = await GetTorExitNodes(dataSourceUrl)
   
   var uploadParams: S3.PutObjectRequest = {
      Body: data,
      Bucket: bucket,
      Key: `${dataSourceName}/data.txt`
   }
   const s3 = new S3();

   console.info('attempting upload to bucket')

   const result = await s3.upload(uploadParams).promise()
   
   console.info(`success! Data uploaded to ${result.Location}`)   
}