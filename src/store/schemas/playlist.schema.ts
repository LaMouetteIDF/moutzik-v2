import { Prop, Schema } from '@nestjs/mongoose';
import { RepeatState } from 'src/utils';
import { Track } from './track.schema';

@Schema()
export class Playlist {
  @Prop()
  index: number;

  @Prop()
  repeat: RepeatState;

  @Prop()
  tracks: Track[];

  get currentTrack() {
    return this.tracks[this.index];
  }

  next(force = false): Track | undefined {
    if (this.index >= this.tracks.length - 1) {
      this.index = 0;
      if (force) return this.tracks[0];
      else return undefined;
    }

    return this.tracks[++this.index];
  }

  previous() {
    if (this.index == 0) {
      this.index = this.tracks.length - 1;
      return this.tracks[this.index];
    }
    return this.tracks[--this.index];
  }

  has(trackId: number) {
    return !!this.tracks[trackId - 1];
  }

  get(trackId: number) {
    if (this.has(trackId)) return this.tracks[trackId - 1];
  }

  setIndex(index: number) {
    if (index > this.tracks.length) return false;
    this.index = index - 1;
  }

  add(tracks: Track | Track[]) {
    if (Array.isArray(tracks)) {
      this.tracks.push(...tracks);
    } else this.tracks.push(tracks);
  }

  remove(trackId: number) {
    if (!this.tracks[trackId - 1]) return false;
    const trackRemove = this.tracks.splice(trackId - 1, 1);
    if (trackId - 1 <= this.index) this.index--;
    if (trackRemove.length > 0) return true;
    else return false;
  }

  setRepeatState(state: RepeatState) {
    this.repeat = state;
  }

  clear() {
    this.index = 0;
    this.tracks.splice(0, this.tracks.length);
  }

  getNextTacksList(numberItem = 5, force = false) {
    if (this.repeat !== RepeatState.ALL && this.index == this.tracks.length - 1)
      return [];

    const nextTracks = this.tracks
      .slice(force ? this.index : this.index + 1)
      .slice(0, numberItem - 1);

    if (this.repeat === RepeatState.NONE) return nextTracks;

    for (;;) {
      if (this.repeat === RepeatState.ALL && nextTracks.length < numberItem) {
        const rest = this.tracks.slice();
        nextTracks.push(...rest);
        if (nextTracks.length < numberItem) continue;
        break;
      }
      break;
    }
    return nextTracks.slice(0, numberItem);
  }

  constructor() {
    this.index = 0;
    this.repeat = RepeatState.NONE;
    this.tracks = [];
  }
}
