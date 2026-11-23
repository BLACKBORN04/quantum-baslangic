// İP-23'te Sepolia ağına dağıtılan EtkinlikKayit sözleşme adresi
const CONTRACT_ADDRESS = "0xe54AF994DB64e0B29B314F60f1C623296723b88d";

// Ethereum Sepolia Testnet ağ kimliği
const SEPOLIA_CHAIN_ID = 11155111n;
const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

// EtkinlikKayit.sol sözleşmesinin ABI tanımı
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "etkinlikAdi",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "KAPASITE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "kayitSayisi",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gorevli",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "kayitlar",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "kayitliMi",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "girisYaptiMi",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_takmaAd", "type": "string" }],
    "name": "kaydol",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_katilimci", "type": "address" }],
    "name": "girisVer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];