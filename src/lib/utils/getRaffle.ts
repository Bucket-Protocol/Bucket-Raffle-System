import { RafflePackageId } from '@/lib/config';
import { JsonRpcProvider } from '@mysten/sui.js';

type RafflesEventData = {
  [key: string]: {
    timestampMs: string;
    prizeAmount: string;
  };
};

export const getRaffles = async (provider: JsonRpcProvider, network: any) => {
  try {
    const events = await provider?.queryEvents({
      query: {
        MoveEventType: `${RafflePackageId[network]}::raffle::CoinRaffleCreated`,
      },
    });

    if (events.hasNextPage) {
      ('');
      // 等有夠多再來寫比較快
    }
    let raffeObjIds = events.data.map((event) => event.parsedJson?.raffle_id);
    let RafflesEventData: RafflesEventData = {};
    for (let index = 0; index < events.data.length; index++) {
      const event: any = events.data[index];

      RafflesEventData[event.parsedJson.raffle_id] = {
        timestampMs: event.timestampMs,
        prizeAmount: event.parsedJson.prizeAmount,
      };
    }

    const res = await provider.multiGetObjects({
      ids: raffeObjIds,
      options: { showContent: true },
    });
    const raffles: any = res?.map((item: any) => {
      return {
        ...RafflesEventData[item.data.objectId],
        ...item.data.content,
        ...item.data.content.fields,
      };
    });
    return raffles;
  } catch (e) {
    console.log(e);
  }
};
