import { createHash } from 'crypto';

function numToUint8Array(num) {
  let arr = new Uint8Array(8);

  for (let i = 0; i < 8; i++) {
    arr[i] = num % 256;
    num = Math.floor(num / 256);
  }

  return arr;
}
function bytesToHex(bytes) {
  return bytes.reduce(
    (hexString, byte) => hexString + byte.toString(16).padStart(2, '0'),
    ''
  );
}

let sha3_256 = (input) => {
  return createHash('sha3-256').update(Buffer.from(input)).digest('hex');
};

let index = 7777777777777888;
let bytesIndex = numToUint8Array(index);
console.log(bytesIndex);
console.log(bytesToHex(bytesIndex), bytesToHex(numToUint8Array(index)));

let inp = Buffer.concat([
  Buffer.from(bytesIndex),
  Buffer.from(
    '96d9a120058197fce04afcffa264f2f46747881ba78a91beb38f103c60e315ae',
    'hex'
  ),
]);
let a = sha3_256(inp);

console.log(a);
