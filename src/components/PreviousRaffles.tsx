import * as React from 'react';

import { useWalletKit } from '@mysten/wallet-kit';
import getSuiProvider from '../lib/getSuiProvider';
import { CoinMetadatas } from '../lib/config';
import { moveCallSettleCoinRaffle } from '../lib/moveCallSettleCoinRaffle';
import { moveCallSettleNFTRaffle } from '../lib/moveCallSettleNFTRaffle';

import { getNetwork } from '../lib/getNetwork';
import { updateCoinMetadatas } from '../lib/updateCoinMetadatas';
import Button from '@/components/buttons/Button';
import { ImSpinner2 } from 'react-icons/im';
import { ConnectToWallet } from './ConnectToWallet';

type Props = {
  index: number;
  RafflePackageId: string;
};

export function PreviousRaffles({ index, RafflePackageId }: Props) {
  console.log('index', index);
  const walletKit: any = useWalletKit();
  const [raffles, setRaffles] = React.useState([]);
  // const [raffleFetched, setRaffleFetched] = React.useState(false);
  const [actionPending, setActionPending] = React.useState<any>({});
  const [coinMetadatasReady, setCoinMetadatasReady] = React.useState(false);
  const [listedNftIds, setListedNftIds] = React.useState([]);
  const [listedNftObjs, setListedNftObjs] = React.useState<any>({});

  React.useEffect(() => {
    if (
      walletKit &&
      walletKit.currentAccount &&
      Object.keys(listedNftObjs).length == 0 &&
      listedNftIds.length
    ) {
      let run = async () => {
        let network = getNetwork(walletKit);
        let provider = getSuiProvider(network);
        let NftObjs = Object();

        let res: any = await provider?.multiGetObjects({
          ids: listedNftIds,
          options: { showContent: true, showDisplay: true },
        });
        for (let index = 0; index < listedNftIds.length; index++) {
          const id = listedNftIds[index];
          const obj = res[index].data;
          NftObjs[id] = obj;
        }

        setListedNftObjs(NftObjs);
      };
      run();
    }
  }, [listedNftIds, walletKit, listedNftObjs]);

  React.useEffect(() => {
    let nftObjIds: any = [];
    let nft_raffles = raffles.filter((raffle: any) =>
      raffle.type.includes('nft_raffle::NFT_Raffle')
    );

    for (let index = 0; index < nft_raffles.length; index++) {
      let raffle: any = nft_raffles[index];
      nftObjIds = nftObjIds.concat(
        raffle.createdEventParsedJson.reward_nft_ids
      );
    }
    setListedNftIds(nftObjIds);
  }, [raffles]);

  React.useEffect(() => {
    if (walletKit && walletKit.currentAccount) {
      let run = async () => {
        let network = getNetwork(walletKit);
        let provider = getSuiProvider(network);
        let datas: any = [];
        let cursor = '';
        do {
          let res: any = await provider?.queryEvents({
            query: {
              MoveEventType: `${RafflePackageId}::raffle::CoinRaffleCreated`,
            },
          });
          datas = datas.concat(res.data);
          if (res.hasNextPage) {
            cursor = res.nextCursor;
            // 等有夠多再來寫比較快
          } else {
            cursor = '';
          }
        } while (cursor);
        do {
          let res: any = await provider?.queryEvents({
            query: {
              MoveEventType: `${RafflePackageId}::nft_raffle::NftRaffleCreated`,
            },
          });
          datas = datas.concat(res.data);
          if (res.hasNextPage) {
            cursor = res.nextCursor;
            // 等有夠多再來寫比較快
          } else {
            cursor = '';
          }
        } while (cursor);
        let raffeObjIds = datas.map((event: any) => event.parsedJson.raffle_id);
        let RafflesEventData: any = {};
        for (let index = 0; index < datas.length; index++) {
          const event: any = datas[index];

          RafflesEventData[event.parsedJson.raffle_id] = {
            timestampMs: event.timestampMs,
            createdEventParsedJson: event.parsedJson,
          };
        }

        let res = await provider?.multiGetObjects({
          ids: raffeObjIds,
          options: { showContent: true },
        });
        let raffles: any = res?.map((item: any) => {
          return {
            ...RafflesEventData[item.data.objectId],
            ...item.data.content,
            ...item.data.content.fields,
          };
        });
        raffles.sort((a: any, b: any) => {
          return Number(b.timestampMs) - Number(a.timestampMs);
        });

        setRaffles(raffles);
        let raffleTypes = raffles.map((raffle: any) =>
          getRaffleCoinType(raffle.type)
        );
        await updateCoinMetadatas(raffleTypes, walletKit);
        setCoinMetadatasReady(true);
      };
      run();
      if (index == 0) {
        // TODO: Ray: When New raffle created or Settled, update it.
        // window.addEventListener('New Raffle Created', (event) => {
        //   console.log(
        //     event,
        //     "window.addEventListener('New Raffle Created', () => {"
        //   );
        //   run();
        // });
        // window.addEventListener('New Raffle Settled', (event) => {
        //   console.log(
        //     event,
        //     "window.addEventListener('New Raffle Settled', () => {"
        //   );
        //   run();
        // });
      }
    }
  }, [walletKit]);
  // if (createRaffleEvents.length) {
  //   let newRaffleEvents = updateRaffleEventsCoinMetadata(
  //     createRaffleEvents,
  //     walletKit
  //   );
  // }

  if (raffles.length) {
    return (
      <tbody>
        {raffles.map((raffle: any, index) => {
          let coinMetadata = CoinMetadatas[getRaffleCoinType(raffle.type)];
          let settleRaffleButtonId = `settle-raffle-${index}-${raffle.id.id}`;
          let icon = () => {
            if (coinMetadata.iconUrl) {
              return (
                <img
                  className='inline-block h-6 w-6 mx-1'
                  src={coinMetadata.iconUrl}
                />
              );
            } else {
              return <></>;
            }
          };
          let prizeField = () => {
            return <></>;
          };
          let settleFunction = moveCallSettleCoinRaffle;
          if (raffle.type.includes('::Raffle')) {
            prizeField = () => {
              if (coinMetadatasReady) {
                return (
                  <span>
                    {raffle.createdEventParsedJson.prizeAmount /
                      10 ** coinMetadata.decimals}{' '}
                    {icon()}
                    {coinMetadata.name}
                  </span>
                );
              } else {
                return <span></span>;
              }
            };
            settleFunction = moveCallSettleCoinRaffle;
          } else if (raffle.type.includes('::NFT_Raffle')) {
            prizeField = () => {
              if (Object.keys(listedNftObjs).length) {
                let network = getNetwork(walletKit);
                console.log(raffle.createdEventParsedJson.reward_nft_ids);
                return (
                  <div className='overflow-x-auto'>
                    {raffle.createdEventParsedJson.reward_nft_ids.length}{' '}
                    NFT(s):
                    {raffle.createdEventParsedJson.reward_nft_ids.map(
                      (id: string, index: number) => {
                        console.log('listedNftObjs', listedNftObjs[id]);
                        return (
                          <a
                            key={index}
                            // href={`https://suiexplorer.com/object/${id}?network=https%3A%2F%2Fsui-${network}-endpoint.blockvision.org`}
                            href={`https://suiexplorer.com/object/${id}?network=${network}`}
                            target='_blank'
                          >
                            <img
                              src={listedNftObjs[id].display.data.image_url}
                              className='h-7 inline-block rounded'
                            ></img>
                          </a>
                        );
                      }
                    )}
                  </div>
                );
              }
              return <span>NFTs</span>;
            };
            settleFunction = moveCallSettleNFTRaffle;
          }
          let handleSettleCoinRaffle = async () => {
            actionPending[settleRaffleButtonId] = true;
            setActionPending({
              ...actionPending,
            });

            let result = await settleFunction({
              raffleObjId: raffle.id.id,
              walletKit,
            });
            if (result) {
              raffle.status = 1;
              setRaffles([...raffles]);
            }
            actionPending[settleRaffleButtonId] = undefined;
            setActionPending({
              ...actionPending,
            });
          };

          let handleViewRaffle = () => {
            let network = walletKit.currentAccount.chains[0].split('sui:')[1];
            window.open(
              `https://suiexplorer.com/object/${raffle.id.id}?network=${network}`,
              // `https://suiexplorer.com/object/${raffle.id.id}?network=https%3A%2F%2Fsui-${network}-endpoint.blockvision.org`,
              '_blank'
            );
          };
          let raffleActions = () => {
            if (raffle.status == 0) {
              // In Progress
              return (
                <Button
                  className='bg-green-500 hover:bg-green-700 rounded-lg text-white'
                  onClick={handleSettleCoinRaffle}
                  id={settleRaffleButtonId}
                  disabled={actionPending[settleRaffleButtonId]}
                  style={
                    actionPending[settleRaffleButtonId]
                      ? { cursor: 'wait' }
                      : {}
                  }
                >
                  {actionPending[settleRaffleButtonId] && (
                    <ImSpinner2 className='animate-spin mr-2'></ImSpinner2>
                  )}
                  Settle Raffle
                </Button>
              );
            } else if (raffle.status == 1) {
              // Settled
              return (
                <Button
                  className='bg-blue-500 hover:bg-blue-700 rounded-lg text-white'
                  onClick={handleViewRaffle}
                >
                  View Raffle
                </Button>
              );
            }
          };
          let displayAddress = () => {
            let network = getNetwork(walletKit);
            return (
              <a
                href={`https://suiexplorer.com/address/${raffle.creator}?network=${network}`}
                target='_blank'
                className='text-blue-500 hover:text-blue-800'
              >
                {`${raffle.creator.substring(
                  0,
                  5
                )}...${raffle.creator.substring(raffle.creator.length - 3)}`}
              </a>
            );
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
                {displayAddress()}
              </td>
              <td className='py-4 px-6 border-b border-gray-200'>
                {prizeField()}
              </td>
              <td className='py-4 px-6 border-b border-gray-200'>
                {raffle.participantCount ||
                  raffle.participants.length + raffle.winners.length}
              </td>
              <td className='py-4 px-6 border-b border-gray-200'>{`${
                raffle.winnerCount
              }/${
                raffle.participantCount ||
                raffle.participants.length + raffle.winners.length
              }`}</td>
              <td className='py-4 px-6 border-b border-gray-200'>
                {raffleActions()}
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  } else if (index == 0) {
    return <>Loading...</>;
  } else {
    return <></>;
  }
}
function parseTimestamp(timestamp: number) {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
function getRaffleCoinType(type: string) {
  return type.split('<')[1].split('>')[0];
}
