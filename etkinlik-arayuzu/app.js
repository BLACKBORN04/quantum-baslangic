let provider = null;
let signer = null;
let contract = null;
let userAddress = null;
let isSepolia = false;

const el = {
  btnConnect: document.getElementById("btnConnect"),
  btnSwitchSepolia: document.getElementById("btnSwitchSepolia"),
  btnRegister: document.getElementById("btnRegister"),
  btnApproveEntry: document.getElementById("btnApproveEntry"),
  walletAddress: document.getElementById("walletAddress"),
  networkName: document.getElementById("networkName"),
  networkAlert: document.getElementById("networkAlert"),
  eventName: document.getElementById("eventName"),
  eventCapacity: document.getElementById("eventCapacity"),
  totalRegistrations: document.getElementById("totalRegistrations"),
  officerAddress: document.getElementById("officerAddress"),
  myRegStatus: document.getElementById("myRegStatus"),
  myNickname: document.getElementById("myNickname"),
  myEntryStatus: document.getElementById("myEntryStatus"),
  inputNickname: document.getElementById("inputNickname"),
  inputParticipant: document.getElementById("inputParticipant"),
  statusBox: document.getElementById("statusBox")
};

function durumYaz(mesaj) {
  el.statusBox.textContent = `Durum: ${mesaj}`;
}

function butonlariGuncelle() {
  const aktif = Boolean(userAddress && isSepolia);
  el.btnRegister.disabled = !aktif;
  el.btnApproveEntry.disabled = !aktif;
}

// ============================================================
// 1) CÜZDAN BAĞLANTISI VE AĞ KONTROLÜ
// ============================================================
async function cuzdanBagla() {
  if (!window.ethereum) {
    durumYaz("MetaMask yüklü değil. Lütfen tarayıcınıza MetaMask eklentisini kurun.");
    return;
  }

  try {
    // Private key istemeden MetaMask üzerinden hesap izni alır
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    el.walletAddress.textContent = userAddress;
    el.btnConnect.textContent = "Bağlandı";

    await agKontrolEt();
    if (isSepolia) {
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      await verileriYenile();
      durumYaz("Cüzdan bağlandı ve Sepolia üzerindeki sözleşme verileri okundu.");
    }
  } catch (err) {
    durumYaz(`Bağlantı hatası: ${err.shortMessage || err.message}`);
  }
}

async function agKontrolEt() {
  const network = await provider.getNetwork();
  isSepolia = network.chainId === SEPOLIA_CHAIN_ID;
  el.networkName.textContent = `${network.name} (Chain ID: ${network.chainId})`;

  if (!isSepolia) {
    el.networkAlert.style.display = "flex";
    durumYaz("Yanlış ağdasınız. İşlem gönderimi engellendi; lütfen Sepolia ağına geçin.");
  } else {
    el.networkAlert.style.display = "none";
  }

  butonlariGuncelle();
}

async function sepoliayaGec() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }]
    });
  } catch (err) {
    durumYaz(`Ağ değiştirme başarısız: ${err.message}`);
  }
}

// ============================================================
// 2) SÖZLEŞMEDEN VERİ OKUMA (READ / VIEW CALLS - 0 GAS)
// ============================================================
async function verileriYenile() {
  if (!contract || !isSepolia) return;

  try {
    const [ad, kapasite, sayi, gorevliAdres, kayitli, takmaAd, girisYapti] =
      await Promise.all([
        contract.etkinlikAdi(),
        contract.KAPASITE(),
        contract.kayitSayisi(),
        contract.gorevli(),
        contract.kayitliMi(userAddress),
        contract.kayitlar(userAddress),
        contract.girisYaptiMi(userAddress)
      ]);

    el.eventName.textContent = ad;
    el.eventCapacity.textContent = kapasite.toString();
    el.totalRegistrations.textContent = sayi.toString();
    el.officerAddress.textContent = gorevliAdres;

    el.myRegStatus.textContent = kayitli ? "Kayıtlı" : "Kayıtlı Değil";
    el.myNickname.textContent = takmaAd || "-";
    el.myEntryStatus.textContent = girisYapti ? "Giriş Onaylandı" : "Onaylanmadı";
  } catch (err) {
    durumYaz(`Veri okuma hatası: ${err.shortMessage || err.message}`);
  }
}

// ============================================================
// 3) SÖZLEŞME ÇAĞRILARI (WRITE / TRANSACTION - METAMASK İMZALI)
// ============================================================
async function kayitOl() {
  if (!isSepolia) {
    durumYaz("Yanlış ağda işlem gönderilemez. Sepolia ağına geçin.");
    return;
  }

  const takmaAd = el.inputNickname.value.trim();
  if (!takmaAd) {
    durumYaz("Lütfen bir takma ad girin.");
    return;
  }

  try {
    durumYaz("MetaMask onayı bekleniyor (kaydol)...");
    const tx = await contract.kaydol(takmaAd);
    durumYaz(`İşlem gönderildi (${tx.hash}). Blok onayı bekleniyor...`);

    await tx.wait();
    el.inputNickname.value = "";
    await verileriYenile();
    durumYaz(`Kayıt başarılı! Tx Hash: ${tx.hash}`);
  } catch (err) {
    durumYaz(`Kayıt başarısız: ${err.reason || err.shortMessage || err.message}`);
  }
}

async function girisiOnayla() {
  if (!isSepolia) {
    durumYaz("Yanlış ağda işlem gönderilemez. Sepolia ağına geçin.");
    return;
  }

  const katilimci = el.inputParticipant.value.trim();
  if (!ethers.isAddress(katilimci)) {
    durumYaz("Geçerli bir Ethereum adresi girin (0x...).");
    return;
  }

  try {
    durumYaz("MetaMask onayı bekleniyor (girisVer)...");
    const tx = await contract.girisVer(katilimci);
    durumYaz(`İşlem gönderildi (${tx.hash}). Blok onayı bekleniyor...`);

    await tx.wait();
    el.inputParticipant.value = "";
    await verileriYenile();
    durumYaz(`Giriş onaylandı! Tx Hash: ${tx.hash}`);
  } catch (err) {
    durumYaz(`Giriş onaylanamadı: ${err.reason || err.shortMessage || err.message}`);
  }
}

// Olay Dinleyicileri
el.btnConnect.addEventListener("click", cuzdanBagla);
el.btnSwitchSepolia.addEventListener("click", sepoliayaGec);
el.btnRegister.addEventListener("click", kayitOl);
el.btnApproveEntry.addEventListener("click", girisiOnayla);

// Hesap veya ağ değiştiğinde sayfayı otomatik güncelle
if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => window.location.reload());
  window.ethereum.on("chainChanged", () => window.location.reload());
}