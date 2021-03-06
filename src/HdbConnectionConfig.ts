export interface HdbConnectionConfig {
	host?     : string,
	port?     : number,
	user?     : string,
	password? : string,
	useCesu8? : boolean,
	databaseName?: string
}