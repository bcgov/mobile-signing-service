
import fs from 'fs';
import * as minio from 'minio';

const m = new minio.Client({
  endPoint: 'dev-mss.developer.gov.bc.ca',
  port: 443,
  useSSL: true,
  accessKey: 'xxx',
  secretKey: 'yyy'
});

// m.makeBucket('testing-delete-me2', 'nyc3', (err) => {
//   if (err) return console.log('Error creating bucket.', err);
//   console.log('Bucket created successfully in "nyc3".');
// });

// m.listBuckets((err, buckets) => {
//   if (err) return console.log(err);
//   console.log('buckets :', buckets);
// });

const file = '/tmp/10mbfile';
const fileStream = fs.createReadStream(file);
const bucket = 'secode-sign';

fs.stat(file, (err, stats) => {
  if (err) {
    return console.log(err);
  }
  m.putObject(bucket, '10mbfile', fileStream, stats.size, (err, etag) => {
    return console.log(err, etag);
  });
});

// var size = 0
// m.getObject('testing-delete-me', 'test/10mbfile2', function (err, dataStream) {
//   if (err) {
//     return console.log(err)
//   }
//   dataStream.on('data', function (chunk) {
//     size += chunk.length
//   })
//   dataStream.on('end', function () {
//     console.log('End. Total size = ' + size)
//   })
//   dataStream.on('error', function (err) {
//     console.log(err)
//   })
// })

var stream = m.listObjectsV2(bucket, '', true, '')
stream.on('data', function (obj) { console.log(obj) })
stream.on('error', function (err) { console.log(err) })