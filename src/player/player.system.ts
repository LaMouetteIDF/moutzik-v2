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
import { PlayingState, RepeatState } from 'src/utils';
import { GuildItem } from 'src/store/type';
import { Track } from 'src/store/schemas/track.schema';
import { TrackService } from './track.service';
import { SimplePlayer, SimplePlayerStatus } from './simple-player';
import { Playlist } from 'src/store/schemas/playlist.schema';

const NUBER_ITEM_SHOW_IN_AWAIT_QUEUE = 5;

export interface PlayerSystemEvents {
  PLAY: [];
  STOP: [];
  upadatePlaybackTime: [currentPlaybackTime: number];
  changeRepeatState: [state: RepeatState];
  playlistChange: [playlist: Playlist];
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
  private _shortLivePlaylist: Playlist;

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

  get currentVoiceConnection(): VoiceConnection | undefined {
    return getVoiceConnection(this.guildId);
  }

  get player(): SimplePlayer {
    return this._simplePlayer;
  }

  get playlist(): Playlist {
    return this._shortLivePlaylist ?? this.guildStore.playlist;
  }

  get currentTrack() {
    return this.playlist.currentTrack;
  }

  get nextTracks() {
    const nextTracks = this.playlist.getNextTacksList(
      NUBER_ITEM_SHOW_IN_AWAIT_QUEUE,
    );
    if (this._shortLivePlaylist) {
      nextTracks.push(
        ...this._playlist.getNextTacksList(
          NUBER_ITEM_SHOW_IN_AWAIT_QUEUE - nextTracks.length,
          true,
        ),
      );
    }
    return nextTracks;
  }

  private _addEventsOnSimplePlayer(player: SimplePlayer) {
    player.on('next', () => {
      switch (this.playlist.repeat) {
        case RepeatState.NONE:
          if (this._shortLivePlaylist) {
            const track = this.playlist.next();
            if (!track) {
              delete this._shortLivePlaylist;
              return player.play(this.playlist.currentTrack);
            }
            return player.play(track);
          }
          const track = this._playlist.next();
          if (!track) return this.stop();
          player.play(track);
          break;
        case RepeatState.ALL:
          player.play(this._playlist.next(true));
          break;
        case RepeatState.ONE:
          player.play(this._playlist.currentTrack);
          break;
      }
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

  async play() {
    if (this._simplePlayer.status == SimplePlayerStatus.Play) return true;

    return await this.player.play(this.playlist.currentTrack);
  }

  pause() {
    return this._simplePlayer.pause();
  }

  resume() {
    return this._simplePlayer.resume();
  }

  async next() {
    if (this._shortLivePlaylist) {
      const track = this._shortLivePlaylist.next();
      if (!track) {
        delete this._shortLivePlaylist;
        return this._simplePlayer.play(this.playlist.currentTrack);
      }
      return this._simplePlayer.play(track);
    }
    const track = this.playlist.next(true);
    if (!this.currentVoiceChannelId) return true;
    return await this._simplePlayer.play(track);
  }

  async previous() {
    if (!this.currentVoiceChannelId) {
      this.playlist.previous();
      return true;
    }
    if (this._simplePlayer.playbackTime > 5)
      return await this._simplePlayer.play(this.playlist.currentTrack);
    return await this._simplePlayer.play(this.playlist.previous());
  }

  async playWithTrack(tracks: Track | Track[]) {
    try {
      delete this._shortLivePlaylist;
      this._shortLivePlaylist = new Playlist();
      this._shortLivePlaylist.add(tracks);
      if (!(await this._simplePlayer.play(this.playlist.currentTrack))) {
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
    this._playlist.add(tracks);
    this.emit('playlistChange', this._playlist);
    this.guildStore.markModified('playlist.tracks');
    await this.guildStore.save();
  }

  changeRepeatState() {
    switch (this.playlist.repeat) {
      case RepeatState.NONE:
        this.playlist.setRepeatState(RepeatState.ALL);
        break;
      case RepeatState.ALL:
        this.playlist.setRepeatState(RepeatState.ONE);
        break;
      case RepeatState.ONE:
        this.playlist.setRepeatState(RepeatState.NONE);
        break;
    }

    this.emit('changeRepeatState', this.playlist.repeat);
  }

  stop() {
    delete this._shortLivePlaylist;
    this._simplePlayer.stop();
    this.currentVoiceConnection?.destroy();
    this.emit('STOP');
  }
}
