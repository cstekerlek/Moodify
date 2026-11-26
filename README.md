# Moodify — Ruh Hâline Göre Müzik Keşif Platformu

Moodify; kullanıcıların o anki ruh hâline, müzik tercihlerine ve seçtikleri dile göre şarkılar keşfedebildiği, kişiselleştirilmiş çalma listeleri oluşturabildiği ve 10 farklı müzik platformuna doğrudan arama bağlantılarıyla yönlendirilebildiği tam kapsamlı bir web uygulamasıdır.

---

## Temel Özellikler

- **Başlangıç Rehberi (Onboarding):** İlk ziyaretçilere 4 adımlı tanıtım ekranı sunulur ve her zaman **Yardım** sekmesinden tekrar açılabilir.
- **Çoklu Ekran Mimarisi:** `Keşfet`, `Ruh Hâlim` (çoklu karma ruh hâli + enerji + tür stüdyosu), `Müzik Kütüphanesi`, `Çalma Listelerim`, `Favoriler`, `Profil`, `Yardım`, Ruh Hâli Kategori sayfası, Çalma Listesi Detay sayfası ve `Yönetici Paneli`.
- **7.420+ Benzersiz Doğrulanmış Şarkı:**
  - Özgün başlangıç havuzundaki 468 şarkı eksiksiz korunmuştur.
  - Açık **Spotify Tracks Dataset** (HuggingFace / Kaggle — CC0) üzerinden alınan gerçek parçalar ve sayısal ses öznitelikleri (`valence`, `energy`, `danceability`, `acousticness`, `tempo`) ile 7.420 benzersiz şarkıya genişletilmiştir.
  - Eksik yıl veya ses özniteliği verileri uydurulmaz; açıkça `null` / doğrulanmadı olarak işaretlenir.
- **14 Müzik Dili ve 27 Tür:** Türkçe, İngilizce, İspanyolca, Fransızca, İtalyanca, Almanca, Korece, Japonca, Portekizce, Arapça, Rusça, Hintçe, Yunanca, Felemenkçe (`Karışık / Tüm Diller` ve çoklu dil seçimi destekli).
- **10 Müzik Platformu Desteği:** Spotify, YouTube Music, YouTube, Apple Music, SoundCloud, Deezer, TIDAL, Amazon Music, Bandcamp ve Audiomack için güvenli arama bağlantıları.
- **Firebase Auth & Firestore İzolasyonu:** Google ile giriş yapan kullanıcıların profilleri, favorileri ve kişisel çalma listeleri Firestore'da `uid` bazlı güvenlik kurallarıyla izole edilir; misafir kullanıcılar için tarayıcı `localStorage` kalıcılığı sağlanır.
- **Güvenli Yönetici Paneli:** Şarkı Yönetimi, Çalma Listesi Yönetimi, Veri Seti Yönetimi (CSV/JSON içe aktarma ve kopya tespiti), Kategori Yönetimi ve Dil Yönetimi modülleri.

---

## Öneri Algoritması (Şeffaf Matematiksel Model)

Moodify, yapay zekâ veya kara kutu tahmin iddiası yerine deterministik ve ağırlıklı ses özniteliği uzaklığı hesaplaması kullanır:

- **Valence (%34):** Müzikal pozitiflik / neşe değeri (`0.0 – 1.0`)
- **Energy (%32):** Yoğunluk ve dinamizm (`0.0 – 1.0`)
- **Acousticness (%16):** Akustik enstrüman ağırlığı (`0.0 – 1.0`)
- **Tempo (%11):** BPM farkının normalize edilmiş uzaklığı
- **Danceability (%7):** Ritim ve dans uygunluğu (`0.0 – 1.0`)

Karma ruh hâli modunda seçilen kategorilerin hedef profilleri ortalanır. Oluşturulan listelerde aynı sanatçıdan en fazla 2 şarkı seçilir ve `Karışık` dil modunda diller arası çeşitlilik korunur.

---

## Kurulum ve Yerel Geliştirme

### Gereksinimler
- Node.js `>= 20`
- npm

### Kurulum Adımları

```bash
npm install
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır (`server.ts` Express API + Vite dev middleware).

### Katalog Verisini Yeniden Üretmek İçin

```bash
node scripts/build-catalog.mjs
```

Bu betik `/public/data/tracks-catalog.json` ve `/src/data/catalog-meta.json` dosyalarını üretir.

---

## Ortam Değişkenleri ve Yönetici Güvenliği

Yönetici kimlik bilgileri **asla** istemci tarafı JavaScript/TypeScript koduna gömülmez. İki güvenli yetkilendirme yolu desteklenir:

1. **Firebase RBAC Yönetici Girişi:** `firestore.rules` içinde tanımlı yetkili Google hesabı veya `/admins/{uid}` belgesine sahip hesaplar doğrudan Firestore üzerinde canlı yönetim yapabilir.
2. **Sunucu Tarafı Yönetici Oturumu:** Sunucu ortam değişkenleri ile HMAC imzalı `HttpOnly` çerez oturumu açılır (`/api/admin/login`).

Örnek ortam değişkenleri (`.env.example`):

```env
ADMIN_USERNAME="your-admin-username"
# ADMIN_PASSWORD veya SHA-256 hash değeri kullanın:
ADMIN_PASSWORD_HASH=""
ADMIN_PASSWORD=""
ADMIN_SESSION_SECRET="long-random-secret"
```

---

## Veritabanı ve Güvenlik Kuralları (Firebase Firestore)

- Yapılandırma dosyası: `/firebase-applet-config.json`
- Şema taslağı: `/firebase-blueprint.json`
- Güvenlik kuralları: `/firestore.rules` (`npx eslint firestore.rules` ile doğrulanır)

Katalog okuma kotasını (Spark ücretsiz plan) korumak amacıyla 7.420 temel şarkı statik `/public/data/tracks-catalog.json` dosyasından yüklenir; yalnızca yönetici eklemeleri/düzenlemeleri (`customTracks`, `curatedPlaylists`, `moodCategories`, `languages`) ve kullanıcı verileri (`users/{uid}`, `favorites`, `playlists`) Firestore'da saklanır.

---

## Vercel Dağıtımı (Deployment)

Proje `vercel.json` ve `/api/index.ts` ile Vercel üzerinde doğrudan çalışacak şekilde yapılandırılmıştır:

1. Projeyi GitHub üzerinden Vercel'e bağlayın.
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. Vercel Dashboard > **Settings > Environment Variables** bölümüne `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` (veya `ADMIN_PASSWORD`) ve `ADMIN_SESSION_SECRET` değerlerini ekleyin.
5. **Deploy** edin.
