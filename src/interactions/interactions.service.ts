// NestJs import
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

// Discord import
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { ConfigService as ConfigServiceNest } from '@nestjs/config';
import { ButtonInteraction, CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

// Services import
import { ClientService } from 'src/client/client.service';
import { PlayerService } from 'src/player/player.service';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class InteractionsService implements OnModuleInit {
  private interactionReady = false;

  constructor(
    private client: ClientService,
    @Inject('COMMANDS') private commands: SlashCommandBuilder[],
    private configServiceNest: ConfigServiceNest,
    private player: PlayerService,
    private config: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.client.on('ready', async (client) => {
      const clientID = client.user.id;
      const guildID = '360675076783341570';

      const token = this.configServiceNest.get<string>('TOKEN');

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
    console.log('titi');

    if (this.interactionReady) return;
    this.client.on('interactionCreate', async (interaction) => {
      if (interaction.isCommand()) this.commandInteraction(interaction);
      if (interaction.isButton()) this.buttonInteraction(interaction);
    });
    this.interactionReady = true;
    // this.eventEmitter.emit('player.ready');
  }

  commandInteraction(interaction: CommandInteraction) {
    const { commandName } = interaction;

    switch (commandName) {
      case 'config':
        const commandGroupName = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        switch (commandGroupName) {
          case 'player':
            switch (subcommand) {
              case 'init':
                this.config.newGuild(interaction);
                console.log('called init player');
            }
            break;
          case 'option':
            this.config.setConfig(interaction);
            break;
        }
        break;

      case 'play':
        this.player.PlayCommand(interaction);
        break;
      case 'add':
        break;
      case 'remove':
        break;
      case 'stop':
        break;
    }
  }

  buttonInteraction(interaction: ButtonInteraction) {
    console.log(interaction);
  }
}
