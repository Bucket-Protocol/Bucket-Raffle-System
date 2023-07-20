import { useQuery } from '@tanstack/react-query';
import { JsonRpcProvider, TransactionDigest } from '@mysten/sui.js';

type CreateObjType = {
  sender: string;
  type: 'created';
  objectType: string;
  objectId: string;
  version: string;
  digest: string;
  owner:
    | {
        AddressOwner: string;
      }
    | {
        ObjectOwner: string;
      }
    | {
        Shared: {
          initial_shared_version: number;
        };
      }
    | 'Immutable';
};

const useGetTx = async (provider: JsonRpcProvider) => {
  const getRaffleObjId = async (txDigest: TransactionDigest) => {
    try {
      const transactionBlock = await provider?.getTransactionBlock({
        digest: txDigest,
        options: { showObjectChanges: true },
      });
      const objectChanges: CreateObjType =
        transactionBlock?.objectChanges?.filter((obj) => {
          return obj.type == 'created';
        })[0] as CreateObjType;
      const raffleObjId = objectChanges?.objectId;
      return raffleObjId;
    } catch (e) {
      console.log(e);
    }
  };

  return {
    getRaffleObjId,
  };
};

export default useGetTx;
