import { SlashCommandBuilder } from '@discordjs/builders';

const COMMAND = new SlashCommandBuilder();

COMMAND.setName('remove').setDescription(
  'Suppression de la piste dans la playlist',
);

COMMAND.addNumberOption((input) =>
  input.setName('track-id').setDescription('Identifiant de piste'),
);

export default COMMAND;
