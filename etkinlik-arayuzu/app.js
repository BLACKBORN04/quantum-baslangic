let provider = null;
let signer = null;
let contract = null;
let userAddress = null;
let isSepolia = false;
let islemSuruyor = false;

const el = {
  btnConnect: document.getElementById("btnConnect"),
  btnRefresh: document.getElementById("btnRefresh"),
  btnSwitchSepolia: document.getElementById("btnSwitchSepolia"),
  btnRegister: document.getElementById("btnRegister"),
  btnApproveEntry: document.getElementById("btnApproveEntry"),
  networkDot: document.getElementById("networkDot"),
  networkName: document.getElementById("networkName"),
  networkAlert: document.getElementById("networkAlert"),
  contractLinkWrap: document.getElementById("contractLinkWrap"),
  eventName: document.getElementById("eventName"),
  eventCapacity: document.getElementById("eventCapacity"),
  totalRegistrations: document.getElementById("totalRegistrations"),
  walletShort: document.getElementById("walletShort"),
  capacityPercent: document.getElementById("capacityPercent"),
  capacityBar: document.getElementById("capacityBar"),
  officerAddress: document.getElementById("officerAddress"),
  officerBadge: document.getElementById("officerBadge"),
  myRegBadge: document.getElementById("myRegBadge"),
  myNickname: document.getElementById("myNickname"),
  myEntryBadge: document.getElementById("myEntryBadge"),
  inputNickname: document.getElementById("inputNickname"),
  inputParticipant: document.getElementById("inputParticipant"),
  statusBox: document.getElementById("statusBox"),
  statusPhase: document.getElementById("statusPhase"),
  statusText: document.getElementById("statusText"),
  txLinkWrap: document.getElementById("txLinkWrap")
};

el.contractLinkWrap.innerHTML = `<a href="https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}" target="_blank" style="color:#94a3b8;text-decoration:none;">Sözleşme: ${kisalt(CONTRACT_ADDRESS)} ↗</a>`;

function kisalt(adres) {
  return `${adres.slice(0, 6)}...${adres.slice(-4)}`;
}

// ============================================================
// İP-25: DURUM, AŞAMA VE EXPLORER BAĞLANTISI YÖNETİMİ
// tip: "idle" | "wallet" | "pending" | "success" | "unknown" | "error"
// ============================================================
function durumGuncelle(tip, asamaEtiketi, mesaj, txHash = null) {
  el.statusBox.className = `terminal state-${tip}`;
  el.statusPhase.textContent = asamaEtiketi;

  const rozetSiniflari = {
    idle: "badge",
    wallet: "badge accent",
    pending: "badge accent",
    success: "badge ok",
    unknown: "badge warn",
    error: "badge err"
  };
  el.statusPhase.className = rozetSiniflari[tip] || "badge";
  el.statusText.textContent = `> ${mesaj}`;

  if (txHash) {
    el.txLinkWrap.innerHTML = `<a href="https://sepolia.etherscan.io/tx/${txHash}" target="_blank" rel="noopener noreferrer">Etherscan (${kisalt(txHash)}) ↗</a>`;
  } else {
    el.txLinkWrap.innerHTML = "";
  }
}

function butonlariGuncelle() {
  const aktif = Boolean(userAddress && isSepolia && !islemSuruyor);
  el.btnRegister.disabled = !aktif;
  el.btnApproveEntry.disabled = !aktif;
  el.btnRefresh.disabled = !Boolean(userAddress && isSepolia);
}

function butonYukleniyor(buton, yukleniyor, etiket) {
  if (yukleniyor) {
    buton.disabled = true;
    buton.innerHTML = `<span class="spinner"></span> ${etiket}`;
  } else {
    buton.textContent = etiket;
    butonlariGuncelle();
  }
}

// ============================================================
// İP-25: ANLAŞILIR HATA ÇÖZÜMLEYİCİ
// ============================================================
function hataMesajiniCoz(err) {
  const hamMesaj = `${err?.reason || ""} ${err?.shortMessage || ""} ${err?.message || ""}`.toLowerCase();

  // 1) Kullanıcı MetaMask'ta imzayı reddetti
  if (err?.code === "ACTION_REJECTED" || err?.code === 4001 || hamMesaj.includes("user rejected") || hamMesaj.includes("rejected")) {
    return "İmza kullanıcı tarafından MetaMask'ta reddedildi. Zincire herhangi bir işlem gönderilmedi.";
  }

  // 2) İkinci kayıt (aynı adres tekrar kaydoluyor)
  if (hamMesaj.includes("zaten kayitli") || hamMesaj.includes("zaten kayıtlı")) {
    return "Bu cüzdan adresi etkinliğe zaten kayıtlı. İkinci kez kayıt yapılamaz.";
  }

  // 3) Kapasite doluluğu
  if (hamMesaj.includes("kapasite") || hamMesaj.includes("kontenjan") || hamMesaj.includes("dolu")) {
    return "Etkinlik kapasitesi dolduğu için yeni kayıt alınamıyor.";
  }

  // 4) Görevli olmayan hesapla giriş onayı denemesi
  if (hamMesaj.includes("gorevli") || hamMesaj.includes("görevli") || hamMesaj.includes("yetki")) {
    return "Yetkisiz işlem: Giriş onayını yalnızca sözleşme görevlisi verebilir.";
  }

  // 5) Kayıtlı olmayan adrese giriş onayı denemesi
  if (hamMesaj.includes("kayitli degil") || hamMesaj.includes("kayıtlı değil")) {
    return "Bu adres etkinliğe kayıtlı değil; önce kayıt yapılması gerekiyor.";
  }

  // 6) Zaten giriş yapmış katılımcı
  if (hamMesaj.includes("zaten giris") || hamMesaj.includes("zaten giriş")) {
    return "Bu katılımcının girişi daha önce onaylanmış.";
  }

  // 7) Yetersiz gas / bakiye
  if (err?.code === "INSUFFICIENT_FUNDS" || hamMesaj.includes("insufficient funds")) {
    return "Yetersiz SepoliaETH bakiyesi. İşlem ücreti (gas) karşılanamadı.";
  }

  return `İşlem başarısız: ${err?.reason || err?.shortMessage || err?.message || "Bilinmeyen hata"}`;
}

// ============================================================
// 1) CÜZDAN BAĞLANTISI VE AĞ KONTROLÜ
// ============================================================
async function cuzdanBagla() {
  if (!window.ethereum) {
    durumGuncelle("error", "HATA", "MetaMask yüklü değil. Lütfen tarayıcınıza MetaMask kurun.");
    return;
  }

  try {
    durumGuncelle("wallet", "CÜZDAN ONAYI", "MetaMask bağlantı onayı bekleniyor...");
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    await oturumuKur("Cüzdan bağlandı. Sözleşme verileri güncel.");
  } catch (err) {
    durumGuncelle("error", "BAĞLANTI HATASI", hataMesajiniCoz(err));
  }
}

async function oturumuKur(basariMesaji) {
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  userAddress = await signer.getAddress();

  el.walletShort.textContent = kisalt(userAddress);
  el.walletShort.title = userAddress;
  el.btnConnect.textContent = kisalt(userAddress);

  await agKontrolEt();
  if (isSepolia) {
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    await verileriYenile();
    if (basariMesaji) {
      durumGuncelle("idle", "HAZIR", basariMesaji);
    }
  }
}

async function agKontrolEt() {
  const network = await provider.getNetwork();
  isSepolia = network.chainId === SEPOLIA_CHAIN_ID;

  if (isSepolia) {
    el.networkDot.className = "dot ok";
    el.networkName.textContent = "Sepolia Testnet";
    el.networkAlert.style.display = "none";
  } else {
    el.networkDot.className = "dot err";
    el.networkName.textContent = `Yanlış Ağ (${network.chainId})`;
    el.networkAlert.style.display = "flex";
    durumGuncelle("error", "YANLIŞ AĞ", "Yanlış ağdasınız. İşlem gönderimi engellendi; lütfen Sepolia ağına geçin.");
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
    durumGuncelle("error", "AĞ HATASI", hataMesajiniCoz(err));
  }
}

// ============================================================
// 2) VERİ OKUMA (0 GAS) VE MANUEL YENİLEME
// ============================================================
async function verileriYenile(manuel = false) {
  if (!contract || !isSepolia) return;

  try {
    if (manuel) {
      butonYukleniyor(el.btnRefresh, true, "Yenileniyor...");
    }

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

    const capNum = Number(kapasite);
    const regNum = Number(sayi);
    const oran = capNum > 0 ? Math.min(100, Math.round((regNum / capNum) * 100)) : 0;

    el.eventName.textContent = ad;
    el.eventCapacity.textContent = capNum;
    el.totalRegistrations.textContent = regNum;
    el.capacityPercent.textContent = `%${oran} (${regNum}/${capNum})`;
    el.capacityBar.style.width = `${oran}%`;
    el.officerAddress.textContent = gorevliAdres;

    el.myRegBadge.textContent = kayitli ? "Kayıtlı" : "Kayıtlı Değil";
    el.myRegBadge.className = kayitli ? "badge ok" : "badge";
    el.myNickname.textContent = takmaAd || "-";

    el.myEntryBadge.textContent = girisYapti ? "Giriş Onaylandı" : "Onaylanmadı";
    el.myEntryBadge.className = girisYapti ? "badge ok" : "badge";

    const gorevliMi = gorevliAdres.toLowerCase() === userAddress.toLowerCase();
    el.officerBadge.textContent = gorevliMi ? "Görevli Hesap" : "Standart Hesap";
    el.officerBadge.className = gorevliMi ? "badge accent" : "badge";

    if (manuel) {
      durumGuncelle("idle", "GÜNCELLENDİ", `Zincirdeki son veriler okundu (${kisalt(userAddress)}).`);
    }
  } catch (err) {
    durumGuncelle("unknown", "BAĞLANTI SORUNU", `Zincirden veri okunamadı. Bağlantınızı kontrol edip tekrar yenileyin.`);
  } finally {
    if (manuel) {
      butonYukleniyor(el.btnRefresh, false, "Bilgileri Yenile");
    }
  }
}

// ============================================================
// 3) ORTAK İŞLEM YÜRÜTÜCÜ (İP-25 YAŞAM DÖNGÜSÜ)
// Aşama 1: Cüzdan onayı -> Aşama 2: Tx hash + Zincir onayı ->
// Aşama 3: Makbuz (receipt.status === 1) doğrulaması
// ============================================================
async function islemYurut({ buton, orijinalMetin, islemAdi, gonderFn, basariSonrasi }) {
  if (!isSepolia) {
    durumGuncelle("error", "YANLIŞ AĞ", "Yanlış ağda işlem gönderilemez. Sepolia ağına geçin.");
    return;
  }
  if (islemSuruyor) return;

  islemSuruyor = true;
  butonlariGuncelle();
  let gonderilenTx = null;

  try {
    // AŞAMA 1: Cüzdan (MetaMask) imzası bekleniyor
    butonYukleniyor(buton, true, "Cüzdan Onayı...");
    durumGuncelle("wallet", "1/2 CÜZDAN ONAYI", `${islemAdi} için MetaMask onayı bekleniyor...`);

    gonderilenTx = await gonderFn();

    // AŞAMA 2: Tx Hash oluştu, zincir (blok) onayı bekleniyor
    butonYukleniyor(buton, true, "Zincir Onayı...");
    durumGuncelle(
      "pending",
      "2/2 ZİNCİR BEKLENİYOR",
      "İşlem ağa iletildi. Blok onayı ve makbuz bekleniyor...",
      gonderilenTx.hash
    );

    // Makbuz doğrulaması (bağlantı kopması burada yakalanır)
    const receipt = await gonderilenTx.wait();

    if (receipt && receipt.status === 1) {
      if (basariSonrasi) basariSonrasi();
      await verileriYenile();
      durumGuncelle(
        "success",
        "ONAYLANDI",
        `${islemAdi} zincirde doğrulandı (Blok #${receipt.blockNumber}).`,
        gonderilenTx.hash
      );
    } else if (receipt && receipt.status === 0) {
      durumGuncelle(
        "error",
        "BAŞARISIZ (REVERT)",
        `${islemAdi} zincirde başarısız oldu (makbuz status: 0).`,
        gonderilenTx.hash
      );
    } else {
      // Makbuz alınamadı -> sonucu bilinmiyor, tx linkini koru, tekrar gönderme!
      durumGuncelle(
        "unknown",
        "SONUÇ DOĞRULANAMADI",
        "İşlem makbuzu alınamadı. Aynı işlem otomatik tekrar gönderilmedi; durumu Etherscan'dan kontrol edin.",
        gonderilenTx.hash
      );
    }
  } catch (err) {
    if (gonderilenTx && gonderilenTx.hash) {
      // İşlem ağa GİTMİŞ ama wait() sırasında hata olmuş:
      // Zincirde kesin revert mi, yoksa bağlantı/RPC kopması mı?
      if (err?.receipt && err.receipt.status === 0) {
        durumGuncelle(
          "error",
          "BAŞARISIZ (REVERT)",
          `${islemAdi} zincirde reddedildi. Detayı Etherscan'dan görebilirsiniz.`,
          gonderilenTx.hash
        );
      } else {
        // Bağlantı sorunu -> sonucu bilinmiyor, mevcut tx linkini KORU, tekrar GÖNDERME!
        durumGuncelle(
          "unknown",
          "SONUÇ DOĞRULANAMADI",
          "Bağlantı sorunu nedeniyle işlem sonucu henüz doğrulanamadı. İşlem ağda işleniyor olabilir; otomatik tekrar gönderilmedi. Etherscan bağlantısından kontrol edip 'Bilgileri Yenile'ye basın.",
          gonderilenTx.hash
        );
      }
    } else {
      // İşlem henüz ağa gitmeden reddedildi (imza reddi, gas tahmin reverti vb.)
      durumGuncelle("error", "İŞLEM BAŞARISIZ", hataMesajiniCoz(err));
    }
  } finally {
    islemSuruyor = false;
    butonYukleniyor(buton, false, orijinalMetin);
  }
}

async function kayitOl() {
  const takmaAd = el.inputNickname.value.trim();
  if (!takmaAd) {
    durumGuncelle("error", "EKSİK BİLGİ", "Lütfen geçerli bir takma ad girin.");
    return;
  }

  await islemYurut({
    buton: el.btnRegister,
    orijinalMetin: "Kayıt Ol",
    islemAdi: "Kayıt işlemi",
    gonderFn: () => contract.kaydol(takmaAd),
    basariSonrasi: () => {
      el.inputNickname.value = "";
    }
  });
}

async function girisiOnayla() {
  const katilimci = el.inputParticipant.value.trim();
  if (!ethers.isAddress(katilimci)) {
    durumGuncelle("error", "GEÇERSİZ ADRES", "Geçerli bir Ethereum adresi girin (0x ile başlayan 42 karakter).");
    return;
  }

  await islemYurut({
    buton: el.btnApproveEntry,
    orijinalMetin: "Girişi Onayla",
    islemAdi: "Giriş onayı",
    gonderFn: () => contract.girisVer(katilimci),
    basariSonrasi: () => {
      el.inputParticipant.value = "";
    }
  });
}

// ============================================================
// OLAY DİNLEYİCİLERİ VE HESAP DEĞİŞİMİ
// ============================================================
el.btnConnect.addEventListener("click", cuzdanBagla);
el.btnRefresh.addEventListener("click", () => verileriYenile(true));
el.btnSwitchSepolia.addEventListener("click", sepoliayaGec);
el.btnRegister.addEventListener("click", kayitOl);
el.btnApproveEntry.addEventListener("click", girisiOnayla);

if (window.ethereum) {
  window.ethereum.on("accountsChanged", async (accounts) => {
    if (!accounts || accounts.length === 0) {
      userAddress = null;
      signer = null;
      contract = null;
      el.walletShort.textContent = "Bağlı değil";
      el.btnConnect.textContent = "Cüzdan Bağla";
      el.myRegBadge.textContent = "Bekleniyor";
      el.myNickname.textContent = "-";
      el.myEntryBadge.textContent = "-";
      butonlariGuncelle();
      durumGuncelle("idle", "BAĞLANTI KESİLDİ", "Cüzdan bağlantısı kesildi. Tekrar bağlanabilirsiniz.");
      return;
    }

    // Hesap değiştiğinde sayfayı kapatmadan yeni hesabın kayıt ve yetki durumunu yenile
    await oturumuKur(`Hesap değişti (${kisalt(accounts[0])}). Kullanıcı ve etkinlik bilgileri yenilendi.`);
  });

  window.ethereum.on("chainChanged", () => window.location.reload());
}