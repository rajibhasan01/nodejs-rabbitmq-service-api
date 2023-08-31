import path from "path";
import amqp from "amqplib";

import ConfigService from "./service.config";

const config = ConfigService.getInstance().getConfig();


const RABBITMQ_HOST = config.RABBITMQ.RABBITMQ_HOST;
const RABBITMQ_PORT_SERVER_1 = config.RABBITMQ.RABBITMQ_PORT_SERVER_1;
const RABBITMQ_PORT_SERVER_2= config.RABBITMQ.RABBITMQ_PORT_SERVER_2;
const RABBITMQ_PORT_SERVER_3 = config.RABBITMQ.RABBITMQ_PORT_SERVER_3;

const INPUT_QUEUE_NAME = config.RABBITMQ.INPUT_QUEUE_NAME;

const RABBITMQ_USER = config.RABBITMQ.RABBITMQ_USER;
const RABBITMQ_PASSWORD = config.RABBITMQ.RABBITMQ_PASSWORD;

const SERVER_1 = `${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT_SERVER_1}`;
const SERVER_2 = `${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT_SERVER_2}`;
const SERVER_3 = `${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT_SERVER_3}`;

const serverList = [SERVER_1, SERVER_2, SERVER_3];

class RabbitMqService {
    private static rabbitMqService : RabbitMqService;
    private constructor() {};

    static getInstance(){
        if(!RabbitMqService.rabbitMqService){
            RabbitMqService.rabbitMqService = new RabbitMqService();
        }
        return RabbitMqService.rabbitMqService;
    };

    public establishRabbitMQConnection = async () => {
        for (const server of serverList) {
            try {
                const connection = await amqp.connect(`amqp://${server}`);
                console.log('RabbitMQ Connection established');
                return connection; // Return the connection on success
            } catch (ex) {
                console.error(`Error establishing RabbitMQ connection: ${ex}`);
            }
        }
        return null; // Return null if no connections were successful
    }


    public closeRabbitMQConnection = async (channel:any, connection:any) => {
        try {
            if(channel){
                await channel.close();
            }
            if (connection) {
                await connection.close();
            }
            console.log('RabbitMQ Connection closed');
        } catch (ex) {
            console.error(`Error closing RabbitMQ connection: ${ex}`);
        }
    }

    public publishToRabbitMQ = async (message: any) => {
        const connection = await this.establishRabbitMQConnection();
        if (!connection) {
            return null;
        }

        try {
            const channel = await connection.createChannel();
            await channel.assertQueue(INPUT_QUEUE_NAME, { durable: true });
            const sendResult = channel.sendToQueue(INPUT_QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
                persistent: true,
            });
            if (!sendResult) {
                await new Promise((resolve) => channel.once('drain', () => resolve));
            }

            console.log('Message published to RabbitMQ', sendResult);
            await this.closeRabbitMQConnection(channel, connection); // Close the connection
            return "success";
        } catch (ex) {
            console.error(`Error publishing message to RabbitMQ: ${ex}`);
            await this.closeRabbitMQConnection(null, connection); // Close the connection even if there's an error
            return null;
        }
    }
}

export = RabbitMqService;