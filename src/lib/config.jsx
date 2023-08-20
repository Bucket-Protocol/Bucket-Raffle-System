export let RafflePackageId = Object();
RafflePackageId['devnet'] =
  '0xc5c1c1d7c860399cf7e46c6513e13bca5c7935f382862c2e886fd280a4032012';

RafflePackageId['testnet'] =
  '0x595d38dba680f310c7f07dc9b3c23b74d665e9eef1a08355901127c33c224d49';

RafflePackageId['mainnet'] = '0x00';

// V2
export let RafflePackageIdV2 = Object();
RafflePackageIdV2['testnet'] =
  '0x0c1f0339563fc092f8355587a72feec10bc5517ef69ae339416fb9bf9dd46a25';

RafflePackageIdV2['mainnet'] =
  '0xa8ff9a23c6cfb36fb141585a5843be000e40a5424a868ce04aa42d5a25a11a70';

// V3
export let RafflePackageIdV3 = Object();
RafflePackageIdV3['testnet'] =
  '0x5698f5889daf24a5edd0a197b99fe3abf67dec3a609c0b7d8c9e2a76fc5a9fbd';

RafflePackageIdV3['mainnet'] =
  '0xc2355f7f321618e1c791cdd31fb5fae5b44c450424d1634b9b0cc3d94ae5dc3a';

export let RafflePackageIds = [
  {
    testnet:
      '0x201e0d9ae99aa1d93d20e5f00b52276f0b0e58713d4ec421b13c99c44dd3364d',
    mainnet:
      '0x1f13fe0b2585e181dd13f2c5119fa5d4d86939e6cbfc9663c10fd3354be701c1',
  }, // V5
  // {
  //   testnet:
  //     '0x50da84b056da95ffd9a2d7f25cd87f8c2326f318e48cea82b33dce75ed88138c',
  //   mainnet:
  //     '0x68e4581fce730187b58dfcb443ca8fddb2f1d71c6f53f5dfa882769e384a0999',
  // }, // V4
  RafflePackageIdV3,
  RafflePackageIdV2,
  RafflePackageId,
];
export let CoinMetadatas = Object();

export let DefaultAddresses = `0x04d626ce8938318165fab01491095329aee67fd017a4a17fe2c981b8a9a569cc
0x388a0e160cb67dbac3a182f1fadd31612a78fc271916db4b2f7d99d2c9ca2c72
0x0a7d09f1769a9090b82e53ccb192ab5c22cff6b884fdb527e0bb0006e9dce5c6
0xda58e4df172eefb76753d21305a9afe6aa515ed090014b2c3dc836388399d6df
0xfd8275da5c6bcf43f899e530b8de596abaa4b7ca60ab2fcb80b90255debcf3e2
0xdde07787ddf67645997e0346c0a8c7d4d8fa9d07f6e045de8b67637a237b406b
0x79d4d542dbd8c47477ce13989e59036aab64103eba6477044312d77ff22ee063
0x4e73fd2a880b40443726cffaada1a73fdede05ca1deffb0568a4d2400a824e8a
0x80b1c01fca124a8f5bf479ed81a2985192506deb715e70fcae1e1b51b049c819
0x55993454aeae431687b7b60dd04e50330c181e868f8eec29f35ec4277023201e
0x3cdf7abbe8ef487405830702cf4f4b8e1b7c11d4f25f5f4f8ab308a53ed3c5c7
0x31717b45d8aae027def8bbe77914256af6a55bc742a76f495587315e2bfbb680
0xcb9fa477172ae207d8b10d39f3eb283bc9d2abad5a0ec67f9aeaa3f266ebda38
0xf2250ae6d984cf993d7c24268722d7bc1a179db2b5511daa81e9c8c7c8abcd14`;
