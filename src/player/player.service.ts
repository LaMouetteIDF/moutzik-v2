import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ButtonInteraction, CommandInteraction, Snowflake } from 'discord.js';
import { ClientService } from 'src/client/client.service';
import { Track } from 'src/store/schemas/track.schema';
import { StoreService } from 'src/store/store.service';
import { GuildItem } from 'src/store/type';
import { ConnectionToChannel } from 'src/utils/discordjs';
import { ErrorType } from 'src/utils/error-type';
import { PlayerSystem } from './player.system';
import { SimplePlayerStatus } from './simple-player';
import { TrackService } from './track.service';

@Injectable()
export class PlayerService {
  guildsPlayer: Map<Snowflake, PlayerSystem>;

  constructor(
    private client: ClientService,
    private eventEmitter: EventEmitter2,
    private trackService: TrackService,
    private store: StoreService,
  ) {
    this.guildsPlayer = new Map<Snowflake, PlayerSystem>();
  }

  private async _newGuildPlayer(guildStore: GuildItem) {
    const guild = await this.client.guilds.fetch(guildStore.guildId);

    if (!guild) {
      console.error(`Guild ${guildStore.guildId} not found on Store !`);
      return;
    }

    const guildPlayer = new PlayerSystem(
      guildStore.guildId,
      guild,
      guildStore,
      guild.voiceAdapterCreator,
      this.trackService,
    );

    this.guildsPlayer.set(guildStore.guildId, guildPlayer);
    this.eventEmitter.emitAsync('guildPlayer.newitem', guildPlayer);
  }

  @OnEvent('client.ready', { async: true })
  onClientReady() {
    for (const guildStore of this.store.getAll()) {
      this._newGuildPlayer(guildStore);
    }
    this.eventEmitter.emit('player.ready', this.guildsPlayer.values());
  }

  newGuildPlayer(guildStore: GuildItem) {
    this._newGuildPlayer(guildStore);
  }

  async PlayCommand(interaction: CommandInteraction) {
    interaction.deferReply({ ephemeral: true });
    const url = interaction.options.getString('youtube-url', false);
    const trackId = interaction.options.getString('track-id', false);
    try {
      if (!url && !trackId)
        throw new Error("Aucun argument n'est passer en paramètre !");
      if (trackId) {
        return; // CODE À COMPLÈTER ICI !!
      }

      const urlIsValide = this.trackService.isValidURL(url);
      if (!urlIsValide) return; // ERREUR À METTRE ICI !!

      const track = await this.trackService.getTrackFromUrl(url);
      if (Array.isArray(track)) return;

      const guildId = interaction.guildId;

      const guildPlayer = this.guildsPlayer.get(guildId);
      if (!guildPlayer)
        return interaction.reply(
          "Le player n'est pas initialiser sur le serveur !!",
        );

      await ConnectionToChannel(guildPlayer, interaction.user.id);

      if (!(await guildPlayer.playWithTrack(track)))
        throw ErrorType.ErrorOnStartPlaying;
      interaction.editReply('OK !');
    } catch (e) {
      console.error(e);
      interaction.editReply(`Error: ${e}`);
    }
  }

  async AddCommand(interaction: CommandInteraction) {
    interaction.deferReply({ ephemeral: true });
    const url = interaction.options.getString('youtube-url', true);
    try {
      const guildId = interaction.guildId;
      const guildPlayer = this.guildsPlayer.get(guildId);
      if (!guildPlayer)
        return interaction.reply(
          "Le player n'est pas initialiser sur le serveur !!",
        );

      if (!this.trackService.isValidURL(url)) throw new Error('URL invalide');

      const tracks = await this.trackService.getTrackFromUrl(url);

      await guildPlayer.add(tracks);

      interaction.editReply('OK !');
    } catch (e) {
      console.error(e);
      interaction.editReply(`Error: ${e}`);
    }
  }

  // BUTTONS

  async PlayPauseButton(interaction: ButtonInteraction) {
    await interaction.deferUpdate();
    try {
      const guildId = interaction.guildId;
      const guildPlayer = this.guildsPlayer.get(guildId);
      if (!guildPlayer)
        return interaction.reply(
          "Le player n'est pas initialiser sur le serveur !!",
        );

      const player = guildPlayer.player;
      const playlist = guildPlayer.playlist;

      switch (player.status) {
        case SimplePlayerStatus.Play:
          if (!player.pause()) throw 'Error to start music';
          break;
        case SimplePlayerStatus.Pause:
          if (!player.resume()) throw 'Error to start music';
          break;
        case SimplePlayerStatus.Stop:
          const track = playlist.tracks[playlist.index];
          await ConnectionToChannel(guildPlayer, interaction.user.id);
          if (!(await player.play(track))) throw 'Error to start music';
          break;
      }
    } catch (e) {
      console.error(e);
      interaction.editReply(`Error: ${e}`);
    }
  }
}
