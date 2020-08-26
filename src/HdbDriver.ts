import { Driver, Connection } from "db-conn";
import { HdbConnection, HdbConnectionConfig } from ".";
const hdb  = require("hdb");

export class HdbDriver implements Driver {
	connect(config: HdbConnectionConfig): Promise<Connection> {
		const client = hdb.createClient(config);
		return new Promise((resolve, reject) => {
			client.on('error', function (err: any) {
				reject(err);
				return ;
			});
			client.connect(function (err: any) {
				if (err) {
					reject(err);
					return;
				}
				const conn: Connection = new HdbConnection(client);
				resolve(conn);
			});
		});
	}

}