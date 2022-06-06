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

test("types", async () => {
	const conn: Connection = await driver.connect(config);
	await rebuild(conn);
	let rt = await conn.execute(`create table type_test( a integer primary key, b nvarchar(2), c decimal(19,6), d float, e timestamp, f date, g time, h nclob, i blob)`);
	expect(rt).toStrictEqual({});

	let clob = "";
	for(let i = 0;i<4096;i++) {
		clob = clob + "数据"
	}
	const buffer = Buffer.from([8, 6, 7, 5, 3, 0, 9]);//Buffer.from("I'm a string!", 'utf-8');
	const bufferString = buffer.toString();
	rt = await conn.execute(
		`insert into type_test(a, b, c, d, e, f, g, h, i) values(?,?,?,?,?,?,?,?,?)`,
		[
			1, '中文','1234567890123.456789', 1.7976931348623157E+308,
			'1999-12-31T23:59:59.123','2000-01-31','23:59:59.999', clob, buffer
		]);
	expect(rt).toStrictEqual({affectedRows:1});

	const result = await conn.execute(`select * from type_test`);
	console.debug(result);
	await conn.close();
});
