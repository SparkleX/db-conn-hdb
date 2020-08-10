import { Connection, SqlError, Result } from "db-conn";
import { ConnectionConfigHdb } from "./ConnectionConfig";
const hdb  = require("hdb");

export class ConnectionHdb implements Connection {

	private config: object;
	private client: any;
	public constructor(config: ConnectionConfigHdb) {
		this.config = config;
	}

	private async ensureConnect():Promise<void> {
		if(this.client) {
			return;
		}
		this.client = hdb.createClient(this.config);
		return new Promise((resolve, reject) => {
			this.client.on('error', function (err: any) {
				reject(new SqlError("hdb error", err));
				return ;
			});
			this.client.connect(function (err: any) {
				if (err) {
					reject(new SqlError("hdb connect failed", err));
					return;
				}
				resolve();
			});
		});
	}
	public async close(): Promise<void> {
		this.client.end();
		delete this.client;
	}
	public async execute(sql: string, params?: object | any[] | undefined): Promise<Result> {
		await this.ensureConnect();
		return new Promise((resolve, reject) => {
		this.client.exec(sql, function(err: any, rows: any) {
			if (err) {
				reject(new SqlError("exec error", err));
				return;
			}
			const rt : Result = {};
			if(isNaN(rows) == false) {
				rt.affectedRows = rows;
			}
			if(Array.isArray(rows)) {
				rt.data = rows;
			}
			resolve(rt);
		  });
		});
	}
	public async executeQuery(sql: string, params?: object | any[] | undefined): Promise<object[]> {
		const rt: Result = await this.execute(sql, params);
		if(rt.data === undefined) {
			throw new SqlError("No data returned");
		}
		return rt.data;
	}
	public async setAutoCommit(autoCommit: boolean): Promise<void> {
		await this.ensureConnect();
		this.client.setAutoCommit(autoCommit);
	}
	public async commit(): Promise<void> {
		const that = this;
		return new Promise((resolve, reject) => {
			that.client.commit(function(err: any){
				if(err) {
					reject(new SqlError(err.message));
					return;
				}
				resolve();
			});
		});
	}
	public async rollback(): Promise<void> {
		const that = this;
		return new Promise((resolve, reject) => {
			that.client.rollback(function(err: any){
				if(err) {
					reject();
					return;
				}
				resolve();
			});
		});
	}
}
