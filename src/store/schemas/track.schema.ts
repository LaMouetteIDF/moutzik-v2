import { Prop, Schema } from '@nestjs/mongoose';
import { Providers } from 'src/player/plugins';

@Schema()
export class Track {
  @Prop()
  provider: Providers;

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
    provider: Providers,
    url: string,
    title: string,
    thumbnail: string,
    timeToStart: number,
    duration = 0,
  ) {
    this.provider = provider;
    this.url = url;
    this.title = title;
    this.thumbnail = thumbnail;
    this.timeToStart = timeToStart;
    this.duration = duration;
  }
}
