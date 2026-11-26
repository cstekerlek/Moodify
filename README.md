🎧 Moodify

Duygu Durumu Odaklı Müzik Keşif ve Öneri Platformu

<p align="center">
  <strong>Her ruh hâlinin bir müziği vardır.</strong>
  <br />
  Ruh hâlini seç, müziğini keşfet.
</p>
<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Authentication%20%26%20Firestore-FFCA28?logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white" />
</p>

⸻

📖 İçindekiler

* 1. Proje Hakkında
* 2. Projenin Amacı ve Çıkış Noktası
* 3. Moodify Nasıl Çalışır?
* 4. Uygulamanın Ekranları ve Özellikleri
* 5. Ruh Hâli Kategorileri
* 6. Müzik Öneri Algoritması
* 7. Müzik Kataloğu ve Veri Yönetimi
* 8. Şarkı Bilgileri ve Albüm Kapakları
* 9. Müzik Platformları
* 10. Kullanıcı Hesap Sistemi
* 11. Yönetici Paneli
* 12. Read Me ve Yardım Sistemi
* 13. Arayüz ve Tasarım
* 14. Kullanılan Teknolojiler
* 15. Proje Dosya Yapısı
* 16. Veri Yapısı
* 17. Kurulum ve Çalıştırma
* 18. Firebase Yapılandırması
* 19. Yönetici Girişi ve Sunucu Yapılandırması
* 20. API ve Sunucu İşlemleri
* 21. Güvenlik ve Gizlilik
* 22. Geliştirme ve Gelecek Hedefleri
* 23. Veri Kaynakları
* 24. Lisans ve Sorumluluk

⸻

🎵 1. Proje Hakkında

Moodify, kullanıcıların mevcut ruh hâllerine göre müzik keşfetmelerini sağlayan web tabanlı bir müzik keşif ve öneri platformudur.

Geleneksel müzik uygulamalarında kullanıcılar genellikle şarkı adı, sanatçı veya müzik türü üzerinden arama yapar. Moodify ise müzik keşfine farklı bir noktadan yaklaşır: Kullanıcı, dinlemek istediği müziği seçmeden önce o an nasıl hissettiğini belirler.

Uygulama, seçilen ruh hâline ait hedef ses profilleri ile müzik kataloğundaki şarkıların ses özelliklerini karşılaştırır. Bu karşılaştırma sonucunda kullanıcıya uygun şarkılar sıralanır ve kişiselleştirilmiş çalma listeleri oluşturulur.

Moodify yalnızca bir müzik listesi oluşturma aracı değildir. Ruh hâli kategorileri, çoklu duygu eşleştirmesi, tematik müzik sahneleri, müzik ruleti, şarkı kütüphanesi, favoriler ve kişisel çalma listeleri gibi farklı özellikleri bir araya getirir.

Projenin temel yaklaşımı:

Kullanıcı müziği aramak yerine, önce hissettiği duyguyu seçer. Moodify bu duyguyla örtüşen müzikleri keşfetmesine yardımcı olur.

Proje türü: Web tabanlı müzik keşif ve öneri uygulaması
Proje adı: Moodify
Temel kullanım alanı: Duygu durumuna dayalı müzik keşfi
Arayüz dili: Türkçe
GitHub deposu: https://github.com/cstekerlek/Moodify

💡 2. Projenin Amacı ve Çıkış Noktası

Müzik, insanların günlük yaşamında farklı duygulara eşlik eden önemli bir araçtır. İnsanlar mutlu olduklarında, üzgün olduklarında, çalışırken, dinlenirken veya spor yaparken farklı müzikler tercih edebilir.

Moodify’nin çıkış noktası, bu ilişkiyi dijital müzik keşif deneyimine taşımaktır.

Proje aşağıdaki ihtiyaçlara odaklanır:

* Kullanıcının ruh hâline uygun müzikleri daha kolay bulabilmesi.
* Farklı dillerde ve türlerde müzik keşfedebilmesi.
* Birden fazla duyguyu bir arada değerlendirebilmesi.
* Müzik listelerini kişisel tercihlerine göre oluşturabilmesi.
* Müzik keşfini sıradan arama işleminin ötesine taşıması.
* Müzik kataloğunun yönetilebilir ve geliştirilebilir olması.

Moodify, müzik ile duygu arasındaki ilişkiyi ses özellikleri üzerinden değerlendiren bir öneri yaklaşımı kullanır.

Bu yaklaşım, kullanıcıya kesin bir psikolojik duygu analizi sunmaz. Kullanıcının seçtiği kategoriye ait sayısal ses profilleriyle şarkıların özelliklerini karşılaştırır.

⚙️ 3. Moodify Nasıl Çalışır?

Uygulamanın genel çalışma süreci aşağıdaki adımlardan oluşur:

1. Kullanıcı Moodify’yi açar.
2. Keşfet ekranından bir ruh hâli seçer veya Ruh Hâli Stüdyosu’na geçer.
3. İstediği müzik dilini belirler.
4. İhtiyaç duyarsa müzik türü ve enerji seviyesi filtrelerini kullanır.
5. Moodify, seçilen tercihlere uygun şarkıları müzik kataloğundan belirler.
6. Şarkıların ses özellikleri karşılaştırılarak eşleşme puanları hesaplanır.
7. Sonuçlar kullanıcıya çalma listesi olarak sunulur.
8. Kullanıcı şarkıları favorilerine ekleyebilir, kendi listesine kaydedebilir veya müzik platformlarında açabilir.

Uygulama içerisinde aynı müzik kataloğu farklı keşif yöntemleriyle kullanılabilir. Böylece kullanıcı yalnızca ruh hâli kategorilerinden değil, tematik sahnelerden, müzik ruletinden ve genel şarkı kütüphanesinden de yararlanabilir.

🖥️ 4. Uygulamanın Ekranları ve Özellikleri

Moodify, farklı işlevleri birbirinden ayıran ekran tabanlı bir yapıya sahiptir.

4.1. Keşfet (Discover)

Uygulamanın ana ekranıdır.

Kullanıcı Moodify’ye girdiğinde ruh hâlini seçebileceği kategorilerle karşılaşır.

Bu ekranda:

* Beş temel ruh hâli kategorisi görüntülenir.
* Müzik dili seçilebilir.
* Öne çıkan çalma listeleri incelenebilir.
* Karma Ruh Hâli özelliğine geçiş yapılabilir.
* Seçilen kategoriye ait müzik keşif ekranı açılabilir.

Keşfet ekranının amacı, kullanıcıyı karmaşık arama işlemleriyle uğraştırmadan müzik keşfine yönlendirmektir.

4.2. Ruh Hâlim (Mood Studio)

Ruh Hâli Stüdyosu, Moodify’nin kişiselleştirme özelliklerinin merkezidir.

Kullanıcı bu ekranda bir veya birden fazla duygu kategorisi seçebilir.

Kullanılabilen kontroller:

* Ruh hâli seçimi.
* Karma Ruh Hâli modu.
* Çoklu duygu seçimi.
* Müzik dili seçimi.
* Müzik türü filtreleme.
* Enerji seviyesi filtreleme.
* Yeni öneriler oluşturma.
* Oluşturulan listeyi kaydetme.

Karma mod açık olduğunda birden fazla ruh hâlinin hedef ses özellikleri birleştirilir. Böylece tek bir kategori yerine seçilen duyguların ortak profiline yakın şarkılar bulunur.

4.3. Ruh Hâli Detay Sayfası (Mood Detail)

Keşfet ekranında seçilen ruh hâlinin ayrıntılı müzik sayfasıdır.

Bu ekranda:

* Seçilen kategorinin görsel teması gösterilir.
* Kategoriye uygun şarkılar listelenir.
* Müzik dili filtresi kullanılabilir.
* Yeni öneriler istenebilir.
* Şarkılar favorilere eklenebilir.
* Şarkılar kişisel çalma listelerine kaydedilebilir.
* Önerilen liste kullanıcı tarafından kaydedilebilir.

4.4. Moodify Cinema 🎬

Moodify Cinema, müzik keşfini sinematik atmosferlerle birleştiren tematik bir özelliktir.

Bu bölümde kullanıcılar bir ruh hâli seçmek yerine bir sahne veya atmosfer seçebilir.

Örnek sahneler:

* Gece Ankara sokaklarında.
* Yağmurlu bir pazar sabahı.
* Gece uzun yolculuğu.
* Eski bir anının içinde.
* Sessiz bir akşam.
* Kendini bir filmin başrolünde hissettiğin an.

Her sahnenin kendine ait açıklaması, görseli ve müzik hedef profili bulunur.

Kullanıcı sahneye girdiğinde o atmosfer için oluşturulan şarkı listesini görüntüler.

Sahne detayında:

* Sahneye ait müzik listesi görüntülenir.
* Şarkılar yenilenebilir.
* Müzik dili değiştirilebilir.
* Şarkılar favorilere eklenebilir.
* Liste kişisel çalma listelerine kaydedilebilir.

4.5. Müzik Ruleti (Music Roulette) 🎲

Müzik Ruleti, hangi müziği dinleyeceğine karar veremediğin durumlar için tasarlanmıştır.

Kullanıcı bir çarkı çevirerek rastgele bir ruh hâli seçer.

Çarkın belirlediği kategoriye göre yeni bir müzik listesi hazırlanır.

İşleyiş:

1. Kullanıcı Müzik Ruleti ekranını açar.
2. Dinlemek istediği müzik dilini belirler.
3. “Bana Sürpriz Yap” butonuna basar.
4. Çark rastgele bir ruh hâli seçer.
5. Seçilen ruh hâline uygun şarkılar listelenir.
6. Kullanıcı yeni bir sonuç için çarkı tekrar çevirebilir.
7. Beğendiği listeyi çalma listelerine kaydedebilir.

4.6. Müzik Kütüphanesi (Library)

Moodify’nin genel şarkı arama ve filtreleme ekranıdır.

Kullanıcı müzik kataloğundaki şarkıları farklı ölçütlere göre arayabilir.

Arama yapılabilen alanlar:

* Şarkı adı.
* Sanatçı.
* Albüm.
* Müzik türü.
* Dil.
* Ruh hâli.

Ek olarak:

* Dil filtresi.
* Tür filtresi.
* Ruh hâli filtresi.
* Sayfalama sistemi.
* Şarkı ayrıntılarını görüntüleme.
* Favorilere ekleme.
* Kişisel listeye ekleme.

Kütüphane ekranında sonuçlar sayfalara ayrılır ve her sayfada 12 şarkı gösterilir.

4.7. Çalma Listelerim (My Playlists)

Kullanıcıların kendi müzik listelerini oluşturabildiği ve yönetebildiği bölümdür.

Kullanıcı:

* Yeni çalma listesi oluşturabilir.
* Listeye isim verebilir.
* Açıklama ekleyebilir.
* Listeye şarkı ekleyebilir.
* Şarkı çıkarabilir.
* Mevcut listeyi düzenleyebilir.
* Listeyi silebilir.
* Kayıtlı listelerini açabilir.
* Önerilen müzik listelerini kişisel listelerine kaydedebilir.

4.8. Çalma Listesi Detayı (Playlist Detail)

Seçilen çalma listesinin içeriğini görüntüler.

Bu ekranda listenin adı, açıklaması, kapak görseli ve şarkıları bulunur.

Şarkılar üzerinden favorilere ekleme, listeden çıkarma ve müzik platformlarına yönelme gibi işlemler gerçekleştirilebilir.

4.9. Favoriler (Favorites)

Kullanıcının beğendiği şarkıları bir arada tutmasını sağlar.

Şarkı kartlarındaki kalp simgesiyle favori işlemi yapılır.

Favoriler ekranında:

* Favori şarkılar görüntülenir.
* Favoriler içerisinde arama yapılabilir.
* Şarkılar kişisel çalma listelerine eklenebilir.
* Şarkı ayrıntıları incelenebilir.
* Müzik platformlarında arama yapılabilir.
* İstenildiğinde favorilerden çıkarılabilir.

4.10. Profil (Profile)

Kullanıcının hesap ve müzik tercihlerini yönetebildiği ekrandır.

Profil bölümünde:

* Kullanıcı adı görüntülenebilir ve düzenlenebilir.
* Google hesabıyla giriş yapılabilir.
* Oturum kapatılabilir.
* Tercih edilen müzik dilleri belirlenebilir.
* Tercih edilen müzik türleri seçilebilir.
* Favori ve çalma listesi sayıları görüntülenebilir.
* Son ziyaret ve kullanım bilgileri incelenebilir.
* Yönetici yetkisi varsa Yönetici Paneli’ne geçilebilir.

4.11. Yardım (Help)

Moodify’nin kullanımına ilişkin açıklamaların bulunduğu ayrı bir ekrandır.

Yardım ekranında:

* Moodify’nin genel kullanımı.
* Ruh hâli kategorileri.
* Müzik Ruleti.
* Moodify Cinema.
* Çalma listeleri.
* Favoriler.
* Dil seçimi.
* Müzik platformları.
* Veri seti yükleme.
* Sık sorulan sorular.
* Read Me ekranını yeniden açma

gibi konular açıklanır.

4.12. Yönetici Paneli (Admin Panel)

Yönetici Paneli, uygulamanın müzik kataloğunu ve içeriklerini yönetmek için geliştirilmiştir.

Ayrıntıları aşağıdaki Yönetici Paneli bölümünde açıklanmıştır.

🎭 5. Ruh Hâli Kategorileri

Moodify’nin öneri sistemi beş temel kategori üzerine kuruludur.

Her kategori, belirli ses özellikleri için hedef değerler içerir.

Kategori	Valence	Energy	Danceability	Acousticness	Tempo
Mutlu & Neşeli	0.82	0.78	0.74	0.16	118
Hüzünlü & Melankolik	0.20	0.28	0.36	0.68	84
Sakin & Odaklanma	0.42	0.24	0.35	0.85	88
Enerjik & Antrenman	0.68	0.89	0.72	0.08	136
Stresli & Rahatlama	0.50	0.30	0.46	0.74	80

Değerler uygulamanın varsayılan kategori yapılandırmasındaki hedef profillerdir. Yönetici tarafından değiştirilebilir.

Ses Özellikleri Ne Anlama Gelir?

Valence: Müziğin pozitif veya negatif duygusal karakterini ifade eder. Yüksek değerler daha pozitif, düşük değerler daha melankolik bir ses karakterine işaret eder.

Energy: Şarkının enerji ve hareketlilik seviyesini temsil eder.

Danceability: Şarkının ritmik yapısının dans etmeye ne kadar uygun olduğunu ifade eder.

Acousticness: Şarkının akustik karakterini gösterir.

Tempo: Şarkının dakikadaki vuruş sayısını (BPM) ifade eder.

Bu özellikler birlikte değerlendirilerek şarkıların seçilen ruh hâliyle ne ölçüde örtüştüğü hesaplanır.

🧠 6. Müzik Öneri Algoritması

Moodify’nin temel teknik bileşenlerinden biri müzik eşleştirme algoritmasıdır.

Sistem, şarkıların ses özelliklerini seçilen ruh hâlinin hedef değerleriyle karşılaştırır.

Bu yapı, ağırlıklı uzaklık ve eşleşme puanlaması esasına dayanır.

6.1. Algoritmanın Girdi Değerleri

Her şarkı için aşağıdaki özellikler değerlendirilir:

* Valence
* Energy
* Danceability
* Acousticness
* Tempo

Seçilen ruh hâli kategorilerinin de aynı özellikler için hedef değerleri bulunur.

6.2. Çoklu Ruh Hâli Hesaplaması

Kullanıcı birden fazla kategori seçtiğinde her kategorinin hedef değerleri birleştirilir.

Örneğin kullanıcı hem Mutlu & Neşeli hem de Sakin & Odaklanma kategorilerini seçerse sistem bu kategorilerin hedef özelliklerini ortalayarak ortak bir ses profili oluşturur.

Bu sayede iki kategori arasında dengeli bir öneri profili elde edilir.

6.3. Ağırlıklı Uzaklık Hesabı

Algoritma aşağıdaki ağırlıkları kullanır:

Ses Özelliği	Ağırlık
Valence	0.34
Energy	0.32
Acousticness	0.16
Tempo	0.11
Danceability	0.07

Ağırlıklı uzaklık hesabı:

weightedDistance =
(abs(track.valence - target.valence) × 0.34) +
(abs(track.energy - target.energy) × 0.32) +
(abs(track.acousticness - target.acousticness) × 0.16) +
(normalizedTempoDistance × 0.11) +
(abs(track.danceability - target.danceability) × 0.07)

Tempo farkı 85 BPM üzerinden normalize edilir ve en fazla 1 değerini alır.

Hesaplanan uzaklık, eşleşme puanına dönüştürülür:

matchScore =
clamp(
  round((1 - weightedDistance × 1.42) × 100),
  10,
  99
)

Burada clamp işlemi puanı 10 ile 99 arasında sınırlar.

Yorum: Uzaklık azaldıkça eşleşme puanı yükselir. Böylece hedef ses profiline daha yakın olan şarkılar üst sıralarda yer alır.

6.4. Ruh Hâli Eşik Kontrolleri

Sistem yalnızca puan hesaplaması yapmaz. Tek bir ruh hâli seçildiğinde bazı kategoriler için ek eşik kontrolleri de uygular.

Örnekler:

* Mutlu: Valence en az 0.55 ve Energy en az 0.48.
* Hüzünlü: Valence en fazla 0.44 ve Energy en fazla 0.56.
* Odaklanma: Acousticness en az 0.42 ve Energy en fazla 0.54.
* Enerjik: Energy en az 0.66 ve Tempo en az 108 BPM.
* Rahatlama: Energy en fazla 0.54, Tempo en fazla 116 BPM ve Acousticness en az 0.28.

Birden fazla ruh hâli seçildiğinde sistem ortak hedef profil üzerinden puanlama yapar.

6.5. Öneri Listesinin Oluşturulması

Öneri oluşturma aşamasında:

1. Silinmiş şarkılar dışarıda bırakılır.
2. Seçilen dil tercihine göre filtreleme yapılır.
3. Kullanıcının belirlediği müzik türleri değerlendirilir.
4. Enerji filtresi uygulanır.
5. Ses profili doğrulanmış şarkılar değerlendirmeye alınır.
6. Ruh hâli eşiklerine uygun şarkılar önceliklendirilir.
7. Şarkıların eşleşme puanları hesaplanır.
8. Sanatçı çeşitliliği gözetilir.
9. Karma dil seçeneğinde dil çeşitliliği de dikkate alınır.
10. Sonuçlar eşleşme puanına göre sıralanır.

Algoritma aynı sanatçıdan en fazla iki şarkı seçmeye çalışır. Karma dil kullanımında dillerin dengeli dağılmasını da hedefler.

Yeni liste oluşturulurken önceki sonuçların tekrarını azaltmak için küçük bir yenilik cezası ve rastgele sıralama etkisi uygulanır.

6.6. Algoritmanın Sınırları

Moodify’nin mevcut öneri sistemi, ses özellikleri üzerinden çalışan kural ve puanlama tabanlı bir sistemdir.

Bu sistem:

* Kullanıcının gerçek psikolojik durumunu tespit etmez.
* Duyguları klinik olarak analiz etmez.
* Eğitilmiş bir makine öğrenmesi modeli değildir.
* Şarkıların ses profilleriyle seçilen kategori arasındaki sayısal benzerliği değerlendirir.

Önerilerin kalitesi, kullanılan müzik verilerinin doğruluğuna ve kapsamına bağlıdır.

💿 7. Müzik Kataloğu ve Veri Yönetimi

Moodify’nin müzik kataloğu, uygulamanın öneri sisteminin temel veri kaynağıdır.

Katalogda şarkıların tanımlayıcı bilgileri ve ses özellikleri saklanır.

Depodaki src/data/catalog-meta.json dosyasının oluşturulma tarihindeki katalog özeti:

Veri	Sayı
Benzersiz şarkı	7.096
Korunan başlangıç kayıtları	468
Doğrulanmış ses profili bulunan şarkı	6.882
Dil kategorisi	14

Bu sayılar katalog meta verisinin 19 Kasım 2026 tarihli anlık görüntüsüdür; güncel katalog değiştikçe farklılaşabilir.

7.1. Desteklenen Müzik Dilleri

Varsayılan katalogda aşağıdaki dil kodları yer alır:

Kod	Dil
tr	Türkçe
en	İngilizce
es	İspanyolca
fr	Fransızca
it	İtalyanca
de	Almanca
ko	Korece
ja	Japonca
pt	Portekizce
ar	Arapça
ru	Rusça
hi	Hintçe
el	Yunanca
nl	Felemenkçe

Kullanıcılar karışık dil seçeneğini de kullanabilir.

Karışık seçim, farklı dillerden şarkıların birlikte önerilmesini sağlar.

7.2. Müzik Türleri

Katalog ve filtreleme sisteminde kullanılan müzik türlerinden bazıları:

* Pop
* Rock
* Alternative
* Indie
* Hip-hop
* Rap
* R&B
* Jazz
* Blues
* Classical
* Electronic
* House
* Techno
* Dance
* Acoustic
* Folk
* Türkçe Pop
* Türkçe Rock
* Türkçe Rap
* Arabesk
* Türk Halk Müziği
* Türk Sanat Müziği
* Lo-fi
* Ambient
* Metal
* Reggae
* Soundtrack

Tür listesi yönetici tarafından genişletilebilir.

7.3. Veri Seti Yükleme

Yönetici Paneli üzerinden CSV ve JSON dosyaları yüklenebilir.

İçe aktarma sistemi farklı alan adlarını tanımaya çalışır.

Örneğin:

Alan	Desteklenen alternatifler
Şarkı adı	title, track_name, name, song
Sanatçı	artist, artists, artist_name
Albüm	album, album_name
Tür	genre, track_genre
Dil	language, lang
Yıl	year, release_year
Kapak	coverUrl, cover_url, artwork
Tempo	tempo, bpm

Ses özellikleri için valence, energy, danceability, acousticness ve tempo alanları kullanılır.

Eksik veya geçersiz bazı alanlar için varsayılan değerler uygulanabilir. Bu nedenle içe aktarılan her kaydın ses özelliklerinin gerçek kaynaktan doğrulanması önemlidir.

7.4. Veri Tekrarlarının Kontrolü

Sistem şarkı adı ve sanatçı bilgilerini normalize ederek olası tekrar kayıtlarını tespit edebilir.

Bu işlem:

* Büyük/küçük harf farklılıklarını azaltır.
* Parantez içindeki ek bilgileri temizler.
* Noktalama işaretlerini normalize eder.
* Şarkı adı ve sanatçı üzerinden karşılaştırma yapar.

Amaç, aynı şarkının katalogda gereksiz yere birden fazla bulunmasını önlemeye yardımcı olmaktır.

🖼️ 8. Şarkı Bilgileri ve Albüm Kapakları

Moodify, şarkıların yalnızca adını ve sanatçısını değil, görsel ve tanımlayıcı bilgilerini de sunar.

Şarkı kartlarında:

* Şarkı adı.
* Sanatçı.
* Albüm veya single bilgisi.
* Müzik dili.
* Müzik türü.
* Ruh hâli eşleşme puanı (varsa).
* Albüm veya single kapak görseli.
* Müzik platformu bağlantıları

görüntülenebilir.

Kapak görseli katalogda bulunmuyorsa uygulama, iTunes Search API üzerinden şarkı ve sanatçı bilgilerine göre görsel aramayı dener.

Görsel bulunamazsa müzik türüne göre hazırlanmış yedek kapak tasarımları kullanılır.

Bu yaklaşım, her şarkıda rastgele bir görsel göstermek yerine mümkün olduğunca ilgili albüm veya single görselini kullanmayı hedefler.

🔗 9. Müzik Platformları

Moodify, müzik keşif ve öneri uygulamasıdır; kendi içinde telifli müzik dosyalarını barındıran bir yayın servisi değildir.

Şarkı kartlarında ilgili müzik platformlarına yönlendiren bağlantılar bulunur.

Desteklenen platformlar:

Platform	Kullanım
Spotify	Şarkı ve sanatçı araması
YouTube Music	Müzik araması
YouTube	Video ve müzik araması
Apple Music	Müzik araması
SoundCloud	Müzik araması
Deezer	Müzik araması
TIDAL	Müzik araması
Amazon Music	Müzik araması

Kullanıcı ilgili platformun logosuna veya bağlantısına tıkladığında şarkı adı ve sanatçı bilgisi kullanılarak platformun arama sayfası açılır.

Önemli: Moodify, bu platformların resmi oynatma servislerini kendi içinde çalıştırdığını iddia etmez. Kullanıcının ilgili platformda oturum açması veya aboneliğe sahip olması gerekebilir.

👤 10. Kullanıcı Hesap Sistemi

Moodify hem misafir kullanımını hem de Google hesabıyla giriş yapmayı destekler.

10.1. Misafir Kullanımı

Kullanıcı hesap açmadan uygulamayı kullanabilir.

Misafir oturumunda:

* Favoriler saklanabilir.
* Kişisel çalma listeleri oluşturulabilir.
* Profil bilgileri tarayıcıda tutulabilir.
* Uygulama tercihleri yerel depolamada saklanabilir.

Misafir verileri localStorage üzerinden yönetilir.

10.2. Google ile Giriş

Firebase Authentication kullanılarak Google hesabıyla giriş yapılabilir.

Bağlı hesapta kullanıcı bilgileri Firebase Authentication üzerinden alınır.

Firestore ise uygulamanın kullanıcıya ait verilerinin ve yönetilen içeriklerinin bulut tarafında saklanması ve senkronizasyonu için kullanılır.

10.3. Profil ve Tercihler

Kullanıcı profilinde:

* Görünen ad.
* Profil fotoğrafı.
* E-posta bilgisi.
* Tercih edilen diller.
* Tercih edilen müzik türleri.
* Favori sayısı.
* Çalma listesi sayısı.
* Son ziyaret bilgileri

gibi alanlar bulunur.

🛠️ 11. Yönetici Paneli

Moodify’nin yönetici paneli, uygulamanın içeriklerini kod dosyalarını sürekli değiştirmeden yönetebilmek amacıyla geliştirilmiştir.

Panel beş ana yönetim bölümünden oluşur.

11.1. Şarkı Yönetimi

Yönetici:

* Yeni şarkı ekleyebilir.
* Mevcut şarkı bilgilerini düzenleyebilir.
* Şarkıları arayabilir.
* Şarkı kayıtlarını silinmiş olarak işaretleyebilir.
* Ses özelliklerini güncelleyebilir.
* Albüm ve kapak bilgilerini düzenleyebilir.

Şarkı yönetiminde kullanılan alanlar:

* Şarkı adı.
* Sanatçı.
* Albüm.
* Tür.
* Dil.
* Yıl.
* Kapak URL’si.
* Valence.
* Energy.
* Danceability.
* Acousticness.
* Tempo.

11.2. Çalma Listesi Yönetimi

Yönetici:

* Seçkiler oluşturabilir.
* Çalma listelerini düzenleyebilir.
* Liste açıklamalarını değiştirebilir.
* Ruh hâli kategorisi belirleyebilir.
* Dil seçebilir.
* Şarkı kimliklerini listeye ekleyebilir.
* Öne çıkan listeleri yönetebilir.

11.3. Veri Seti Yönetimi

CSV ve JSON dosyaları içe aktarılabilir.

Bu bölümde:

* Veri setleri yüklenebilir.
* Şarkı kayıtları normalize edilebilir.
* Tekrar kayıtlar tespit edilebilir.
* Katalog verileri genişletilebilir.
* Ses özellikleri yönetilebilir.

11.4. Ruh Hâli Kategorisi Yönetimi

Yönetici mevcut ruh hâli kategorilerinin:

* Adını.
* Açıklamasını.
* Renk temasını.
* Kapak görselini.
* Hedef ses özelliklerini.
* Sıralamasını.
* Aktiflik durumunu

yönetebilir.

Böylece öneri sisteminin hedef profilleri içerik yönetimi üzerinden güncellenebilir.

11.5. Dil Yönetimi

Yönetici:

* Yeni dil tanımlayabilir.
* Dil adını değiştirebilir.
* Dil kodunu düzenleyebilir.
* Dilin aktiflik durumunu belirleyebilir.
* Dil sıralamasını değiştirebilir.

11.6. Yönetici Yetkilendirmesi

Panel iki yönetici erişim yolunu destekler:

1. Sunucu tarafında yapılandırılmış yönetici kullanıcı adı ve şifresi.
2. Kodda tanımlanmış yönetici e-posta adresine sahip, e-postası doğrulanmış Firebase hesabı.

Sunucu tarafındaki yönetici oturumu imzalı ve süreli bir çerezle yönetilir. Oturumun geçerliliği sunucu tarafında kontrol edilir.

📘 12. Read Me ve Yardım Sistemi

Moodify, ilk kullanımda kullanıcıyı bilgilendirmek için Read Me ekranına sahiptir.

Bu ekranda:

* Moodify’nin ne olduğu.
* Ruh hâlinin nasıl seçileceği.
* Müzik listesinin nasıl oluşturulacağı.
* Müzik platformlarının nasıl kullanılacağı.
* Favorilerin ve çalma listelerinin nasıl yönetileceği

açıklanır.

Kullanıcı “Hemen Başla” seçeneğiyle uygulamaya geçebilir.

Read Me’nin ilk kullanım bilgisi tarayıcıda saklanır. Kullanıcı daha sonra Yardım ekranından bu rehberi tekrar açabilir.

Yardım ekranı ise uygulamanın farklı özelliklerini açıklayan ayrı bir sayfadır.

🎨 13. Arayüz ve Tasarım

Moodify’nin tasarım dili, müzik ve duygu ilişkisini görsel olarak da yansıtmayı hedefler.

Ana tema toz pembe ve gül kurusu tonları üzerine kuruludur.

Her ruh hâli kendi renk atmosferine sahiptir:

Ruh Hâli	Renk
Mutlu & Neşeli	Turuncu / Şeftali
Hüzünlü & Melankolik	Gri / Lavanta
Sakin & Odaklanma	Mavi / Lila
Enerjik & Antrenman	Kırmızı / Mercan
Stresli & Rahatlama	Yeşil / Mint

Arayüzde:

* Kart tabanlı bileşenler.
* Ayrı sayfa ve ekran yapısı.
* Mobil uyumlu düzen.
* Açık ve koyu tema.
* Şarkı kapakları.
* Platform logoları.
* Gezinme menüsü.
* Bildirim mesajları.
* Modal pencereler.
* Sayfa başına dönme kontrolü

gibi kullanıcı deneyimini destekleyen bileşenler bulunur.

Amaç, uygulamanın hem masaüstü hem de mobil cihazlarda anlaşılır ve rahat kullanılabilmesidir.

🧰 14. Kullanılan Teknolojiler

Moodify, modern JavaScript ve web geliştirme teknolojileriyle oluşturulmuştur.

Teknoloji	Projedeki Görevi
React 19	Bileşen tabanlı kullanıcı arayüzü
TypeScript	Tip güvenliği ve uygulama mantığı
Vite 8	Geliştirme sunucusu ve derleme
Tailwind CSS 4	Tasarım ve stil yönetimi
Node.js	Sunucu çalışma ortamı
Express.js	API ve sunucu işlemleri
Firebase Authentication	Google ile kullanıcı girişi
Cloud Firestore	Bulut tabanlı veri yönetimi
Lucide React	İkonlar
Motion	Arayüz animasyonları
iTunes Search API	Albüm ve single kapak görsellerini arama
LocalStorage	Misafir kullanıcı verileri ve yerel tercihler

14.1. React

Uygulamanın kullanıcı arayüzü React bileşenleri üzerinden oluşturulmuştur.

Her ekranın kendi bileşen yapısı bulunur. Böylece keşfet, favoriler, profil ve yönetici paneli gibi bölümler birbirinden ayrılır.

14.2. TypeScript

TypeScript, uygulamadaki veri yapılarını ve fonksiyonların aldığı değerleri tanımlamak için kullanılır.

Örneğin Track, MoodCategory, UserProfile ve UserPlaylist gibi türler sayesinde uygulama verilerinin belirli bir yapıda tutulması sağlanır.

14.3. Vite

Vite, geliştirme ortamını ve üretim derlemesini yönetir.

Geliştirme sırasında hızlı yenileme ve derleme imkânı sağlar.

14.4. Tailwind CSS

Arayüz tasarımı Tailwind CSS sınıflarıyla oluşturulmuştur.

Renkler, boşluklar, responsive düzenler ve bileşen stilleri bu yapı üzerinden yönetilir.

14.5. Firebase

Firebase Authentication kullanıcı girişini, Cloud Firestore ise bulut verilerini yönetmek için kullanılır.

14.6. Express.js

Express, uygulamanın sunucu tarafındaki API işlemlerini yürütür.

Yönetici oturumu, katalog düzenlemeleri ve albüm kapağı arama işlemleri sunucu üzerinden gerçekleştirilebilir.

📁 15. Proje Dosya Yapısı

Proje, arayüz, veri, yardımcı fonksiyonlar ve sunucu işlemlerini ayrı klasörlerde tutan bir yapıya sahiptir.

Moodify/
│
├── public/
│   └── data/
│       └── tracks-catalog.json
│
├── src/
│   │
│   ├── assets/
│   │   └── images/
│   │
│   ├── components/
│   │   ├── AdminPanelView.tsx
│   │   ├── CinemaView.tsx
│   │   ├── DiscoverView.tsx
│   │   ├── FavoritesView.tsx
│   │   ├── HelpView.tsx
│   │   ├── LibraryView.tsx
│   │   ├── Modals.tsx
│   │   ├── MoodCategoryView.tsx
│   │   ├── MoodStudioView.tsx
│   │   ├── MyPlaylistsView.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── PlatformButtons.tsx
│   │   ├── PlaylistCover.tsx
│   │   ├── PlaylistDetailView.tsx
│   │   ├── ProfileView.tsx
│   │   ├── RouletteView.tsx
│   │   └── TrackRowCard.tsx
│   │
│   ├── constants/
│   │   └── musicConfig.ts
│   │
│   ├── data/
│   │   └── catalog-meta.json
│   │
│   ├── lib/
│   │   ├── artworkCache.ts
│   │   ├── firebase.ts
│   │   └── recommendation.ts
│   │
│   ├── server/
│   │   └── app.ts
│   │
│   ├── types/
│   │   └── music.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── server.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md

Önemli Dosyaların Görevleri

Dosya	Açıklama
App.tsx	Uygulamanın ana bileşeni, ekran geçişleri ve genel durum yönetimi
recommendation.ts	Müzik eşleştirme algoritması, filtreleme ve veri normalizasyonu
musicConfig.ts	Varsayılan ruh hâli kategorileri, renkler, diller, türler ve platformlar
music.ts	Uygulamada kullanılan TypeScript veri türleri
firebase.ts	Firebase bağlantısı, kimlik doğrulama ve Firestore yapılandırması
artworkCache.ts	Şarkı kapak görsellerinin aranması ve önbellek işlemleri
AdminPanelView.tsx	Yönetici paneli
DiscoverView.tsx	Ana keşfet ekranı
MoodStudioView.tsx	Karma ruh hâli ve kişiselleştirilmiş öneriler
CinemaView.tsx	Moodify Cinema ve sahne detayları
RouletteView.tsx	Müzik Ruleti
LibraryView.tsx	Şarkı arama ve filtreleme
TrackRowCard.tsx	Şarkı kartlarının gösterimi
server/app.ts	Express API ve sunucu tarafı yönetim işlemleri
server.ts	Uygulamanın geliştirme ve üretim sunucusunu başlatır

🗂️ 16. Veri Yapısı

Moodify’de temel müzik verisi Track arayüzü üzerinden tanımlanır.

Örnek şarkı kaydı:

{
  "id": "track-001",
  "title": "Example Song",
  "artist": "Example Artist",
  "album": "Example Album",
  "genre": "Pop",
  "language": "en",
  "year": 2024,
  "coverUrl": null,
  "valence": 0.82,
  "energy": 0.76,
  "danceability": 0.71,
  "acousticness": 0.12,
  "tempo": 120,
  "audioFeaturesVerified": true
}

Bu örnek, uygulamada kullanılan veri alanlarını göstermek amacıyla hazırlanmıştır.

Temel Veri Modelleri

Track: Şarkı bilgilerini ve ses özelliklerini tutar.

MoodCategory: Ruh hâli kategorisinin adını, rengini, açıklamasını ve hedef ses profilini tutar.

LanguageConfig: Dil kodunu, adını ve aktiflik durumunu tutar.

CuratedPlaylist: Uygulama tarafından sunulan seçkileri tanımlar.

UserPlaylist: Kullanıcının oluşturduğu kişisel çalma listelerini tanımlar.

UserProfile: Kullanıcı hesabı, tercihleri ve ziyaret bilgilerini tutar.

CinemaScene: Moodify Cinema sahnelerinin atmosferini ve hedef ses özelliklerini tanımlar.

🚀 17. Kurulum ve Çalıştırma

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz.

Gereksinimler

* Node.js
* npm
* Git
* Firebase projesi (Google girişi ve Firestore özellikleri için)

1. Depoyu Klonlayın

git clone https://github.com/cstekerlek/Moodify.git

2. Proje Klasörüne Girin

cd Moodify

3. Paketleri Yükleyin

npm install

4. Firebase Yapılandırmasını Hazırlayın

Projenin beklediği firebase-applet-config.json yapılandırma dosyasını hazırlayın.

Ayrıntılar için Firebase Yapılandırması bölümüne bakın.

5. Geliştirme Sunucusunu Başlatın

npm run dev

Uygulama varsayılan olarak:

http://localhost:3000

adresinde açılır.

6. Üretim Derlemesi Oluşturun

npm run build

Derleme çıktısı dist/ klasörüne oluşturulur.

7. TypeScript Kontrolünü Çalıştırın

npm run lint

Bu komut TypeScript dosyalarını tsc --noEmit ile kontrol eder.

8. Üretim Sunucusunu Başlatın

npm start

Üretim modunda çalıştırırken NODE_ENV=production ortam değişkeninin ayarlanması gerekir.

🔥 18. Firebase Yapılandırması

Moodify, Firebase Authentication ve Cloud Firestore kullanır.

Firebase yapılandırması src/lib/firebase.ts dosyasında aşağıdaki dosyadan alınır:

firebase-applet-config.json

Bu dosya proje kök dizininde bulunmalıdır.

Firebase tarafında:

1. Bir Firebase projesi oluşturun.
2. Web uygulaması tanımlayın.
3. Authentication bölümünden Google giriş yöntemini etkinleştirin.
4. Cloud Firestore veritabanını oluşturun.
5. Gerekli veritabanı erişim kurallarını yapılandırın.
6. Uygulamanın yapılandırma dosyasını hazırlayın.

Uygulama Firestore tarafında kullanıcı ve yönetilen içerik verileriyle çalışır.

Kullanılan koleksiyonlardan bazıları:

* customTracks
* curatedPlaylists

Kullanıcı hesabı verileri ve diğer kayıtlar da uygulamanın ilgili Firestore işlemleri üzerinden yönetilir.

Firebase güvenlik kurallarının doğru yapılandırılması önemlidir. İstemci tarafındaki kod tek başına veritabanı güvenliğini sağlamaz.

🔐 19. Yönetici Girişi ve Sunucu Yapılandırması

Sunucu tarafındaki yönetici girişi için ortam değişkenleri kullanılabilir.

Örnek:

ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password
ADMIN_SESSION_SECRET=your_long_random_secret
PORT=3000

Alternatif olarak ADMIN_PASSWORD yerine ADMIN_PASSWORD_HASH kullanılabilir.

Gerçek şifreleri ve oturum anahtarlarını GitHub’a yüklemeyin.

Sunucu tarafındaki yönetici oturumu:

* Giriş sırasında doğrulanır.
* İmzalı oturum bilgisi oluşturur.
* HTTP-only çerez üzerinden saklanır.
* 12 saatlik süre sonunda geçersiz olur.
* Yönetici gerektiren işlemlerde sunucu tarafından kontrol edilir.

Firebase yönetici erişimi için de kodda tanımlanan yönetici e-posta adresinin doğrulanmış olması gerekir.

🌐 20. API ve Sunucu İşlemleri

Moodify, Express tabanlı bir sunucu kullanır.

Sunucu tarafında:

* Yönetici oturum kontrolü.
* Yönetici girişi ve çıkışı.
* Yönetici yetkilendirmesi.
* Katalog değişiklikleri.
* Albüm ve single kapak görseli arama.
* Sağlık kontrolü.

gibi işlemler yürütülür.

Kodda bulunan temel API uç noktalarından bazıları:

Endpoint	Metot	Görev
/api/health	GET	Sunucunun çalışma durumunu kontrol eder.
/api/admin/session	GET	Yönetici oturumunun durumunu kontrol eder.
/api/admin/login	POST	Yönetici girişini gerçekleştirir.
/api/admin/logout	POST	Yönetici oturumunu kapatır.
/api/artwork	GET	Şarkı için kapak görseli arar.

Sunucu ayrıca yönetici işlemleri için korumalı API uç noktaları içerir.

Geliştirme modunda Express sunucusu Vite middleware’i kullanarak uygulamayı sunar. Üretim modunda ise dist klasöründeki derlenmiş dosyalar servis edilir.

🛡️ 21. Güvenlik ve Gizlilik

Moodify’nin güvenli kullanımı için aşağıdaki konular önemlidir:

* Firebase erişim kuralları doğru yapılandırılmalıdır.
* Yönetici şifreleri istemci koduna yazılmamalıdır.
* Ortam değişkenleri güvenli biçimde saklanmalıdır.
* Firebase yapılandırması ve özel erişim bilgileri yanlışlıkla depoya eklenmemelidir.
* Yönetici API işlemleri sunucu tarafında yetkilendirilmelidir.
* Kullanıcı verileri ve oturum bilgileri uygun güvenlik kurallarıyla korunmalıdır.
* Üçüncü taraf platformların kullanım ve gizlilik koşullarına uyulmalıdır.
* Müzik verilerinin kaynak ve lisans koşulları dikkate alınmalıdır.

Misafir kullanıcı verileri tarayıcının yerel depolamasında tutulabilir. Tarayıcı verilerinin temizlenmesi bu kayıtların kaybolmasına neden olabilir.

🧭 22. Geliştirme ve Gelecek Hedefleri

Moodify, geliştirilmeye açık bir müzik keşif projesidir.

Gelecekte üzerinde çalışılabilecek alanlar:

* [ ]	Müzik kataloğunun düzenli olarak genişletilmesi.
* [ ]	Veri kaynaklarının ve lisans bilgilerinin daha ayrıntılı belgelenmesi.
* [ ]	Ses özelliklerinin doğruluğunun artırılması.
* [ ]	Müzik öneri algoritmasının geliştirilmesi.
* [ ]	Kullanıcı dinleme tercihlerinin önerilere kontrollü biçimde yansıtılması.
* [ ]	Öneri sonuçlarının kullanıcı geri bildirimleriyle iyileştirilmesi.
* [ ]	Mobil cihazlarda kullanım deneyiminin geliştirilmesi.
* [ ]	Uygulama performansının ve yükleme sürelerinin iyileştirilmesi.
* [ ]	Test kapsamının genişletilmesi.
* [ ]	Erişilebilirlik iyileştirmeleri.

Bu maddeler geliştirme hedefleridir; mevcut sürümde tamamlanmış özellikler olarak değerlendirilmemelidir.

📚 23. Veri Kaynakları

Moodify’nin katalog meta verisinde belirtilen kaynaklar:

Spotify Tracks Dataset – Kaggle / Hugging Face

https://huggingface.co/datasets/maharshipandya/spotify-tracks-dataset

Müzik kayıtları ve ses özellikleri için kullanılan açık veri kaynağıdır.

Katalog meta verisinde lisans bilgisi CC0 / Public Open Dataset olarak belirtilmiştir. Kullanım öncesinde veri kümesinin güncel lisans koşulları ayrıca kontrol edilmelidir.

Moodify Başlangıç Veri Seti

Uygulamanın başlangıç kataloğunda bulunan kayıtlar:

RAW_OPEN_TRACKS

iTunes Search API

https://itunes.apple.com/search

Şarkı ve sanatçı bilgileri üzerinden albüm ve single kapak görsellerini bulmak için kullanılır.

Üçüncü taraf servislerin kullanım koşulları ve marka hakları kendi sahiplerine aittir.

📄 24. Lisans ve Sorumluluk

Bu depoda bulunan yazılım kodunun kullanım koşulları için depodaki lisans dosyası kontrol edilmelidir.

Üçüncü taraf müzik verileri, albüm kapakları, platform logoları ve diğer içerikler kendi kaynaklarının lisans ve kullanım koşullarına tabidir.

Moodify, Spotify, Apple Music, YouTube Music veya diğer müzik platformlarının resmî ürünü ya da iştiraki değildir.

Moodify’nin amacı müzik keşfini kolaylaştırmak ve kullanıcıları ilgili müzik platformlarına yönlendirmektir.

⸻

💗 Moodify

Müzik bazen anlatamadığımız şeyleri anlatır.

Bazen bir şarkı, bazen bir anı, bazen de yalnızca o gün hissettiğimiz şeydir.

Moodify, müziği ruh hâlinle buluşturmak için geliştirildi.

Her ruh hâlinin bir müziği vardır. Sen bugün hangisini dinliyorsun?

<p align="center">
  <strong>🎧 Made with Moodify.</strong>
  <br />
  <a href="https://github.com/cstekerlek/Moodify">GitHub Repository</a>
</p>
