import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class ErrorsService {
  constructor() {}

  public e = (message: string): HttpException => {
    return new HttpException(message, HttpStatus.BAD_REQUEST);
  };
}
