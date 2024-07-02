class Response {
  status: number;
  message: string;
  body: string;
  data: any;
  jsonBody: object;
  constructor(status: number, message: string, data?: any) {
    if (status < 400) {
      this.status = status;
      this.message = message;
      this.body = data;
      this.jsonBody = {
        status: status,
        message: message,
        data: data ? data : null,
      };
    } else {
      this.status = status;
      this.message = message;
      this.body = data;
      this.jsonBody = {
        status: status,
        message: message,
        error: data ? data : null,
      };
    }
  }
}

export default Response;
