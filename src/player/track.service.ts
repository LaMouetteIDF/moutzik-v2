import { Injectable } from '@nestjs/common';
import { Track } from 'src/store/schemas/track.schema';
import { YoutubePlug } from './plugins/youtube';

@Injectable()
export class TrackService {
  private _yt: YoutubePlug;

  isValidURL(url: string) {
    try {
      new URL(url);
    } catch (e) {
      console.error(e);
      return false;
    }
    return true;
  }

  async getTrackFromUrl(url: string): Promise<Track | Track[]> {
    if (!this.isValidURL(url)) throw new Error('Invalide URL');
    try {
      return await this._yt.getTracks(url);
    } catch (error) {
      console.error(error);
      throw new Error('Invalide youtube URL');
    }
  }

  async getStream(track: Track) {
    return await this._yt.getAudioStream(track.url);
  }

  constructor() {
    this._yt = new YoutubePlug();
  }
}
