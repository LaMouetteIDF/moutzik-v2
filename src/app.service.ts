import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ClientService } from './client/client.service';
import { InteractionsService } from './interactions/interactions.service';
import { PlayerService } from './player/player.service';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private clientService: ClientService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private playerService: PlayerService,
    private interactionsService: InteractionsService,
  ) {}

  onApplicationBootstrap() {
    this.startApp();
  }
  async startApp() {
    const token = this.configService.get<string>('TOKEN');
    await this.clientService.login(token);
    await this.playerService.init();
    await this.interactionsService.init();
    // this.eventEmitter.emit('client.ready');
  }
}
