import Web3 from 'web3';

export const getBalance = async (provider: string, address: string) => {
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(provider));
      const balanceWei = await web3.eth.getBalance(address);
      const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
      console.log('balanceEth', balanceEth);
      return balanceEth;
    } catch (error) {
      console.error('Error while checking account balance:', error);
      throw error;
    }

};



export const sendTransaction = async (address: string, recipientAddress: string, amount: string) => {
  try {
    const web3 = new Web3(window.ethereum);
    const gasLimit = 21000;
    const gasPrice = await web3.eth.getGasPrice();

    const balance = await web3.eth.getBalance(address);
    const amountInWei = web3.utils.toWei(amount, 'ether');



    const tx = {
      from: address,
      to: recipientAddress,
      value: web3.utils.toWei(amount, 'ether'),
      gas: gasLimit,
      gasPrice: gasPrice
    };

    const receipt = await web3.eth.sendTransaction(tx);
    console.log('receipt', receipt)
    console.log('Transaction receipt:', receipt);
    return receipt.transactionHash.toString();
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};






