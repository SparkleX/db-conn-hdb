import { HdbConnection } from "../HdbConnection";
import { SqlError, Connection } from "db-conn";
import { HdbConnectionConfig } from "../HdbConnectionConfig";
import { HdbDriver } from "../HdbDriver";
/*var mockORDRRepositorygetByKey = jest.fn();
var mockORDRRepository = {
    findByKey : mockORDRRepositorygetByKey
}*/

//container.rebind(ORDRRepository).toConstantValue(mockORDRRepository as any);

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
	
   /* mockORDRRepositorygetByKey.mockReturnValueOnce({DocEntry: 1});

    var service: ORDRService = container.get(ORDRService);
    var rt: ORDR = await service.getById( {DocEntry: 1} );
    expect(rt).toStrictEqual({DocEntry: 1});
    
    expect(mockORDRRepositorygetByKey.mock.calls.length).toBe(1);
    expect(mockORDRRepositorygetByKey.mock.calls[0][0]).toStrictEqual({DocEntry: 1});*/
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

test("rollback", async () => {
	const conn: Connection = await driver.connect(config);
	await conn.setAutoCommit(false);
	await conn.rollback();
	await conn.close();
});