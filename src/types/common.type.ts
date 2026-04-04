export interface IResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  result?: T;
}
