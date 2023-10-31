'use client'

import Link from 'next/link'
import useGetName from '../hooks/useGetName'
import {
   useContractRead,
   useContractReads,
   useContractWrite,
   usePrepareContractWrite,
} from 'wagmi'
import { streamABI } from '../const/streamAbi'
import { Log, PropDatePropInfo } from '../const/types'
import axios from 'axios'
import useGetPropdateInfo from '../hooks/useGetPropdateInfo'

function formatDate(d: Date): string {
   const day = d.getDate()
   const month = d.getMonth()
   const year = d.getFullYear()
   const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
   ]
   const formattedDay =
      day + (day % 10 == 1 ? 'st' : day % 10 == 2 ? 'nd' : day % 10 == 3 ? 'rd' : 'th')
   return (
      monthNames[month] +
      ' ' +
      formattedDay +
      (year != 2023 ? " '" + year.toString().slice(-2) : '')
   )
}

export default function StreamRow({ user, log }: { user: boolean; log: Log }) {
   const { stream, recipient, token, tokenAmount, propID } = log
   const { data } = useContractReads({
      contracts: [
         {
            abi: streamABI,
            address: stream,
            functionName: 'remainingBalance',
         },
         {
            abi: streamABI,
            address: stream,
            functionName: 'recipientActiveBalance',
         },
      ],
   })
   const { name, guarantee, isLoading } = useGetName(recipient)
   const withdrawable = data ? data[1].result : undefined
   const { config } = usePrepareContractWrite({
      address: log.stream,
      abi: streamABI,
      functionName: 'withdrawFromActiveBalance',
      args: [withdrawable!],
   })

   const { write, data: writeData, isSuccess } = useContractWrite(config)
   const { prop: propdateData } = useGetPropdateInfo(propID, true)

   const streamAmount = tokenAmount / 10 ** (token == 'USDC' ? 6 : 18)
   const remainingFormatted = data
      ? Number(data[0].result) / 10 ** (token == 'USDC' ? 6 : 18)
      : 0
   const withdrawableFormatted = !withdrawable
      ? 0
      : (Number(withdrawable) / 10 ** (token == 'USDC' ? 6 : 18)).toFixed(2)

   const withdrawnPct = 1 - remainingFormatted / streamAmount
   const roundedRemaining = Number(withdrawnPct.toFixed(1)) * 10
   let progressString =
      withdrawnPct == 0 ? `100% \xa0` : `${((1 - withdrawnPct) * 100).toFixed(1)}% `
   for (let i = 0; i < 10; i++) {
      progressString += i < roundedRemaining ? '▓' : '░'
   }

   let timePct =
      (new Date().getTime() - log.startTime * 1000) /
      (log.stopTime * 1000 - log.startTime * 1000)
   let otherPString =
      timePct < 0
         ? `0% \xa0`
         : timePct > 1
         ? `100% \xa0`
         : `${(timePct * 100).toFixed(1)}% `

   for (let i = 0; i < 10; i++) {
      otherPString += i < timePct * 10 - 1 ? '▓' : '░'
   }

   return (
      <div className='flex flex-row gap-x-2 items-center'>
         <div className='w-12'>{propID}</div>
         {!user && (
            <Link
               className='w-44 hover:underline text-gray-500'
               href={`https://etherscan.io/address/${recipient}`}
               target='_blank'
            >
               {isLoading ? guarantee : name}
            </Link>
         )}
         <div className='w-32'>{`${streamAmount.toLocaleString('en-US')} ${token}`}</div>
         <div className='w-28'>{formatDate(new Date(log.startTime * 1000))}</div>
         <div className='w-28'>{formatDate(new Date(log.stopTime * 1000))}</div>
         <div className='w-44 hidden lg:block'>{otherPString}</div>
         <div className='w-24 flex flex-row gap-x-1'>
            <Link
               href={`https://updates.wtf/prop/${propID}`}
               target='_blank'
               className='underline'
            >
               {`${propdateData ? propdateData.count : 0}`}
            </Link>
            <div> {propdateData && propdateData.isCompleted ? '✅' : '⏳'}</div>
         </div>

         {user && (
            <button
               className={`text-sm text-gray-800 rounded border border-gray-300 px-3 py-1 shadow-sm hover:shadow bg-white
                           ease-in-out transition-all active:mt-[2px] active:mb-[-2px]`}
               onClick={write}
               type='button'
            >
               {`Withdraw  Available (${withdrawableFormatted} ${token})`}
            </button>
         )}
         {isSuccess && (
            <div className='rounded py-1 px-2 border border-green-400 bg-green-200 text-green-700'>
               Withdrawn!{' '}
               <Link
                  className='underline'
                  target='_blank'
                  href={`https://etherscan.io/tx/${writeData?.hash}`}
               >
                  Receipt
               </Link>
            </div>
         )}
         <Link
            className='w-24 hover:underline text-gray-500 hidden lg:block'
            href={`https://etherscan.io/address/${stream}`}
            target='_blank'
         >
            Contract
         </Link>
      </div>
   )
}
