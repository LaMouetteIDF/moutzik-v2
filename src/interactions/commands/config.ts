import { SlashCommandBuilder } from '@discordjs/builders';
import { ConfigSubCommandsNameOption } from '../commands';

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
        .setName(ConfigSubCommandsNameOption.PlayerChannel)
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
        .setName(ConfigSubCommandsNameOption.VoiceChannel)
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
        .setName(ConfigSubCommandsNameOption.VoiceChannelLock)
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
        .setName(ConfigSubCommandsNameOption.LogChannel)
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
        .setName(ConfigSubCommandsNameOption.Logging)
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
