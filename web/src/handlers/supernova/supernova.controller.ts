import { SupernovaBind, SupernovaResponse } from '@/types';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { SupernovaService } from './supernova.service';

@Controller('supernova')
export class SupernovaController {
  constructor(private readonly supernovaService: SupernovaService) {}

  @Get()
  async getSupernovaFriend(@Body() body: Body): Promise<SupernovaResponse> {
    const uid: string = body['uid'];
    const supernovaResponse: SupernovaResponse =
      await this.supernovaService.checkSupernovaFriendship(uid);
    return supernovaResponse;
  }

  @Post()
  async setSupernova(@Body() body: Body): Promise<SupernovaBind> {
    const username: string = body['username'];
    const accepted: boolean = body['accepted'];
    const status: string = body['status'];
    const oneway: string = body['oneway'];

    const userData: SupernovaResponse = {
      username: username,
      status: status,
      oneway: oneway,
    };
    const supernovaBind: SupernovaBind =
      await this.supernovaService.oneWaySupernovaFriendship(
        username,
        userData,
        accepted,
      );
    return supernovaBind;
  }
}
