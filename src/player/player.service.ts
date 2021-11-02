import { Embed } from '@discordjs/builders';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  ButtonInteraction,
  CommandInteraction,
  MessageEmbed,
  Snowflake,
} from 'discord.js';
import { ClientService } from 'src/client/client.service';
import { TrackListSubCommandsName } from 'src/interactions/commands';
import { Playlist } from 'src/store/schemas/playlist.schema';
import { Track } from 'src/store/schemas/track.schema';
import { StoreService } from 'src/store/store.service';
import { GuildItem } from 'src/store/type';
import { ConnectionToChannel } from 'src/utils/discordjs';
import { ErrorType } from 'src/utils/error-type';
import { PlayerSystem } from './player.system';
import { SimplePlayerStatus } from './simple-player';
import { TrackService } from './track.service';

const MAX_LENGTH_TITLE_IN_EMBED = 70;

@Injectable()
export class PlayerService {
  guildsPlayer: Map<Snowflake, PlayerSystem>;
  private _playerIsInit = false;

  constructor(
    private client: ClientService,
    private eventEmitter: EventEmitter2,
    private trackService: TrackService,
    private store: StoreService,
  ) {
    this.guildsPlayer = new Map<Snowflake, PlayerSystem>();
  }

  private async _newGuildPlayer(guildStoreItem: GuildItem) {
    const guild = await this.client.guilds.fetch(guildStoreItem.guildId);

    if (!guild) {
      console.error(`Guild ${guildStoreItem.guildId} not found on Store !`);
      return;
    }

    const guildPlayerItem = new PlayerSystem(
      guildStoreItem.guildId,
      guild,
      guildStoreItem,
      guild.voiceAdapterCreator,
      this.trackService,
    );

    this.guildsPlayer.set(guildStoreItem.guildId, guildPlayerItem);
    return guildPlayerItem;
  }

  async init() {
    if (this._playerIsInit) return;
    for (const guildStore of await this.store.getAll()) {
      this._newGuildPlayer(guildStore);
    }
    this._playerIsInit = true;
  }

  async newGuildPlayer(guildStore: GuildItem) {
    await this._newGuildPlayer(guildStore);
  }

  async PlayCommand(interaction: CommandInteraction) {
    const url = interaction.options.getString('youtube-url', false);
    const trackId = interaction.options.getString('track-id', false);

    if (!url && !trackId)
      throw new Error("Aucun argument n'est passer en paramètre !");
    if (trackId) {
      return; // CODE À COMPLÈTER ICI !!
    }

    const urlIsValide = this.trackService.isValidURL(url);
    if (!urlIsValide) return; // ERREUR À METTRE ICI !!

    const track = await this.trackService.getTrackFromUrl(url);

    const guildPlayer = this.guildsPlayer.get(interaction.guildId);
    if (!guildPlayer) throw 'server not initialized';

    await ConnectionToChannel(guildPlayer, interaction.user.id);

    if (!(await guildPlayer.playWithTrack(track)))
      throw ErrorType.ErrorOnStartPlaying;
    interaction.editReply('OK !');
  }

  async AddCommand(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
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

  async TrackListCommand(interaction: CommandInteraction) {
    const guildPlayer = this.guildsPlayer.get(interaction.guildId);
    const subcommand = interaction.options.getSubcommand();
    const playlistName = interaction.options.getString('playlist', false);

    function getNameOfPlaylist(playlist: Playlist) {
      if (playlist.name == 'DEFAULT') return 'par defaut';
      return `"${playlist.name}"`;
    }

    function getNameOfPlaylistForTitleEmbed(playlist: Playlist) {
      if (playlist.name == 'DEFAULT') return 'Par default';
      else return `**Nom :** ${playlist.name}`;
    }

    switch (subcommand) {
      case TrackListSubCommandsName.SHOW: {
        let playlist: Playlist;

        if (playlistName) {
          const list = guildPlayer.playlists.get(playlistName);
          if (!list) {
            interaction.editReply("La liste de lecture n'existe pas !");
            return;
          }
          playlist = list;
        } else playlist = guildPlayer.playlists.currentPlaylist;

        const tracks = playlist.getAllTracks();

        let responseList = '';

        for (const index in tracks) {
          const id = parseInt(index) + 1;
          const title = tracks[index].title;
          const url = tracks[index].url;
          responseList += `**[${id})  ${
            title.length > MAX_LENGTH_TITLE_IN_EMBED
              ? title.substr(0, 60) + '...'
              : title
          }](${url})**\n`;
        }

        // responseList += `${playlist.tracks.length} piste(s)`;

        const embedMessage = new MessageEmbed()
          .setColor('GREEN')
          .setTitle('Liste de lecture :')
          .setDescription(getNameOfPlaylistForTitleEmbed(playlist))
          .addField('**Pistes :**', responseList, false)
          .addField('Nombre de piste :', `${playlist.tracks.length}`, true);

        await interaction.editReply({ embeds: [embedMessage] });
        break;
      }
      case TrackListSubCommandsName.ADD: {
        const url = interaction.options.getString('youtube-url', true);
        if (!this.trackService.isValidURL(url)) throw new Error('URL invalide');

        const tracks = await this.trackService.getTrackFromUrl(url);

        let playlist: Playlist;

        if (playlistName) {
          if (!guildPlayer.playlists.has(playlistName)) {
            guildPlayer.playlists.add(playlistName).add(tracks);
            guildPlayer.updateView();
            await interaction.editReply(
              `La playlist "${playlistName}" à été créé et la piste(s) à bien été ajouter !`,
            );
            return;
          }
        } else {
          playlist = guildPlayer.playlists.currentPlaylist;
          playlist.add(tracks);
          guildPlayer.updateView();
          await interaction.editReply(
            `La piste(s) à bien été ajouter à la liste de lecture ${getNameOfPlaylist(
              playlist,
            )} !`,
          );
        }

        break;
      }
      case TrackListSubCommandsName.REMOVE: {
        const trackId = interaction.options.getInteger('track-id', true);

        let playlist: Playlist;

        if (playlistName) {
          if (!guildPlayer.playlists.has(playlistName)) {
            throw new Error("La liste de lecture n'existe pas !");
          }
          playlist = guildPlayer.playlists.get(playlistName);
          if (!playlist.remove(trackId))
            throw new Error("La piste n'existe pas !");
        } else {
          playlist = guildPlayer.playlists.currentPlaylist;
          if (!playlist.remove(trackId))
            throw new Error("La piste n'existe pas !");
        }
        guildPlayer.updateView();
        await interaction.editReply(
          `La piste à bien été supprimer de la liste de lecture ${getNameOfPlaylist(
            playlist,
          )}`,
        );
        break;
      }
      case TrackListSubCommandsName.CLEAR: {
        let playlist: Playlist;
        if (playlistName) {
          if (!guildPlayer.playlists.has(playlistName)) {
            throw new Error("La liste de lecture n'existe pas !");
          }
          playlist = guildPlayer.playlists.get(playlistName);
          playlist.clear();
        } else {
          playlist = guildPlayer.playlists.currentPlaylist;
          playlist.clear();
        }
        await interaction.editReply(
          `La liste de le lecture ${getNameOfPlaylist(
            playlist,
          )} à bien été nettoyer !`,
        );
        break;
      }
    }
  }

  // BUTTONS

  async PlayPauseButton(interaction: ButtonInteraction) {
    try {
      await interaction.deferUpdate();
    } catch (error) {
      return;
    }
    try {
      const guildId = interaction.guildId;
      const guildPlayer = this.guildsPlayer.get(guildId);
      if (!guildPlayer) throw 'server not initialized';

      switch (guildPlayer.player.status) {
        case SimplePlayerStatus.Play:
          if (!guildPlayer.pause()) throw 'Error to start music';
          break;
        case SimplePlayerStatus.Pause:
          if (!guildPlayer.resume()) throw 'Error to start music';
          break;
        case SimplePlayerStatus.Stop:
          await ConnectionToChannel(guildPlayer, interaction.user.id);
          if (!(await guildPlayer.play())) throw 'Error to start music';
          break;
      }
    } catch (e) {
      console.error(e);
      interaction.editReply(`Error: ${e}`);
    }
  }

  async StopButton(interaction: ButtonInteraction) {
    try {
      await interaction.deferUpdate();
    } catch (error) {
      return;
    }
    try {
      const guildPlayer = this.guildsPlayer.get(interaction.guildId);
      if (!guildPlayer) throw 'server not initialized';

      guildPlayer.stop();
    } catch (e) {
      console.error(e);
      await interaction.editReply(`Error: ${e}`);
    }
  }

  async PreviousButton(interaction: ButtonInteraction) {
    try {
      await interaction.deferUpdate();
    } catch (error) {
      return;
    }
    try {
      const guildPlayer = this.guildsPlayer.get(interaction.guildId);
      if (!guildPlayer) throw 'server not initialized';

      await ConnectionToChannel(guildPlayer, interaction.user.id, false);

      if (!(await guildPlayer.previous())) throw new Error('Error to play');
    } catch (e) {
      console.error(e);
      interaction.editReply(`Error: ${e}`);
    }
  }

  async NextButton(interaction: ButtonInteraction) {
    try {
      await interaction.deferUpdate();
    } catch (error) {
      return;
    }
    try {
      const guildPlayer = this.guildsPlayer.get(interaction.guildId);
      if (!guildPlayer) throw 'server not initialized';

      await ConnectionToChannel(guildPlayer, interaction.user.id, false);

      if (!(await guildPlayer.next())) throw new Error('Error to play');
    } catch (e) {
      console.error(e);
      interaction.editReply(`Error: ${e}`);
    }
  }

  async RepeatButton(interaction: ButtonInteraction) {
    try {
      await interaction.deferUpdate();
    } catch (error) {
      return;
    }
    try {
      const guildPlayer = this.guildsPlayer.get(interaction.guildId);
      if (!guildPlayer) if (!guildPlayer) throw 'server not initialized';

      guildPlayer.changeRepeatState();
    } catch (e) {
      console.error(e);
      interaction.editReply(`Error: ${e}`);
    }
  }
}
