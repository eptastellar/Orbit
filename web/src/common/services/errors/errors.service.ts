import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class ErrorsService {
  constructor() {}

  public e = (message: string): HttpException => {
    console.log('error');
    return new HttpException(message, HttpStatus.BAD_REQUEST);
  };

  public ne = (message: string): HttpException => {
    console.log('error');
    return new HttpException(message, HttpStatus.OK);
  };
}
