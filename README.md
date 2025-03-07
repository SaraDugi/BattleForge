# Battle Forge

## Pregled projekta

**Battle Forge Arena** je mikrostoritveni sistem za upravljanje in simulacijo namiznih strateških iger, navdihnjenih z Warhammerjem in podobnimi miniaturnimi igrami. Sistem omogoča:

- **Upravljanje igralcev:** Registracija in vzdrževanje igralčevih profilov, spremljanje statistik in dosežkov.
- **Rezervacije in urniki:** Organizacijo rezervacij miz, terminov za igranje in turnirjev.
- **Simulacijo bitk:** Izračun in beleženje rezultatov bitk na osnovi predpisanih pravil in naključnih elementov.
- **Spletni vmesnik:** Spletna aplikacija, preko katere uporabniki komunicirajo z vsemi mikrostoritvami.

## Arhitektura sistema

Sistem temelji na načelih **čiste arhitekture** in **screaming architecture**, kar pomeni:

- **Neodvisnost domene:** Poslovna logika (npr. pravila bitk, upravljanje igralcev) je popolnoma ločena od infrastrukture (podatkovne baze, API-ji).
- **Ohlapna sklopljenost:** Vsaka mikrostoritev deluje kot samostojna enota in komunicira prek jasno definiranih API-jev.
- **Smer odvisnosti:** Zunanje plasti (infrastructure) se povezujejo z notranjimi (domain), pri čemer se ne delijo odvisnosti obratno.

## Mikrostoritve

### 1. **BattleService**  
**Opis:**  
BattleService upravlja vse vidike posameznih bitk, vključno z ustvarjanjem, posodabljanjem, beleženjem rezultatov in povezovanjem s turnirji. Omogoča celovito sledenje poteku igre, beleženje ključnih dogodkov in zagotavljanje analitike za igralce in organizatorje turnirjev.

**Ključne funkcionalnosti:**
- **Ustvarjanje bitke:**  
  - Določanje udeležencev, frakcij in začetnih pogojev.  
  - Povezovanje bitke s turnirjem, če gre za tekmovalno igro.
- **Upravljanje poteka bitke:**  
  - Sledenje posameznim fazam igre (premiki, napadi, specialni učinki).  
  - Beleženje kritičnih dogodkov, kot so herojski trenutki ali uničenje ključnih enot.
- **Beleženje in analiza rezultatov:**  
  - Zbiranje podatkov o zmagovalcu, izgubah in pomembnih statističnih kazalnikih.  
  - Generiranje povzetkov bitk za kasnejšo analizo in izboljšanje strategij igralcev.
- **Sledenje zgodovini bitk:**  
  - Omogočanje igralcem, da si ogledajo pretekle igre in primerjajo uspešnost različnih taktik.

### 2. **BookingService**  
**Opis:**  
BookingService omogoča rezervacijo miz, upravljanje urnikov in organizacijo turnirskih dogodkov. Zagotavlja pregled razpoložljivosti, sinhronizacijo terminov in pošiljanje obvestil igralcem.

**Ključne funkcionalnosti:**
- **Rezervacija miz in terminov:**  
  - Omogočanje igralcem in organizatorjem, da rezervirajo igralne prostore.  
  - Dodelitev miz glede na število igralcev in trajanje igre.
- **Upravljanje urnikov:**  
  - Organizacija prostih terminov za igranje, turnirje in posebne dogodke.  
  - Sinhronizacija urnikov med različnimi mikrostoritvami, da se preprečijo prekrivanja terminov.
- **Turnirski sistem:**  
  - Možnost prijave igralcev in ekip na turnir.  
  - Samodejno določanje razporedov za turnirske tekme (skupinski del, izločilni boji).  
  - Povezava z BattleService za sledenje rezultatom turnirskih bitk.
- **Obveščanje igralcev:**  
  - Pošiljanje potrditvenih sporočil o rezervacijah in opomnikov pred začetkom igre.  
  - Integracija z e-pošto, SMS ali drugimi sistemi za obveščanje.
- **Pregled in urejanje rezervacij:**  
  - Možnost organizatorjev, da spreminjajo, prestavljajo ali prekličejo rezervacije.

### 3. **PlayerManagementService**  
**Opis:**  
PlayerManagementService upravlja podatke o igralcih, njihovih profilih, statistiki in dosežkih. Omogoča celovit vpogled v zgodovino igranja, spremljanje napredka in analizo uspešnosti posameznih igralcev ali ekip.

**Ključne funkcionalnosti:**
- **Registracija in prijava igralcev:**  
  - Ustvarjanje uporabniškega računa s podatki (ime, kontakt, frakcija, nivo igralca).  
  - Upravljanje gesel in avtentikacija za dostop do sistema.
- **Upravljanje profilov:**  
  - Možnost urejanja osebnih podatkov, spreminjanje frakcije in nastavitev profila.  
  - Dodajanje prilagojenih avatarjev, značk in drugih vizualnih elementov.
- **Sledenje dosežkom in statistikam:**  
  - Beleženje števila odigranih bitk, zmag/porazov in uspešnosti proti določenim frakcijam.  
  - Razvrstitev igralcev glede na stopnjo izkušenj in posebne nagrade.
- **Sistem rangiranja:**  
  - Točkovni sistem za ocenjevanje igralcev glede na njihovo uspešnost na turnirjih.  
  - Dinamične lestvice najboljših igralcev v različnih kategorijah (npr. agresivni stil igranja, defenzivna strategija).
- **Povezava s turnirskimi podatki:**  
  - Sledenje igralčevim nastopom na turnirjih in beleženje nagrad.  
  - Možnost ogleda zgodovine dvobojev in analize uspešnosti.
- **Družabne funkcije:**  
  - Možnost dodajanja prijateljev in organizacije ekip za ekipne igre.  

## Spletna aplikacija (WebUI)

**WebUI** je spletna aplikacija, razvita z uporabo **Node.js** in **React** ter omogoča uporabnikom:

- **Pregled in ustvarjanje bitk:**  
  - Uporabniki lahko preko intuitivnega uporabniškega vmesnika pregledajo pretekle bitke, ustvarijo nove bitke in spremljajo potek aktivnih bitk.
  - Interaktivni obrazci omogočajo enostavno vnašanje podatkov o bitkah, vključno z udeleženci, frakcijami in začetnimi pogoji.

- **Rezervacija terminov in prijava na turnirje:**  
  - Aplikacija nudi koledarski sistem, ki prikazuje razpoložljive termine za igranje ter omogoča rezervacijo miz in prijavo na turnirje.
  - Uporabniki prejmejo potrdila in opomnike preko integriranih obvestil, ki so sinhronizirani s strežniškimi mikrostoritvami.

- **Upravljanje uporabniških profilov in spremljanje statistike:**  
  - Vsak uporabnik lahko ureja svoj profil, spremlja osebno statistiko (npr. zmag/porazov, dosežke) ter primerja svoje rezultate z drugimi igralci.
  - Profil vključuje možnosti za dodajanje avatarjev, osebnih podatkov in prikaz dinamičnih lestvic najboljših igralcev.

## Dodatne komponente

- **Podatkovna baza:**  
  - Uporabljamo **Aiven MySQL** za shranjevanje vseh podatkov.