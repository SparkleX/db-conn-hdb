import { Connection, Result } from "db-conn";
import { Buffer } from "buffer";
const hdb  = require("hdb");

export class HdbConnection implements Connection {
	private client: any;
	public constructor(client: any) {
		this.client = client;
	}
	public async close(): Promise<void> {
		this.client.end();
		delete this.client;
	}
	public async execute(sql: string, params?: object | any[] | undefined): Promise<Result> {
		if (params === undefined) {
			params = [];
		}
		return new Promise((resolve, reject) => {
			this.client.prepare(sql, function (err: any, statement: any){
				if (err) {
					reject(err);
					return;
				}
				statement.exec(params, function (err: any, rows: any) {
					if (err) {
						reject(err);
						return;
					}
					const rt : Result = {};
					if(isNaN(rows) == false) {
						rt.affectedRows = rows;
					}
					if(Array.isArray(rows)) {
						rt.data = rows;
						for(const index in rt.data) {
							const obj: any = rt.data[index];
							for(const name in obj) {
								const value = obj[name];
								if (Buffer.isBuffer(value) == false) {
									continue;
								}
								obj[name] = (value as Buffer).toString();
							}
						}
					}
					statement.drop(function(err: any){
						/* istanbul ignore next */
						if (err) {
							reject(err);
							return;
						}
						resolve(rt);
					});					
				});
			});
		});
	}
	public async executeQuery(sql: string, params?: object | any[] | undefined): Promise<object[]> {
		const rt: Result = await this.execute(sql, params);
		if(rt.data === undefined) {
			throw new Error("No data returned");
		}
		return rt.data;
	}
	public async setAutoCommit(autoCommit: boolean): Promise<void> {
		this.client.setAutoCommit(autoCommit);
	}
	public async commit(): Promise<void> {
		const that = this;
		return new Promise((resolve, reject) => {
			that.client.commit(function(err: any){
				if(err) {
					reject(err);
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
					reject(err);
					return;
				}
				resolve();
			});
		});
	}
}
