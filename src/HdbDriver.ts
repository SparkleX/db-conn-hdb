import { Driver, Connection, SqlError } from "db-conn";
import { HdbConnection } from ".";
const hdb  = require("hdb");

export class HdbDriver implements Driver {
	connect(config: any): Promise<Connection> {
		const client = hdb.createClient(config);
		return new Promise((resolve, reject) => {
			client.on('error', function (err: any) {
				reject(new SqlError("hdb error", err));
				return ;
			});
			client.connect(function (err: any) {
				if (err) {
					reject(new SqlError("hdb connect failed", err));
					return;
				}
				const conn: Connection = new HdbConnection(client);
				resolve(conn);
			});
		});
	}

}