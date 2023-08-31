import amqp from "amqplib";
import path from "path";
import fs from "fs";

import ConfigService from "../services/service.config";
import RabbitMqService from "../services/service.rabbitmq";

const rabbitMqService = RabbitMqService.getInstance();
const config = ConfigService.getInstance().getConfig();

const OUTPUT_QUEUE_NAME = config.RABBITMQ.OUTPUT_QUEUE_NAME;
const SHARED_DIR = config.Storage_Dir;


const sleep = async(ms:any) => {
    try {
        await new Promise(resolve => setTimeout(resolve, ms));
    } catch (error) {
        console.error(`Error during sleep: ${error}`);
    }
}

const consumeFromRabbitMQ = async() => {
    try{
        const workerConnection = await rabbitMqService.establishRabbitMQConnection().catch((error) => {
            throw error;
        });

        if(workerConnection){
            let workerChannel:any;
            try{
                workerChannel = await workerConnection.createChannel().catch((error)=>{
                    throw error;
                });
                await workerChannel.assertQueue(OUTPUT_QUEUE_NAME, { durable: true}).catch((error:any) => {
                    throw error;
                });

                await workerChannel.prefetch(10).catch((error:any) => {
                    throw error;
                });
                console.log('Worker is waiting for messages in the task queue...');
                const options = { noAck: false, recover: true };

                await workerChannel.consume(OUTPUT_QUEUE_NAME, async (msg:any) => {
                    const body = msg.content.toString();
                    const uid = JSON.parse(body).uid;

                    console.log(`Worker received a message from task queue. UID: ${uid}`);
                    await sleep(1000);

                    const filePath = path.join(SHARED_DIR, `${uid}.json`);
                    fs.writeFileSync(filePath, body);

                    console.log(`Worker processed and saved message. UID: ${uid}`);
                    await workerChannel.ack(msg);

                }, options).catch((error:any) => {
                    throw error;
                });

                return {workerConnection, workerChannel};

            }catch (error){
                if(workerChannel){
                    await workerChannel.close();
                }
                if(workerConnection){
                    await workerConnection.close();
                }
                console.log(`Error consuming message from Worker RabbitMQ: ${error}`);
                throw error;
            }
        } else {
            console.log('Cannot consume messages from Worker RabbitMQ: No valid connection');
            await consumeFromRabbitMQ();
        }
    }catch (error){
        console.log('Invalid Connection:', error);
        await consumeFromRabbitMQ();
    }
}

const ObserverFunction = async() => {
    console.log("************** Reconnecting For Connection Alive **************")
    const data = await consumeFromRabbitMQ();
    // Recontion making in every 2 min for socket alive
    await sleep(120*1000);
    if(data?.workerChannel){
        await data?.workerChannel?.close().catch((error:any) => {
            console.log("Error in closing channel:", error);
        });
    }
    if(data?.workerConnection){
        await data?.workerConnection?.close().catch((error:any) => {
            console.log("Error in closing connection:", error);
        });
    }

    ObserverFunction();
}

ObserverFunction();