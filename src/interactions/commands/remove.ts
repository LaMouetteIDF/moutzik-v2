import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandsName } from '../commands';

const COMMAND = new SlashCommandBuilder();

COMMAND.setName(CommandsName.remove).setDescription(
  'Suppression de la piste dans la playlist',
);

COMMAND.addNumberOption((input) =>
  input.setName('track-id').setDescription('Identifiant de piste'),
);

export default COMMAND;
