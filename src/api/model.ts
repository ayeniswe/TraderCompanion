enum Version {
  V1 = "V1",
}

enum Method {
  Get = "Get",
  Post = "Post",
  Put = "Put",
  Delete = "Delete",
}

class RPCRequest<T> {
  version: Version;
  // method: Method;
  payload: T;
  id: number;

  constructor(version: Version, payload: T, id: number /*method: Method*/) {
    this.id = id;
    this.version = version;
    this.payload = payload;
    // this.method = method;
  }
}

class RPCResponse<T> {
  version: Version;
  response?: T;
  error?: RPCError;
  id: number;

  constructor(version: Version, response: T, id: number, error: RPCError) {
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

export { RPCError, RPCRequest, RPCResponse, Version };
