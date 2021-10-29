import { Guild, Snowflake } from 'discord.js';
import {
  VoiceConnection,
  AudioPlayer,
  AudioResource,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  createAudioResource,
  createAudioPlayer,
  getVoiceConnection,
} from '@discordjs/voice';

import { Readable } from 'stream';
import { EventEmitter } from 'events';
import { PlayingState } from 'src/utils';
import { GuildItem } from 'src/store/type';
import { Track } from 'src/store/schemas/track.schema';
import { TrackService } from './track.service';
import { SimplePlayer } from './simple-player';

export interface PlayerSystemEvents {
  PLAY: [];
  STOP: [];
  upadatePlaybackTime: [currentPlaybackTime: number];
}

export declare interface PlayerSystem extends EventEmitter {
  on<K extends keyof PlayerSystemEvents>(
    event: K,
    listener: (...args: PlayerSystemEvents[K]) => void,
  ): this;
  once<K extends keyof PlayerSystemEvents>(
    event: K,
    listener: (...args: PlayerSystemEvents[K]) => void,
  ): this;
  emit<K extends keyof PlayerSystemEvents>(
    event: K,
    ...args: PlayerSystemEvents[K]
  ): boolean;
}

export class PlayerSystem extends EventEmitter {
  private _voiceConnection?: VoiceConnection;
  private _voiceAudioPlayer?: AudioPlayer;
  private _voiceResource?: AudioResource;
  private _voiceStream?: Readable;
  private _simplePlayer: SimplePlayer;

  private _state: PlayingState;

  private _currentTrack: Track;

  constructor(
    public guildId: Snowflake,
    public guild: Guild,
    private guildStore: GuildItem,
    private voiceAdaptator: DiscordGatewayAdapterCreator,
    private trackService: TrackService,
  ) {
    super();
    this._state = PlayingState.STOP;
    this._simplePlayer = new SimplePlayer(this.guildId, this.trackService);
  }

  get currentVoiceChannelId(): string | undefined {
    const connection = getVoiceConnection(this.guildId);
    return connection ? connection.joinConfig.channelId : undefined;
  }

  get player(): SimplePlayer {
    return this._simplePlayer;
  }

  async connectToChannel(channelId: Snowflake): Promise<boolean> {
    try {
      const voiceChannel = await this.guild.channels.fetch(channelId);

      if (!voiceChannel.isVoice()) return false;

      this._voiceConnection = joinVoiceChannel({
        channelId,
        guildId: this.guildId,
        adapterCreator: this.voiceAdaptator,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  play() {
    if (this._state == PlayingState.PLAY) return;

    if (this._voiceAudioPlayer && this._state == PlayingState.PAUSE) {
      this._voiceAudioPlayer.unpause();
      this._state = PlayingState.PLAY;
      return;
    }

    const playlistIndex = this.guildStore.playlist.index;
  }

  async playWithTrack(track: Track) {
    try {
      if (!this._simplePlayer.play(track)) {
        throw new Error('Player not work !');
      }
      this.emit('PLAY');
    } catch (error) {
      console.error(error);
      this.emit('STOP');
    }
  }

  stop() {
    this._simplePlayer.stop();
    this.emit('STOP');
  }
}
