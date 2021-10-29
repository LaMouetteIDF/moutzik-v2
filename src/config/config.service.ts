import { Injectable } from '@nestjs/common';
import { CommandInteraction, TextChannel, VoiceChannel } from 'discord.js';
import { ConfigSubCommandsNameOption } from 'src/interactions/commands';
import { PlayerService } from 'src/player/player.service';
import { StoreService } from 'src/store/store.service';
import { GuildConfigItem } from 'src/store/type';

@Injectable()
export class ConfigService {
  constructor(private store: StoreService, private player: PlayerService) {}

  async newGuild(interaction: CommandInteraction) {
    const guildData = await this.store.newItem(
      interaction.guildId,
      interaction.channelId,
    );
    this.player.newGuildPlayer(guildData);
    interaction.reply('Ok!');
  }

  async setConfig(interaction: CommandInteraction) {
    const guildItem = this.store.get(interaction.guildId);

    if (!guildItem)
      return interaction.reply('Error your guild is not initialized !');

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case ConfigSubCommandsNameOption.PlayerChannel:
        {
          const channel = interaction.options.getChannel('channel', true);
          if (channel instanceof TextChannel) {
            guildItem.config.playerChannel = channel.id;
          }
        }
        break;

      case ConfigSubCommandsNameOption.VoiceChannel:
        {
          const channel = interaction.options.getChannel('channel', true);
          if (channel instanceof VoiceChannel) {
            guildItem.config.voiceChannel = channel.id;
          }
        }
        break;

      case ConfigSubCommandsNameOption.VoiceChannelLock:
        {
          const value = interaction.options.getBoolean('boolean', true);
          guildItem.config.voiceChannelLock = value;
        }
        break;

      case ConfigSubCommandsNameOption.LogChannel:
        {
          const channel = interaction.options.getChannel('channel', true);
          if (channel instanceof TextChannel) {
            guildItem.config.logChannel = channel.id;
          }
        }
        break;

      case ConfigSubCommandsNameOption.Logging:
        {
          const value = interaction.options.getBoolean('boolean', true);
          guildItem.config.logging = value;
        }
        break;
    }

    guildItem.markModified('config');

    await guildItem.save();

    interaction.reply('OK !');
  }
}
