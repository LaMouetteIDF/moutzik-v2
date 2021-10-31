import { ButtonsCustomIds } from 'src/interactions/buttons';
import { ActionButton } from './types';

export const ButtonsDataState: Array<ActionButton> = [
  {
    // PLAY / PAUSE BTN
    id: ButtonsCustomIds.PlayPause,
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
    id: ButtonsCustomIds.Stop,
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
    id: ButtonsCustomIds.Previous,
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
    id: ButtonsCustomIds.Next,
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
    id: ButtonsCustomIds.Repeat,
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
        payload: '🔂',
        style: 'SUCCESS',
        disable: false,
      },
    ],
  },
];
