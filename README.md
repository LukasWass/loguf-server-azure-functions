# loguf-server-azure-functions
## Log User Flow Server Azure Functions with Azure Cosmos DB

Uses Azure Cosmos DB to store log data.

### Usage

```bash
$ npm install --save loguf-server-azure-fuctions
```

```typescript
import LogufServer from "loguf-server-azure-functions";

const Server = new LogufServer({
    cosmosdbUri: "my-cosmosdb-uri",
    cosmosdbKey: "my-cosmos-db-key"
});

export default Server.createHandler();
```

### How to deploy Loguf server to azure function

#### VS Code

Video ...

#### Azure portal

Video ...

### Create Azure Cosmos DB

Video ...