import getSuiProvider from '@/lib/getSuiProvider';
import { updateCoinMetadatas } from '@/lib/updateCoinMetadatas';
import { PaginatedCoins } from '@mysten/sui.js';
import { WalletAccount } from '@mysten/wallet-standard';

export async function getAllCoins(currentAccount: WalletAccount | null) {
  if (!currentAccount) return;
  const network = currentAccount.chains[0].split('sui:')[1];
  const provider = getSuiProvider(network);

  if (!provider) return;
  let nextCursor: string | null = '';
  let userCoins: any[] = [];
  let getAllCoinsRes: PaginatedCoins;

  try {
    do {
      getAllCoinsRes = await provider.getAllCoins({
        owner: currentAccount.address,
      });
      userCoins = userCoins.concat(getAllCoinsRes.data);
      nextCursor = getAllCoinsRes.nextCursor;
    } while (getAllCoinsRes.hasNextPage);

    let coinSum: any = {};
    userCoins.forEach((coin) => {
      if (coinSum[coin.coinType]) {
        coinSum[coin.coinType].balance += Number(coin.balance);
      } else {
        coinSum[coin.coinType] = {
          type: coin.coinType,
          balance: Number(coin.balance),
        };
      }
    });
    // updateCoinMetadatas(Array.from(Object.keys(coinSum)), currentAccount);
    return Array.from(Object.values(coinSum));
  } catch (e) {
    console.log(e);
  }
}
