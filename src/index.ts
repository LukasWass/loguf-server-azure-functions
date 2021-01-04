import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

interface IConstructorParam {
    cosmosdbUri: string;
    cosmosdbKey: string;
    database: string;
    container: string;
}

enum DataType {
    Event = 0,
    Exception = 1
}

interface IPublishData {
    timestamp: number;
    userId: string;
    type: DataType;
    event: string;
    properties: any;
}

interface ILoggedData {
    receivedTimestamp: number;
    userId: string;
    logData: IPublishData;
}

export default class LogufServerAzureFunctions {
    private cosmosdbUri: string = "";
    private cosmosdbKey: string = "";
    private databaseName: string = "";
    private containerName: string = "";

    constructor(params: IConstructorParam) {
        this.cosmosdbUri = params.cosmosdbUri;
        this.cosmosdbKey = params.cosmosdbKey
        this.databaseName = params.database;
        this.containerName = params.container;
    }

    public createHandler = (): AzureFunction => {
        const httpTrigger = async (context: Context, req: HttpRequest): Promise<void> => {
            try {
                const logData: IPublishData = req.body;

                const data: ILoggedData = {
                    userId: logData.userId,
                    receivedTimestamp: new Date().valueOf(),
                    logData: logData,

                };

                const res = new CosmosClient({
                    endpoint: this.cosmosdbUri,
                    key: this.cosmosdbKey
                })
                    .database(this.databaseName)
                    .container(this.containerName)
                    .items.upsert(data);


                context.res = {
                    status: 200,
                    body: JSON.stringify({
                        success: true,
                        message: ""
                    })
                };
            }
            catch (reason) {
                context.res = {
                    status: 500,
                    body: JSON.stringify({
                        success: false,
                        message: reason
                    })
                };
            }
        }

        return httpTrigger;
    }
}