import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const config =
{
"RABBITMQ": {
    "RABBITMQ_HOST":process.env.RABBITMQ_HOST,
    "RABBITMQ_PORT_SERVER_1":process.env.RABBITMQ_PORT_SERVER_1 || 5671,
    "RABBITMQ_PORT_SERVER_2":process.env.RABBITMQ_PORT_SERVER_2 || 5672,
    "RABBITMQ_PORT_SERVER_3":process.env.RABBITMQ_PORT_SERVER_3 || 5673,
    "OUTPUT_QUEUE_NAME":process.env.OUTPUT_QUEUE_NAME,
    "INPUT_QUEUE_NAME":process.env.INPUT_QUEUE_NAME,
    "RABBITMQ_USER":process.env.RABBITMQ_USER,
    "RABBITMQ_PASSWORD":process.env.RABBITMQ_PASSWORD
    },
"ACCESS_KEY":process.env.ACCESS_KEY,
"Storage_Dir": path.join(__dirname, "..", 'tmp'),
"Google_Cloud":{
    "BUCKET_NAME":"braincraft-gcp-bucket",
    "FOLDER_PATH":"v-toonify-test",
    "SERVICE_ACCOUNT_PATH":"/home/rajibhasan/Desktop/service_account_key.json"
    }
};

export = config;
