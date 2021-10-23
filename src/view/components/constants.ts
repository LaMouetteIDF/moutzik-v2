import { ActionButton } from './types';

export const ButtonsDataState: Array<ActionButton> = [
  {
    // PLAY / PAUSE BTN
    id: 'play_pause',
    states: [
      {
        id: 'PLAY',
        payload: '▶',
        default: true,
        style: 'PRIMARY',
        disable: false,
      },
      {
        id: 'PAUSE',
        payload: '⏸',
        style: 'SECONDARY',
        disable: false,
      },
    ],
  },
  {
    // STOP BTN
    id: 'stop',
    states: [
      {
        id: 'DENIE',
        payload: '⏹',
        default: true,
        style: 'DANGER',
        disable: true,
      },
      {
        id: 'ALLOW',
        payload: '⏹',
        style: 'DANGER',
        disable: false,
      },
    ],
  },
  {
    // PREV BTN
    id: 'prev',
    states: [
      {
        id: 'DEFAULT',
        payload: '⏪',
        style: 'SECONDARY',
        disable: false,
      },
    ],
  },
  {
    // NEXT BTN
    id: 'next',
    states: [
      {
        id: 'DEFAULT',
        payload: '⏩',
        style: 'SECONDARY',
        disable: false,
      },
    ],
  },

  {
    // REPEAT BTN
    id: 'repeat',
    states: [
      {
        id: 'NONE',
        payload: '🔁',
        default: true,
        style: 'SECONDARY',
        disable: false,
      },
      {
        id: 'ALL',
        payload: '🔁',
        style: 'PRIMARY',
        disable: false,
      },
      {
        id: 'ONE',
        payload: '🔁',
        style: 'SUCCESS',
        disable: false,
      },
    ],
  },
  {
    // MUTE BTN
    id: 'mute',
    states: [
      {
        id: 'DISABLE',
        payload: '🔇',
        style: 'SECONDARY',
        disable: false,
      },
      {
        id: 'ACTIVE',
        payload: '🔇',
        style: 'DANGER',
        disable: false,
      },
    ],
  },
  {
    // VOL_DOWN BTN
    id: 'vol_down',
    states: [
      {
        id: 'DEFAULT',
        payload: '🔉',
        style: 'PRIMARY',
        disable: false,
      },
    ],
  },
  {
    // VOL_UP
    id: 'vol_up',
    states: [
      {
        id: 'DEFAULT',
        payload: '🔊',
        style: 'PRIMARY',
        disable: false,
      },
    ],
  },
];
