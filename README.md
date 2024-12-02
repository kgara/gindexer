# gindexer

## Description

Simple SocketGateway SocketBridge events indexer example written in TypeScript for [Node.js](https://nodejs.org/en) with [NestJS](https://docs.nestjs.com/) 
framework, 
[MySQL](https://www.mysql.com/) as a back-end storage, [RabbitMQ](https://www.rabbitmq.com/) as a message broker and [ethers.js](https://docs.ethers.org/v6/) for 
interacting with blockchain.

## Components

### indexer-app
The indexer service which scans the blocks since `metadata.latestProcessedBlock` DB value, does reconciliation and keep scanning the new blocks occurring in 
the network.\
The bridge events are stored into MySQL database in transactional manner.\
The bridge events are also published into RabbitMQ in `bridge-events` queue for the realtime downstream updates. 

### api-server
Simple REST HTTP server with basic endpoints.\
Default listening should start on http://localhost:3000

**GET /bridge-events**

Retrieves bridge events within a specified range of block numbers.

#### **Query Parameters**
| Parameter  | Type   | Required | Description                                     |
|------------|--------|----------|-------------------------------------------------|
| `fromBlock` | Number | Yes      | The starting block number of the range.         |
| `toBlock`   | Number | Yes      | The ending block number of the range.           |

#### **Responses**

##### **200 OK**
Returns an array of blocks in the specified range.

**Example valid request**

`GET /bridge-events?fromBlock=21308167&toBlock=21308210`

**Example Response:**
```json5
{
    "bridgeEvents": [
        {
            "id": 3608,
            "hash": "0x9ae3ec5ce00ec4069827d1df153113a944b36a904ffd185a3c25d3af1f31f4f4",
            "blockNumber": 21308167,
            "amount": "81062020551930000",
            "toChainId": "8453",
            "bridgeName": "0x709f58818bedd58450336213e1f2f6ff7405a2b1e594f64270a17b7e2249419c",
            "token": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            "sender": "0xE0B3AEA41A6DCBE94757BCd40965585b041E65A7",
            "receiver": "0xE0B3AEA41A6DCBE94757BCd40965585b041E65A7",
            "metadata": "0x00000000000000000000000000000000000000000000000000000000000008f1"
        },
        {
            "id": 3609,
            "hash": "0x8e32f95c193cba7c351bd6a116c230f2e5aa9b6ca8bc8546ec16b7d1c1c8b06d",
            "blockNumber": 21308168,
            "amount": "111000000",
            "toChainId": "8453",
            "bridgeName": "0x709f58818bedd58450336213e1f2f6ff7405a2b1e594f64270a17b7e2249419c",
            "token": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            "sender": "0xA12aD412C998B23fa3B1667a9618aD299aBA172a",
            "receiver": "0xA12aD412C998B23fa3B1667a9618aD299aBA172a",
            "metadata": "0x00000000000000000000000000000000000000000000000000000000000008f1"
        },
        // ...
        {
            "id": 3638,
            "hash": "0x781885682ffe92ec0f8e5009a6058529f4eba5557b6bfa50929a6b403bc0d6cc",
            "blockNumber": 21308210,
            "amount": "32315963951542210",
            "toChainId": "8453",
            "bridgeName": "0x709f58818bedd58450336213e1f2f6ff7405a2b1e594f64270a17b7e2249419c",
            "token": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            "sender": "0x08c559c54A59Ff797Acf63df04f6bC7593b49BCd",
            "receiver": "0x08c559c54A59Ff797Acf63df04f6bC7593b49BCd",
            "metadata": "0x00000000000000000000000000000000000000000000000000000000000008f1"
        }
    ]
}
```
**Example invalid request**

`GET /bridge-events?fromBlock=21308167`

##### **400 Bad Request**
Returned when:
- One or both query parameters (`fromBlock` or `toBlock`) are missing.
- Query parameters are not valid numbers.
- `fromBlock` is greater than `toBlock`.

**Example Error Response:**
```json
{
    "message": "Both 'fromBlock' and 'toBlock' query parameters are required!",
    "error": "Bad Request",
    "statusCode": 400
}
```

#### **Other**
Some api calls examples might also be found here:\
`rest-examples/rest-examples.http`

## Prerequsites

- The project was tested with MySQL 8.0.40 under Linux Mint with kernel 6.8.0 and Node.js v20.18.1.
- Ethereum RPC endpoint access required, in case the author's one would not be available for any reason one might change it:\
`libs/shared/src/config/general.config.ts:rpcEndpoint`

## Installation
### Install database. 
It might be a docker, remote or local installation. In this example we use the local Linux Mint installation:
```bash
$ sudo apt-get install mysql-server
````
### Init database:
```bash
# Optionally if you need remote access
# Set bind-address = 0.0.0.0
$ sudo mcedit /etc/mysql/mysql.conf.d/mysqld.cnf
# And restart the service 
$ sudo systemctl restart mysql.service 

$ sudo mysql -u root
mysql> CREATE DATABASE gindexer;
mysql> CREATE USER 'ugindexer'@'%' IDENTIFIED BY 'pgindexer';
mysql> GRANT ALL PRIVILEGES ON `gindexer`.* TO 'ugindexer'@'%';
mysql> FLUSH PRIVILEGES;

# Optionally if we don't want to start indexing from very beginning
$ mysql -u ugindexer -ppgindexer
mysql> USE gindexer;
mysql> create table metadata
(
    id                   int 
        primary key,
    latestProcessedBlock int not null
);
# Put the number of block you want to start with instead of {startBlockNum}
mysql> INSERT INTO gindexer.metadata (id, latestProcessedBlock) VALUES (0, {startBlockNum});
```
The DB DDL is supposed to be generated on indexer-app first start. 

### Install RabbitMQ.
It might be a docker, remote or local installation. In this example we use the local Linux Mint installation:
```bash
$ sudo apt-get install rabbitmq-server
$ sudo rabbitmq-plugins enable rabbitmq_management
````
Tested with RabbitMQ 3.9.27 listening on localhost:5672 and web management on http://localhost:15672/ \
RabbitMQ connection parameters might be changed in: \
`libs/shared/src/config/general.config.ts:rabbitMQ`
### Install the project itself:
```bash
$ yarn install
```
### Build all components of the project:
```bash
$ yarn run build
```
### Some configuration
Alternative DB configuration (e.g. for remote server) might be done in :\
`libs/shared/src/config/database.config.ts` for both components simultaneously

SocketGateway contract address might be changed as well if required:\
`libs/shared/src/config/general.config.ts:contractAddress`

The api-server listening port can be changed here:\
`libs/shared/src/config/general.config.ts:apiServer.port`

## Running indexer-app

```bash
# production mode
$ yarn run start:prod:indexer-app
```
```bash
# debug mode
$ yarn run start:debug:indexer-app
```

## Running api-server

```bash
# production mode
$ yarn run start:prod:api-server
```
```bash
# debug mode
$ yarn run start:debug:api-server
```
