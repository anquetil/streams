import { type Address } from 'viem'
import { useEnsName } from 'wagmi'

export function useGetName(address: Address) {
   let name = ''
   const guarantee = address.slice(0, 6) + '..' + address.slice(-4)
   let isLoading = false

   const { data: ensData, isLoading: ensLoading } = useEnsName({
      address: address,
   })

   if (ensLoading) {
      isLoading = true
   } else if (ensData && ensData != null) {
      name = ensData
      isLoading = false
   } else if (!ensLoading && address) {
      // DONE LOADING, NO ENS
      name = address.slice(0, 6) + '..' + address.slice(-4)
      isLoading = false
   }

   return {
      name,
      isLoading,
      guarantee,
   }
}

export default useGetName
