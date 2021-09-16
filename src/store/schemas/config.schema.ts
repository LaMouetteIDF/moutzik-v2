import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Config {
  @Prop({ required: true })
  playerChannel: string;

  @Prop({ required: false, default: '' })
  logChannel: string;

  @Prop({ required: true, default: false })
  logging: boolean;

  @Prop({ required: true, default: true })
  allowMute: boolean;

  @Prop({ required: true, default: true })
  allowChangeVolume: boolean;

  constructor() {
    this.logChannel = '';
    this.logging = false;
    this.allowMute = true;
    this.allowChangeVolume = true;
  }
}
