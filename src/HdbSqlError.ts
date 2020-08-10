import { SqlError } from "db-conn";

export class HdbSqlError extends SqlError {
	public constructor(message: string, source?: any) {
		super(`${message}: ${source?.message}`);
	}
}