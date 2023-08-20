import React, { useEffect, useState } from 'react';
import { useWalletKit } from '@mysten/wallet-kit';
import getSuiProvider from '../lib/getSuiProvider';
import { moveCallCreateCoinRaffle } from '../lib/moveCallCreateCoinRaffle';
import { moveCallSettleCoinRaffle } from '../lib/moveCallSettleCoinRaffle';
import { moveCallCreateCoinRaffleByAddressesObj } from '../lib/moveCallCreateCoinRaffleByAddressesObj';
import { getRaffleFields } from '../lib/getRaffleFields';
import { CoinMetadatas, DefaultAddresses } from '../lib/config';
import { updateCoinMetadatas } from '@/lib/updateCoinMetadatas';
import RingAnimation from './RingAnimation';
import { sleep } from '../lib/sleep.jsx';
import { getNetwork, getNetworkIgnoreError } from '../lib/getNetwork';
import axios from 'axios';

export default function CreateCoinRaffle() {
  let walletKit = useWalletKit();

  const [startRaffleDigest, setStartRaffleDigest] = useState('');
  const [currentRaffleObjId, setCurrentRaffleObjId] = useState('');
  const [currentRaffleFields, setCurrentRaffleFields] = useState({});
  const [txRunning, setTxRunning] = useState(false);
  const [userCoinsList, setUserCoinsList] = useState([]);

  const [coinMetadataReady, setCoinMetadataReady] = useState(false);
  const [currentCoinInfo, setCurrentCoinInfo] = useState({
    iconUrl: null,
    coinType: '0x2::sui::SUI',
    name: 'Sui',
    symbol: 'SUI',
  });
  useEffect(() => {
    let run = async () => {
      if (
        walletKit &&
        walletKit.currentAccount &&
        walletKit.currentAccount.chains
      ) {
        let network = walletKit.currentAccount.chains[0].split('sui:')[1];
        let provider = getSuiProvider(network);
        let userCoins = [];
        let nextCursor = '';
        let res;
        do {
          res = await provider.getAllCoins({
            owner: walletKit.currentAccount.address,
            nextCursor,
          });
          userCoins = userCoins.concat(res.data);
          nextCursor = res.nextCursor;
        } while (res.hasNextPage);
        let coinSum = {};
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
        setUserCoinsList(Array.from(Object.values(coinSum)));
        console.log(
          'Array.from(Object.values(coinSum)):',
          Array.from(Object.values(coinSum))
        );
        await updateCoinMetadatas(Array.from(Object.keys(coinSum)), walletKit);
        setCoinMetadataReady(true);

        // todo: may have next cursor
      }
    };
    run();
  }, [walletKit]);

  useEffect(() => {
    let run = async () => {
      if (
        currentRaffleObjId &&
        !currentRaffleFields.id &&
        walletKit &&
        walletKit.currentAccount
      ) {
        let raffleFields = await getRaffleFields({
          walletKit,
          raffleObjId: currentRaffleObjId,
        });
        setCurrentRaffleFields(raffleFields);
        console.log('raffleFields:', raffleFields);
        setRaffleName(raffleFields.name);
        setWinnerCount(raffleFields.winner_count);
        await updateCoinMetadatas([raffleFields.coin_type], walletKit);
        setPrizeBalance(
          raffleFields.balance /
            10 ** CoinMetadatas[raffleFields.coin_type].decimals
        ); //
      }
    };
    run();
  }, [walletKit, currentRaffleObjId, currentRaffleFields]);

  useEffect(() => {
    let run = async () => {
      if (
        walletKit &&
        walletKit.currentAccount &&
        walletKit.currentAccount.chains &&
        startRaffleDigest
      ) {
        try {
          let network = walletKit.currentAccount.chains[0].split('sui:')[1];
          let provider = getSuiProvider(network);
          // console.log('walletKit:', walletKit);
          let transactionBlock = await provider.getTransactionBlock({
            digest: startRaffleDigest,
            options: { showObjectChanges: true },
          });
          setTxRunning(false);
          let raffleObjId = transactionBlock.objectChanges.filter((obj) => {
            return (
              obj.type == 'created' &&
              obj.objectType.includes('::raffle::Raffle')
            );
          })[0].objectId;
          setCurrentRaffleObjId(raffleObjId);
        } catch (e) {
          console.log('ERROR:', e);
          await sleep(1000);
          run();
        }
      }
    };
    run();
  }, [walletKit, startRaffleDigest]);

  // raffle name Handeler
  let raffleNameDefault = '';
  const [raffleName, setRaffleName] = useState(raffleNameDefault);
  const handleRaffleNameChange = (event) => {
    setRaffleName(event.target.value);
  };
  // prizeBlance Handeler
  let prizeBalanceDefault = 0;
  const [prizeBalance, setPrizeBalance] = useState(prizeBalanceDefault);
  const handlePrizeBalanceChange = (event) => {
    setPrizeBalance(event.target.value);
  };
  // winnerCount Handeler
  let winnerCountDefault = 1;
  const [winnerCount, setWinnerCount] = useState(winnerCountDefault);
  const handleWinnerCountChange = (event) => {
    setWinnerCount(event.target.value);
  };
  // addresses Handeler
  const [addresses, setAddresses] = useState(DefaultAddresses);
  const handleAddressesChange = (event) => {
    setAddresses(event.target.value);
  };
  const handleSettleRaffle = async (event) => {
    setTxRunning(true);
    let result;
    try {
      result = await moveCallSettleCoinRaffle({
        walletKit,
        raffleObjId: currentRaffleObjId,
      });
    } catch (e) {
      setTxRunning(false);
      return;
    }
    setTxRunning(false);
    window.dispatchEvent(new CustomEvent('New Raffle Settled', {}));
    if (result) {
      let updateRaffleFields = async () => {
        let raffleFields = await getRaffleFields({
          walletKit,
          raffleObjId: currentRaffleObjId,
        });
        setCurrentRaffleFields(raffleFields);
      };
      await updateRaffleFields();
      setTimeout(updateRaffleFields, 1000);
    } else {
      alert(
        'This raffle is not ready yet. Please wait a few seconds and try again.'
      );
    }
  };
  const handleStartRaffle = async (event) => {
    let _winnerCount = Number(winnerCount) || 1;
    let _prizeBalance = prizeBalance || prizeBalanceDefault;
    let _addresses = addresses.split('\n');
    setTxRunning(true);

    let coin_type = currentCoinInfo.coinType;

    let resData;
    try {
      if (_addresses.length > 400) {
        console.log('Will Use AddressObj');

        const userAddress = walletKit.currentAccount.address;
        const data = JSON.stringify({
          addresses: _addresses,
          network: 'testnet',
          user_address: userAddress,
        });

        const headers = { 'Content-type': 'application/json' };
        let response = await axios.post(
          'https://injoy4.intag.io/addressesobj/new',
          data,
          { headers }
        );
        let addressObj_DataId = response.data.id;
        let res;
        while (addressObj_DataId) {
          res = await axios.get(
            `https://injoy4.intag.io/addressesobj/${addressObj_DataId}`
          );
          if (res.data.ready) break;
          await sleep(1000);
        }
        let addressesObjInput = res.data.share_object_ref;
        let total_fee = res.data.total_fee;

        resData = await moveCallCreateCoinRaffleByAddressesObj({
          walletKit,
          addressesObjInput,
          total_fee,
          raffleName,
          winnerCount: _winnerCount,
          prizeBalance,
          coin_type,
        });
      } else {
        resData = await moveCallCreateCoinRaffle({
          walletKit,
          addresses: _addresses,
          raffleName,
          winnerCount: _winnerCount,
          prizeBalance,
          coin_type,
        });
      }
    } catch (e) {
      // print the error detail
      console.log('ERROR at moveCallCreateCoinRaffle:', e);
      setTxRunning(false);
      return;
    }
    console.log('resData:', resData);
    window.dispatchEvent(new CustomEvent('New Raffle Created', {}));

    let network = walletKit.currentAccount.chains[0].split('sui:')[1];
    let provider = getSuiProvider(network);

    setStartRaffleDigest(resData.digest);
  };

  return (
    <div className='w-full bg-gray-800 py-6 shadow'>
      <div className='flex flex-col w-[90%] mx-auto'>
        <div className='flex mb-4'>
          <div className='w-1/2'>
            <div className='border-gray-light2 bg-white text-black relative my-2 flex items-center rounded-lg border px-2 py-1'>
              <label className='w-full '>Raffle Name</label>
              <input
                type='text'
                className='placeholder-gray-light2 block w-full rounded-lg border-transparent bg-transparent '
                placeholder='Name of your Raffle'
                value={raffleName}
                onChange={handleRaffleNameChange}
                disabled={currentRaffleObjId}
              />
            </div>
            <div className='border-gray-light2 bg-white text-black relative my-2 flex items-center rounded-lg border px-2 py-1'>
              <label className='w-full '>How Many Winners?</label>
              <input
                type='number'
                className='placeholder-gray-light2 block w-full rounded-lg border-transparent bg-transparent '
                placeholder='1'
                value={winnerCount}
                onChange={handleWinnerCountChange}
                disabled={currentRaffleObjId}
              />
            </div>
            <div className='border-gray-light2 bg-white text-black relative my-2 flex items-center rounded-lg border px-2 py-1'>
              <label className='w-48'>Prize Amount</label>
              <input
                type='number'
                className='placeholder-gray-light2 block w-full rounded-lg border-transparent bg-transparent p-2 pr-32 text-sm focus:outline-none lg:text-lg mx-3'
                placeholder='0'
                onChange={handlePrizeBalanceChange}
                value={prizeBalance || ''}
                disabled={currentRaffleObjId}
              />
              <div className='w-38 absolute inset-y-0 right-0 flex items-center rounded-lg'>
                {/* <button
            className='bg-gray-light3 text-primary-default m-2 rounded-lg px-2 py-1'
            // style='visibility: visible;'
          >
            Max
          </button> */}
                <button
                  id='coinSelectDropdownButton'
                  data-dropdown-toggle='coinSelectDropdown'
                  className='inline-flex items-center px-5 py-2.5 text-center text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                  type='button'
                  // disabled={currentRaffleObjId} // why I have this line?
                >
                  {CoinMetadatas[currentCoinInfo.coinType] &&
                    CoinMetadatas[currentCoinInfo.coinType].iconUrl && (
                      <img
                        className='inline-block h-6 w-6 mx-1'
                        src={CoinMetadatas[currentCoinInfo.coinType].iconUrl}
                      />
                    )}
                  {currentCoinInfo.name || currentCoinInfo.symbol}
                  <svg
                    className='ml-2.5 h-2.5 w-2.5'
                    aria-hidden='true'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 10 6'
                  >
                    <path
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='m1 1 4 4 4-4'
                    />
                  </svg>
                </button>
                <div
                  id='coinSelectDropdown'
                  className='z-10 hidden w-64 divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700'
                >
                  <ul
                    className='py-2 text-sm text-gray-700 dark:text-gray-200'
                    aria-labelledby='coinSelectDropdownButton'
                  >
                    {userCoinsList.map((coin, index) => {
                      if (coinMetadataReady && CoinMetadatas[coin.type]) {
                        let icon = () => {
                          if (CoinMetadatas[coin.type].iconUrl) {
                            return (
                              <img
                                className='inline-block h-6 w-6 mx-1'
                                src={CoinMetadatas[coin.type].iconUrl}
                              />
                            );
                          } else {
                            return <></>;
                          }
                        };
                        let handleOnClick = () => {
                          setCurrentCoinInfo({
                            coinType: coin.type,
                            ...CoinMetadatas[coin.type],
                          });
                          document
                            .getElementById('coinSelectDropdownButton')
                            .click();
                        };
                        return (
                          <li key={`${index}`}>
                            <button
                              className='block w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'
                              onClick={handleOnClick}
                            >
                              {icon()}
                              {(
                                coin.balance /
                                10 ** CoinMetadatas[coin.type].decimals
                              ).toFixed(2)}{' '}
                              {CoinMetadatas[coin.type].name ||
                                CoinMetadatas[coin.type].symbol}{' '}
                            </button>
                          </li>
                        );
                      } else {
                        return <li key={`${index}`}></li>;
                      }
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className='w-1/2'>
            <div className='ml-2 my-2 h-full'>
              <p className='text-white'>
                Participants' Addresses ({addresses.split('\n').length})
              </p>
              <textarea
                className='w-full h-3/4 rounded p-2 overflow-x-auto text-sm'
                value={addresses}
                onChange={handleAddressesChange}
              ></textarea>
            </div>
          </div>
        </div>
        {(txRunning && (
          <div className='w-[90%] mx-auto text-center'>
            <RingAnimation></RingAnimation>
          </div>
        )) ||
          (currentRaffleFields.winners &&
            currentRaffleFields.winners.length && (
              <div>
                <div className='w-full rounded bg-white px-4 py-2 text-center mb-3'>
                  <p>🎊 Winners 🎊</p>
                  {currentRaffleFields.winners.map((address, index) => (
                    <p key={index}>{address}</p>
                  ))}
                </div>
                <button
                  className='w-full bg-green-500 hover:bg-green-700 rounded-lg px-4 py-1 text-white'
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Create Another Raffle
                </button>
              </div>
            )) ||
          (!currentRaffleObjId && (
            <button
              className='w-full bg-blue-500 hover:bg-blue-700 rounded-lg px-4 py-1 text-white'
              onClick={handleStartRaffle}
              disabled={!winnerCount || !addresses}
            >
              Start Raffle {getNetworkIgnoreError(walletKit, 'on ')}
            </button>
          )) || (
            <button
              className='w-full bg-green-500 hover:bg-green-700 rounded-lg px-4 py-1 text-white'
              onClick={handleSettleRaffle}
            >
              Settle Raffle {getNetworkIgnoreError(walletKit, 'on ')}
            </button>
          )}
      </div>
    </div>
  );
}
