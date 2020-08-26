# SAP HANA implementation of db-conn(JDBC)

1) based on hdb, pure javascript
2) Typescript async/await


# Connect to database
```
const config: HdbConnectionConfig = {
	host:"1.1.1.10",
	port: 30013,
	user: "system",
	password: "********",
	databaseName: "DBA"
}
const driver = new HdbDriver();
const conn: Connection = await driver.connect(c);
const rt = await conn.executeQuery("select * from dummy");
await conn.close();
```
# Connection Pool
```
const poolConfig: any = {
	min: 2,
    max: 5
}
const driver = new HdbDriver();
const pool: DataSource = new GenericPool(driver, config, poolConfig);
const conn1 = await pool.getConnection();
const conn2 = await pool.getConnection();
await conn1.close();
await conn2.close();
await pool.close();
```

# History
## 1.2.0
1) SQLException removed
