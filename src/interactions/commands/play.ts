import { SlashCommandBuilder } from '@discordjs/builders';

const COMMAND = new SlashCommandBuilder();

COMMAND.setName('play').setDescription('Lire une piste ou un lien YT');

COMMAND.addStringOption((input) =>
  input.setName('youtube-url').setDescription('Lien de vidéo youtube'),
);

COMMAND.addNumberOption((input) =>
  input.setName('track-id').setDescription('Identifiant de piste'),
);

export default COMMAND;
