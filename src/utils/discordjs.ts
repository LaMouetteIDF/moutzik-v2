import { PlayerSystem as GuildPlayer } from 'src/player/player.system';
import { ErrorType } from './error-type';

export async function ConnectionToChannel(
  guildPlayer: GuildPlayer,
  userId: string,
  force = true, // the user must be in a vocal channel
) {
  const guildMember = guildPlayer.guild.members.cache.get(userId);
  if (!guildMember) throw ErrorType.UserNotInGuild;

  const selfVoiceChannelId = guildPlayer.currentVoiceChannelId;
  const userVoiceChannelId = guildMember.voice.channelId;

  if (force && !userVoiceChannelId) throw ErrorType.UserNotInVoiceChannel;
  else if (!force && !userVoiceChannelId) return;

  if (!selfVoiceChannelId)
    return await guildPlayer.connectToChannel(userVoiceChannelId);

  if (selfVoiceChannelId !== userVoiceChannelId)
    throw ErrorType.UserNotInBotVoiceChannel;
}
