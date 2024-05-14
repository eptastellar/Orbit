import { Injectable } from '@nestjs/common';

@Injectable()
export class ErrorsService {
  constructor() {}

  public err = (message: string): Error => {
    return new Error(message);
  };
}
