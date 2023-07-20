import getSuiProvider from './getSuiProvider';
import { CoinMetadatas } from './config';
import { sleep } from '../lib/sleep.jsx';
import { WalletAccount } from '@mysten/wallet-standard';

export async function updateCoinMetadatas(
  coinTypes: string[],
  currentAccount: WalletAccount
) {
  let network = currentAccount.chains[0].split('sui:')[1];
  let provider = getSuiProvider(network);
  let coinTypeSet = Array.from(new Set(coinTypes));
  for (let coinType of coinTypeSet) {
    if (CoinMetadatas[coinType]) {
      continue;
    }
    while (CoinMetadatas) {
      try {
        let coinMetadata: any = await provider?.getCoinMetadata({
          coinType,
        });
        CoinMetadatas[coinType] = coinMetadata;
        break;
      } catch (e: any) {
        if (e.message == 'Rate limit') {
          await sleep(1000);
          continue;
        }
      }
    }
  }
}
