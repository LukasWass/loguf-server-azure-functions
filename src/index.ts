import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

interface IConstructorParam {
    cosmosdbUri: string;
    cosmosdbKey: string;
    database?: string;
    logContainer?: string;
    userContainer?: string;
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
    private databaseName: string = "Loguf";
    private userContainerName: string = "Users";
    private logContainerName: string = "Logs";

    constructor(params: IConstructorParam) {
        this.cosmosdbUri = params.cosmosdbUri;
        this.cosmosdbKey = params.cosmosdbKey

        if (params.database !== undefined)
            this.databaseName = params.database;

        if (params.userContainer !== undefined)
            this.userContainerName = params.userContainer;

        if (params.logContainer !== undefined)
            this.logContainerName = params.logContainer;

        const Client = new CosmosClient({
            endpoint: this.cosmosdbUri,
            key: this.cosmosdbKey
        });

        Client.databases.createIfNotExists({ id: this.databaseName, })
            .then(() => {
                Client.database(this.databaseName)
                    .containers.createIfNotExists({ id: this.userContainerName, partitionKey: "/id" })
                    .then(() => {
                        Client.database(this.databaseName)
                            .containers.createIfNotExists({ id: this.logContainerName, partitionKey: "/userId" })
                            .then(() => {

                            })
                            .catch((reason) => {
                            })
                    })
                    .catch((reason) => {
                    })
            })
            .catch((reason) => {
            })
    }

    private Log = (context: Context, req: HttpRequest) => {
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
            .container(this.logContainerName)
            .items.upsert(data);


        context.res = {
            status: 200,
            body: JSON.stringify({
                success: true,
                message: ""
            })
        };
    }

    private GetPortalWebsite = (context: Context, req: HttpRequest) => {
        context.res = {
            status: 200,
            headers: {
                "Content-Type": "text/html"
            },
            body: `
                <html>
                    <head>
                        <meta http-equiv="Refresh" content="0; URL=https://www.loguf.se?server=${req.url}">
                    </head>
                </html>
            `
        };
    }

    public createHandler = (): AzureFunction => {
        const httpTrigger = async (context: Context, req: HttpRequest): Promise<void> => {
            try {
                if (req.method === "GET") {
                    this.GetPortalWebsite(context, req);
                }
                else if (req.method === "POST") {
                    this.Log(context, req);
                }
                else {
                    this.Log(context, req);
                }
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