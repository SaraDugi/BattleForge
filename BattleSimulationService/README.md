# BattleService

## Namen

**BattleService** je mikrostoritveni modul, namenjen upravljanju posameznih bitk znotraj turnirjev. Storitev omogoča ustvarjanje, posodabljanje in spremljanje bitk ter beleženje rezultatov in posebnih dogodkov med bitkami. S tem prispeva k organizaciji turnirjev in zagotavlja podatke za analizo uspešnosti in strategij.

## Ključne funkcionalnosti

- **Ustvarjanje bitke:**  
  - Omogoča definiranje novih bitk z določitvijo udeležencev, frakcij in začetnih pogojev.
  - Povezuje bitke s specifičnimi turnirji, kar omogoča sledenje napredka v tekmovalnem okolju.

- **Beleženje in analiza rezultatov:**  
  - Zbira podatke o končnem izidu bitke, vključno z zmagovalcem, porazi in drugimi pomembnimi statističnimi kazalniki.

- **Sledenje zgodovine bitk:**  
  - Shranjuje celotno zgodovino bitk, kar omogoča pregled preteklih dogodkov in primerjavo uspešnosti različnih taktik.
  - Zagotavlja API-je za vpogled v podrobnosti posameznih bitk.

- **Integracija s turnirskimi sistemi:**  
  - Omogoča samodejno generiranje turnirskih tabel na podlagi rezultatov bitk.
  - Povezuje se z drugimi mikrostoritvami (npr. PlayerManagementService) za spremljanje dosežkov igralcev.