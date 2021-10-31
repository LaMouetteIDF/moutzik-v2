import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Config } from './config.schema';
import { Playlist } from './playlist.schema';

export type GuildDocument = Guild & Document;

@Schema()
export class Guild {
  @Prop({ required: true, index: true })
  guildId: string;

  @Prop()
  config: Config;

  @Prop({ type: Playlist })
  playlist: Playlist;

  constructor() {
    this.config = new Config();
    this.playlist = new Playlist();
  }
}

export const GuildSchema = SchemaFactory.createForClass(Guild);
