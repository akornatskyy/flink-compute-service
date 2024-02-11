#!/usr/bin/env node
/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable no-undef */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */

require('../dist')
  .main()
  .catch(console.error);
