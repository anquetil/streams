import Link from 'next/link'
import { cache } from 'react'
import { createPublicClient, decodeFunctionData, http, parseAbiItem } from 'viem'
import StreamRow from './streamRow'
import UserStreams from './userStreams'
import Header from './header'
import { Log } from '../const/types'
import { mainnet } from 'viem/chains'
export const revalidate = 300 // revalidate the data at most every 5 minutes?

const getData = cache(async () => {
   console.log('fetchin data from viem...')
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
      toBlock: 'latest',
   })

   let propIDs = []
   for(const log of logs){
      const id = await client.getLogs({
         event: parseAbiItem('event ProposalExecuted(uint256 id)'),
         blockHash: log.blockHash,
      })
      propIDs.push(id)
   }
   let returnLogs = []

   for (const [i, l] of logs.entries()) {
      returnLogs.push({
         recipient: l.args.recipient!,
         stream: l.args.streamAddress!,
         token:
            l.args.tokenAddress == '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
               ? 'USDC'
               : ('WETH' as 'USDC' | 'WETH'),
         startTime: Number(l.args.startTime!),
         stopTime: Number(l.args.stopTime!),
         tokenAmount: Number(l.args.tokenAmount),
         propID: Number((propIDs[i])[0].args.id),
      })
   }
   return returnLogs
})

export default async function AllStreams() {
   let logs: Log[] = await getData()
   logs = logs.sort((a, b) => (a.propID > b.propID ? -1 : 1))
   if (logs && logs.length > 0) {
      return (
         <div className='px-4 md:pl-12 md:pr-4 py-6 '>
            <Header />
            <div className='block md:hidden bg-neutral-100 p-2 text-neutral-500 rounded text-sm mb-3 '>{`WIP! Streams.wtf isn't optimized for mobile yet`}</div>
            <UserStreams logs={logs} />
            <div className='text-xl'>All Streams</div>
            <div className='flex flex-row gap-x-2 font-bold'>
               <div className='w-12'>Prop</div>
               <div className='w-44'>Recipient</div>
               <div className='w-32'>Amount</div>
               <div className='w-28'>Start Time</div>
               <div className='w-28'>End Time</div>
               <div className='w-44 hidden lg:block'>Progress</div>
               <div className='w-24'>Propdates</div>
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
