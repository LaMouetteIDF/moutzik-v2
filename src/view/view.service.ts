import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Snowflake, TextChannel } from 'discord.js';
import { ClientService } from 'src/client/client.service';
import { PlayerSystem } from 'src/player/player.system';
import { StoreService } from 'src/store/store.service';
import { GuildItem } from 'src/store/type';
import { ButtonComponents } from './components/actions';
import { PlayerEmbedComponents } from './components/player';
import { PlaylistEmbedComponents } from './components/playlist';
import { GuildPlayerView } from './components/types';
import { ViewSystem } from './view.system';

@Injectable()
export class ViewService implements OnApplicationBootstrap {
  private playerChannels = new Map<string, TextChannel>();
  private view = new Map<string, GuildPlayerView>();
  private guildsView: Map<Snowflake, ViewSystem>;

  constructor(
    private client: ClientService,
    private store: StoreService,
    private eventEmitter: EventEmitter2,
  ) {
    this.guildsView = new Map<Snowflake, ViewSystem>();
  }

  private async _newGuildView(
    guildPlayer: PlayerSystem,
    guildStore: GuildItem,
  ) {
    const guildId = guildPlayer.guildId;
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`Guild: ${guildId} not found in Client Discord`);
      return;
    }

    const playerChannel = await guild.channels.fetch(
      guildStore.config.playerChannel,
    );
    if (!playerChannel) {
      console.error('PlayerChannel not found in guild');
      return;
    }
    if (!playerChannel.isText()) return;

    // const playerInstance = await playerChannel.messages.fetch(
    //   guildStore.config.playerInstanceId,
    // );
    // if (!playerInstance) {
    //   console.error('playerInstance not found on playerChannel');
    //   return;
    // }

    const viewSystem = new ViewSystem(
      guildPlayer.guildId,
      guild,
      guildStore,
      guildPlayer,
      playerChannel,
    );

    this.guildsView.set(guildId, viewSystem);
  }

  // @OnEvent('player.ready', { async: true })
  // async onPlayerReady(guildsPlayer: IterableIterator<PlayerSystem>) {
  //   for (const guildPlayer of guildsPlayer) {
  //     const guildId = guildPlayer.guildId;
  //     const guildStore = this.store.get(guildId);
  //     if (!guildStore) {
  //       console.error(`Guild: ${guildId} not found in guildStore !!`);
  //       continue;
  //     }

  //     this._newGuildView(guildPlayer, guildStore);
  //   }
  // }

  @OnEvent('guildPlayer.newitem', { async: true })
  newGuildView(guildPlayer: PlayerSystem) {
    const guildId = guildPlayer.guildId;
    const guildStore = this.store.get(guildId);
    if (!guildStore) {
      console.error(`Guild: ${guildId} not found in guildStore !!`);
      return;
    }
    console.log('toto');

    this._newGuildView(guildPlayer, guildStore);
  }

  onApplicationBootstrap() {
    //   this.client.on('ready', async (client) => {
    //     const guildDatas = this.store.getAll();
    //     for (const guildData of guildDatas) {
    //       const guild = await client.guilds.fetch(guildData.guildId);
    //       if (!guild) continue;
    //       const textChannel = await guild.channels.fetch(
    //         guildData.config.playerChannel,
    //       );
    //       if (!textChannel || !textChannel.isText()) continue;
    //       if (textChannel instanceof TextChannel)
    //         this.playerChannels.set(guild.id, textChannel);
    //       const guildView: GuildPlayerView = {
    //         action: new ButtonComponents(),
    //         player: new PlayerEmbedComponents(),
    //         playlist: new PlaylistEmbedComponents(guildData.playlist.tracks),
    //       };
    //       this.view.set(guild.id, guildView);
    //       guildView.playlist.show(true);
    //       // test
    //       // const button = new ButtonComponents();
    //       const message = await textChannel.send({
    //         content: 'hey!',
    //         embeds: [guildView.player.response, guildView.playlist.response],
    //         components: guildView.action.response,
    //       });
    //       setTimeout(() => {
    //         guildView.action.setState('play_pause', 'PAUSE');
    //         message.edit({
    //           content: 'hey!',
    //           embeds: [guildView.player.response, guildView.playlist.response],
    //           components: guildView.action.response,
    //         });
    //       }, 5000);
    //     }
    //   });
  }
}
