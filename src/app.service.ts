import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientService } from './client/client.service';

@Injectable()
export class AppService {
  constructor(
    private clientService: ClientService,
    private configService: ConfigService,
  ) {}

  @OnEvent('app.ready', { async: true })
  async startApp() {
    const token = this.configService.get<string>('TOKEN');
    await this.clientService.login(token);
  }
}
