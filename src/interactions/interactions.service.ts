import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { ConfigService } from '@nestjs/config';
import { ButtonInteraction, CommandInteraction } from 'discord.js';

import { ClientService } from 'src/client/client.service';
import { PlayerModule } from 'src/player/player.module';

// COMMANDS  import

import { PlayerService } from 'src/player/player.service';
import { SlashCommandBuilder } from '@discordjs/builders';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class InteractionsService implements OnModuleInit {
  private interactionReady = false;

  constructor(
    private client: ClientService,
    @Inject('COMMANDS') private commands: SlashCommandBuilder[],
    private configService: ConfigService,
    private player: PlayerService,
    private eventEmitter: EventEmitter2,
  ) {}
  onModuleInit() {
    this.client.on('ready', async (client) => {
      const clientID = client.user.id;
      const guildID = '360675076783341570';

      const token = this.configService.get<string>('TOKEN');

      const rest = new REST({ version: '9' }).setToken(token);
      const commandsJSON = this.commands.map((command) => command.toJSON());
      try {
        await rest.put(Routes.applicationGuildCommands(clientID, guildID), {
          body: commandsJSON,
        });

        console.log('Successfully reloaded application (/) commands.');
      } catch (error) {
        console.error(error);
        throw error;
      }
    });
  }

  @OnEvent('player.ready')
  eventIteraction() {
    if (this.interactionReady) return;
    this.client.on('interactionCreate', async (interaction) => {
      if (interaction.isCommand()) this.commandInteraction(interaction);
      if (interaction.isButton()) this.buttonInteraction(interaction);
    });
    this.eventEmitter.emit('app.ready');
    this.interactionReady = true;
  }

  commandInteraction(interaction: CommandInteraction) {
    const commandGroupName = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();

    switch (commandGroupName) {
      case 'player':
        switch (subcommand) {
          case 'init':
            this.player.newGuild(interaction);
            console.log('called init player');
        }
        break;
    }
  }

  buttonInteraction(interaction: ButtonInteraction) {
    console.log(interaction);
  }
}
