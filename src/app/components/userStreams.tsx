'use client'

import { useAccount } from 'wagmi'
import StreamRow from './streamRow'
import { CustomConnectButton } from './customConnectButton'
import { Log } from '../const/types'

export default function UserStreams({ logs }: { logs: Log[] }) {
   const { isConnected, address } = useAccount()
   let userLogs: Log[] = []
   if (isConnected) {
      userLogs = logs.filter((l) => l.recipient.toLowerCase() == address?.toLowerCase())
   }

   return (
      <div className='flex flex-col gap-x-2 mb-6'>
         <div className='text-xl'>My Streams</div>
         <div className='flex flex-row gap-x-2 font-bold'>
            <div className='w-32'>Amount</div>
            <div className='w-28'>Start Time</div>
            <div className='w-28'>End Time</div>
            <div className='w-44'>Progress</div>
         </div>
         {isConnected ? (
            userLogs.length == 0 ? (
               <div className='text-gray-600'>No streams for this address.</div>
            ) : (
               userLogs.map((l, i) => <StreamRow key={i} log={l} user={true} />)
            )
         ) : (
            <CustomConnectButton />
         )}
      </div>
   )
}
