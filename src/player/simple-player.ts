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
  Stop = 'stop',
}

export interface SimplePlayerEvents {
  play: [track: Track];
  pause: [];
  idle: [];
  error: [error: Error];
  stop: [];
  next: [];
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

  private _status: SimplePlayerStatus;

  constructor(public guildId: string, private trackService: TrackService) {
    super();
    this._status = SimplePlayerStatus.Stop;
  }

  get playbackTime() {
    const playbackTime = this._voiceResource?.playbackDuration;
    if (!playbackTime) return 0;
    return Math.ceil(playbackTime / 1000);
  }

  get status(): SimplePlayerStatus {
    return this._status;
  }

  get currentTrack() {
    return this._cTrack;
  }

  private _makePlayer() {
    if (!this._voiceAudioPlayer) {
      const connection = getVoiceConnection(this.guildId);
      if (!connection) throw new Error('Voice connection is not found !');
      this._voiceAudioPlayer = createAudioPlayer();
      this._addEventsOnAudioPlayer(this._voiceAudioPlayer);
      connection.subscribe(this._voiceAudioPlayer);
    }
  }

  private async createAudioResource(track: Track) {
    try {
      const stream = await this.trackService.getStream(track);
      if (this._voiceAudioPlayer.state.status == AudioPlayerStatus.Playing) {
        this._status = SimplePlayerStatus.Idle;
        this._voiceAudioPlayer.stop();
        await sleep(100);
      }
      this._voiceStream?.destroy();
      delete this._voiceStream;
      this._voiceStream = stream;
      delete this._voiceResource;
      this._voiceResource = createAudioResource(this._voiceStream);
      this._voiceResource.playStream.on('error', (error) => {
        console.error('Error:', error.message);
        this.play(this._cTrack);
      });
      return this._voiceResource;
    } catch (error) {
      throw new Error('Stream is not found');
    }
  }

  private _addEventsOnAudioPlayer(audioPlayer: AudioPlayer) {
    audioPlayer.on(AudioPlayerStatus.Idle, () => {
      if (this._status == SimplePlayerStatus.Play) {
        this.emit('next');
      }
    });

    audioPlayer.on(AudioPlayerStatus.Playing, () => {
      this._status = SimplePlayerStatus.Play;
      this.emit('play', this._cTrack);
    });

    audioPlayer.on(AudioPlayerStatus.Paused, () => {
      this._status = SimplePlayerStatus.Pause;
      this.emit('pause');
    });

    audioPlayer.on('error', (e) => {
      console.error(e);
      this.play(this._cTrack);
    });
  }

  async play(track: Track): Promise<boolean> {
    try {
      this._makePlayer();
      this._voiceAudioPlayer.play(await this.createAudioResource(track));
      this._cTrack = track;
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
    this._status = SimplePlayerStatus.Stop;
    this._voiceAudioPlayer?.stop();
    delete this._voiceAudioPlayer;
    delete this._voiceResource;
    this._voiceStream?.destroy();
    delete this._voiceStream;
    this.emit('stop');
  }
}
