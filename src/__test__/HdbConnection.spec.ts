import { HdbConnection } from "../HdbConnection";
import { SQLException, Connection } from "db-conn";
import { HdbConnectionConfig } from "../HdbConnectionConfig";
import { HdbDriver } from "../HdbDriver";
import { readBuilderProgram } from "typescript";

const driver = new  HdbDriver();

const config: HdbConnectionConfig = {
	host:"10.58.81.71",
	port: 30013,
	user: "system",
	password: "Initial0",
	databaseName: "ANA"
}

test("Failed connection", async () => {
	const c = Object.assign({}, config);
	c.password = "1111";
	
	try {
		const conn: Connection = await driver.connect(c);
	}catch(e) {
		expect(e instanceof SQLException).toBe(true);
	}
});


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

test("Connect", async () => {
	const conn: Connection = await driver.connect(config);
	await rebuild(conn);
	let rt = await conn.execute(`create table "TEST"( "ID" INTEGER not null,primary key ("ID"))`);
	expect(rt).toStrictEqual({});
	rt = await conn.execute(`insert into "TEST"("ID") values(1)`);
	expect(rt).toStrictEqual({affectedRows:1});

	const data = await conn.executeQuery(`select * from "TEST"`);
	expect(data).toStrictEqual([{ID:1}]);

	await conn.close();
});


test("Faied execute", async () => {
	const conn: Connection = await driver.connect(config);
	try {
		let rt = await conn.execute("hello");
	}catch(e) {
		expect(e instanceof SQLException).toBe(true);
	}
	await conn.close();
});

test("Faied execute query", async () => {
	const conn: Connection = await driver.connect(config);
	try {
		let rt = await conn.executeQuery("set schema testhdb");
	}catch(e) {
		expect(e instanceof SQLException).toBe(true);
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
	}catch(e) {
		expect(e instanceof SQLException).toBe(true);
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
	}catch(e) {
		expect(e instanceof SQLException).toBe(true);
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
	}catch (e) {
		expect(e instanceof SQLException).toBe(true);
	}
	await conn.close();
});