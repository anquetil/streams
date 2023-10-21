export type Log = {
   recipient: `0x${string}`
   stream: `0x${string}`
   token: 'USDC' | 'WETH'
   startTime: number
   stopTime: number
   tokenAmount: number
}
