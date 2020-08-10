import { Driver, Connection, SqlError } from "db-conn";
import { HdbConnection, HdbConnectionConfig } from ".";
import { HdbSqlError } from "./HdbSqlError";
const hdb  = require("hdb");

export class HdbDriver implements Driver {
	connect(config: HdbConnectionConfig): Promise<Connection> {
		const client = hdb.createClient(config);
		return new Promise((resolve, reject) => {
			client.on('error', function (err: any) {
				reject(new HdbSqlError("hdb error", err));
				return ;
			});
			client.connect(function (err: any) {
				if (err) {
					reject(new HdbSqlError("hdb connect failed", err));
					return;
				}
				const conn: Connection = new HdbConnection(client);
				resolve(conn);
			});
		});
	}

}