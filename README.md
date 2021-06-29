Projekat: Upis podataka iz Pošta Garaže u Almaks sistem

Serverski deo aplikacije:
Serverski deo aplikacije služi da sa poštinog Ftp servera skine CSV fajl koji je izvezen iz Pošta Garaže aplikacije. U CSV fajlu je svaki red zabeležen kao jedna vožnja koja ima I još neke dodatne informacije (broj telefona vozača, ime I prezime vozača, informacije o dispečeru). Aplikacija služi da proveri svaku od tih redova u CSV fajla I upiše sledeće informacije preko Almaks Api servisa u Almaks sistem:

Kreiranje vozača na Almaks sistemu
Ova funkcija služi da proveri svaki red CSV fajla I ako ne postoji vozač sa jedinsvenim brojem (ID), kreira vozača. Ako već postoji vozač sa tim jedinstvenim brojem(ID) samo preskoči taj red I radi sledeće funkcije. Prilikom kreiranja vozača popunjavaju se 3 polja:
• Prvo polje (naziv) je obavezno I u njemu se upisuje ime I prezime vozača
• Drugo polje (kod) je opciono I u njemu se unosi jedinsveni broj (ID) vozača
• Treće polje (broj telefona) je takođe opciono I u njemu se upisuje jedinstveni broj telefona (ne može se kreirati drugi vozač sa istim brojem telefona na sistemu) u formatu +381…
Zaduženje i razduženje vozila od vozača
Ova funkcija omogućava vozaču da zaduži i razduži vozilo, u slučaju da taj red ne poseduje informaciju o razduženju vozila, vozilo će biti zaduženo sve dok se taj CSV fajl ne ažurira I u tom redu ne doda informacija o razduženju vozila.

Editovanje već kreiranog vozača
Ova funkcija služi da izmeni Prvo I Treće polje iz opcije kreiranje vozača, funkcioniše tako što proverava svaku liniju iz CSV fajla I upisuje informaciju iz poslednjeg reda vezanu za jedinstveni broj (ID) vozača. Ukoliko nema izmena samo preskoči taj red.

Upisivanje informacija u poruke događaja
Ova funkcija služi da upise ceo red iz CSV fajla vezan za to određeno vozilo. Poruka se upisuje isključivo ako red ima zaduženje I razduženje (ukoliko nema razduženje ne upisuje taj red u događaje). Vreme upisivanja poruke u događaje je zabeleženo kao vreme zaduženja vozila.
