import { SlashCommandBuilder } from '@discordjs/builders';

const COMMAND = new SlashCommandBuilder();

COMMAND.setName('config').setDescription('Configuration général du lecteur');

COMMAND.addSubcommandGroup((subcommandGroup) =>
  subcommandGroup
    .setName('player')
    .setDescription('Lecteur de musique')
    .addSubcommand((subcommand) =>
      subcommand.setName('init').setDescription('Initialisation du lecteur'),
    ),
);

export default COMMAND;
