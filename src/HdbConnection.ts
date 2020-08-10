import { Connection, SqlError, Result } from "db-conn";
import { HdbConnectionConfig } from "./HdbConnectionConfig";
import { HdbSqlError } from "./HdbSqlError";
const hdb  = require("hdb");

export class HdbConnection implements Connection {
	private client: any;
	private pool: any;
	public constructor(client: any, pool?: any) {
		this.client = client;
		this.pool = pool;
	}
	public async close(): Promise<void> {
		this.client.end();
		delete this.client;
	}
	public async execute(sql: string, params?: object | any[] | undefined): Promise<Result> {
		return new Promise((resolve, reject) => {
		this.client.exec(sql, function(err: any, rows: any) {
			if (err) {
				reject(new HdbSqlError("exec error", err));
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
			throw new HdbSqlError("No data returned");
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
					reject(new HdbSqlError("commit failed", err));
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
					reject(new HdbSqlError("rollback failed", err));
					return;
				}
				resolve();
			});
		});
	}
}
