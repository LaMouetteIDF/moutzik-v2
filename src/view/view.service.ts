import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TextChannel } from 'discord.js';
import { ClientService } from 'src/client/client.service';
import { StoreService } from 'src/store/store.service';
import { ButtonComponents } from './components/actions';
import { PlayerEmbedComponents } from './components/player';
import { PlaylistEmbedComponents } from './components/playlist';
import { GuildPlayerView } from './components/types';

@Injectable()
export class ViewService implements OnApplicationBootstrap {
  private playerChannels = new Map<string, TextChannel>();
  private view = new Map<string, GuildPlayerView>();

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

        const guildView: GuildPlayerView = {
          action: new ButtonComponents(),
          player: new PlayerEmbedComponents(),
          playlist: new PlaylistEmbedComponents(guildData.playlist.tracks),
        };

        this.view.set(guild.id, guildView);
        guildView.playlist.show(true);

        // test
        // const button = new ButtonComponents();

        const message = await textChannel.send({
          content: 'hey!',
          embeds: [guildView.player.response, guildView.playlist.response],
          components: guildView.action.response,
        });

        setTimeout(() => {
          guildView.action.setState('play_pause', 'PAUSE');

          message.edit({
            content: 'hey!',
            embeds: [guildView.player.response, guildView.playlist.response],
            components: guildView.action.response,
          });
        }, 5000);
      }
    });
  }
}
