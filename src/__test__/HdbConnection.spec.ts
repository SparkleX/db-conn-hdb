import { HdbConnection } from "../HdbConnection";
import { Connection } from "db-conn";
import { HdbConnectionConfig } from "../HdbConnectionConfig";
import { HdbDriver } from "../HdbDriver";
import * as jsonfile from "jsonfile"
import { exception } from "console";
const driver = new  HdbDriver();

const config: HdbConnectionConfig = jsonfile.readFileSync("config/test.json");

async function rebuild(conn: Connection) {
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

test("Failed connection", async () => {
	expect.assertions(2);
	const c = Object.assign({}, config);
	c.password = "1111";
	try {
		const conn: Connection = await driver.connect(c);
	}catch(e) {
		expect(e.code).toBe(10);
		expect(e.message).toBe("authentication failed");
	}
});

test("Connect", async () => {
	const conn: Connection = await driver.connect(config);
	await rebuild(conn);
	let rt = await conn.execute(`create table TEST( ID INTEGER not null, CTEXT text,primary key ("ID"))`);
	expect(rt).toStrictEqual({});
	rt = await conn.execute(`insert into TEST(ID, CTEXT) values(1, 'text')`);
	expect(rt).toStrictEqual({affectedRows:1});

	const data = await conn.executeQuery(`select * from "TEST"`);
	expect(data).toStrictEqual([{ID:1, CTEXT:"text"}]);

	await conn.close();
});


test("Faied execute", async () => {
	const conn: Connection = await driver.connect(config);
	try {
		let rt = await conn.execute("hello");
		fail("never here");
	}catch(e) {
		expect(e.code).toBe(257);
		expect(e.message.startsWith("sql syntax error:")).toBeTruthy();
	}
	await conn.close();
});

test("Faied execute query", async () => {
	const conn: Connection = await driver.connect(config);
	try {
		let rt = await conn.executeQuery("set schema testhdb");
		fail("never here");
	}catch(e) {
		expect(e.message).toBe("No data returned");
	}
	await conn.close();
});

test("commit", async () => {
	const conn: Connection = await driver.connect(config);
	await conn.setAutoCommit(false);
	await conn.commit();
	await conn.close();
});
test("commit failed", async () => {
	const conn: Connection = await driver.connect(config);
	(conn as any).client.end();
	try {
		await conn.commit();
		fail("never here");
	}catch(e) {
	}
});
test("rollback", async () => {
	const conn: Connection = await driver.connect(config);
	await rebuild(conn);
	await conn.execute(`create table TEST( "ID" INTEGER not null,primary key ("ID"))`);
	await conn.setAutoCommit(false);
	await conn.execute(`insert into TEST("ID") values(1)`);
	await conn.rollback();
	const rt = await conn.execute(`select * from TEST`);
	expect(rt.data?.length).toBe(0);
	await conn.close();
});


test("rollback failed", async () => {
	const conn: Connection = await driver.connect(config);
	(conn as any).client.end();
	try {
		await conn.rollback();
		fail("never here");
	}catch(e) {
	}
});


test("Params", async () => {
	const conn: Connection = await driver.connect(config);
	await rebuild(conn);
	let rt = await conn.execute(`create table TEST(ID INTEGER not null,primary key (ID))`);
	expect(rt).toStrictEqual({});
	rt = await conn.execute(`insert into TEST(ID) values(?)`,[1]);
	expect(rt).toStrictEqual({affectedRows:1});

	const data = await conn.executeQuery(`select * from "TEST"`);
	expect(data).toStrictEqual([{ID:1}]);

	await conn.close();
});

test("fail exec params", async () => {
	const conn: Connection = await driver.connect(config);
	await rebuild(conn);
	let rt = await conn.execute(`create table TEST(ID INTEGER not null,primary key (ID))`);
	expect(rt).toStrictEqual({});
	try {
		rt = await conn.execute(`insert into TEST(ID) values(?)`);
		fail("never here");
	}catch (e) {
	}
	await conn.close();
});