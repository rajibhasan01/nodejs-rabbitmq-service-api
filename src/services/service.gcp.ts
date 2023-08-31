import * as gcs from '@google-cloud/storage';
import { v4 as uuid } from 'uuid';

import ConfigService from "./service.config";

const config = ConfigService.getInstance().getConfig();

const keyFilePath = config.Google_Cloud.SERVICE_ACCOUNT_PATH;
const bucketName = config.Google_Cloud.BUCKET_NAME
const folderPath = config.Google_Cloud.FOLDER_PATH;


// Initialize Google Cloud Storage client
const storage = new gcs.Storage({
    projectId: require(keyFilePath).project_id,
    keyFilename: keyFilePath,
  });


class GoogleCloudService {
    private static googleCloudService : GoogleCloudService;
    private constructor() {};

    static getInstance(){
        if(!GoogleCloudService.googleCloudService){
            GoogleCloudService.googleCloudService = new GoogleCloudService();
        }
        return GoogleCloudService.googleCloudService;
    };

    public uploadImageToGCS = async(file:any) => {
        const uid = uuid();
        const filename = uid + "_" + file.originalname;
        const outputFilePath = `${folderPath}/${filename}`;

        const bucket = storage.bucket(bucketName);
        const blob = bucket.file(outputFilePath);
        const stream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        return new Promise((resolve, reject) => {
          stream.on('error', (err) => {
            console.error('Error uploading to GCS:', err);
            reject(err);
          });

          stream.on('finish', async () => {
            console.log('File uploaded to GCS successfully.');

            // Generate a signed URL with public read access that expires in 1 hour
            const expirationTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration
            const [url] = await blob.getSignedUrl({
              version: 'v4',
              action: 'read',
              expires: expirationTime,
            });

            resolve({url, uid});
          });

          stream.end(file.buffer);
        }).catch((error) => {
            throw error;
        });
    }

}

export = GoogleCloudService;