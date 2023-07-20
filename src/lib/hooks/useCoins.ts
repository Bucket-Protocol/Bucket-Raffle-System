import { getAllCoins } from '@/lib/utils/getAllCoins';
import { useWalletKit } from '@mysten/wallet-kit';
import { useQuery } from '@tanstack/react-query';

const useCoins = () => {
  const walletKit = useWalletKit();
  const { currentAccount } = walletKit;
  const {
    data: coins,
    refetch: refetchCoins,
    isLoading: loadingCoins,
  } = useQuery({
    queryKey: ['getAllCoins', currentAccount],
    queryFn: () => getAllCoins(currentAccount ?? null),
    enabled: !!currentAccount,
  });

  return {
    coins,
    refetchCoins,
    loadingCoins,
  };
};

export default useCoins;
