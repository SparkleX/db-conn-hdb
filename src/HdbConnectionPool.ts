import { ConnectionPool, Connection } from "db-conn";
import { HdbConnectionConfig, HdbConnection } from ".";
const Pool = require('hdb-pool');


export class HdbConnectionPool implements ConnectionPool {
	private pool: any;
	constructor(dbConfig: HdbConnectionConfig, poolConfig:any) {
		this.pool = Pool.createPool(dbConfig, poolConfig);
	}
	public async getConnection(): Promise<Connection> {
		const client = await this.pool.getConnection();
		const conn = new HdbConnection(client, this.pool);
		return conn;
	}
	public async close(): Promise<void> {
		await this.pool.clear()
	}
}