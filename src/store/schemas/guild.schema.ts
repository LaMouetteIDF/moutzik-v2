import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Config } from './config.schema';
import { Playlists } from './playlists.schema';

export type GuildDocument = Guild & Document;

@Schema()
export class Guild {
  @Prop({ required: true, index: true })
  guildId: string;

  @Prop()
  config: Config;

  @Prop({ type: Playlists })
  playlists: Playlists;

  constructor() {
    this.config = new Config();
    this.playlists = new Playlists();
  }
}

export const GuildSchema = SchemaFactory.createForClass(Guild);
