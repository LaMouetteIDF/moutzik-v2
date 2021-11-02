export enum CommandsName {
  CONFIG = 'config',
  PLAY = 'play',
  TRACKLIST = 'tracklist',
  STOP = 'stop',
}

export enum ConfigOptionSubCommandsName {
  PLAYER_CHANNEL = 'player-channel',
  VOICE_CHANNEL = 'voice-channel',
  VOICE_CHANNEL_LOCK = 'voice-chennel-lock',
  LOG_CHANNEL = 'log-channel',
  LOGGING = 'logging',
}

export enum ConfigSubGroupeCommandsName {
  INIT = 'init',
  OPTION = 'option',
  PLAYER = 'player',
}

export enum TrackListSubCommandsName {
  ADD = 'add',
  SHOW = 'show',
  REMOVE = 'remove',
  CLEAR = 'clear',
}
