import { MessageEmbed } from 'discord.js';
import { Track } from 'src/store/schemas/track.schema';

export class PlaylistEmbedComponents {
  private playlistResponse: MessageEmbed;
  private _show: boolean;

  constructor(private trackList: Track[]) {
    this.playlistResponse = new MessageEmbed();
    this.playlistResponse.setTitle('Liste de lecture');
    this._show = false;
    this.makeResponse(trackList);
  }

  get response() {
    if (!this._show) return undefined;
    return this.playlistResponse;
  }

  private makeResponse(trackList: Track[]) {
    const trackListCharString = [];

    for (const trackIndex in trackList) {
      trackListCharString.push(
        `${trackIndex} - ${trackList[trackIndex].title}\n`,
      );
    }

    this.playlistResponse.setDescription(
      `\`\`\`\n${trackListCharString.join('')} \n\`\`\``,
    );
  }

  show(value = false) {
    this._show = value;
  }

  update() {
    this.makeResponse(this.trackList);
  }
}
