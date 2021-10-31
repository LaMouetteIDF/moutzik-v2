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

    const viewSystem = new ViewSystem(
      guildPlayer.guildId,
      guild,
      guildStore,
      guildPlayer,
      playerChannel,
    );

    this.guildsView.set(guildId, viewSystem);
  }

  @OnEvent('guildPlayer.newitem', { async: true })
  async newGuildView(guildPlayer: PlayerSystem) {
    const guildId = guildPlayer.guildId;
    const guildStore = this.store.get(guildId);
    if (!guildStore) {
      console.error(`Guild: ${guildId} not found in guildStore !!`);
      return;
    }
    await this._newGuildView(guildPlayer, guildStore);
  }

  onApplicationBootstrap() {
    // todo
  }
}
