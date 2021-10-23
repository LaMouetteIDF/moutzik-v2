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

COMMAND.addSubcommandGroup((subcommandGroup) =>
  subcommandGroup
    .setName('option')
    .setDescription('General options')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('player-channel')
        .setDescription('Set player view channel')
        .addChannelOption((input) =>
          input
            .setName('channel')
            .setDescription('TextChannel')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('voice-channel')
        .setDescription('Set voice channel')
        .addChannelOption((input) =>
          input
            .setName('channel')
            .setDescription('VoiceChannel')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('voice-channel-lock')
        .setDescription('Lock voice channel')
        .addBooleanOption((input) =>
          input
            .setName('boolean')
            .setDescription('True of False')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('log-channel')
        .setDescription('Set logChannel')
        .addChannelOption((input) =>
          input
            .setName('channel')
            .setDescription('TextChannel')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('logging')
        .setDescription('active logging')
        .addBooleanOption((input) =>
          input
            .setName('boolean')
            .setDescription('True of False')
            .setRequired(true),
        ),
    ),
);

export default COMMAND;
