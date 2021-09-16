import { Injectable } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import { StoreService } from 'src/store/store.service';

@Injectable()
export class PlayerService {
  constructor(private store: StoreService) {}
  async newGuild(interaction: CommandInteraction) {
    const guildData = await this.store.newItem(
      interaction.guildId,
      interaction.channelId,
    );
    console.log(guildData);
    interaction.reply('Ok!');
  }
}
