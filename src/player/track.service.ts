import { Injectable } from '@nestjs/common';
import { Track } from 'src/store/schemas/track.schema';
import { Providers } from './plugins';
import { YoutubePlug } from './plugins/youtube';

@Injectable()
export class TrackService {
  private _yt: YoutubePlug;

  constructor() {
    this._yt = new YoutubePlug();
  }

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
    switch (true) {
      case this._yt.validateURL(url): // Youtube url
        return await this._yt.getTracks(url).catch(() => {
          throw new Error('Invalide youtube URL');
        });
    }
  }

  async getStream(track: Track) {
    switch (track.provider) {
      case Providers.YOUTUBE:
        return await this._yt.getAudioStream(track.url).catch(() => {
          throw new Error('Stream is not found');
        });
    }
  }
}
