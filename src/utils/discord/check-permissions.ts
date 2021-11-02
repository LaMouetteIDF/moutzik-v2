import {
  Channel,
  Permissions,
  Snowflake,
  TextBasedChannels,
  TextChannel,
} from 'discord.js';
import { ErrorType } from '../error-type';

export async function CheckIfChannelIsAccess(
  channel: Channel | TextBasedChannels,
) {
  if (!channel) throw ErrorType.BotNotHaveAccesToChannel;
  try {
    await channel.fetch();
  } catch (error) {
    throw ErrorType.BotNotHaveAccesToChannel;
  }
}

export function CheckPermissionWriteOnTextChannel(
  user: Snowflake,
  channel: TextChannel,
) {
  try {
    const permission = channel.permissionsFor(user);
    if (!permission.has(Permissions.FLAGS.SEND_MESSAGES)) {
      throw ErrorType.BotNotHavePermissionForWriteInChannel;
    }
  } catch (error) {
    throw ErrorType.BotNotHaveAccesToChannel;
  }
}
