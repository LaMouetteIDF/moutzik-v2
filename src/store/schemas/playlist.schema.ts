import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Playlist {
  @Prop()
  index: number;

  @Prop()
  tracks: string[];

  constructor() {
    this.index = 0;
    this.tracks = [];
  }
}
