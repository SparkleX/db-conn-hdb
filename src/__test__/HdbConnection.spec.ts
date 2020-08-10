import { HdbConnection } from "../HdbConnection";
import { SqlError, Connection } from "db-conn";
import { HdbConnectionConfig } from "../HdbConnectionConfig";
import { HdbDriver } from "../HdbDriver";

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
		expect(e instanceof SqlError).toBe(true);
	}
});

test("Connect", async () => {

	const conn: Connection = await driver.connect(config);
	let rt = await conn.execute("set schema i031684");
	expect(rt).toStrictEqual({});
	try {
		rt = await conn.execute(`drop table "TEST"`);
	}catch (e) {
		console.debug(e);
	}
	rt = await conn.execute(`create table "TEST"( "ID" INTEGER not null,primary key ("ID"))`);
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
		expect(e instanceof SqlError).toBe(true);
	}
	await conn.close();
});

test("Faied execute query", async () => {
	const conn: Connection = await driver.connect(config);
	try {
		let rt = await conn.executeQuery("set schema i031684");
	}catch(e) {
		expect(e instanceof SqlError).toBe(true);
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
		expect(e instanceof SqlError).toBe(true);
	}
});
test("rollback", async () => {
	const conn: Connection = await driver.connect(config);
	try {
		await conn.execute(`drop table TEST_ROLLBACK`);
	}catch (e) {
		console.debug(e);
	}
	await conn.execute(`create table TEST_ROLLBACK( "ID" INTEGER not null,primary key ("ID"))`);
	await conn.setAutoCommit(false);
	await conn.execute(`insert into TEST_ROLLBACK("ID") values(1)`);
	await conn.rollback();
	const rt = await conn.execute(`select * from TEST_ROLLBACK`);
	expect(rt.data?.length).toBe(0);
	await conn.close();
});


test("rollback failed", async () => {
	const conn: Connection = await driver.connect(config);
	(conn as any).client.end();
	try {
		await conn.rollback();
	}catch(e) {
		expect(e instanceof SqlError).toBe(true);
	}
});


test("Params", async () => {
	const conn: Connection = await driver.connect(config);
	let rt = await conn.execute("set schema i031684");
	expect(rt).toStrictEqual({});
	try {
		rt = await conn.execute(`drop table "TEST"`);
	}catch (e) {
		console.debug(e);
	}
	rt = await conn.execute(`create table TEST(ID INTEGER not null,primary key (ID))`);
	expect(rt).toStrictEqual({});
	rt = await conn.execute(`insert into TEST(ID) values(?)`,[1]);
	expect(rt).toStrictEqual({affectedRows:1});

	const data = await conn.executeQuery(`select * from "TEST"`);
	expect(data).toStrictEqual([{ID:1}]);

	await conn.close();
});

test("fail exec params", async () => {
	const conn: Connection = await driver.connect(config);
	let rt = await conn.execute("set schema i031684");
	expect(rt).toStrictEqual({});
	try {
		rt = await conn.execute(`drop table "TEST"`);
	}catch (e) {
		console.debug(e);
	}
	rt = await conn.execute(`create table TEST(ID INTEGER not null,primary key (ID))`);
	expect(rt).toStrictEqual({});
	try {
		rt = await conn.execute(`insert into TEST(ID) values(?)`);
	}catch (e) {
		expect(e instanceof SqlError).toBe(true);
	}
	await conn.close();
});