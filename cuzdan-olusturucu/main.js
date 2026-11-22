import {
  hexlify,
  Mnemonic,
  HDNodeWallet,
  SigningKey,
  computeAddress
} from "ethers";
import { IP_MODULLERI } from "./IPLER.js";

const DERIVATION_PATH = "m/44'/60'/0'/0/0";

const eduModeToggle = document.getElementById("edu-mode-toggle");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabWallet = document.getElementById("tab-wallet");
const tabModules = document.getElementById("tab-modules");

const btnGenerate = document.getElementById("btn-generate");
const btnVector = document.getElementById("btn-vector");
const emptyState = document.getElementById("empty-state");
const stepsContainer = document.getElementById("steps-container");
const vectorResult = document.getElementById("vector-result");

const modulesFilter = document.getElementById("modules-filter");
const modulesGrid = document.getElementById("modules-grid");

let activeCategory = "Tümü";

// --- 1. SEKME GEÇİŞLERİ ---
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    tabButtons.forEach((b) => b.classList.toggle("active", b === btn));
    tabWallet.classList.toggle("hidden", target !== "wallet");
    tabModules.classList.toggle("hidden", target !== "modules");
  });
});

// --- 2. EĞİTİCİ MOD ANAHTARI ---
eduModeToggle.addEventListener("change", () => {
  const showEdu = eduModeToggle.checked;
  document.querySelectorAll(".edu-box").forEach((box) => {
    box.classList.toggle("hidden", !showEdu);
  });
});

// --- 3. İP 12: CÜZDAN OLUŞTURMA ZİNCİRİ ---
function generateEducationWallet() {
  // 1) Kriptografik olarak güvenli 128 bit (16 byte) entropi (CSPRNG)
  const entropyBytes = new Uint8Array(16);
  window.crypto.getRandomValues(entropyBytes);
  const entropyHex = hexlify(entropyBytes);

  // 2) Entropi -> 12 İngilizce kelime (BIP39, boş passphrase)
  const mnemonicObj = Mnemonic.fromEntropy(entropyBytes, "");
  const mnemonicPhrase = mnemonicObj.phrase;

  // 3) Mnemonic + "" -> 512 bit (64 byte) Seed (PBKDF2-HMAC-SHA512)
  const seedHex = mnemonicObj.computeSeed();

  // 4) Seed -> BIP32 Master Node -> BIP44 (m/44'/60'/0'/0/0)
  const rootNode = HDNodeWallet.fromSeed(seedHex);
  const derivedWallet = rootNode.derivePath(DERIVATION_PATH);

  // 5) Private Key (256 bit / 32 byte)
  const privateKey = derivedWallet.privateKey;

  // 6) Public Key (secp256k1: Uncompressed 65B & Compressed 33B)
  const signingKey = new SigningKey(privateKey);
  const uncompressedPublicKey = signingKey.publicKey;
  const compressedPublicKey = signingKey.compressedPublicKey;

  // 7) Ethereum Adresi (Keccak-256 son 20 byte + EIP-55 Checksum)
  const ethereumAddress = computeAddress(uncompressedPublicKey);

  const steps = [
    {
      title: "1. Entropi (128 bit / 16 byte)",
      value: entropyHex,
      sensitive: true,
      what: "İşletim sisteminin kriptografik rastgelelik kaynağından (CSPRNG) 16 byte saf rastgele veri üretilir. Math.random() tahmin edilebilir olduğu için kesinlikle kullanılmaz.",
      call: "window.crypto.getRandomValues(new Uint8Array(16))",
      risk: "Bu 16 byte ele geçirilirse tüm 12 kelime, seed ve cüzdandaki bütün hesaplar birebir yeniden üretilebilir."
    },
    {
      title: "2. BIP39 Mnemonic (12 İngilizce Kelime)",
      value: mnemonicPhrase,
      sensitive: true,
      what: "128 bit entropinin SHA-256 özetinden ilk 4 bit checksum olarak eklenir (132 bit). 11'er bitlik 12 parçaya bölünüp 2048 kelimelik BIP39 listesinden seçilir.",
      call: "Mnemonic.fromEntropy(entropyBytes, '')",
      risk: "Cüzdanın ana yedeğidir. Ele geçiren kişi bu tohumdan türeyen tüm ağlardaki bütün hesapları kontrol edebilir."
    },
    {
      title: "3. BIP39 Seed (512 bit / 64 byte)",
      value: seedHex,
      sensitive: true,
      what: "12 kelime ve boş passphrase (''), PBKDF2-HMAC-SHA512 fonksiyonundan 2048 tur geçirilerek 64 byte uzunluğunda sabit tohum (seed) elde edilir.",
      call: "mnemonicObj.computeSeed()",
      risk: "HD cüzdan ağacının matematiksel köküdür. Seed sızarsa mnemonic olmadan da tüm alt anahtarlar türetilebilir."
    },
    {
      title: "4. BIP32 / BIP44 Türetme Yolu",
      value: DERIVATION_PATH,
      sensitive: false,
      what: "Seed'den Master Node kurulur; 44' (BIP44), 60' (Ethereum coin tipi), 0' (ilk hesap), 0 (dış zincir), 0 (ilk adres indeksi) yolu izlenir.",
      call: "HDNodeWallet.fromSeed(seedHex).derivePath(\"m/44'/60'/0'/0/0\")",
      risk: "Standart açık bir yoldur; paylaşılmasında güvenlik riski yoktur."
    },
    {
      title: "5. Private Key (256 bit / 32 byte)",
      value: privateKey,
      sensitive: true,
      what: "Seçilen BIP44 yolundan türetilen 32 byte'lık gizli anahtardır. İşlemleri ECDSA (secp256k1) ile imzalamak için kullanılır.",
      call: "derivedWallet.privateKey",
      risk: "Sızarsa yalnızca bu tek Ethereum adresindeki tüm varlıklar ve imzalama yetkisi kaybedilir."
    },
    {
      title: "6. Public Key (secp256k1 — Uncompressed & Compressed)",
      value: `Uncompressed (65B): ${uncompressedPublicKey}\nCompressed (33B):   ${compressedPublicKey}`,
      sensitive: false,
      what: "Private key ile secp256k1 eliptik eğrisindeki üretici nokta (G) çarpılır. İşlem tek yönlüdür; public key'den private key'e geri dönülemez.",
      call: "new SigningKey(privateKey)",
      risk: "Açık bilgidir, gizli tutulması gerekmez; ancak gizlilik (mahremiyet) açısından kimlikle ilişkilendirilebilir."
    },
    {
      title: "7. Ethereum Adresi (EIP-55 Checksum)",
      value: ethereumAddress,
      sensitive: false,
      what: "Sıkıştırılmamış public key'in 0x04 öneki atılır, kalan 64 byte'ın Keccak-256 özeti alınır ve son 20 byte'ına EIP-55 büyük/küçük harf doğrulaması eklenir.",
      call: "computeAddress(uncompressedPublicKey)",
      risk: "Paylaşılabilir (IBAN gibi). Ancak zincir herkese açık olduğu için tüm işlem geçmişi bu adresten izlenebilir."
    }
  ];

  renderSteps(steps);
}

function renderSteps(steps) {
  emptyState.classList.add("hidden");
  stepsContainer.innerHTML = "";
  stepsContainer.classList.remove("hidden");
  const showEdu = eduModeToggle.checked;

  steps.forEach((step) => {
    const card = document.createElement("article");
    card.className = "step-card";

    const dot = document.createElement("div");
    dot.className = "step-dot";

    const header = document.createElement("div");
    header.className = "step-header";

    const titleWrap = document.createElement("div");
    titleWrap.className = "step-title-wrap";
    titleWrap.innerHTML = `
      <span class="step-title">${step.title}</span>
      <span class="${step.sensitive ? "badge-secret" : "badge-public"}">
        ${step.sensitive ? "Hassas / Gizli" : "Açık Bilgi"}
      </span>
    `;

    const actions = document.createElement("div");
    actions.className = "step-actions";

    const valueBox = document.createElement("pre");
    valueBox.className = "value-box";

    if (step.sensitive) {
      let visible = false;
      valueBox.textContent = "••••••••••••••••••••••••••••••••••••••••";
      valueBox.classList.add("masked");

      const toggleBtn = document.createElement("button");
      toggleBtn.className = "mini-btn";
      toggleBtn.textContent = "Göster";
      toggleBtn.addEventListener("click", () => {
        visible = !visible;
        valueBox.textContent = visible
          ? step.value
          : "••••••••••••••••••••••••••••••••••••••••";
        valueBox.classList.toggle("masked", !visible);
        toggleBtn.textContent = visible ? "Gizle" : "Göster";
      });
      actions.appendChild(toggleBtn);
    } else {
      valueBox.textContent = step.value;
    }

    header.appendChild(titleWrap);
    header.appendChild(actions);

    const eduBox = document.createElement("div");
    eduBox.className = `edu-box${showEdu ? "" : " hidden"}`;
    eduBox.innerHTML = `
      <div class="edu-item">
        <strong>Burada Ne Oluyor?</strong>
        ${step.what}
      </div>
      <div class="edu-item">
        <strong>Kütüphane Çağrısı</strong>
        <code>${step.call}</code>
      </div>
      <div class="edu-item ${step.sensitive ? "risk" : ""}">
        <strong>${step.sensitive ? "Sızarsa Ne Olur?" : "Paylaşım Notu"}</strong>
        ${step.risk}
      </div>
    `;

    card.appendChild(dot);
    card.appendChild(header);
    card.appendChild(valueBox);
    card.appendChild(eduBox);
    stepsContainer.appendChild(card);
  });
}

// --- 4. BIP39 RESMÎ TEST VEKTÖRÜ DOĞRULAMA ---
function verifyBip39TestVector() {
  const testEntropy = "0x00000000000000000000000000000000";
  const expectedMnemonic =
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
  const testPassphrase = "TREZOR";
  const expectedSeed =
    "0xc55257c360c07c72029aebc1b53c05ed0362ada38ead3e3e9efa3708e53495531f09a6987599d18264c1e1c92f2cf141630c7a3c4ab7c81b2f001698e7463b04";

  const mnemonicObj = Mnemonic.fromEntropy(testEntropy, testPassphrase);
  const actualMnemonic = mnemonicObj.phrase;
  const actualSeed = mnemonicObj.computeSeed();

  const mnemonicOk = actualMnemonic === expectedMnemonic;
  const seedOk = actualSeed === expectedSeed;

  vectorResult.classList.remove("hidden");
  vectorResult.innerHTML = `
    <strong>BIP39 Resmî Test Vektörü #1 Doğrulama Sonucu</strong><br/><br/>
    <strong>Test Girdisi (Entropi):</strong> <code>${testEntropy}</code><br/>
    <strong>Test Passphrase (Vektöre Özel):</strong> <code>"${testPassphrase}"</code> <em>(Kendi deneyimizdeki boş passphrase'den ayrıdır)</em><br/><br/>
    <strong>Mnemonic Eşleşmesi:</strong> ${mnemonicOk ? "BAŞARILI" : "HATALI"}<br/>
    <code>${actualMnemonic}</code><br/><br/>
    <strong>Seed Eşleşmesi:</strong> ${seedOk ? "BAŞARILI" : "HATALI"}<br/>
    <code>${actualSeed}</code>
  `;
}

// --- 5. SEKME 2: İP 01-12 EĞİTİM MODÜLLERİ ---
function renderModuleFilters() {
  const categories = ["Tümü", ...new Set(IP_MODULLERI.map((m) => m.kategori))];
  modulesFilter.innerHTML = "";

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = `filter-btn${cat === activeCategory ? " active" : ""}`;
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      activeCategory = cat;
      renderModuleFilters();
      renderModules();
    });
    modulesFilter.appendChild(btn);
  });
}

function renderModules() {
  modulesGrid.innerHTML = "";
  const list =
    activeCategory === "Tümü"
      ? IP_MODULLERI
      : IP_MODULLERI.filter((m) => m.kategori === activeCategory);

  list.forEach((mod) => {
    const card = document.createElement("article");
    card.className = "module-card";

    const itemsHtml = mod.maddeler
      .map(
        (m) => `
        <div class="module-item">
          <strong>${m.soru}</strong>
          ${m.ozet}
        </div>
      `
      )
      .join("");

    card.innerHTML = `
      <div class="module-top">
        <span class="module-code">${mod.kod}</span>
        <span class="module-cat">${mod.kategori}</span>
      </div>
      <h3 class="module-title">${mod.baslik}</h3>
      <p class="module-amac">${mod.amac}</p>
      <div class="module-body hidden">
        ${itemsHtml}
        <div class="module-comment"><strong>Yorum:</strong> ${mod.yorum}</div>
      </div>
    `;

    card.addEventListener("click", () => {
      card.querySelector(".module-body").classList.toggle("hidden");
    });

    modulesGrid.appendChild(card);
  });
}

btnGenerate.addEventListener("click", generateEducationWallet);
btnVector.addEventListener("click", verifyBip39TestVector);

renderModuleFilters();
renderModules();