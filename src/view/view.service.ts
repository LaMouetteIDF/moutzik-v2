import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TextChannel } from 'discord.js';
import { ClientService } from 'src/client/client.service';
import { StoreService } from 'src/store/store.service';

@Injectable()
export class ViewService implements OnApplicationBootstrap {
  private playerChannels = new Map<string, TextChannel>();

  constructor(
    private client: ClientService,
    private store: StoreService,
    private eventEmitter: EventEmitter2,
  ) {}

  onApplicationBootstrap() {
    this.client.on('ready', async (client) => {
      const guildDatas = this.store.getAll();
      for (const guildData of guildDatas) {
        const guild = await client.guilds.fetch(guildData.guildId);
        if (!guild) continue;

        const textChannel = await guild.channels.fetch(
          guildData.config.playerChannel,
        );
        if (!textChannel || !textChannel.isText()) continue;

        if (textChannel instanceof TextChannel)
          this.playerChannels.set(guild.id, textChannel);
      }
    });
  }
}
