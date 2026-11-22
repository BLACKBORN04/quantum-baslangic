export const IP_MODULLERI = [
  {
    kod: "İP 01",
    kategori: "Temeller",
    baslik: "Blokzincir ve Ortak Kayıt",
    amac: "Teknolojinin hangi probleme cevap verdiğini anlamak.",
    maddeler: [
      {
        soru: "Blokzincir, işlem, blok ve dağıtık defter ilişkisi",
        ozet: "İşlemler (tx) kullanıcıların yaptığı değer/durum değişiklikleridir; işlemler bloklarda toplanır, bloklar kriptografik hash ile birbirine zincirlenir ve bu defter ağdaki tüm düğümlerde (node) ortak kopya olarak tutulur."
      },
      {
        soru: "Merkezi veritabanı vs. Blokzincir",
        ozet: "Merkezi veritabanında tek bir yönetici kaydı silebilir veya değiştirebilir. Blokzincirde kayıt kontrolü ve güven tek bir kuruma değil, kriptografiye ve çoğunluk uzlaşmasına (konsensüs) dağıtılır."
      },
      {
        soru: "Geçmiş işlem kaydı vs. Güncel durum (State)",
        ozet: "Geçmişte onaylanan bir işlem silinmez (değişmez tarihçe). Sözleşmedeki güncel değer ise yeni bir işlemle üzerine yeni durum yazılarak güncellenir."
      }
    ],
    yorum: "Tek bir kurumun zaten güvenilir olduğu, yüksek hız ve düşük maliyet gereken kapalı sistemlerde normal veritabanı daha mantıklıdır."
  },
  {
    kod: "İP 02",
    kategori: "Temeller",
    baslik: "Node ve Konsensüs",
    amac: "Ağdaki rollerin ve uzlaşmanın görevini kavramak.",
    maddeler: [
      {
        soru: "Node ve Validator farkı",
        ozet: "Her node ağı dinler, kuralları doğrular ve defteri tutar; ancak her node blok üretmez. Blok öneren ve onaylayanlar validator (PoS) veya madencilerdir (PoW)."
      },
      {
        soru: "PoW ve PoS farkı",
        ozet: "PoW (Bitcoin) işlem gücü ve elektrik maliyetiyle güven sağlar. PoS (Ethereum) ise kilitlenen teminat (stake) ve kural ihlalinde kesinti (slashing) mekanizmasıyla uzlaşma sağlar."
      },
      {
        soru: "Bloğa alınma, başarılı çalışma ve kesinleşme (Finality)",
        ozet: "İşlemin bloğa girmesi başarılı olduğu anlamına gelmez (revert olabilir). Kesinleşme ise bloğun geri döndürülmesinin ekonomik/teknik olarak imkânsız hale gelmesidir."
      }
    ],
    yorum: "Tek bir node kapanınca ağın durup durmaması ağın merkezsizlik derecesine ve aktif validator dağılımına bağlıdır."
  },
  {
    kod: "İP 03",
    kategori: "Cüzdan & Varlık",
    baslik: "Kriptografi ve Cüzdan",
    amac: "Cüzdan oluşturma görevine kavramsal hazırlık yapmak.",
    maddeler: [
      {
        soru: "Hash, Şifreleme ve Dijital İmza",
        ozet: "Hash tek yönlü parmak izi üretir (geri çevrilemez). Şifreleme veriyi gizler ve anahtarla geri açılır. Dijital imza ise özel anahtarı ifşa etmeden işlemin gerçek sahibini kanıtlar."
      },
      {
        soru: "BIP39, BIP32 ve BIP44 standartları",
        ozet: "BIP39 entropiyi 12/24 kelimeye ve seed'e çevirir. BIP32 bu seed'den hiyerarşik anahtar ağacı (HD Wallet) kurar. BIP44 ise ağ ve hesap yolunu (m/44'/60'/0'/0/0) standartlaştırır."
      },
      {
        soru: "Cüzdan uygulaması vs. Hesap",
        ozet: "Varlıklar cüzdan uygulamasının içinde değil, blokzincirdeki hesapta durur. Uygulama yalnızca anahtarları yöneten bir arayüzdür."
      }
    ],
    yorum: "Cüzdan uygulamasını silmek sorun değildir (12 kelimeyle geri gelir), ancak 12 kelime/private key kaybolursa varlıklara bir daha ulaşılamaz."
  },
  {
    kod: "İP 04",
    kategori: "Cüzdan & Varlık",
    baslik: "Bitcoin, Ethereum ve Token",
    amac: "Ağ ile varlık türlerini ayırt etmek.",
    maddeler: [
      {
        soru: "Bitcoin vs. Ethereum",
        ozet: "Bitcoin temel olarak eşler arası dijital değer transferi ve saklama odaklıdır. Ethereum ise genel amaçlı, Turing-complete akıllı sözleşmeler çalıştırabilen programlanabilir bir platformdur."
      },
      {
        soru: "Native varlık (ETH) vs. Token (USDC)",
        ozet: "ETH ağın kendi yerleşik varlığıdır ve gas ücreti onunla ödenir. USDC ise Ethereum üzerinde bir ERC-20 akıllı sözleşmesiyle tanımlanan tokendır."
      },
      {
        soru: "Mainnet vs. Testnet (Sepolia)",
        ozet: "Mainnet gerçek ekonomik değere sahip ana ağdır. Sepolia gibi testnetler geliştirme ve deneme içindir; test ETH'nin gerçek parasal değeri yoktur."
      }
    ],
    yorum: "Her etkinlik girişi için token şart değildir; ancak ikincil piyasada devredilebilirlik veya zincir üstü doğrulanabilirlik gerekiyorsa NFT/token anlamlı olur."
  },
  {
    kod: "İP 05",
    kategori: "Cüzdan & Varlık",
    baslik: "Akıllı Sözleşme ve ABI",
    amac: "Kodun zincirde çalışmasını ve çağrılmasını anlamak.",
    maddeler: [
      {
        soru: "Akıllı Sözleşme, EVM ve State",
        ozet: "Akıllı sözleşme zincirde yaşayan koddur. EVM (Ethereum Virtual Machine) bu kodu her node'da aynı sonucu verecek şekilde çalıştırır. State, sözleşmenin depoladığı güncel veridir."
      },
      {
        soru: "Derleme, Bytecode, Deploy ve ABI",
        ozet: "Solidity kodu derlenince makine kodu (bytecode) ve arayüz haritası (ABI) çıkar. Deploy işlemi bytecode'u zincire yazar. ABI, dış uygulamaların hangi fonksiyonu nasıl çağıracağını bilmesini sağlar."
      },
      {
        soru: "Veri Okuma vs. State Değiştirme",
        ozet: "Okuma (view/call) yerel node'dan ücretsiz yapılır. State değiştiren işlemler ağa yayınlanır, imza ve gas ücreti gerektirir."
      }
    ],
    yorum: "Aynı kod iki farklı adrese deploy edildiğinde her sözleşme adresinin kendi bağımsız depolama alanı (state) olur; bu yüzden kayıtları ayrıdır."
  },
  {
    kod: "İP 06",
    kategori: "Ağ & Ekosistem",
    baslik: "RPC, Explorer ve Event",
    amac: "Uygulamanın zincirdeki bilgiye nasıl eriştiğini anlamak.",
    maddeler: [
      {
        soru: "RPC ve RPC Endpoint",
        ozet: "Uygulamanın bir Ethereum node'u ile JSON-RPC protokolü üzerinden konuşmasını sağlayan kapıdır (URL). Bir RPC sağlayıcısı veya explorer çökse bile blokzincir ağı çalışmaya devam eder."
      },
      {
        soru: "Event/Log vs. Güncel State ve Indexer",
        ozet: "State yalnızca son değeri tutar; event/log ise geçmişte olan olayların ucuz ve aranabilir kaydıdır. Indexer'lar bu logları tarayıp uygulamalara hızlı sorgu sunar."
      }
    ],
    yorum: "Explorer olmadan bir kaydı doğrulamak için kendi node'uma veya doğrudan bir RPC endpoint'ine eth_call / eth_getTransactionReceipt isteği atarım."
  },
  {
    kod: "İP 07",
    kategori: "Ağ & Ekosistem",
    baslik: "Bir İşlemin Yolculuğu",
    amac: "İmza ile zincirdeki sonuç arasındaki aşamaları anlamak.",
    maddeler: [
      {
        soru: "Cüzdan Bağlamak, Mesaj İmzalamak ve İşlem Göndermek",
        ozet: "Bağlamak sadece adresi paylaşır. Mesaj imzalamak zincire yazılmaz (gas yok). İşlem göndermek ise state değiştirir, ağa yayınlanır ve gas harcar."
      },
      {
        soru: "Gas, Nonce ve Chain ID",
        ozet: "Gas işlem maliyetini sınırlar; Nonce hesabın işlem sırasını takip edip tekrar saldırısını önler; Chain ID işlemin yanlış ağda (ör. Sepolia yerine Mainnet) tekrarlanmasını engeller."
      },
      {
        soru: "Pending, Receipt ve Status",
        ozet: "Tx hash işlemin kimliğidir ama başarı kanıtı değildir. Kesin sonuç için işlem makbuzundaki (receipt) status alanının 1 (başarılı) veya 0 (revert) olduğuna bakılır."
      }
    ],
    yorum: "'İşlem başarısız' (status: 0) kesinleşmiş bir reddir; 'sonucunu öğrenemedim' ise ağ/RPC kopukluğu nedeniyle işlemin hâlâ pending veya onaylanmış olabileceği belirsiz durumdur."
  },
  {
    kod: "İP 08",
    kategori: "Ağ & Ekosistem",
    baslik: "Ekosistemi Tanı",
    amac: "İleri alanların hangi ihtiyaca cevap verdiğini görmek.",
    maddeler: [
      {
        soru: "L1/L2, DeFi, DAO, Oracle, Bridge",
        ozet: "L1 ana ağ (Ethereum), L2 ölçekleme katmanıdır. DeFi aracısız finans, DAO topluluk yönetişimi, Oracle zincir dışı veri köprüsü, Bridge ise ağlar arası varlık transfer aracıdır."
      },
      {
        soru: "Zero-Knowledge Proof (ZK)",
        ozet: "Bir bilginin kendisini açıklamadan, o bilgiye sahip olunduğunu veya bir hesaplamanın doğru yapıldığını matematiksel olarak kanıtlar. Her ZK sistemi tam gizlilik amaçlı değildir; bazıları (ZK-Rollup) sadece ölçekleme içindir."
      }
    ],
    yorum: "Siber güvenlik ve kriptografi kesişimi nedeniyle ZK kanıtları ve akıllı sözleşme güvenliği (audit) derinleşmek istediğim alanlar."
  },
  {
    kod: "İP 09",
    kategori: "Proje & Yarışma",
    baslik: "Gerçek Proje İncelemesi (Uniswap)",
    amac: "Kavramları kullanılan bir sistemle ilişkilendirmek.",
    maddeler: [
      {
        soru: "Çözdüğü Problem ve Mimari",
        ozet: "Merkezi borsaya güvenmeden, otomatik piyasa yapıcı (AMM) likidite havuzlarıyla ERC-20 token takası sağlar. Çekirdek takas zincir üstündedir; web arayüzü, rota API'si ve token listeleri zincir dışındadır."
      },
      {
        soru: "Güven Sınırları",
        ozet: "Kullanıcı çekirdek sözleşmenin değişmezliğine güvenirken; frontend hijacking riskine karşı arayüz işletmecisine ve doğru veri için RPC sağlayıcısına kısmen güvenmek zorundadır."
      }
    ],
    yorum: "Güçlü yanı 7/24 sansüre dirençli ve şeffaf likidite sunması; sınırlaması ise yüksek gas dönemleri ve MEV/ön-çalıştırma riskidir."
  },
  {
    kod: "İP 10",
    kategori: "Proje & Yarışma",
    baslik: "Yarışma Şartnamesi İncelemesi",
    amac: "Takımın hedefini ve yarışmanın beklentilerini anlamak.",
    maddeler: [
      {
        soru: "Kapsam ve Beklenen Çıktılar",
        ozet: "Yarışma şartnamesindeki problem tanımları, teknik rapor, çalışan prototip ve değerlendirme ölçütleri doğrultusunda takım hedefleri belirlenir."
      }
    ],
    yorum: "Akıllı sözleşme güvenliği, cüzdan/imza akışları ve zincir üstü-zincir dışı ayrımı yarışma prototipinde en kritik konular olacak."
  },
  {
    kod: "İP 11",
    kategori: "Uygulama",
    baslik: "Çalışma Ortamını Hazırla",
    amac: "Geliştirme ve versiyon kontrol araçlarını kurmak.",
    maddeler: [
      {
        soru: "Kurulan Araçlar",
        ozet: "VS Code, Git, GitHub (quantum-baslangic), Node.js, izole tarayıcı profilinde MetaMask ve Remix IDE kurularak geliştirme ortamı hazırlandı."
      }
    ],
    yorum: "Tüm araçları resmî kaynaklardan kurup izole bir tarayıcı profiliyle MetaMask'ı ayırmak güvenlik alışkanlığı kazandırdı."
  },
  {
    kod: "İP 12",
    kategori: "Uygulama",
    baslik: "Kendi Cüzdan Oluşturucunu Yaz",
    amac: "Rastgelelikten Ethereum adresine giden 7 aşamayı kodlamak.",
    maddeler: [
      {
        soru: "Uygulanan Zincir",
        ozet: "CSPRNG 128-bit Entropi → BIP39 12 Kelime → PBKDF2 512-bit Seed → BIP32/44 (m/44'/60'/0'/0/0) → Private Key → secp256k1 Public Key → Keccak-256 Ethereum Adresi."
      }
    ],
    yorum: "Mnemonic tüm HD cüzdan ağacının ana köküdür; Private Key ise o ağaçtaki tek bir türetme yoluna ait tek hesabın anahtarıdır."
  }
];