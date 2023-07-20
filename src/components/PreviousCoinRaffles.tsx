import React, { useState } from 'react';
import { useWalletKit } from '@mysten/wallet-kit';
import getSuiProvider from '../lib/getSuiProvider';
import { CoinMetadatas } from '../lib/config';
import { moveCallSettleCoinRaffle } from '../lib/moveCallSettleCoinRaffle';
import { useQuery } from '@tanstack/react-query';
import { getRaffles } from '@/lib/utils/getRaffle';
import { JsonRpcProvider } from '@mysten/sui.js';
import { getRaffleCoinType, parseTimestamp } from '@/lib/utils/utils';

export function PreviousCoinRaffles() {
  const walletKit = useWalletKit();
  const network = walletKit.currentAccount?.chains[0].split('sui:')[1];
  const provider = getSuiProvider(network);
  const [coinMetadatasReady, setCoinMetadatasReady] = useState(false);
  const {
    data: raffles,
    refetch: refetchRaffles,
    isLoading: loadingRaffles,
  } = useQuery({
    queryKey: ['getRaffles'],
    queryFn: () => getRaffles(provider as JsonRpcProvider, network),
    enabled: !!provider && !!walletKit.currentAccount,
  });

  console.log('raffles', raffles);

  //! Fix
  // TODO: ray: 需要queryEvents 只發生一次就夠了，但要等 walletKit Ready

  if (raffles) {
    return (
      <div className=''>
        <table className='min-w-full divide-y divide-gray-200 text-left'>
          <thead>
            <tr>
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
                Total Reward
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
          <tbody>
            {raffles.map((raffle: any, index: any) => {
              let coinMetadata = CoinMetadatas[getRaffleCoinType(raffle.type)];
              let prizeField = () => {
                if (coinMetadatasReady) {
                  return (
                    <span>
                      {raffle.prizeAmount / 10 ** coinMetadata.decimals}{' '}
                      {coinMetadata.name}
                    </span>
                  );
                } else {
                  return <span></span>;
                }
              };
              let handleSettleRaffle = async () => {
                let result = await moveCallSettleCoinRaffle({
                  raffleObjId: raffle.id.id,
                  walletKit,
                });
                if (result) {
                  raffle.status = 1;
                  refetchRaffles();
                }
              };
              let handleViewRaffle = () => {
                let network =
                  walletKit.currentAccount?.chains[0].split('sui:')[1];
                window.open(
                  `https://suiexplorer.com/object/${raffle.id.id}?network=${network}`,
                  '_blank'
                );
              };
              let raffleActions = () => {
                if (raffle.status == 0) {
                  // In Progress
                  return (
                    <button
                      className='bg-green-500 hover:bg-green-700 rounded-lg px-4 py-1 text-white'
                      onClick={handleSettleRaffle}
                    >
                      Settle Raffle
                    </button>
                  );
                } else if (raffle.status == 1) {
                  // Settled
                  return (
                    <button
                      className='bg-blue-500 hover:bg-blue-700 rounded-lg px-4 py-1 text-white'
                      onClick={handleViewRaffle}
                    >
                      View Raffle
                    </button>
                  );
                }
              };
              return (
                <tr key={index}>
                  <td className='py-4 px-6 border-b border-gray-200'>
                    {index + 1}
                  </td>
                  <td className='py-4 px-6 border-b border-gray-200'>
                    {raffle.name}
                  </td>

                  <td className='py-4 px-6 border-b border-gray-200'>
                    {parseTimestamp(Number(raffle.timestampMs))}
                  </td>
                  <td className='py-4 px-6 border-b border-gray-200'>
                    {`${raffle.creator.substring(
                      0,
                      5
                    )}...${raffle.creator.substring(
                      raffle.creator.length - 3
                    )}`}
                  </td>
                  <td className='py-4 px-6 border-b border-gray-200'>
                    {prizeField()}
                  </td>
                  <td className='py-4 px-6 border-b border-gray-200'>
                    {raffle.participants.length}
                  </td>
                  <td className='py-4 px-6 border-b border-gray-200'>{`${raffle.winnerCount}/${raffle.participants.length}`}</td>
                  <td className='py-4 px-6 border-b border-gray-200'>
                    {raffleActions()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
  return <div>Loading</div>;
}
