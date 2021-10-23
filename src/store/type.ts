import { Config } from './schemas/config.schema';
import { PlayerOptions } from './schemas/player_options.schema';
import { Playlist } from './schemas/playlist.schema';

export type GuildItem = {
  guildId: string;
  config: Config;
  playerOptions: PlayerOptions;
  playlist: Playlist;
};

export type GuildConfigItem = {
  playerChannel: string;
  logChannel: string;
  logging: boolean;
  allowMute: boolean;
  allowChangeVolume: boolean;
};
