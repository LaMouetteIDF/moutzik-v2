import { Prop, Schema } from '@nestjs/mongoose';
import { Track } from './track.schema';

@Schema()
export class Playlist {
  @Prop()
  index: number;

  @Prop()
  tracks: Track[];

  constructor() {
    this.index = 0;
    this.tracks = [];
  }
}
