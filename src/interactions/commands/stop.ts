import { SlashCommandBuilder } from '@discordjs/builders';

const COMMAND = new SlashCommandBuilder();

COMMAND.setName('stop').setDescription('Arrêt de la lecture');

export default COMMAND;
