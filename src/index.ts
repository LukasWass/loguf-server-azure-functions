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
    userId: string;
    type: DataType;
    event: string;
    properties: any;
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
                const data: IPublishData = JSON.parse(req.body);

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