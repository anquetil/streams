export type Log = {
   recipient: `0x${string}`
   stream: `0x${string}`
   token: 'USDC' | 'WETH'
   startTime: number
   stopTime: number
   tokenAmount: number
   propID: number
}

export type PropDatePropInfo = {
   id: string
   title: string
   isCompleted: boolean
   count: Number
}
