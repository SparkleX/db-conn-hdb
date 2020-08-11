import { SQLException } from "db-conn";

export class HdbSQLException extends SQLException {
	public constructor(message: string, source?: any) {
		super(`${message}: ${source?.message}`);
	}
}