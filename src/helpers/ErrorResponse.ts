// interface MongoErr {
//   code?: string;

// }

export class ErrorResponse extends Error {
  statusCode: number;
  code?: number;
  keyValue?: {};
  value?: string;
  errors?: {
    [key: string]: {
      message: string;
    };
  };

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
