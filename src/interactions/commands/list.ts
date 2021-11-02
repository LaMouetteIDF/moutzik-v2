import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandsName, TrackListSubCommandsName } from '../commands';

const COMMAND = new SlashCommandBuilder();

COMMAND.setName(CommandsName.TRACKLIST).setDescription('Liste de lecture');

COMMAND.addSubcommand((subcommand) =>
  subcommand
    .setName(TrackListSubCommandsName.SHOW)
    .setDescription('Afficher la liste de lecture')
    .addStringOption((input) =>
      input
        .setName('playlist')
        .setDescription('Nom de la liste de lecture')
        .setRequired(false),
    ),
);

COMMAND.addSubcommand((subcommand) =>
  subcommand
    .setName(TrackListSubCommandsName.ADD)
    .setDescription('Ajout de pistes')
    .addStringOption((input) =>
      input
        .setName('youtube-url')
        .setDescription('URL Youtube')
        .setRequired(true),
    )
    .addStringOption((input) =>
      input
        .setName('playlist')
        .setDescription('Nom de la liste de lecture')
        .setRequired(false),
    ),
);

COMMAND.addSubcommand((subcommand) =>
  subcommand
    .setName(TrackListSubCommandsName.REMOVE)
    .setDescription('Supprimer une piste')
    .addIntegerOption((input) =>
      input
        .setName('track-id')
        .setDescription('Numero de la piste')
        .setRequired(true),
    )
    .addStringOption((input) =>
      input
        .setName('playlist')
        .setDescription('Nom de la liste de lecture')
        .setRequired(false),
    ),
);

COMMAND.addSubcommand((subcommand) =>
  subcommand
    .setName(TrackListSubCommandsName.CLEAR)
    .setDescription('Nettoyer la liste de lecture')
    .addStringOption((input) =>
      input
        .setName('playlist')
        .setDescription('Nom de la liste de lecture')
        .setRequired(false),
    ),
);

export default COMMAND;
