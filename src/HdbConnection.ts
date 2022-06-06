import { Connection, Result, ResultSetMetaData, ResultSetColumnMetadata, SqlType} from "db-conn";
import { Buffer } from "buffer";
import { HdbColumnType } from "./HdbColumnType";
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
	private convertColumnMetaData (colMeta: any): ResultSetColumnMetadata {
		let rt: ResultSetColumnMetadata = {};
		rt.name = colMeta.columnName;
		switch(colMeta.dataType) {
			case HdbColumnType.INTEGER :
				rt.type = SqlType.integer;
				break;
			case HdbColumnType.NVARCHAR :
				rt.type = SqlType.varchar;
				break;
			case HdbColumnType.DECIMAL :
				rt.type = SqlType.decimal;
				break;
			case HdbColumnType.TIMESTAMP :
				rt.type = SqlType.timestamp;
				break;
			//default:
				//throw Error(`undefined column type ${colMeta.dataType}`)
		}
		return rt;
	}

	private convertResultSetMetaData (statement: any): ResultSetMetaData {
		const rt:ResultSetMetaData = [];
		for (let i in statement.resultSetMetadata) {
			const srcColMeta = statement.resultSetMetadata[i];
			const tgtColMeta = this.convertColumnMetaData(srcColMeta);
			rt.push(tgtColMeta);
		}
		return rt;

	}
	public async execute(sql: string, params?: object | any[] | undefined): Promise<Result> {
		const thisConn = this;
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
						rt.metadata = thisConn.convertResultSetMetaData(statement);
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
