const { ChainId, Token, WETH, Fetcher,Trade,TokenAmount, Route,TradeType } = require('@uniswap/sdk');
const { ethers } = require('hardhat');



async function main() {

    const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18)

    // note that you may want/need to handle this async code differently,
    // for example if top-level await is not an option
    const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId])

    const route = new Route([pair], WETH[DAI.chainId])

    console.log('mid price');
    console.log('pair',pair);
    console.log(route.midPrice.toSignificant(6)) // 201.306
    console.log(route.midPrice.invert().toSignificant(6)) // 0.00496756




const exDAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18)

// note that you may want/need to handle this async code differently,
// for example if top-level await is not an option
const expair = await Fetcher.fetchPairData(exDAI, WETH[exDAI.chainId])

const exroute = new Route([expair], WETH[exDAI.chainId]) 

const trade = new Trade(exroute, new TokenAmount(WETH[exDAI.chainId], ethers.utils.parseEther('100')), TradeType.EXACT_INPUT)
console.log('------------Trade -----------' ,trade);
console.log('execution price');
console.log(trade.executionPrice.toSignificant(6))
console.log(trade.nextMidPrice.toSignificant(6))

const priceImpact = route.midPrice.toSignificant(6) - trade.executionPrice.toSignificant(6)
console.log('------- priceImpact-------------',priceImpact);
console.log('------ Price Impact Percent' , priceImpact / 100 , '%');

}

main().then(() => {
    process.exit(0)
})
.catch((error) => {
    console.log(error);
    process.exit(1)
})