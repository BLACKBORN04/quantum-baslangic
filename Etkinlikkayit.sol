// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EtkinlikKayit {
    string public etkinlikAdi = "Quantum Blokzincir Atolyesi";
    uint256 public constant KAPASITE = 3;
    uint256 public kayitSayisi;

    mapping(address => string) public kayitlar;
    mapping(address => bool) public kayitliMi;

    function kaydol(string calldata takmaAd) external {
        require(bytes(takmaAd).length > 0, "Takma ad bos olamaz");
        require(!kayitliMi[msg.sender], "Bu adres zaten kayitli");
        require(kayitSayisi < KAPASITE, "Etkinlik kapasitesi doldu");

        kayitlar[msg.sender] = takmaAd;
        kayitliMi[msg.sender] = true;
        kayitSayisi++;
    }
}