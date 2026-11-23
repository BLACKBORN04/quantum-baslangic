// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EtkinlikKayit {
    string public etkinlikAdi = "Quantum Blokzincir Atolyesi";
    uint256 public constant KAPASITE = 3;
    uint256 public kayitSayisi;
    address public gorevli;

    mapping(address => string) public kayitlar;
    mapping(address => bool) public kayitliMi;
    mapping(address => bool) public girisYaptiMi;

    event KayitOldu(address indexed katilimci, string takmaAd);
    event GirisYapti(address indexed katilimci);

    constructor() {
        gorevli = msg.sender;
    }

    modifier sadeceGorevli() {
        require(msg.sender == gorevli, "Sadece gorevli bu islemi yapabilir");
        _;
    }

    function kaydol(string calldata takmaAd) external {
        require(bytes(takmaAd).length > 0, "Takma ad bos olamaz");
        require(!kayitliMi[msg.sender], "Bu adres zaten kayitli");
        require(kayitSayisi < KAPASITE, "Etkinlik kapasitesi doldu");

        kayitlar[msg.sender] = takmaAd;
        kayitliMi[msg.sender] = true;
        kayitSayisi++;

        emit KayitOldu(msg.sender, takmaAd);
    }

    function girisVer(address katilimci) external sadeceGorevli {
        require(kayitliMi[katilimci], "Bu adres etkinlige kayitli degil");
        require(!girisYaptiMi[katilimci], "Bu katilimci zaten giris yapti");

        girisYaptiMi[katilimci] = true;

        emit GirisYapti(katilimci);
    }
}