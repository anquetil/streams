import { gql, useQuery } from '@apollo/client'
import { PropDatePropInfo } from '../const/types'

export function useGetPropdateInfo(propID: number, enabled: boolean) {
   const query = gql`query propQuery {
      proposal(
            id: ${propID}
      ){
         id
         title
         isCompleted
         count
      }
   }`

   const { data, loading } = useQuery(query, {
      skip: !enabled,
   })

   const prop: PropDatePropInfo = data ? data.proposal : undefined

   return {
      prop,
      loading,
   }
}

export default useGetPropdateInfo
