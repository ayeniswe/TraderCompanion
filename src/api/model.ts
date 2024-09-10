enum Method {
	Get = 'Get',
	Post = 'Post',
	Put = 'Put',
	Delete = 'Delete'
}

class RPCRequest<T> {
	version: string;
	method: Method;
	payload: T;
	id: string;

	constructor(version: string, payload: T, id: string, method: Method) {
		this.id = id;
		this.version = version;
		this.payload = payload;
		this.method = method;
	}
}

class RPCResponse<T> {
	version: string;
	response: T;
	error?: RPCError;
	id: string;

	constructor(version: string, response: T, id: string, error: RPCError) {
		this.id = id;
		this.version = version;
		this.response = response;
		this.error = error;
	}
}

class RPCError {
	code: number;
	message: string;

	constructor(message: string, code: number) {
		this.code = code;
		this.message = message;
	}
}

export { RPCError, RPCRequest, RPCResponse, Method };
