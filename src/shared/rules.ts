import {Rule} from 'check-compiler';

export const nextToken: Rule<string> = {type: 'string', min: 40, max: 50};

export const name: Rule<string> = {type: 'string', min: 1, max: 50};

export const architecture: Rule<string> = {
  type: 'string',
  min: 5,
  max: 6,
  pattern: /^(arm64|x86_64)$/,
  messages: {
    'string pattern': 'Required to be either x86_64 or arm64.',
  },
};
