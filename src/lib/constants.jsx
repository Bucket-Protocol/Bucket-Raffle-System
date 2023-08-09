import { Inputs } from '@mysten/sui.js';

export const CLOCK_OBJECT = Inputs.SharedObjectRef({
  objectId:
    '0x0000000000000000000000000000000000000000000000000000000000000006',
  mutable: false,
  initialSharedVersion: 1,
});
