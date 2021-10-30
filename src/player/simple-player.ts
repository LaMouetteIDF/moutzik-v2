import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  VoiceConnection,
} from '@discordjs/voice';
import { EventEmitter } from 'events';
import { Track } from 'src/store/schemas/track.schema';
import { sleep } from 'src/utils';
import { Readable } from 'stream';
import { TrackService } from './track.service';

export enum SimplePlayerStatus {
  Play = 'play',
  Pause = 'pause',
  Idle = 'idle',
}

export interface SimplePlayerEvents {
  play: [track: Track];
  pause: [];
  idle: [];
  error: [];
}

export declare interface SimplePlayer extends EventEmitter {
  on<K extends keyof SimplePlayerEvents>(
    event: K,
    listener: (...args: SimplePlayerEvents[K]) => void,
  ): this;
  once<K extends keyof SimplePlayerEvents>(
    event: K,
    listener: (...args: SimplePlayerEvents[K]) => void,
  ): this;
  emit<K extends keyof SimplePlayerEvents>(
    event: K,
    ...args: SimplePlayerEvents[K]
  ): boolean;
}

export class SimplePlayer extends EventEmitter {
  private _voiceAudioPlayer?: AudioPlayer;
  private _voiceResource?: AudioResource;
  private _voiceStream?: Readable;

  /**
   * @description Current playing track
   */
  private _cTrack?: Track;

  constructor(public guildId: string, private trackService: TrackService) {
    super();
  }

  get playbackTime() {
    const playbackTime = this._voiceResource?.playbackDuration;
    if (!playbackTime) return 0;
    return Math.ceil(playbackTime / 1000);
  }

  get currentTrack() {
    return this._cTrack;
  }

  private _makePlayer() {
    if (!this._voiceAudioPlayer) {
      const connection = getVoiceConnection(this.guildId);
      if (!connection) throw new Error('Voice connection is not found !');
      this._voiceAudioPlayer = createAudioPlayer();
      connection.subscribe(this._voiceAudioPlayer);
    }
  }

  private async createAudioResource(track: Track) {
    try {
      const stream = await this.trackService.getStream(track);
      if (this._voiceAudioPlayer.state.status == AudioPlayerStatus.Playing) {
        this._voiceAudioPlayer.stop();
        await sleep(500);
      }
      this._voiceStream?.destroy();
      delete this._voiceStream;
      this._voiceStream = stream;
      delete this._voiceResource;
      this._voiceResource = createAudioResource(this._voiceStream);
      return this._voiceResource;
    } catch (error) {
      throw new Error('Stream is not found');
    }
  }

  async play(track: Track): Promise<boolean> {
    try {
      this._makePlayer();
      this._voiceAudioPlayer.play(await this.createAudioResource(track));
      this.emit('play', track);
    } catch (e) {
      return false;
    }

    return true;
  }

  pause(): boolean {
    if (this._voiceAudioPlayer) return this._voiceAudioPlayer.pause(true);

    return false;
  }

  resume(): boolean {
    if (this._voiceAudioPlayer) return this._voiceAudioPlayer.unpause();

    return false;
  }

  stop() {
    this._voiceAudioPlayer?.stop();
    delete this._voiceAudioPlayer;
    delete this._voiceResource;
    this._voiceStream?.destroy();
    delete this._voiceStream;
  }
}
