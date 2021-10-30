import {
  Guild,
  Message as InstancePlayer,
  MessageEmbed,
  NewsChannel,
  Snowflake,
  TextChannel,
} from 'discord.js';
import { PlayerSystem } from 'src/player/player.system';
import { Playlist } from 'src/store/schemas/playlist.schema';
import { GuildItem } from 'src/store/type';
import { ButtonComponents } from './components/actions';
import { PlayerEmbedComponents } from './components/player';
import { PlaylistEmbedComponents } from './components/playlist';
import { GuildPlayerView } from './components/types';

const INTERVAL_UPTADE = 5_000;

export class ViewSystem {
  private guildView: GuildPlayerView;

  private instancePlayer: InstancePlayer;

  private timer: NodeJS.Timer;

  constructor(
    public guildId: Snowflake,
    public guild: Guild,
    private guildStore: GuildItem,
    private guildPlayer: PlayerSystem,
    public playerChannel: TextChannel | NewsChannel,
  ) {
    this.guildView = {
      action: new ButtonComponents(),
      player: new PlayerEmbedComponents(),
      playlist: new PlaylistEmbedComponents(this.guildStore.playlist.tracks),
    };

    if (!!guildStore.config.playerInstanceId)
      playerChannel.messages
        .fetch(guildStore.config.playerInstanceId)
        .then((playerInstance) => {
          if (!playerInstance) {
            console.error('playerInstance not found on playerChannel');
            return;
          }

          this.instancePlayer = playerInstance;
        })
        .catch(() => this.newInstancePlayer());
    else this.newInstancePlayer();

    let ephenalTimer: NodeJS.Timer;

    this.guildPlayer.player.on('play', async (track) => {
      clearInterval(this.timer);
      // const currentTack = this.guildPlayer.currentTrack;
      const player = this.guildPlayer.player;
      this.guildView.player.setTitle(track.title, track.url);
      this.guildView.player.setDuration(track.duration);
      this.guildView.player.setThumbnail(track.thumbnail);
      this.guildView.player.setPlaybackTime(player.playbackTime);
      await this.update();
      ephenalTimer = setInterval(
        () => this.guildView.player.setPlaybackTime(player.playbackTime),
        1000,
      );
      this.timer = setInterval(this.update.bind(this), INTERVAL_UPTADE);
    });

    this.guildPlayer.on('STOP', () => {
      clearInterval(ephenalTimer);
      clearInterval(this.timer);
    });
  }

  private get embeds(): MessageEmbed[] {
    const embeds = [this.guildView.player.response];
    const playlistView = this.guildView.playlist.response;
    if (playlistView) embeds.push(playlistView);
    return embeds;
  }

  private async newInstancePlayer() {
    this.instancePlayer = await this.playerChannel.send({
      embeds: this.embeds,
      components: this.guildView.action.response,
    });
    this.guildStore.config.playerInstanceId = this.instancePlayer.id;
    this.guildStore.markModified('config');
    this.guildStore.save();
  }

  async update() {
    if (!this.instancePlayer) {
      console.error(`Instance is not found in guild "${this.guild.name}"`);
      return;
    } else if (!this.instancePlayer.editable) {
      console.error(`Instance is not editable in guild "${this.guild.name}"`);
      return;
    }

    try {
      await this.instancePlayer.edit({
        embeds: this.embeds,
        components: this.guildView.action.response,
      });
    } catch (error) {
      this.newInstancePlayer();
    }
  }
}
