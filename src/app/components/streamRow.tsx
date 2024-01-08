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
   return d.toLocaleDateString(undefined, {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
   })
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
   return month + 1 + '/' + day + '/' + year.toString().slice(-2)
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
   const withdrawableFormatted = !withdrawable
      ? 0
      : (Number(withdrawable) / 10 ** (token == 'USDC' ? 6 : 18)).toFixed(2)

   let timePct =
      (new Date().getTime() - log.startTime * 1000) /
      (log.stopTime * 1000 - log.startTime * 1000)
   let otherPString =
      timePct < 0
         ? `0% \xa0`
         : timePct >= 0.994
         ? `100%`
         : Number((timePct * 100).toFixed(0)) < 10
         ? `${(timePct * 100).toFixed(0)}% \xa0`
         : `${(timePct * 100).toFixed(0)}% `

   otherPString += `\xa0`
   for (let i = 0; i < 10; i++) {
      otherPString += i < timePct * 10 - 1 ? '▓' : '░'
   }

   return (
      <div className='flex flex-row gap-x-2 items-center text-sm'>
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
         <Link
            className='w-32 hover:underline text-gray-500'
            href={`https://etherscan.io/address/${stream}`}
            target='_blank'
         >
            {`${streamAmount.toLocaleString('en-US')} ${token}`}
         </Link>
         <div className='w-28'>{formatDate(new Date(log.startTime * 1000))}</div>
         <div className='w-28'>{formatDate(new Date(log.stopTime * 1000))}</div>
         <div className='w-44 hidden lg:block'>{otherPString}</div>
         <div className='w-24 flex flex-row gap-x-1'>
            <Link
               href={`https://updates.wtf/prop/${propID}`}
               target='_blank'
               className='hover:underline text-gray-500'
            >
               {`${propdateData ? propdateData.count : 0}`}
            </Link>
            <div> {propdateData && propdateData.isCompleted ? '✅' : '⏳'}</div>
         </div>

         {user && (
            <button
               className={`text-sm text-gray-800 rounded border border-gray-300 px-3 py-1 shadow-sm hover:shadow hover:bg-gray-50 bg-white
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
      </div>
   )
}
