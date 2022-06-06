import { HdbConnection } from "../HdbConnection";
import { Connection } from "db-conn";
import { HdbConnectionConfig } from "../HdbConnectionConfig";
import { HdbDriver } from "../HdbDriver";
import * as jsonfile from "jsonfile"
import { exception } from "console";
const driver = new  HdbDriver();

const config: HdbConnectionConfig = jsonfile.readFileSync("config/test.json");

async function rebuild(conn: Connection):Promise<void> {
	try {
		await conn.execute("drop schema testhdb cascade");
	}catch (e) {		
	}	
	await conn.execute("create schema testhdb");
	await conn.execute("set schema testhdb");
	try {
		await conn.execute(`drop table test`);
	}catch (e) {		
	}	
}

test("Decimal", async () => {
	const conn: Connection = await driver.connect(config);
	await rebuild(conn);
	let rt = await conn.execute(`create table type_test( a integer not null, b text, c decimal(19,6), d timestamp, primary key (a))`);
	expect(rt).toStrictEqual({});
	rt = await conn.execute(`insert into type_test(a, b, c, d) values(1, 'abc','1234567890123.123456', '2007-02-28 12:45:12.23456')`);
	expect(rt).toStrictEqual({affectedRows:1});

	const result = await conn.execute(`select * from type_test`);
	console.debug(result);
	await conn.close();
});

