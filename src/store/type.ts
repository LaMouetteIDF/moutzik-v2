import { Config } from './schemas/config.schema';
import { Playlists } from './schemas/playlists.schema';

export type GuildItem = {
  guildId: string;
  config: Config;
  playlists: Playlists;
  save(): Promise<GuildItem>;
  markModified(path: string): void;
};

export type GuildConfigItem = {
  playerChannel: string;
  playerInstanceId: string;
  logChannel: string;
  logging: boolean;
  allowMute: boolean;
  allowChangeVolume: boolean;
};
