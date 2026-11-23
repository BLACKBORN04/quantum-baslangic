// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EtkinlikKayit {
    // Tek bir etkinliğin adını tutan durum değişkeni
    string public etkinlikAdi = "Quantum Blokzincir Atolyesi";

    // Adres bazlı takma adları tutan depolama alanı (storage)
    mapping(address => string) public kayitlar;

    // Kullanıcı yalnızca kendi adresi (msg.sender) adına takma ad kaydedebilir
    function kaydol(string calldata takmaAd) external {
        kayitlar[msg.sender] = takmaAd;
    }
}