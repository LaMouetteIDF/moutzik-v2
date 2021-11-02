import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandsName,
  ConfigOptionSubCommandsName,
  ConfigSubGroupeCommandsName,
} from '../commands';

const COMMAND = new SlashCommandBuilder();

COMMAND.setName(CommandsName.CONFIG).setDescription(
  'Configuration général du lecteur',
);

COMMAND.addSubcommandGroup((subcommandGroup) =>
  subcommandGroup
    .setName('player')
    .setDescription('Lecteur de musique')
    .addSubcommand((subcommandGroup) =>
      subcommandGroup
        .setName(ConfigSubGroupeCommandsName.INIT)
        .setDescription('Initialisation du player'),
    ),
);

// COMMAND.addSubcommandGroup((subcommandGroup) =>
//   subcommandGroup
//     .setName(ConfigSubGroupeCommandsName.INIT)
//     .setDescription('Initialisation du player'),
// );

COMMAND.addSubcommandGroup((subcommandGroup) =>
  subcommandGroup
    .setName('option')
    .setDescription('General options')
    .addSubcommand((subcommand) =>
      subcommand
        .setName(ConfigOptionSubCommandsName.PLAYER_CHANNEL)
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
        .setName(ConfigOptionSubCommandsName.VOICE_CHANNEL)
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
        .setName(ConfigOptionSubCommandsName.VOICE_CHANNEL_LOCK)
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
        .setName(ConfigOptionSubCommandsName.LOG_CHANNEL)
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
        .setName(ConfigOptionSubCommandsName.LOGGING)
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
