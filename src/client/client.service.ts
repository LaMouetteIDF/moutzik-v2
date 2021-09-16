import { Inject, Injectable } from '@nestjs/common';
import { Client, ClientOptions } from 'discord.js';

@Injectable()
export class ClientService extends Client {
  constructor(@Inject('CLIENT_OPTIONS') clientOptions: ClientOptions) {
    super(clientOptions);
    this.on('ready', ({ user }) => {
      console.log(`Le client est bien connecter a ${user.tag}!`);
    });
    this.isReady();
  }
}
