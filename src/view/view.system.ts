import {
  Guild,
  Message as InstancePlayer,
  MessageEmbed,
  NewsChannel,
  Snowflake,
  TextChannel,
} from 'discord.js';
import { ButtonsCustomIds } from 'src/interactions/buttons';
import { PlayerSystem } from 'src/player/player.system';
import { SimplePlayer } from 'src/player/simple-player';
import { Playlist } from 'src/store/schemas/playlist.schema';
import { GuildItem } from 'src/store/type';
import { RepeatState } from 'src/utils';
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
          this.instancePlayer = playerInstance;
          this._setPlayerData();
        })
        .catch(() => this.newInstancePlayer());
    else this.newInstancePlayer();

    this._addEventsOnSimplePlayer(this.guildPlayer.player);
    this._addEventsOnGuildPlayer(this.guildPlayer);
  }

  private get embeds(): MessageEmbed[] {
    const embeds = [this.guildView.player.response];
    const playlistView = this.guildView.playlist.response;
    if (playlistView) embeds.push(playlistView);
    return embeds;
  }

  private _addEventsOnSimplePlayer(player: SimplePlayer) {
    player
      .on('play', (track) => {
        clearInterval(this.timer);
        this.guildView.action.setState(ButtonsCustomIds.PlayPause, 'PAUSE');
        this.guildView.action.setState(ButtonsCustomIds.Stop, 'ALLOW');
        this._setPlayerData();
        this.timer = setInterval(this.update.bind(this), INTERVAL_UPTADE);
      })
      .on('pause', () => {
        clearInterval(this.timer);
        this.guildView.action.setState(ButtonsCustomIds.PlayPause, 'PLAY');
        this._setPlayerData();
      })
      .on('stop', () => {
        clearInterval(this.timer);
        this.guildView.action.setState(ButtonsCustomIds.PlayPause, 'PLAY');
        this.guildView.action.setState(ButtonsCustomIds.Stop, 'DENIE');
        this._setPlayerData();
      });
  }

  private _addEventsOnGuildPlayer(guildPlayer: PlayerSystem) {
    guildPlayer.on('changeRepeatState', async (state) => {
      this._setButtonState();
      await this.update();
    });

    guildPlayer.on('playlistChange', async () => {
      await this.update();
    });
  }

  private async _setPlayerData() {
    const track = this.guildPlayer.currentTrack;
    if (!track) return this.guildView.player.setDefault();
    this.guildView.player.setTitle(track.title, track.url);
    this.guildView.player.setDuration(track.duration);
    this.guildView.player.setThumbnail(track.thumbnail);
    this.guildView.player.setPlaybackTime(this.guildPlayer.player.playbackTime);
    this._setButtonState();
    await this.update();
  }

  private _setButtonState() {
    switch (this.guildPlayer.playlist.repeat) {
      case RepeatState.NONE:
        this.guildView.action.setState(ButtonsCustomIds.Repeat, 'NONE');
        break;
      case RepeatState.ALL:
        this.guildView.action.setState(ButtonsCustomIds.Repeat, 'ALL');
        break;
      case RepeatState.ONE:
        this.guildView.action.setState(ButtonsCustomIds.Repeat, 'ONE');
        break;
    }
  }

  private async newInstancePlayer() {
    try {
      this.instancePlayer = await this.playerChannel.send({
        embeds: this.embeds,
        components: this.guildView.action.response,
      });
      this.guildStore.config.playerInstanceId = this.instancePlayer.id;
      this.guildStore.markModified('config');
      this.guildStore.save();
    } catch (error) {
      console.log(error);
    }
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
      this.guildView.player.setPlaybackTime(
        this.guildPlayer.player.playbackTime,
      );

      this.guildView.player.setNextTracksList(
        this.guildPlayer.nextTracks.map((item) => item.title),
      );

      await this.instancePlayer.edit({
        embeds: this.embeds,
        components: this.guildView.action.response,
      });
    } catch (error) {
      this.newInstancePlayer();
    }
  }
}
