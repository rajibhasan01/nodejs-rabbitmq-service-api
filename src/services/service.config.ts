/** Internal Import */
import config from "../../config";

class ConfigService{
    private static configInstance : ConfigService;
    private constructor(){};

    static getInstance(){
        if(!ConfigService.configInstance){
            ConfigService.configInstance = new ConfigService();
        }
        return ConfigService.configInstance;
    }

    public getConfig(){
        return config;
    }
}

export = ConfigService;