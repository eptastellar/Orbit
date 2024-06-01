import { interests } from '@/assets';
import { InterestsResponse } from '@/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InterestsService {
  public getInterests = (): InterestsResponse => {
    return {
      interests: interests,
    };
  };
}
