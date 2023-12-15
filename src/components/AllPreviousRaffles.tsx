import * as React from 'react';
import { PreviousRaffles } from './PreviousRaffles';
import { useWalletKit } from '@mysten/wallet-kit';
import { RafflePackageIds } from '../lib/config';
import { getNetwork } from '../lib/getNetwork';
import { ConnectToWallet } from './ConnectToWallet';

export function AllPreviousRaffles() {
  const walletKit: any = useWalletKit();

  if (walletKit && walletKit.currentAccount) {
    let network = getNetwork(walletKit);
    return (
      <div className=''>
        <table className='divide-y divide-gray-200 text-left w-[90%] mx-auto'>
          <thead>
            <tr className=''>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                #
              </th>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                Name
              </th>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                Timestamp
              </th>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                Creator
              </th>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                Prizes
              </th>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                Participants
              </th>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                %
              </th>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                Action
              </th>
            </tr>
          </thead>
          {RafflePackageIds.map((RafflePackageId, i) => {
            return (
              <PreviousRaffles
                key={i}
                index={i}
                RafflePackageId={RafflePackageId[network]}
              ></PreviousRaffles>
            );
          })}
        </table>
      </div>
    );
  } else {
    return (
      <div className='mt-3 text-center'>
        <h1>Connect Wallet to start using Sui Raffle.</h1>
        <div className='mt-3'>
          <ConnectToWallet></ConnectToWallet>
        </div>
      </div>
    );
  }
}
