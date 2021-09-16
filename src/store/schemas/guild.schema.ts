import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Config } from './config.schema';
import { PlayerOptions } from './player_options.schema';
import { Playlist } from './playlist.schema';

export type GuildDocument = Guild & Document;

@Schema()
export class Guild {
  @Prop({ required: true, index: true })
  guildId: string;

  @Prop()
  config: Config;

  @Prop()
  playerOptions: PlayerOptions;

  @Prop()
  playlist: Playlist;

  constructor() {
    this.config = new Config();
    this.playerOptions = new PlayerOptions();
    this.playlist = new Playlist();
  }
}

export const GuildSchema = SchemaFactory.createForClass(Guild);
