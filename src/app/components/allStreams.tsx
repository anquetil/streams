import Link from 'next/link'
import { cache } from 'react'
import { createPublicClient, decodeFunctionData, http, parseAbiItem } from 'viem'
import { mainnet, useAccount } from 'wagmi'
import useGetName from '../hooks/useGetName'
import StreamRow from './streamRow'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import UserStreams from './userStreams'
import Header from './header'
export const revalidate = 300 // revalidate the data at most every 5 minutes?

const getData = cache(async () => {
   const client = createPublicClient({
      chain: mainnet,
      transport: http(
         `https://eth-mainnet.g.alchemy.com/v2/${
            process.env.NEXT_PUBLIC_ALCHEMY_ID ?? ''
         }`
      ),
   })
   const logs = await client.getLogs({
      address: '0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff',
      event: parseAbiItem(
         'event StreamCreated(address indexed msgSender, address indexed payer, address indexed recipient, uint256 tokenAmount, address tokenAddress, uint256 startTime, uint256 stopTime, address streamAddress)'
      ),
      fromBlock: BigInt(17212788),
   })
   return logs.map((l) => {
      return {
         recipient: l.args.recipient!,
         stream: l.args.streamAddress!,
         token:
            l.args.tokenAddress == '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
               ? 'USDC'
               : ('WETH' as 'USDC' | 'WETH'),
         startTime: Number(l.args.startTime!),
         stopTime: Number(l.args.stopTime!),
         tokenAmount: Number(l.args.tokenAmount),
      }
   })
})

export default async function AllStreams() {
   let logs = await getData()
   logs = logs.sort((a, b) => (a.stopTime > b.stopTime ? 1 : -1))

   if (logs && logs.length > 0) {
      return (
         <div className='px-4 md:px-12 py-6 '>
            <Header />
            <UserStreams logs={logs} />
            <div className='text-xl'>All Streams</div>
            <div className='flex flex-row gap-x-2 font-bold'>
               <div className='w-44'>Recipient</div>
               <div className='w-32'>Amount</div>
               <div className='w-28'>Start Time</div>
               <div className='w-28'>End Time</div>
               <div className='w-44 hidden lg:block'>Progress</div>
            </div>
            {logs.map((l, i) => {
               return <StreamRow key={i} log={l} user={false} />
            })}
         </div>
      )
   } else {
      return <div>waiting</div>
   }
}
