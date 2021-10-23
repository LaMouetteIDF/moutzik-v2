import { Injectable } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import { StoreService } from 'src/store/store.service';
import { GuildConfigItem } from 'src/store/type';

@Injectable()
export class ConfigService {
  constructor(private store: StoreService) {}

  async newGuild(interaction: CommandInteraction) {
    const guildData = await this.store.newItem(
      interaction.guildId,
      interaction.channelId,
    );
    console.log(guildData);
    // guildData.config.
    interaction.reply('Ok!');
  }

  async setConfig(interaction: CommandInteraction) {
    console.log('totot');

    const subcommand =
      interaction.options.getSubcommand() as keyof GuildConfigItem;
    const value = interaction.options.getBoolean('boolean', true);
    this.store.setConfigOption(interaction.guildId, subcommand, value);
  }
}
