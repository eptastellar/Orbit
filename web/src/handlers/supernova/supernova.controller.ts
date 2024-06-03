import { SupernovaBindDto, SupernovaParamsDto, SupernovaResponseDto } from '@/dto';
import { SupernovaBind, SupernovaResponse } from '@/types';
import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { SupernovaService } from './supernova.service';

@ApiTags('supernova')
@Controller('supernova')
export class SupernovaController {
  constructor(private readonly supernovaService: SupernovaService) { }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Get supernova friend',
    schema: { $ref: getSchemaPath(SupernovaResponseDto) },
  })
  @ApiExtraModels(SupernovaResponseDto)
  @ApiBearerAuth('JWT_Session_Token')
  async getSupernovaFriend(@Body() body: Body): Promise<SupernovaResponse> {
    const uid: string = body['uid'];
    const supernovaResponse: SupernovaResponse =
      await this.supernovaService.checkSupernovaFriendship(uid);
    return supernovaResponse;
  }

  @Post()
  @ApiBody({
    schema: {
      $ref: getSchemaPath(SupernovaParamsDto),
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Set supernova',
    schema: { $ref: getSchemaPath(SupernovaBindDto) },
  })
  @ApiExtraModels(SupernovaParamsDto, SupernovaBindDto)
  @ApiBearerAuth('JWT_Session_Token')
  async setSupernova(@Body() body: Body): Promise<SupernovaBind> {
    const username: string = body['username'];
    const accepted: boolean = body['accepted'];
    const status: string = body['status'];
    const oneway: string = body['oneway'];
    const friendUid: string = body['uid'];

    const userData: SupernovaResponse = {
      username: friendUid,
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
