import { Guild, Snowflake } from 'discord.js';
import {
  VoiceConnection,
  AudioPlayer,
  AudioResource,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  createAudioResource,
  createAudioPlayer,
} from '@discordjs/voice';

import { Readable } from 'stream';
import { EventEmitter } from 'events';
import { PlayingState } from 'src/utils';
import { GuildItem } from 'src/store/type';
import { Track } from 'src/store/schemas/track.schema';
import { TrackService } from './track.service';

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
  }

  get currentVoiceChannelId(): string | undefined {
    return this._voiceConnection
      ? this._voiceConnection.joinConfig.channelId
      : undefined;
  }

  get currentTrack() {
    return this._currentTrack;
  }

  get playbackTime() {
    const playbackTime = this._voiceResource?.playbackDuration;
    if (!playbackTime) return 0;
    return Math.ceil(playbackTime / 1000);
  }

  private _kill() {
    this._voiceStream?.destroy();
    this._voiceAudioPlayer?.stop();
    this._voiceConnection?.destroy();
    delete this._voiceConnection;
    delete this._voiceAudioPlayer;
    delete this._voiceResource;
    delete this._voiceStream;
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
      const stream = await this.trackService.getStream(track);
      const ressource = createAudioResource(stream);
      const audioPlayer = createAudioPlayer();
      if (!this._voiceConnection) throw new Error('No found voice connection');
      this._voiceConnection.subscribe(audioPlayer);
      audioPlayer.play(ressource);
      this._currentTrack = track;
      this.emit('PLAY');
      this._voiceStream = stream;
      this._voiceResource = ressource;
      this._voiceAudioPlayer = audioPlayer;
    } catch (error) {
      console.error(error);
      this._kill();
      this.emit('STOP');
    }
  }

  stop() {
    this._kill();
    this.emit('STOP');
  }
}
