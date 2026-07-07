# MatReflex — Fiziksel Arayüz Dili

*İmza etkileşim dili. Ekranlar tasarlamıyoruz; ekranda yaşayan fiziksel nesneler tasarlıyoruz.*

---

## Temel fikir

MatReflex bir menü listesi değil. Elle tutulur nesnelerin bir araya geldiği sakin bir masa. Her menü öğesinin ağırlığı, bir malzemesi, bir kalınlığı ve bir sırası var. Kullanıcı kaydırmıyor; nesnelerin arasında dolaşıyor, birini eline alıyor, açıyor, yerine bırakıyor.

Ölçüt tek: bir öğeyi gözünle gördüğünde onu **parmağınla kaldırabileceğini** hissetmelisin. Hissetmiyorsan, o öğe henüz bir nesne değil, sadece bir dikdörtgen.

---

## Malzeme

Her şey tek bir malzemeden yapılmış gibi durur: **sıcak, preslenmiş kağıt**. Mat, hafif dokulu, kremli. Cam değil (yansıma yok), plastik değil (parlaklık yok), metal değil (soğukluk yok). Kağıdın iki hali var:

- **Yüzey kağıdı:** açık krem, üstüne yazı ve içerik basılır. Sakin, geri planda.
- **Renkli şerit kağıdı:** aynı kağıdın boyanmış hali. Bir nesnenin kimliğini rengi taşır, ama renk hep tok değil, soluk ve topraksı. Renk bağırmaz, işaret eder.

Kağıdın kenarları yuvarlatılmış ve hafifçe kalın. Bir nesneye baktığında kenarının bir **et kalınlığı** olduğunu hissedersin; kağıt sonsuz ince değil, preslenmiş ve sağlam.

**Kural:** Palet sıcak ve muted kalır. Neon yok, degrade gösterisi yok, cam efekti yok. Tek bir yumuşak ışık kaynağı vardır ve o hep yukarıdadır.

---

## Ağırlık ve yerçekimi

Nesnelerin ağırlığı vardır, o yüzden hiçbir şey anında hareket etmez ve hiçbir şey aniden durmaz. Her hareket bir **yay** ile biter: hafifçe hedefi geçer, sonra yerine oturur. Doğrusal (sabit hızlı) hareket yoktur; doğrusal hareket cansızdır, robotiktir.

Dokunulan nesne **çöker** (hafif ölçek küçülmesi), bırakılınca **geri gelir**. Öne çıkan nesne yükselir ve gölgesi büyür; gerideki nesneler bir adım geri çekilir. Bu bir animasyon süsü değil, fizik: ağır bir nesneyi kaldırınca çevresi ona yer açar.

**Kural:** Süre kısa, eğri yumuşak. Hareket "canlı, doğal, yumuşak" hissettirmeli; asla "yükleniyor" hissettirmemeli.

---

## Derinlik ve katman

Derinlik gerçek olmalı, taklit değil. Derinliği üç şey verir:

1. **Yumuşak, tek yönlü gölge.** Yukarıdaki ışıktan düşen, geniş ve dağınık bir gölge. Sert değil. Nesne ne kadar önemliyse ve ne kadar öndeyse, gölgesi o kadar derin.
2. **Katmanlı istifleme.** Nesneler hafifçe üst üste biner ya da yan yana durur, ama hep hizalı. Derinlik onların *sırasından* gelir, eğik durmasından değil.
3. **Kabartma ve kıvrım.** Bir nesnenin üstündeki ikon, kağıttan **kabartılmış** gibidir: üstünde ince bir ışık, altında ince bir iç gölge. Şeridin sol kenarında kağıdın hafifçe katlandığı bir kıvrım vardır.

**Yasak:** Hizasızlık, rastgele döndürme, farklı hızlarda kayan sahte parallax. Bunlar derinlik değil, kusurdur. Bir kez denedik, "yarım kalmış" göründü. Derinlik disiplinden gelir; nesneler hep hizalı, gölgeler hep tutarlı.

---

## Hiyerarşi

Bir nesnenin önemi fiziksel olarak okunur. Önemli olan:

- **Daha büyüktür** (daha çok yer kaplar),
- **Daha yüksektedir** (daha derin gölge, daha öne),
- **Daha doygun renktedir** (soluk gri değil, kendi rengi),
- **Daha yukarıdadır** (ekranda üst sırada, günlük eylem ortada).

Yasal ve ikincil olan nesneler daha sakin, daha gri, daha geride durur. Aynı sistemin parçasıdırlar ama seslerini yükseltmezler. Kullanıcı hiçbir etiketi okumadan neyin önemli olduğunu **bir bakışta** görmeli.

---

## Hareket grameri

Her etkileşim bir fiziksel eylemdir, bir menü komutu değil. Fiiller bunlar:

- **Bas ve kaldır.** Nesneye dokunursun; çöker, sonra öne yükselir. Gitmesi gereken yere gider ya da açılır.
- **Aç (akordeon).** Kısa içerikli bir nesne yerinde **açılır**; kağıt katlanır ve içi görünür. İçerik başka bir yere taşınmaz, nesnenin kendisi büyür. Bu, "önce özü göster, isteyince detayı aç" ilkesinin fiziksel karşılığıdır. (Adı: *aşamalı açığa çıkarma*.)
- **Çekmece (sheet).** Uzun içerikli bir nesneye dokununca alttan bir **çekmece** yayla yukarı kayar. Arkadaki masa bulanıklaşıp hafifçe kararır ama görünür kalır; kullanıcı nerede olduğunu kaybetmez. Çekmece kapanınca masa yerindedir.
- **Yer aç.** Bir nesne öne çıkınca komşuları geri çekilir. Ekran, üstünde nesneler olan bir tepsidir; biri kalkınca diğerleri kımıldar.

**Kural:** Aynı eylem her yerde aynı hisseder. Akordeon her zaman yerinde açılır, çekmece her zaman alttan gelir. Tutarlılık, kullanıcının kasları öğrenmesini sağlar.

---

## Nesne kütüphanesi

Sistemin somut nesneleri. Her biri aynı malzemeden, aynı fizikle. Yeni bir ekran değil, bu nesnelerin yeni bir dizilişi.

**Plaka.** Kimlik levhası. Profilin, durumun tepesinde durur. Kalın, sağlam, hafif gömülü. Üstünde kabartma bir künye ve birkaç sayısal rozet taşır. Masanın "başlığı"dır.

**Şerit.** Menü nesnesinin temel biçimi. Yatay, renkli kağıt bant. Solda kimlik rengi ve katlanma kıvrımı, sağda kabartmalı yuvarlak ikon. Dokununca açılır (akordeon) ya da çekmece açar. Ayarlar, profil, yasal; hepsi şerittir.

**Deste.** Pratik nesnesi. Bir kart destesi gibi seçilir. Her deste bir konu; dokununca doğrudan başlar. Katmanlı gölgeyle fiziksel bir kağıt yığını gibi durur.

**Akış Kartı.** Bir yöntemin nasıl çalıştığını gösteren nesne. Üstte problem, aşağı oklarla adımlar, altta o rengin dolu sonuç kartı. Kritik rakam yöntemin renginde vurgulanır. Metin değil, izlenen bir yol.

**Tablo Hücresi.** Bilgi taşı. Küçük, kare, sayısını taşır. Yan yana dizilince bir tablo, bir desen oluşturur (taşımalı olanlar bir renkte, olmayanlar başka; kural gözle görünür hale gelir).

**Anahtar.** Fiziksel bir açma-kapama. Yuvarlak topuz bir raydan öbür uca yayla kayar. Dokunulabilir, tıklanabilir, geri alınabilir.

**Çekmece.** Uzun içeriğin barındığı katman. Alttan gelir, masayı örtmeden üstüne oturur, kapanınca iz bırakmaz.

---

## Disiplin

Cesaret tek yere harcanır. Bir kompozisyonda akılda kalan tek çarpıcı şey olsun; gerisi sessiz ve düzenli dursun. Muji'nin sadeliği ile Apple'ın hassasiyeti burada buluşur: az ama kusursuz.

Chanel'in kuralı geçerlidir: nesneyi bitirdikten sonra bir aksesuarı çıkar. Bir gölge fazlaysa, bir renk yüksekse, bir döndürme gereksizse; kaldır. Boşluk cömert olsun; nesnelerin nefes alacak yeri olsun.

Ve her zaman bir zemin katı: mobilde çalışır, klavye odağı görünür, hareket azaltma tercih edilirse tüm animasyon sadeleşir. Premium his, gösterişten değil, bu görünmez sağlamlıktan gelir.

---

## Dil böyle büyür

Yeni bir özellik geldiğinde yeni bir görsel dil icat edilmez. Sorulan tek soru şudur: *bu, hangi nesne?* Bir şerit mi, bir deste mi, bir çekmece mi? Aynı kağıt, aynı ışık, aynı yay, aynı hiyerarşi. Böylece uygulama büyüdükçe dağılmaz; tek bir zanaatkârın elinden çıkmış gibi kalır.

Bu dil MatReflex'in imzasıdır ve aynı ilkelerle başka eğitim ürünlerine de taşınabilir: malzeme, ağırlık, derinlik, hiyerarşi. Nesneler değişir, fizik değişmez.
