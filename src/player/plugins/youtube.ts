import { Track } from 'src/store/schemas/track.schema';
import {
  validateID,
  getInfo,
  filterFormats,
  downloadFromInfo,
} from 'ytdl-core';

import * as ytpl from 'ytpl';
import { Providers } from '.';

export interface YTParseURL {
  url: string;
  id: string;
  t: number;
}

type YTURL = string;

const YT_REGEX =
  /^https?\:\/\/(?:www\.youtube\.com\/|m\.youtube\.com\/|music\.youtube\.com\/|youtube\.com\/)?(?:\?vi?=|youtu\.be\/|vi?\/|user\/.+\/u\/\w{1,2}\/|embed\/|playlist\?(?:.\&)?list=|watch\?(?:.*\&)?vi?=|\&vi?=|\?(?:.*\&)?vi?=)([^#\&\?\n\/<>"']*)(?:(?:\?|\&)?list=(?:[^#\&\?\n\/<>"']*)?)?(?:[\?\&]index=(?:\d+)?)?(?:[\?\&]t=)?(\d+)?$/i;

export class YoutubePlug {
  validateURL(url: string): url is YTURL {
    const p = this.parseURL(url);
    if (!p) return false;

    if (ytpl.validateID(p.id) || validateID(p.id)) return true;

    return false;
  }

  parseURL(url: string): YTParseURL {
    const match = url.match(YT_REGEX);

    if (!Array.isArray(match))
      throw new Error(
        'Erreur lors de la lecture du lien youtube. Veuillez utiliser un lien youtube valide',
      );

    // const url = match[0];
    const id = match[1];
    let time = parseInt(match[2], 10);
    if (isNaN(time)) time = 0;

    const result: YTParseURL = {
      url,
      id,
      t: time,
    };

    return result;
  }

  private async getSingleTrack(id: string, timeToStart = 0): Promise<Track> {
    const item = await getInfo(id);
    let duration: number | undefined = parseInt(
      item.videoDetails.lengthSeconds,
    );
    if (isNaN(duration)) duration = undefined;

    const thumbnail = item.videoDetails.thumbnails.pop();

    return new Track(
      Providers.YOUTUBE,
      item.videoDetails.video_url,
      item.videoDetails.title,
      thumbnail ? thumbnail.url : '',
      timeToStart,
      duration,
    );
  }

  async getTracks(url: string): Promise<Track[] | Track> {
    if (!this.validateURL(url)) throw new Error('This is not youtube URL');

    const ytURL = this.parseURL(url);
    try {
      // return array tracks
      if (ytpl.validateID(ytURL.id)) {
        const tracks: Track[] = [];
        const info = await ytpl(ytURL.id);

        for (const item of info.items) {
          tracks.push(await this.getSingleTrack(item.shortUrl));
        }

        return tracks;
      }
      // return single Track
      else return await this.getSingleTrack(ytURL.id, ytURL.t);
    } catch (error) {
      console.log('tototoottototo');
      console.error(error);

      throw new Error(
        `This is not youtube valid playlist or watch ID "${ytURL.id}"`,
      );
    }
  }

  async getAudioStream(url: YTURL) {
    try {
      const info = await getInfo(url);

      const audioFormats = filterFormats(info.formats, 'audioonly');
      if (audioFormats.length <= 0)
        throw new Error('This video have not audio format.');
      let formats = audioFormats.filter(
        (item) =>
          item.audioCodec == 'opus' && item.audioQuality?.includes('MEDIUM'),
      );
      if (formats.length == 0)
        formats = audioFormats.filter((item) => item.audioCodec == 'opus');
      return downloadFromInfo(info, {
        format: formats[0] ?? audioFormats[0],
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
