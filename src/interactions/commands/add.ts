import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandsName } from '../commands';

const COMMAND = new SlashCommandBuilder();

COMMAND.setName(CommandsName.Add).setDescription(
  'Ajout de la piste(s) dans la playlist',
);

COMMAND.addStringOption((input) =>
  input
    .setName('youtube-url')
    .setDescription('Lien de vidéo youtube')
    .setRequired(true),
);

export default COMMAND;
