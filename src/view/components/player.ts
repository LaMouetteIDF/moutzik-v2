import { MessageEmbed } from 'discord.js';

export interface PlayerEmbedState {
  authorName: string;
  authorThumbnail: string;
  authorURL: string;
  trackTitle: string;
  trackURL: string;
  trackThumbnail: string;
  trackPlaybackTime: number;
  trackDurationTime: number;
  numberTracks: number;
  nextTracks: string[];
}

const SIZE_MAX_PLAYING_POSITION_BAR = 40;
const MAX_ROW_CHAR = 38;

export class PlayerEmbedComponents {
  private playerResponse: MessageEmbed;

  private duration: number;

  constructor() {
    this.playerResponse = new MessageEmbed()
      .setColor('DARK_GOLD')
      .setAuthor('Player Next Generation', 'https://i.imgur.com/AfFp7pu.png')
      .setTitle('Aucun Titre')
      .setDescription(this.getPlaybackDurationToCharString(0, this.duration))
      .setFields([
        {
          name: "File d'attente",
          value: this.getCharStringWaitingNextTrack([]),
          inline: false,
        },
      ]);

    this.duration = 0;
  }

  get response() {
    return this.playerResponse;
  }

  private getTimeToCharString(num: number, force = false) {
    if (!num && !force) return '-:--';

    const time = Math.floor(num);

    const minutes = Math.floor(time / 60);

    const seconds = time % 60;

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  private getTimelineBarToCharString(now: number, end?: number): string {
    let stringTimesBar = ``;

    const duration = end ?? 0;

    const intervalePushChar = duration / SIZE_MAX_PLAYING_POSITION_BAR;

    const SizeCurrentPositionBar = !end
      ? -1
      : Math.floor(now / intervalePushChar);

    for (let i = 0; i < SIZE_MAX_PLAYING_POSITION_BAR; i++) {
      if (i < SizeCurrentPositionBar) stringTimesBar += `|`;
      else stringTimesBar += ` `;
    }
    return stringTimesBar;
  }

  private getPlaybackDurationToCharString(now: number, end?: number): string {
    const PLAYBACK_DURATION = this.getTimeToCharString(now, true);

    const DURATION_TRACK = !end ? '-:--' : this.getTimeToCharString(end, true);

    const TIMELINE_STRING_BAR = this.getTimelineBarToCharString(now, end);

    return `\`${PLAYBACK_DURATION} |${TIMELINE_STRING_BAR}| ${DURATION_TRACK}\``;
  }

  private getCharStringWaitingNextTrack(els: Array<string>) {
    return `\`\`\`\n${(() => {
      let elements = ``;
      for (const item of els) {
        elements += `- ${
          item.length > MAX_ROW_CHAR
            ? item.substring(0, MAX_ROW_CHAR) + '...'
            : item
        }\n`;
      }
      return elements;
    })()} \`\`\``;
  }

  setTitle(title: string, url?: string) {
    this.playerResponse.setTitle(title);
    if (url) {
      try {
        new URL(url);
        this.playerResponse.setURL(url);
      } catch (e) {
        this.playerResponse.setURL('');
      }
    }
  }

  setThumbnail(url: string) {
    try {
      new URL(url);
      this.playerResponse.setThumbnail(url);
    } catch (error) {
      this.playerResponse.setThumbnail('');
    }
  }

  setDuration(duration: number) {
    this.duration = duration;
  }

  setPlaybackTime(time: number) {
    this.playerResponse.setDescription(
      this.getPlaybackDurationToCharString(time, this.duration),
    );
  }

  setNextTracksList(list: string[]) {
    this.playerResponse.setFields([
      {
        name: "File d'attente",
        value: this.getCharStringWaitingNextTrack(list),
        inline: false,
      },
    ]);
  }
}
