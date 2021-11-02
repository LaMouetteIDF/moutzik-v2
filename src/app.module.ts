import { Module } from '@nestjs/common';
import {
  ConfigModule as ConfigModuleNest,
  ConfigService,
} from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';

import { AppService } from './app.service';

import { ClientModule } from './client/client.module';
import { InteractionsModule } from './interactions/interactions.module';
import { PlayerModule } from './player/player.module';
import { StoreModule } from './store/store.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModuleNest.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({
      // set this to `true` to use wildcards
      wildcard: true,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: true,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 10,
      // show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: true,
      // disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useCreateIndex: true,
        connectionFactory: async (connection) => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          // connection.plugin(require('mongoose-autopopulate'));

          connection.on('connected', () => {
            console.log('Connected to database');
          });
          connection.on('disconnected', () => {
            console.log('Disconnected to database');
          });

          connection.on('error', (error) => {
            console.debug('OnError error', error);
          });

          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    StoreModule,
    InteractionsModule,
    ClientModule,
    PlayerModule,
    ConfigModule,
  ],
  providers: [AppService],
})
export class AppModule {}
