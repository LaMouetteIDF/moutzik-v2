import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandsName } from '../commands';

const COMMAND = new SlashCommandBuilder();

COMMAND.setName(CommandsName.STOP).setDescription('Arrêt de la lecture');

export default COMMAND;
