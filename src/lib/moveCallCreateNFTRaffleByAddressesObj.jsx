import { TransactionBlock } from '@mysten/sui.js';
import { getNetwork } from './getNetwork';
import { RafflePackageIds } from './config';
let RafflePackageId = RafflePackageIds[0];
import { CLOCK_OBJECT } from './constants';
import getSuiProvider from './getSuiProvider';
import { CoinMetadatas } from './config';
import { updateCoinMetadatas } from '@/lib/updateCoinMetadatas';
export let moveCallCreateNFTRaffleByAddressesObj = async ({
  walletKit,
  addressesObjId,
  raffleName,
  NFTs,
}) => {
  if (walletKit.currentAccount) {
    let network = getNetwork(walletKit);
    let provider = getSuiProvider(network);

    // let drand = await fetch(
    //   `https://drand.cloudflare.com/8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce/public/latest`
    // ).then((response) => response.json());
    // let round = drand.round + 2;
    // let round = drand.round;
    const tx = new TransactionBlock();
    console.log('NFTs:', NFTs);
    const NFTs_input = NFTs.map((nft) =>
      tx.objectRef({
        objectId: nft.data.objectId,
        digest: nft.data.digest,
        version: nft.data.version,
      })
    );
    let addressesObj = await provider.getObject({
      id: addressesObjId,
      options: { showContent: true },
    });
    console.log('addressesObj:', addressesObj);
    let fee_coin_type = '0x2::sui::SUI';
    let FeeInput = tx.splitCoins(tx.gas, [
      tx.pure(addressesObj.data.content.fields.fee, 'u64'),
    ]);

    tx.moveCall({
      target: `${RafflePackageId[network]}::nft_raffle::create_nft_raffle_by_addresses_obj`,
      typeArguments: [NFTs[0].data.type, fee_coin_type],
      arguments: [
        tx.pure(Array.from(new TextEncoder().encode(raffleName)), 'vector<u8>'),
        tx.object(CLOCK_OBJECT),
        tx.objectRef(addressesObj.data),
        FeeInput,
        tx.makeMoveVec({ objects: NFTs_input }),
      ],
    });

    const resData = await walletKit.signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });
    console.log('resData', resData);

    return resData;
  }
};
