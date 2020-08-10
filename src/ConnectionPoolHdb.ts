import { ConnectionPool } from "db-conn";

export class ConnectionHdbPool implements ConnectionPool {
	getConnection(): Promise<import("db-conn").Connection> {
		throw new Error("Method not implemented.");
	}
	close(): Promise<void> {
		throw new Error("Method not implemented.");
	}
}