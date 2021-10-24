import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Config {
  @Prop({ required: true })
  playerChannel: string;

  @Prop({ required: true, default: '' })
  playerInstanceId: string;

  @Prop({ required: true })
  voiceChannel: string;

  @Prop({ required: true, default: false })
  voiceChannelLock: boolean;

  @Prop({ required: false, default: '' })
  logChannel: string;

  @Prop({ required: true, default: false })
  logging: boolean;

  // @Prop({ required: true, default: true })
  // allowMute: boolean;

  // @Prop({ required: true, default: true })
  // allowChangeVolume: boolean;

  constructor() {
    this.playerInstanceId = '';
    this.voiceChannel = '';
    this.voiceChannelLock = false;
    this.logChannel = '';
    this.logging = false;
    // this.allowMute = true;
    // this.allowChangeVolume = true;
  }
}
