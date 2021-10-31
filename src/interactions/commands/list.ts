import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandsName } from '../commands';

const COMMAND = new SlashCommandBuilder();

COMMAND.setName(CommandsName.list).setDescription(
  'Afficher la list de lecture',
);

export default COMMAND;
