import { TransactionBlock } from '@mysten/sui.js';
import { getNetwork } from './getNetwork';
import { RafflePackageIds } from './config';
let RafflePackageId = RafflePackageIds[0];
import { CLOCK_OBJECT } from './constants';
import getSuiProvider from './getSuiProvider';
import { CoinMetadatas } from './config';
import { updateCoinMetadatas } from '@/lib/updateCoinMetadatas';
export let moveCallCreateCoinRaffleByAddressesObj = async ({
  walletKit,
  addressesObjId,
  raffleName,
  winnerCount,
  prizeBalance,
  coin_type,
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
    let coinInput = undefined;

    if (coin_type === '0x2::sui::SUI') {
      coinInput = tx.splitCoins(tx.gas, [
        tx.pure(prizeBalance * 10 ** 9, 'u64'),
      ]);
    } else {
      await updateCoinMetadatas([coin_type], walletKit);

      let userCoins = [];

      let res = {};
      do {
        res = await provider.getAllCoins({
          owner: walletKit.currentAccount.address,
          coinType: coin_type,
          cursor: res.nextCursor,
        });
        userCoins = userCoins.concat(res.data);
      } while (res.hasNextPage);
      const [mainCoin, ...otherCoins] = userCoins
        .filter((coin) => coin.coinType === coin_type)
        .map((coin) =>
          tx.objectRef({
            objectId: coin.coinObjectId,
            digest: coin.digest,
            version: coin.version,
          })
        );
      if (mainCoin) {
        if (otherCoins.length > 0) {
          tx.mergeCoins(mainCoin, otherCoins);
          coinInput = tx.splitCoins(mainCoin, [
            tx.pure(
              prizeBalance * 10 ** (CoinMetadatas[coin_type].decimals ?? 9),
              'u64'
            ),
          ]);
        } else {
          coinInput = tx.splitCoins(mainCoin, [
            tx.pure(
              prizeBalance * 10 ** (CoinMetadatas[coin_type].decimals ?? 9),
              'u64'
            ),
          ]);
        }
      }
    }
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
      target: `${RafflePackageId[network]}::raffle::create_coin_raffle_by_addresses_obj`,
      typeArguments: [coin_type, fee_coin_type],
      arguments: [
        tx.pure(Array.from(new TextEncoder().encode(raffleName)), 'vector<u8>'),
        tx.object(CLOCK_OBJECT),
        tx.objectRef(addressesObj.data),
        FeeInput,
        tx.pure(parseInt(winnerCount), 'u64'),
        coinInput,
      ],
    });

    const resData = await walletKit.signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });
    console.log('resData', resData);

    return resData;
  }
};
