import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CSV_PATH = '/tmp/spotify_dataset.csv';
const OUT_CATALOG_PATH = path.join(ROOT, 'public', 'data', 'tracks-catalog.json');
const OUT_META_PATH = path.join(ROOT, 'src', 'data', 'catalog-meta.json');

function parseCsvLine(line) {
  const res = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        q = !q;
      }
    } else if (c === ',' && !q) {
      res.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  res.push(cur.trim());
  return res;
}

function normalizeKey(title, artist) {
  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/\(.*?\)|\[.*?\]/g, '')
      .replace(/[^a-z0-9\u00c0-\u024f\u0400-\u04ff\u0600-\u06ff\u0370-\u03ff\u3040-\u30ff\u4e00-\u9faf\uac00-\ud7af]+/gi, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  return `${norm(title)}::${norm(artist.split(/[;,]/)[0])}`;
}

function hashShort(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function clamp01(n) {
  if (!Number.isFinite(n)) return 0.5;
  return Math.max(0, Math.min(1, Number(n.toFixed(3))));
}

function clampTempo(n) {
  if (!Number.isFinite(n) || n <= 0) return 100;
  return Math.round(Math.max(40, Math.min(230, n)));
}

const arabeskRx = /(müslüm gürses|ibrahim tatlıses|orhan gencebay|ferdi tayfur|bergen|cengiz kurtoğlu|hakan altun|mahsun kırmızıgül|kibariye|ebru gündeş|yıldız tilbe|özcan deniz|güllü|ümit besen|azer bülbül|koray avcı|arabesk)/i;
const thmRx = /(neşet ertaş|aşık veysel|selda bağcan|musa eroğlu|arif sağ|erkan oğur|kardeş türküler|yeni türkü|grup yorum|ilkay akkaya|edip akbayram|zülfü livaneli|türkü|bağlama|uzun hava|bozlak|ges[i̇] bağları|grup abdal|ender balkır|ali ekber çiçek)/i;
const tsmRx = /(zeki müren|müzeyyen senar|bülent ersoy|emel sayın|safiye ayla|münir nurettin|beh[i̇]ye aksoy|nesrin sipahi|muazzez abacı|türk sanat|fasıl|hicaz|nihavend|rast|uşşak)/i;
const trRapRx = /(ceza|ezhel|sagopa|uzi|şam|no\.1|lil zey|khontkar|şehinşah|tepki|lvbel|motive|aspova|anıl piyancı|hidra|şanışer|contra|stabil|ceg|ben fero|gazapizm|norm ender|allame|defkhan|patron|cakal|reckol|batuflex|rap)/i;
const trRockRx = /(duman|teoman|mor ve ötesi|pinhani|yüksek sadakat|haluk levent|athena|emre fel|flört|ayna|barış manço|cem karaca|erkin koray|büyük ev|yüzyüzeyken|manga|şebnem ferah|özlem tekin|kıraç|kurban|adamlar|madrigal|dktt|son feci bisiklet|yaşlı amca|sedef sebüktekin|rock)/i;
const rapArtistRx = /(eminem|kendrick|drake|kanye|travis scott|future|lil |21 savage|snoop|nas|jay-z|tupac|biggie|j\. cole|nicki minaj|cardi b|megan thee|metro boomin|playboi carti|post malone|juice wrld|xxxtentacion|tyler, the creator|a\$ap|asap|macklemore|50 cent|outkast|ice cube)/i;

function normalizeDisplayGenre(rawGenre, artist = '', title = '', language = 'en', energy = 0.5, acousticness = 0.3) {
  const g = String(rawGenre || '').toLowerCase();
  const combined = `${artist} ${title}`;

  if (language === 'tr' || g === 'turkish') {
    if (arabeskRx.test(combined) || g.includes('arabesk')) return 'Arabesk';
    if (thmRx.test(combined)) return 'Türk Halk Müziği';
    if (tsmRx.test(combined)) return 'Türk Sanat Müziği';
    if (trRapRx.test(combined) || g.includes('rap')) return 'Türkçe Rap';
    if (trRockRx.test(combined) || g.includes('rock')) return 'Türkçe Rock';
    return 'Türkçe Pop';
  }

  if (g === 'hip-hop' || g === 'hip hop') {
    return rapArtistRx.test(combined) ? 'Rap' : 'Hip-hop';
  }

  const map = {
    'pop': 'Pop', 'dance pop': 'Pop', 'synth-pop': 'Pop', 'power-pop': 'Pop',
    'french': acousticness > 0.5 ? 'Acoustic' : 'Pop',
    'german': energy > 0.72 ? 'Electronic' : 'Pop',
    'spanish': acousticness > 0.5 ? 'Acoustic' : 'Pop',
    'indian': acousticness > 0.45 ? 'Folk' : 'Soundtrack',
    'british': 'Rock', 'swedish': 'Pop',
    'j-idol': 'Pop', 'k-pop': 'Pop', 'j-pop': 'Pop', 'j-rock': 'Rock', 'j-dance': 'Dance',
    'rock': 'Rock', 'alt-rock': 'Rock', 'hard-rock': 'Rock', 'psych-rock': 'Rock', 'punk-rock': 'Rock', 'punk': 'Rock', 'rock-n-roll': 'Rock',
    'alternative': 'Alternative', 'grunge': 'Alternative', 'emo': 'Alternative', 'goth': 'Alternative',
    'indie': 'Indie', 'indie-pop': 'Indie', 'indie rock': 'Indie', 'indie folk': 'Indie', 'indie pop': 'Indie',
    'hip-hop': 'Hip-hop', 'rap': 'Rap', 'r-n-b': 'R&B', 'soul': 'R&B', 'funk': 'R&B',
    'jazz': 'Jazz', 'bossa nova': 'Jazz', 'blues': 'Blues',
    'classical': 'Classical', 'opera': 'Classical', 'piano': 'Classical', 'minimalist': 'Classical', 'instrumental': 'Classical',
    'electronic': 'Electronic', 'edm': 'Electronic', 'electro': 'Electronic', 'idm': 'Electronic', 'synthwave': 'Electronic',
    'house': 'House', 'deep-house': 'House', 'chicago-house': 'House', 'progressive-house': 'House',
    'techno': 'Techno', 'detroit-techno': 'Techno', 'minimal-techno': 'Techno', 'trance': 'Techno',
    'dance': 'Dance', 'disco': 'Dance', 'club': 'Dance', 'latin': 'Dance', 'latino': 'Dance', 'reggaeton': 'Dance', 'salsa': 'Dance', 'samba': 'Dance', 'pagode': 'Dance',
    'forro': 'Folk', 'sertanejo': 'Folk', 'mpb': 'Acoustic', 'brazil': 'Acoustic',
    'acoustic': 'Acoustic', 'guitar': 'Acoustic', 'singer-songwriter': 'Acoustic', 'songwriter': 'Acoustic', 'chanson': 'Acoustic',
    'folk': 'Folk', 'bluegrass': 'Folk', 'world-music': 'Folk',
    'lo-fi': 'Lo-fi', 'chill': 'Lo-fi', 'chillout': 'Lo-fi', 'chillwave': 'Lo-fi', 'study': 'Lo-fi',
    'ambient': 'Ambient', 'sleep': 'Ambient', 'new-age': 'Ambient',
    'metal': 'Metal', 'heavy-metal': 'Metal', 'metalcore': 'Metal', 'black-metal': 'Metal', 'death-metal': 'Metal',
    'reggae': 'Reggae', 'dub': 'Reggae', 'dancehall': 'Reggae', 'ska': 'Reggae',
    'soundtrack': 'Soundtrack', 'disney': 'Soundtrack', 'show-tunes': 'Soundtrack', 'anime': 'Soundtrack',
    'romance': 'Acoustic', 'happy': 'Pop', 'sad': 'Indie',
  };

  if (map[g]) return map[g];
  if (g.includes('lo-fi') || g.includes('lofi')) return 'Lo-fi';
  if (g.includes('jazz')) return 'Jazz';
  if (g.includes('hip-hop')) return 'Hip-hop';
  if (g.includes('rap')) return 'Rap';
  if (g.includes('rock')) return 'Rock';
  if (g.includes('metal')) return 'Metal';
  if (g.includes('house')) return 'House';
  if (g.includes('techno')) return 'Techno';
  if (g.includes('ambient')) return 'Ambient';
  if (g.includes('acoustic')) return 'Acoustic';
  if (g.includes('folk')) return 'Folk';
  if (g.includes('classical') || g.includes('piano')) return 'Classical';
  if (g.includes('soul') || g.includes('r&b') || g.includes('funk')) return 'R&B';
  if (g.includes('reggae')) return 'Reggae';
  if (g.includes('electronic') || g.includes('electro')) return 'Electronic';
  if (g.includes('dance') || g.includes('disco')) return 'Dance';
  if (g.includes('indie')) return 'Indie';
  if (g.includes('pop')) return 'Pop';
  if (g.includes('soundtrack') || g.includes('ost')) return 'Soundtrack';
  return 'Pop';
}

// Strict linguistic title/artist verification so cross-language false positives never appear
const englishStopwordsRx = /\b(the|and|you|your|you're|i'm|it's|don't|can't|won't|my|me|we|our|with|from|this|that|what|when|where|why|how|love|night|heart|baby|girl|boy|eyes|mind|soul|life|time|world|forever|never|always|again|tonight|broken|break|dream|dreams|high|alone|away|down|over|under|into|through|better|best|good|bad|feel|feeling|want|need|know|think|make|take|give|come|stay|leave|light|dark|fire|summer|winter|shadow|memories|beautiful|someone|nobody|nothing|everything)\b/i;

function isEnglishTitleOnly(title) {
  // Returns true if title looks purely English (ASCII + >= 2 English stopwords or unmistakable English phrase, no foreign diacritics)
  if (/[^\x00-\x7F]/.test(title)) return false;
  const matches = title.match(new RegExp(englishStopwordsRx.source, 'gi'));
  return Boolean(matches && matches.length >= 1);
}

const trTitleRx = /[ğüşöçıİĞÜŞÖÇ]|\b(aşk|ask|sevda|kalp|kalbim|gönül|gece|geceler|gündüz|sen|ben|biz|siz|seni|beni|sana|bana|bir|iki|bu|şu|ve|ile|gibi|kadar|nasıl|neden|niye|nerede|burada|orada|her|hiç|yok|var|değil|gel|git|kal|bak|gör|duy|sev|özledim|ağlama|gülümse|yar|hayat|dünya|yol|yıldız|deniz|rüzgar|yağmur|sonbahar|bahar|yaz|kış|akşam|sabah|düş|rüya|şarkı|türkü|istanbul|ankara|izmir|gözlerin|ellerin|yalnız|sensiz|böyle|öyle|şimdi|yarın|dün|kim|kime|ne|niçin|olur|olmaz|gitme|kalma|sevme|üzülme|deli|paramparça|bambaşka|kuzu|şımarık|yolla|salla|tut|bırak|yak|söndür|unut|hatırla)\b/i;
const trArtistStrictRx = /\b(Tarkan|Sezen Aksu|Ajda Pekkan|Kenan Doğulu|Mabel Matiz|Teoman|Duman|Mor ve Ötesi|Haluk Levent|Sertab Erener|Yalın|Pinhani|Ceza|Sagopa Kajmer|Ezhel|Madrigal|Adamlar|Yüzyüzeyken Konuşuruz|Büyük Ev Ablukada|Müslüm Gürses|İbrahim Tatlıses|Orhan Gencebay|Ferdi Tayfur|Neşet Ertaş|Zeki Müren|Müzeyyen Senar|Selda Bağcan|Barış Manço|Cem Karaca|Erkin Koray|Kalben|Birsen Tezer|Bülent Ortaçgil|Zeynep Bastık|Mert Demir|Semicenk|KÖFN|Emre Fel|Melike Şahin|Hadise|Gülşen|Hande Yener|Mustafa Sandal|maNga|Şebnem Ferah|Athena|Emir Can İğrek|Dedublüman|Yıldız Tilbe|Ebru Gündeş|Koray Avcı|Cem Adrian|Gökhan Türkmen|Sıla|Simge|İrem Derici|Edis|Aleyna Tilki|Murat Boz|Buray|Melek Mosso|Canozan|Dolu Kadehi Ters Tut|Son Feci Bisiklet|Yaşlı Amca|Kıraç|Funda Arar|Göksel|Nilüfer|MFÖ)\b/i;

const frDiacriticOrWordRx = /[àâæçéèêëîïôœùûüÿÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸ]|\b(le|la|les|un|une|des|du|au|aux|et|je|tu|il|elle|on|nous|vous|mon|ma|mes|ton|ta|tes|son|sa|ses|dans|pour|avec|sans|sur|sous|pas|ne|plus|tout|tous|rien|jamais|toujours|aime|aimer|amour|coeur|cœur|nuit|jour|vie|monde|veux|suis|est|sont|faire|voir|dire|être|avoir|ciel|soleil|lune|mer|ville|paris|fille|femme|homme|temps|rêve|lumière|ombre|fleur|chanson|danse|bonjour|merci|oui|non|moi|toi|lui|ce|cette|ces|qui|que|quoi|où|quand|comment|suavemente|dernière|balader|tout va bien|pas bête|jefe|peur|j’comprends)\b/i;

const deDiacriticOrWordRx = /[äöüßÄÖÜ]|\b(der|die|das|den|dem|des|ein|eine|einen|einem|einer|und|oder|aber|ich|du|er|sie|es|wir|ihr|mein|meine|dein|deine|mit|für|auf|aus|bei|nach|von|zu|zum|zur|über|unter|vor|nicht|kein|keine|ist|sind|war|bin|bist|kann|will|muss|soll|liebe|herz|nacht|tag|leben|welt|stadt|mädchen|sonne|mond|zeit|alles|nichts|immer|nie|wieder|schön|schon|frei|allein|zusammen|glück|schmerz|tränen|licht|dunkel|feuer|wasser|wind|weg|haus|deutschland|berlin|atemlos|komet|roller|wildberry|bauch|beine|kopf|augen|himmel)\b/i;

const itDiacriticOrWordRx = /[àèéìíîòóùúÀÈÉÌÍÎÒÓÙÚ]|\b(il|lo|la|i|gli|le|un|una|uno|che|chi|non|per|con|tra|fra|nel|nella|sul|sulla|del|della|dei|degli|sono|sei|siamo|abbiamo|amore|cuore|vita|notte|giorno|sole|luna|mare|cielo|terra|casa|tempo|mondo|sempre|mai|tutto|tutti|niente|nulla|bella|bello|ti|mi|vi|ci|mio|mia|miei|tuo|tua|suo|sua|questo|questa|quello|quella|senza|più|come|dove|quando|perché|ancora|adesso|ora|domani|ieri|prima|dopo|bene|male|felice|triste|ciao|grazie|roma|milano|napoli|italia|ragazza|ragazzo|bambina|donna|uomo|occhi|mani|voce|canzone|musica|partirò|volare|brividi|cenere|due vite|tango|superclassico|ricordami|fiori|stelle|sogni|vento|pioggia)\b/i;
const itArtistStrictRx = /\b(Andrea Bocelli|Laura Pausini|Eros Ramazzotti|Luciano Pavarotti|Tiziano Ferro|Vasco Rossi|Zucchero|Mahmood|Marco Mengoni|Ultimo|Elodie|Annalisa|Irama|Fabrizio De André|Lucio Dalla|Adriano Celentano|Mina|Giorgia|Nek|Jovanotti|Ligabue|Cesare Cremonini|Pinguini Tattici Nucleari|Fedez|Ghali|Salmo|Il Volo|Sfera Ebbasta|Lazza|Geolier|Tananai|Mr\.Rain|Ludovico Einaudi|Ennio Morricone|Giuseppe Verdi|Giacomo Puccini|Antonio Vivaldi)\b/i;

const esDiacriticOrWordRx = /[ñáéíóúü¡¿ÑÁÉÍÓÚÜ]|\b(el|la|los|las|un|una|unos|unas|que|de|del|en|por|para|con|sin|como|cuando|donde|amor|corazón|corazon|vida|noche|día|dia|todo|nada|siempre|nunca|mi|tu|su|te|me|nos|solo|quiero|eres|soy|tengo|baila|bailar|bonito|bonita|feliz|triste|beso|besos|cielo|luna|mar|fuego|alma|ojos|boca|tiempo|mundo|camino|contigo|conmigo|adiós|hola|oye|dale|mami|papi|chica|chico|loco|loca|estrella|sol|bachata|ojitos|bonito|felicito|corriente|gatúbela|provenza|neverita|efecto|tarot)\b/i;

const ptDiacriticOrWordRx = /[ãõáàâêéíóôúçÃÕÁÀÂÊÉÍÓÔÚÇ]|\b(não|nao|você|voce|eu|ele|ela|nós|meu|minha|meus|minhas|seu|sua|teu|tua|com|sem|por|para|pra|pro|mais|menos|tudo|nada|amor|coração|coracao|vida|noite|dia|saudade|beijo|beijos|vem|vai|vou|quero|sou|estou|tô|ao vivo|deixa|menina|garota|mulher|homem|tempo|mundo|casa|rua|mar|sol|lua|céu|estrela|chuva|festa|samba|pagode|sertanejo|brasil|rio|feliz|triste|agora|sempre|nunca|aqui|onde|quando|como|porque|quem|de|do|da|dos|das|em|no|na|nos|nas|corcovado|desafinado|ipanema)\b/i;

const nlDiacriticOrWordRx = /\b(het|een|van|ik|jij|je|hij|zij|wij|we|jullie|mijn|zijn|haar|ons|met|voor|op|aan|uit|bij|naar|over|onder|door|om|te|niet|geen|ook|als|dan|maar|want|dus|dat|wat|wie|waar|wanneer|hoe|liefde|hart|nacht|dag|leven|wereld|stad|zon|maan|tijd|alles|niets|altijd|nooit|weer|mooi|mooie|samen|alleen|blijf|kom|ga|zie|hoor|voel|bent|ben|hou|lachen|huilen|dansen|zingen|regen|zomer|winter|vriend|vrienden|thuis|morgen|gisteren|vandaag|dromen|droom|tranen|sterren|zee)\b/i;
const nlArtistStrictRx = /\b(Suzan & Freek|Snelle|Bløf|André Hazes|Marco Borsato|Froukje|S10|Goldband|Flemming|Antoon|Maan|Guus Meeuwis|Racoon|Acda en de Munnik|De Jeugd van Tegenwoordig|Nick & Simon|Roxy Dekker|Yves Berendse|Claude)\b/i;

const elArtistStrictRx = /\b(Nikos Vertis|Konstantinos Argiros|Anna Vissi|Antonis Remos|Despina Vandi|Helena Paparizou|Mikis Theodorakis|Haris Alexiou|Marina Satti|Giorgos Mazonakis|Pantelis Pantelidis|Yannis Ploutarchos|Natasa Theodoridou|Sakis Rouvas|Nikos Oikonomopoulos|Eleni Foureira|Giannis Kotsiras|Sokratis Malamas|Alkinoos Ioannidis)\b/i;

const jaArtistStrictRx = /\b(Fujii Kaze|Kenshi Yonezu|YOASOBI|Ado|Aimer|LiSA|RADWIMPS|Official HIGE DANdism|King Gnu|Vaundy|Mrs\. GREEN APPLE|Eve|Joe Hisaishi|Ryuichi Sakamoto|Hikaru Utada|Spitz|Aimyon|back number|Yorushika|ONE OK ROCK|Kensuke Ushio|Yoko Kanno|Yuuri|imase|Creepy Nuts|ATARASHII GAKKO!|Perfume|Kyary Pamyu Pamyu|BABYMETAL|Natori|yama)\b/i;

const koArtistStrictRx = /\b(BTS|BLACKPINK|TWICE|IVE|NewJeans|LE SSERAFIM|Stray Kids|SEVENTEEN|EXO|IU|aespa|\(G\)I-DLE|ITZY|NCT|TXT|ENHYPEN|Red Velvet|Taeyeon|Crush|PSY|BIGBANG|SHINee|MAMAMOO|ATEEZ|TREASURE|AKMU|Heize|Dean|ZICO|BOL4|Paul Kim|Lim Young Woong|DAY6|ILLIT|RIIZE)\b/i;

const hiArtistStrictRx = /\b(Pritam|Arijit Singh|Anuv Jain|Shreya Ghoshal|Atif Aslam|A\.R\. Rahman|Diljit Dosanjh|AP Dhillon|Jubin Nautiyal|Sonu Nigam|Alka Yagnik|Neha Kakkar|Vishal-Shekhar|Amit Trivedi|Mohit Chauhan|KK|Darshan Raval|Armaan Malik|Sunidhi Chauhan|Udit Narayan|Kishore Kumar|Lata Mangeshkar|Shankar-Ehsaan-Loy|Badshah|Yo Yo Honey Singh|King|Prateek Kuhad)\b/i;

const arArtistStrictRx = /\b(Amr Diab|Nancy Ajram|Fairuz|Fairouz|Elissa|Cairokee|Sherine|Tamer Hosny|Kadim Al Sahir|Wael Kfoury|Saad Lamjarred|Wegz|Marwan Pablo|Assala|Hussain Al Jassmi|Mohamed Hamaki|Ragheb Alama|Majida El Roumi|George Wassouf|Nawal El Zoghbi)\b/i;

function detectStrictLanguage(row) {
  const artist = row.artists;
  const title = row.track_name;
  const genre = row.track_genre;
  const combined = `${artist} ${title}`;

  // Reject explicit false positives first
  const isBennyBlanco = /benny blanco|blanco white/i.test(artist);
  const isDimitriVangelis = /dimitri vangelis/i.test(artist);
  const isDamso = /\bdamso\b/i.test(artist);
  const isLilPeep = /\blil peep\b/i.test(artist);

  // 1. Non-Latin Scripts (High Precision)
  if (/[\u0600-\u06FF]/.test(combined) && genre !== 'iranian') return 'ar';
  if (arArtistStrictRx.test(artist) && !isEnglishTitleOnly(title)) return 'ar';

  if (/[\u0400-\u04FF]/.test(title) && !isLilPeep) return 'ru';

  if (/[\u0370-\u03FF]/.test(combined) && !isDimitriVangelis && !isDamso && !/Rotting Christ/i.test(artist)) return 'el';
  if (elArtistStrictRx.test(artist) && !isEnglishTitleOnly(title)) return 'el';

  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(combined)) return 'ko';
  if (genre === 'k-pop' && koArtistStrictRx.test(artist)) return 'ko';

  if (/[\u3040-\u30FF]/.test(combined)) return 'ja';
  if ((genre === 'j-pop' || genre === 'j-rock' || genre === 'j-idol' || genre === 'anime' || genre === 'j-dance') && (/[\u4E00-\u9FAF]/.test(combined) || jaArtistStrictRx.test(artist))) return 'ja';

  // 2. Turkish
  if ((genre === 'turkish' || trArtistStrictRx.test(artist)) && (trTitleRx.test(title) || trArtistStrictRx.test(artist)) && !isEnglishTitleOnly(title)) return 'tr';
  if (/[ğüşöçıİĞÜŞÖÇ]/.test(title) && genre !== 'german') return 'tr';

  // 3. French
  if ((genre === 'french' || isDamso) && frDiacriticOrWordRx.test(title) && !isEnglishTitleOnly(title)) return 'fr';

  // 4. German
  if (genre === 'german' && deDiacriticOrWordRx.test(title) && !isEnglishTitleOnly(title)) return 'de';

  // 5. Spanish
  if ((genre === 'spanish' || genre === 'latin' || genre === 'latino' || genre === 'reggaeton' || genre === 'salsa') && esDiacriticOrWordRx.test(title) && !isEnglishTitleOnly(title)) return 'es';

  // 6. Portuguese
  if ((genre === 'brazil' || genre === 'mpb' || genre === 'samba' || genre === 'forro' || genre === 'pagode' || genre === 'sertanejo') && ptDiacriticOrWordRx.test(title) && !isEnglishTitleOnly(title)) return 'pt';

  // 7. Italian (strictly exclude benny blanco / Blanco White & English-titled Måneskin)
  if (!isBennyBlanco && itArtistStrictRx.test(artist) && itDiacriticOrWordRx.test(title) && !isEnglishTitleOnly(title)) return 'it';

  // 8. Dutch
  if ((nlArtistStrictRx.test(artist) || nlDiacriticOrWordRx.test(title)) && !isEnglishTitleOnly(title) && !/[ğüşöçıàâçéèêëñáíóúüäöß]/i.test(title)) {
    if (nlArtistStrictRx.test(artist) || genre === 'dutch') return 'nl';
  }

  // 9. Hindi
  if (genre === 'indian' && (hiArtistStrictRx.test(artist) || !isEnglishTitleOnly(title)) && !/lofi|ambient|meditation|frequency/i.test(title)) {
    if (hiArtistStrictRx.test(artist)) return 'hi';
  }

  // 10. English (strictly exclude foreign scripts & foreign genre playlists)
  if (
    !/[^\x00-\x7F]/.test(title) &&
    !['turkish', 'french', 'german', 'spanish', 'latin', 'latino', 'reggaeton', 'salsa', 'brazil', 'mpb', 'samba', 'forro', 'pagode', 'sertanejo', 'indian', 'k-pop', 'j-pop', 'j-rock', 'j-idol', 'j-dance', 'anime', 'iranian', 'malay', 'cantopop', 'mandopop'].includes(genre) &&
    !trTitleRx.test(title) &&
    !esDiacriticOrWordRx.test(title) &&
    !frDiacriticOrWordRx.test(title)
  ) {
    return 'en';
  }

  return null;
}

function loadPreservedBaseTracks() {
  if (!fs.existsSync(OUT_CATALOG_PATH)) return [];
  const existing = JSON.parse(fs.readFileSync(OUT_CATALOG_PATH, 'utf8'));
  return existing.filter((t) => String(t.id).startsWith('base_')).map((t) => {
    // Verify language of base_ tracks cleanly
    let lang = t.language;
    if (lang === 'en' && trTitleRx.test(t.title)) lang = 'tr';
    if (lang === 'tr' && !trTitleRx.test(t.title) && !trArtistStrictRx.test(t.artist) && isEnglishTitleOnly(t.title)) {
      lang = 'en';
    }
    return { ...t, language: lang };
  });
}

async function fetchItunesSupplement(langCode, queries, genreFallback = 'Pop') {
  const out = [];
  const countryMap = { ar: 'EG', nl: 'NL', el: 'GR', it: 'IT', de: 'DE', fr: 'FR', ko: 'KR', ja: 'JP' };
  const country = countryMap[langCode] || 'US';

  for (const q of queries) {
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&country=${country}&media=music&entity=song&limit=10`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      for (const item of data.results || []) {
        if (!item.trackName || !item.artistName) continue;
        // Skip English titles on non-English iTunes supplement
        if (langCode !== 'en' && isEnglishTitleOnly(item.trackName) && !/[^\x00-\x7F]/.test(item.trackName)) continue;
        const year = item.releaseDate ? Number(String(item.releaseDate).slice(0, 4)) : null;
        out.push({
          id: `itunes_${langCode}_${item.trackId}`,
          title: item.trackName,
          artist: item.artistName,
          album: item.collectionName || 'Single',
          genre: normalizeDisplayGenre(item.primaryGenreName || genreFallback, item.artistName, item.trackName, langCode),
          language: langCode,
          year: Number.isFinite(year) ? year : null,
          coverUrl: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '300x300bb') : null,
          spotifyId: null,
          valence: null,
          energy: null,
          danceability: null,
          acousticness: null,
          tempo: null,
          popularity: null,
          durationMs: item.trackTimeMillis || null,
          audioFeaturesVerified: false,
          source: 'iTunes Search API',
        });
      }
    } catch {
      // skip
    }
  }
  return out;
}

async function main() {
  const seenKeys = new Set();
  const catalog = [];

  const addTrack = (t) => {
    const key = normalizeKey(t.title, t.artist);
    if (!t.title || !t.artist || seenKeys.has(key)) return false;
    seenKeys.add(key);
    catalog.push(t);
    return true;
  };

  // 1. Preserve 468 base tracks
  const baseTracks = loadPreservedBaseTracks();
  let preservedCount = 0;
  for (const t of baseTracks) {
    if (addTrack(t)) preservedCount++;
  }

  // 2. Parse Spotify CSV with strict language detection
  const csvText = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = csvText.split('\n');
  const buckets = {
    tr_special: [],
    tr: [],
    fr: [],
    de: [],
    es: [],
    it: [],
    ko: [],
    ja: [],
    pt: [],
    ru: [],
    hi: [],
    nl: [],
    el: [],
    ar: [],
    en_by_genre: {},
  };

  const targetEnGenres = new Set([
    'pop', 'rock', 'alternative', 'alt-rock', 'indie', 'indie-pop',
    'hip-hop', 'r-n-b', 'soul', 'jazz', 'blues', 'classical', 'piano',
    'electronic', 'house', 'deep-house', 'techno', 'dance', 'disco',
    'acoustic', 'folk', 'chill', 'study', 'ambient', 'sleep',
    'metal', 'reggae', 'disney', 'show-tunes', 'sad', 'happy', 'emo', 'grunge'
  ]);

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;
    const cols = parseCsvLine(line);
    if (cols.length < 21) continue;

    const row = {
      track_id: cols[1],
      artists: cols[2].replace(/;/g, ', '),
      album_name: cols[3],
      track_name: cols[4],
      popularity: Number(cols[5]) || 0,
      duration_ms: Number(cols[6]) || 0,
      danceability: clamp01(Number(cols[8])),
      energy: clamp01(Number(cols[9])),
      acousticness: clamp01(Number(cols[14])),
      valence: clamp01(Number(cols[17])),
      tempo: clampTempo(Number(cols[18])),
      track_genre: cols[20],
    };

    if (!row.track_name || !row.artists) continue;
    const lang = detectStrictLanguage(row);
    if (!lang) continue;

    const genre = normalizeDisplayGenre(row.track_genre, row.artists, row.track_name, lang, row.energy, row.acousticness);
    const trackObj = {
      id: `sp_${row.track_id || i}_${hashShort(row.track_name + row.artists)}`,
      title: row.track_name,
      artist: row.artists,
      album: row.album_name || 'Single',
      genre,
      language: lang,
      year: null,
      coverUrl: null,
      spotifyId: row.track_id || null,
      valence: row.valence,
      energy: row.energy,
      danceability: row.danceability,
      acousticness: row.acousticness,
      tempo: row.tempo,
      popularity: row.popularity,
      durationMs: row.duration_ms,
      audioFeaturesVerified: true,
      source: 'Spotify Tracks Dataset (maharshipandya / Kaggle CC0)',
    };

    if (lang === 'tr') {
      if (['Arabesk', 'Türk Halk Müziği', 'Türk Sanat Müziği', 'Türkçe Rock'].includes(genre)) {
        buckets.tr_special.push(trackObj);
      } else {
        buckets.tr.push(trackObj);
      }
    } else if (lang === 'en') {
      if (targetEnGenres.has(row.track_genre)) {
        if (!buckets.en_by_genre[row.track_genre]) buckets.en_by_genre[row.track_genre] = [];
        buckets.en_by_genre[row.track_genre].push(trackObj);
      }
    } else if (buckets[lang]) {
      buckets[lang].push(trackObj);
    }
  }

  const takeFromBucket = (arr, limit) => {
    arr.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    let added = 0;
    for (const item of arr) {
      if (added >= limit) break;
      if (addTrack(item)) added++;
    }
    return added;
  };

  takeFromBucket(buckets.tr_special, 250);

  const langQuotas = {
    tr: 750,
    es: 460,
    fr: 360,
    de: 340,
    it: 320,
    ko: 340,
    ja: 380,
    pt: 280,
    ru: 240,
    hi: 220,
    nl: 120,
    el: 120,
    ar: 80,
  };

  for (const [lang, quota] of Object.entries(langQuotas)) {
    takeFromBucket(buckets[lang] || [], quota);
  }

  // Supplement Dutch, Greek, Arabic cleanly via iTunes API (also brings real album covers!)
  const [nlSup, elSup, arSup] = await Promise.all([
    fetchItunesSupplement('nl', ['Suzan & Freek', 'Snelle', 'Bløf', 'Marco Borsato', 'André Hazes', 'Froukje', 'Goldband', 'Flemming', 'Guus Meeuwis']),
    fetchItunesSupplement('el', ['Nikos Vertis', 'Konstantinos Argiros', 'Anna Vissi', 'Antonis Remos', 'Despina Vandi', 'Haris Alexiou', 'Marina Satti', 'Pantelis Pantelidis']),
    fetchItunesSupplement('ar', ['Amr Diab', 'Nancy Ajram', 'Fairuz', 'Elissa', 'Tamer Hosny', 'Cairokee', 'Sherine', 'Saad Lamjarred']),
  ]);

  for (const t of [...nlSup, ...elSup, ...arSup]) {
    addTrack(t);
  }

  // Fill remaining English tracks up to >= 5,600 total unique tracks
  for (const [genreKey, arr] of Object.entries(buckets.en_by_genre)) {
    const quota = ['pop', 'rock', 'indie', 'hip-hop', 'r-n-b', 'jazz', 'classical', 'electronic', 'acoustic', 'ambient', 'metal', 'blues', 'reggae'].includes(genreKey)
      ? 110
      : 75;
    takeFromBucket(arr, quota);
  }

  if (catalog.length < 5500) {
    for (const arr of Object.values(buckets.en_by_genre)) {
      if (catalog.length >= 5600) break;
      takeFromBucket(arr, 200);
    }
  }

  if (catalog.length < 5000) {
    throw new Error(`Expected >= 5000 unique tracks, got ${catalog.length}`);
  }

  const byLanguage = {};
  const byGenre = {};
  for (const t of catalog) {
    byLanguage[t.language] = (byLanguage[t.language] || 0) + 1;
    byGenre[t.genre] = (byGenre[t.genre] || 0) + 1;
  }

  const meta = {
    totalUniqueTracks: catalog.length,
    preservedBaseTracks: preservedCount,
    verifiedAudioFeatureTracks: catalog.filter((t) => t.audioFeaturesVerified).length,
    minimumRequirementMet: catalog.length >= 5000,
    generatedAt: new Date().toISOString(),
    sources: [
      {
        name: 'Spotify Tracks Dataset (Kaggle / HuggingFace)',
        url: 'https://huggingface.co/datasets/maharshipandya/spotify-tracks-dataset',
        license: 'CC0 / Public Open Dataset',
      },
      {
        name: 'Moodify Başlangıç Veri Seti (v1)',
        url: 'local://RAW_OPEN_TRACKS',
        license: 'Open Audio Metadata Reference',
      },
      {
        name: 'iTunes Search API (Çok Dilli Katalog & Kapak Doğrulaması)',
        url: 'https://itunes.apple.com/search',
        license: 'Apple iTunes Search Public API',
      },
    ],
    byLanguage,
    byGenre,
  };

  fs.mkdirSync(path.dirname(OUT_CATALOG_PATH), { recursive: true });
  fs.mkdirSync(path.dirname(OUT_META_PATH), { recursive: true });
  fs.writeFileSync(OUT_CATALOG_PATH, JSON.stringify(catalog));
  fs.writeFileSync(OUT_META_PATH, JSON.stringify(meta, null, 2));

  console.log('DONE! Total unique tracks:', catalog.length, 'Preserved base:', preservedCount);
  console.log('Languages:', byLanguage);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
