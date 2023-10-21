'use client'

import { useAccount } from 'wagmi'
import { CustomConnectButton } from './customConnectButton'

export default function Header() {
   const { isConnected } = useAccount()

   return (
      <div className='flex flex-row justify-between w-full mb-6'>
         <div>streams.wtf</div>
         {isConnected && <CustomConnectButton />}
      </div>
   )
}
