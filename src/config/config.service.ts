import { Injectable } from '@nestjs/common';
import {
  Channel,
  CommandInteraction,
  Permissions,
  TextChannel,
  VoiceChannel,
} from 'discord.js';
import { ConfigSubCommandsNameOption } from 'src/interactions/commands';
import { PlayerService } from 'src/player/player.service';
import { StoreService } from 'src/store/store.service';
import { GuildConfigItem } from 'src/store/type';
import {
  CheckIfChannelIsAccess,
  CheckPermissionWriteOnTextChannel,
} from 'src/utils/discord/check-permissions';
import { ErrorType } from 'src/utils/error-type';

@Injectable()
export class ConfigService {
  constructor(private store: StoreService, private player: PlayerService) {}

  async newGuild(interaction: CommandInteraction) {
    await CheckIfChannelIsAccess(interaction.channel);
    if (!interaction.inGuild()) return;

    if (interaction.channel instanceof TextChannel) {
      CheckPermissionWriteOnTextChannel(
        interaction.client.user.id,
        interaction.channel,
      );
    } else throw ErrorType.IsNotTextChannel;

    console.log(this.store.has(interaction.guildId));

    if (this.store.has(interaction.guildId)) {
      await interaction.editReply('Le serveur est déjà initialisé !');
      return;
    }

    const guildData = await this.store.newItem(
      interaction.guildId,
      interaction.channelId,
    );
    this.player.newGuildPlayer(guildData);

    await interaction.editReply('Le serveur est maintenant initialisé !');
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

    await interaction.reply('OK !');
  }
}
