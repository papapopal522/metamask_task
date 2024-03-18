'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './page.module.scss';
import { FaRegCopy, FaEthereum } from 'react-icons/fa';
import { AiFillCheckCircle } from "react-icons/ai";
import { Web3 } from 'web3';
import { getBalance, sendTransaction } from '../../service';



declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletPage = () => {

  const [activeNetwork, setActiveNetwork] = useState('Mainnet');
  const [address, setAddress] = useState<string>('');
  const [activeCoin, setActiveCoin] = useState<string>('BNB');
  const [amount, setAmount] = useState<string>('0.0001');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [transactionCompleted, setTransactionIsCompleted] = useState<boolean>(false);
  const [transactionHashCopied, setTransactionHashCopied] = useState<boolean>(false);
  const [recipientAddress, setRecipientAddress] = useState<string>('0x567c5fa2Eb5ecCBCfA1d028ED5a2CBf47cdBd85c');
  const [accountBalance, setAccountBalance] = useState<string | null>(null);
  const [hoveredSvg, setHoveredSvg] = useState<boolean>(false);
  const [addressCopied, setAddressCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [coinsData, setCoinsData] = useState<{
    [key: string]: { symbol: string; address: string; provider: string };
  }>({
    BNB: {
      symbol: 'BNB',
      address: address,
      provider: `https://bsc-dataseed1.binance.org`,
    },
    ETH: {
      symbol: 'ETH',
      address: address,
      provider: 'https://mainnet.infura.io/v3/9086527a5b44445aba865fdc391406a8',
    },
    bnbTestnet: {
      symbol: 'tBNB',
      address: address,
      provider: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    },
  });

  const switchNetwork = async (network: string) => {
    setActiveNetwork(network);

    if (network === 'Mainnet') {
      switchToBNB('BNB');
      const currentCoin = coinsData['BNB']['provider'];
      const balance = await getBalance(currentCoin, address);
      setAccountBalance(balance);

    } else if (network === 'Testnet') {
      switchToBSCTestnet('BNB');
      try {
        const currentCoin = coinsData['bnbTestnet']['provider'];
        const balance = await getBalance(currentCoin, address);
        setAccountBalance(balance);
      } catch (error) {
        console.error();
      }
    }
  };


  const switchToBNB = (network: string) => {
    setAccountBalance(null);
    setActiveCoin(network);

    if (window.ethereum) {
      const existingNetwork = window.ethereum.networkVersion;
      if (existingNetwork === '56') {

        window.ethereum.request({
          method: 'wallet_updateEthereumChain',
          params: [{
            chainId: '0x38',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'BNB',
              decimals: 18,
            },
          }],
        });
      } else {

        window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x38',
            chainName: 'Binance Smart Chain',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'BNB',
              decimals: 18,
            },
            rpcUrls: ['https://bsc-dataseed1.binance.org'],
            blockExplorerUrls: ['https://bscscan.com/'],
          }],
        });
      }
    }
  };

  const switchToETH = (network: string) => {
    setAccountBalance(null);
    setActiveCoin(network);
    if (window.ethereum) {
      const existingNetwork = window.ethereum.networkVersion;
      if (existingNetwork === '1') {

        window.ethereum.request({
          method: 'wallet_updateEthereumChain',
          params: [{
            chainId: '0x1',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
          }],
        });
      } else {

        window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x1',
            chainName: 'Ethereum',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://mainnet.infura.io/v3/9086527a5b44445aba865fdc391406a8'],
            blockExplorerUrls: ['https://etherscan.io/'],
          }],
        });
      }
    }
  };

  const switchToBSCTestnet = (coin: string) => {
    setAccountBalance(null);
    setActiveCoin(coin);
    if (window.ethereum) {
      const existingNetwork = window.ethereum.chainId;
      if (existingNetwork !== '0x61') {
        window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x61',
            chainName: 'Binance Smart Chain Testnet',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'tBNB',
              decimals: 18,
            },
            rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
            blockExplorerUrls: ['https://testnet.bscscan.com/'],
          }],
        });
      }
    }
  };


  const copyHandler = () => {
    navigator.clipboard.writeText(address);
    setAddressCopied(true);
    setTimeout(() => {
      setAddressCopied(false);
      setHoveredSvg(false);
    }, 3000);
  };

  const transactionHashCopyHandler = () => {
    navigator.clipboard.writeText(transactionHash);
    setTransactionHashCopied(true);
    setTimeout(() => {
      setAddressCopied(false);
      setTransactionHashCopied(false);
    }, 3000);
  };

  useEffect(() => {
    const loadWeb3 = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3Instance = new Web3(window.ethereum);
          const accounts = await web3Instance.eth.getAccounts();
          setAddress(accounts[0]);
          const currentCoinData = coinsData[activeCoin];
          const balance = await getBalance(currentCoinData.provider, accounts[0]);
          setAccountBalance(balance);
        } catch (error) {
          console.error('Failed to connect to MetaMask:', error);
        }
      } else {
        console.error('MetaMask is not installed!');
      }
    };
    loadWeb3();
  }, []);

  const connectMetaMask = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.getAccounts();
      setAddress(accounts[0]);
      console.log('MetaMask is connected!', accounts[0]);
    } catch (error) {
      console.error('Failed to connect to MetaMask:', error);
    }
  };

  const handleConnectClick = () => {
    if (typeof window.ethereum !== 'undefined') {
      connectMetaMask();
    } else {
      console.error('MetaMask is not installed!');
    }
  };

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress('');
      }
    };

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.off('accountsChanged', handleAccountsChanged);
      }
    };
  }, [address]);
  useEffect(() => {
    setCoinsData(prevCoinsData => ({
      ...prevCoinsData,
      BNB: {
        ...prevCoinsData.BNB,
        address: address,

      },
      ETH: {
        ...prevCoinsData.ETH,
        address: address,
      },
      bnbTestnet: {
        ...prevCoinsData.bnbTestnet,
        address: address,
      },

    }));
  }, [address]);


  useEffect(() => {

    const fetchBalance = async () => {
      try {
        if (!address || !activeCoin) return;
        const coinData = coinsData[activeCoin];
        const balance = await getBalance(coinData.provider, coinData.address);
        setAccountBalance(balance);
      } catch (error) {
        setAccountBalance('Error fetching balance');
        console.error('Error fetching balance:', error);
      }
    };
    fetchBalance();
  }, [activeCoin, address]);


  const sendHandler = async () => {
    try {
      const transactionHash = await sendTransaction(address, recipientAddress, amount);
      setTransactionHash(transactionHash);
      setTransactionIsCompleted(true);

    } catch (error: any) {
      console.error('error', error);
      setErrorMessage(error.message);
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
  };

const closeHandler = () => {
 setTransactionIsCompleted(!transactionCompleted)

}
  return (
    <div className={styles.wallet_page}>
      {address.length <= 0 ? (
        <div className={styles.metamask_button_block}>
          <button className={styles.connect} onClick={handleConnectClick}>Connect</button>
          <FaEthereum size={25} />
        </div>

      ) : (
        <>
          <h1>Account 1</h1>
          <div className={styles.networks}>
          <span
            className={`${styles.network} ${activeNetwork === 'Mainnet' ? styles.active : ''}`}
            onClick={() => switchNetwork('Mainnet')}
          >
            Mainnet
          </span>
            <span
              className={`${styles.network} ${activeNetwork === 'Testnet' ? styles.active : ''}`}
              onClick={() => switchNetwork('Testnet')}
            >
            Testnet
          </span>
          </div>

          <div className={styles.address_block}>
            <span>{address}</span>
            {addressCopied ? (
              <AiFillCheckCircle color='green' />
            ) : (
              <FaRegCopy
                className={styles.copy}
                onMouseEnter={() => setHoveredSvg(!hoveredSvg)}
                onMouseLeave={() => setHoveredSvg(!hoveredSvg)}
                onClick={copyHandler}
              />
            )}
          </div>
          {hoveredSvg && (
            <div className={styles.clipboard_block}>
              {addressCopied ? 'Address copied' : 'Copy to clipboard'}
            </div>
          )}
          <div className={styles.wallets}>
            <div
              className={`${styles.wallet_block} ${activeCoin === 'BNB' ? styles.active : ''}`}
              onClick={activeNetwork === 'Mainnet' ? () => switchToBNB('BNB') : () => switchToBSCTestnet('BNB')}
            >
              <span>BNB</span>
              <Image
                src='/bnb.png'
                alt='bnb'
                className={styles.vercelLogo}
                width={20}
                height={20}
                priority
              />
            </div>

            {activeNetwork !== 'Testnet' && <div
              className={`${styles.wallet_block} ${activeCoin === 'ETH' ? styles.active : ''}`}
              onClick={() => switchToETH('ETH')}
            >
              <span>ETH</span>
              <Image
                src='/eth.png'
                alt='eth'
                className={styles.vercelLogo}
                width={15}
                height={18}
                priority
              />
            </div>}
          </div>
          <div className={styles.balance}>
            {accountBalance && <span>{accountBalance} {activeCoin === 'BNB' ? 'BNB' : 'ETH'}</span>}
          </div>
          <div className={styles.send_block}>
            <div className={styles.send_block}>
              <input
                className={styles.address}
                type='text'
                id='recipientAddress'
                value={recipientAddress}
                name='recipientAddress'
                placeholder='Enter public address(0x) or ENS name:'
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
              <div className={styles.transaction_block}>
                <input
                  type='text'
                  id='amount'
                  name='amount'
                  className={styles.amount}
                  placeholder='Enter amount'
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    const onlyNumbersAndDot = value.replace(/[^0-9.]/g, '');
                    setAmount(onlyNumbersAndDot);
                  }}
                />
                <button onClick={sendHandler}>SEND</button>
              </div>
            </div>
          </div>

          {transactionCompleted && (
            <div className={styles.transaction_completed}>
                            <span className={styles.close_button}
                                  onClick={closeHandler}>X</span>
              <span>Transaction Confirmed</span>
              <a
                href={activeNetwork === 'Mainnet' ?
                  (activeCoin === 'BNB' ? `https://bscscan.com/tx/${transactionHash}` : `https://etherscan.io/tx/${transactionHash}`) :
                  `https://testnet.bscscan.com/tx/${transactionHash}`}
                target='_blank' rel='noopener noreferrer'>
                <span className={styles.view_transaction}>View on block explorer</span>
              </a>


              <span>transaction hash:</span>
              <div className={styles.transaction_hash}>
                {transactionHash} {transactionHashCopied ? <AiFillCheckCircle color='green' /> :
                <FaRegCopy className={styles.transaction_copy} onClick={transactionHashCopyHandler} />}
              </div>
            </div>
          )}
        </>
      )}
      <div className={styles.error}>{errorMessage}</div>
    </div>
  );
};
export default WalletPage;

