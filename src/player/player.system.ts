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
import { SimplePlayer, SimplePlayerStatus } from './simple-player';
import { Playlist } from 'src/store/schemas/playlist.schema';

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

  private _playlist: Playlist;

  private _currentTrack: Track;

  constructor(
    public guildId: Snowflake,
    public guild: Guild,
    private guildStore: GuildItem,
    private voiceAdaptator: DiscordGatewayAdapterCreator,
    private trackService: TrackService,
  ) {
    super();
    this._playlist = this.guildStore.playlist;
    this._state = PlayingState.STOP;
    this._simplePlayer = new SimplePlayer(this.guildId, this.trackService);
    this._addEventsOnSimplePlayer(this._simplePlayer);
  }

  get currentVoiceChannelId(): string | undefined {
    const connection = getVoiceConnection(this.guildId);
    return connection ? connection.joinConfig.channelId : undefined;
  }

  get player(): SimplePlayer {
    return this._simplePlayer;
  }

  get playlist() {
    return this.guildStore.playlist;
  }

  private _addEventsOnSimplePlayer(player: SimplePlayer) {
    player.on('next', () => {
      const track = this.playlist.tracks[0];
      player.play(track);
    });
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

    const playlistIndex = this.guildStore.playlist.index;
  }

  async playWithTrack(track: Track) {
    try {
      if (!this._simplePlayer.play(track)) {
        throw new Error('Player not work !');
      }
      this.emit('PLAY');
      return true;
    } catch (error) {
      console.error(error);
      this.emit('STOP');
      return false;
    }
  }

  async add(tracks: Track | Track[]) {
    if (Array.isArray(tracks)) {
      this._playlist.tracks.push(...tracks);
    } else this._playlist.tracks.push(tracks);
    this.guildStore.markModified('playlist.tracks');
    await this.guildStore.save();
  }

  stop() {
    this._simplePlayer.stop();
    this.emit('STOP');
  }
}
