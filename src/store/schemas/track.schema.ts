import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Track {
  @Prop()
  url: string;

  @Prop()
  title: string;

  @Prop()
  thumbnail: string;

  @Prop()
  timeToStart: number;

  @Prop()
  duration: number;

  constructor(
    url: string,
    title: string,
    thumbnail: string,
    timeToStart: number,
    duration = 0,
  ) {
    this.url = url;
    this.title = title;
    this.thumbnail = thumbnail;
    this.timeToStart = timeToStart;
    this.duration = duration;
  }
}
