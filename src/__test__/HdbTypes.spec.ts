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
	let rt = await conn.execute(`create table TEST( ID INTEGER not null, CTEXT text, AMOUNT DECIMAL(19,6), times timestamp, primary key ("ID"))`);
	expect(rt).toStrictEqual({});
	rt = await conn.execute(`insert into TEST(ID, AMOUNT, times) values(1, '1234567890123.123456', '2007-02-28 12:45:12.23456')`);
	expect(rt).toStrictEqual({affectedRows:1});

	const result = await conn.execute(`select * from "TEST"`);
	expect(result.metadata).toMatchSnapshot("metadata");
	expect(result.data).toMatchSnapshot("data");
	await conn.close();
});

