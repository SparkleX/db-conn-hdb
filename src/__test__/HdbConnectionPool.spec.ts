import { HdbConnectionConfig, HdbPoolConfig, HdbConnectionPool } from "..";
import { Connection, SqlError, ConnectionPool } from "db-conn";

const config: HdbConnectionConfig = {
	host:"10.58.81.71",
	port: 30013,
	user: "system",
	password: "Initial0",
	databaseName: "ANA"
}
const poolConfig: HdbPoolConfig = {
	min: 2,
    max: 5
}

test("connection pool", async () => {
	const pool: ConnectionPool = new HdbConnectionPool(config, poolConfig);
	const conn1 = await pool.getConnection();
	const conn2 = await pool.getConnection();
	conn1.close();
	conn2.close();
	pool.close();
	expect((pool as any).pool._pool.availableResourceList.length).toStrictEqual(2);	
});