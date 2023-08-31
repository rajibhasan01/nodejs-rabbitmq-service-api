import fs from "fs";
import path from "path";
import ConfigService from "./../services/service.config";
import RabbitMqService from "./../services/service.rabbitmq";
import GoogleCloudService from "./../services/service.gcp";

const rabbitMqService = RabbitMqService.getInstance();
const googleCloudService = GoogleCloudService.getInstance();
const config = ConfigService.getInstance().getConfig();
const SHARED_DIR = config.Storage_Dir;

class PublisherController{
    private static publisherController : PublisherController;

    private constructor(){}
    static getInstance(){
        if(!PublisherController.publisherController){
            PublisherController.publisherController = new PublisherController();
        }
        return PublisherController.publisherController;
    }

    public healthCheck = async(req: Request, res: any) => {
        const response: any = {
            server_status: 'Server Working Fine - 200',
            rabbitmq_status: 'RabbitMQ Connection Failed - 404',
        };
        try {
            const connection = await rabbitMqService.establishRabbitMQConnection();

            if (connection) {
                response.rabbitmq_status = 'RabbitMQ Connection Alive - 200';
            }
            await connection.close();
            res.status(200).json(response);
        } catch (ex) {
            console.error(`Error in healthCheck: ${ex}`);
            res.status(500).json(response);
        }
    }

    public CreateCartoon = async(req:any, res:any) => {
        try{
            if (!req.file) {
                return res.status(400).json({"status": 400, error: 'No file uploaded.' });
            }

            const data:any = await googleCloudService.uploadImageToGCS(req.file).catch((error) => {
                throw error;
            });

            const publish = await rabbitMqService.publishToRabbitMQ(data).catch((error) => {
                throw error;
            })


            if(publish==="success"){
                const jsonPath = path.join(SHARED_DIR, `${data.uid}.json`); // Use the shared directory path

                while (true) {
                    if (!fs.existsSync(jsonPath)) {
                        await new Promise(resolve => setTimeout(resolve, 250));
                        continue;
                    }

                    const body = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                    fs.unlinkSync(jsonPath);
                    return res.json(body);
                }

            } else {
                console.log(`Error in Publishing message in Queue: ${publish}`)
                return res.status(500).json({"status": 500, error: 'Internal server error' });
            }
        } catch (ex) {
            console.error(`Error creating cartoon: ${ex}`);
            return res.status(500).json({ "status": 500, error: 'Internal server error' });
        }

    }
}

export = PublisherController;