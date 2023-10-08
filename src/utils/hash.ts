import { createHash } from 'crypto';

export function numToUint8Array(num: number) {
  let arr = new Uint8Array(8);

  for (let i = 0; i < 8; i++) {
    arr[i] = num % 256;
    num = Math.floor(num / 256);
  }

  return arr;
}
export function bytesToHex(bytes: Uint8Array) {
  return bytes.reduce(
    (hexString, byte) => hexString + byte.toString(16).padStart(2, '0'),
    ''
  );
}

export function sha3_256(input: any) {
  return createHash('sha3-256').update(Buffer.from(input)).digest('hex');
}

export function calculateHashByIndexAndAddress(index: number, address: any) {
  let bytesIndex = numToUint8Array(index);
  let hash_input = Buffer.concat([
    Buffer.from(bytesIndex),
    Buffer.from(address, 'hex'),
  ]);
  let hash_output = sha3_256(hash_input);
  return hash_output;
}
