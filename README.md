# Travel360

Een volledige Java/Spring Boot webapplicatie voor het beheren en bekijken van reisfoto's (inclusief 360°-beelden) met Polarsteps-integratie. De uploader (Gijs) kan reizen aanmaken en foto's uploaden; bezoekers kunnen zich registreren en reacties plaatsen.

## Functionaliteit
- Authenticatie via gebruikersnaam of e-mail + wachtwoord.
- Eén uploader-account (Gijs / Gijs1212) met volledige beheerrechten.
- Registratie voor commenters (kunnen reacties plaatsen, geen uploads).
- Reizen met titel, beschrijving, periode en Polarsteps-link (automatische embed-URL).
- Foto's (normaal of 360°) per reis, opgeslagen op het lokale bestandssysteem.
- 360°-viewer op basis van [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/).
- Reacties per foto met datum/tijd-stempel.
- Dashboard voor de uploader om reizen en foto's te beheren.

## Technologieën
- Java 17
- Spring Boot 3 (Web, Thymeleaf, Security, Data JPA, Validation)
- H2 database (bestand op `./data/travel360-db`)
- Thymeleaf + Tailored CSS
- Photo Sphere Viewer via CDN

## Voorwaarden
- JDK 17+
- Maven 3.8+

## Installatie en draaien
```bash
mvn spring-boot:run
```

De applicatie draait vervolgens op [http://localhost:8080](http://localhost:8080).

### Standaardaccounts
| Rol | Gebruikersnaam | Wachtwoord |
|-----|----------------|------------|
| Uploader | Gijs | Gijs1212 |

Nieuwe bezoekers kunnen zichzelf registreren via `/register`; zij krijgen automatisch de rol `COMMENTER`.

### Bestandsopslag
- Geüploade foto's worden opgeslagen onder `./uploads/<trip-id>/`.
- De map `uploads/` staat in `.gitignore` en wordt automatisch aangemaakt.

### Database
- H2 database wordt automatisch aangemaakt in `./data/travel360-db`.
- Spring JPA staat ingesteld op `update`, zodat tabellen worden aangemaakt en bijgewerkt.
- H2-console is beschikbaar op `/h2-console` (alleen voor ontwikkeldoeleinden).

## Testen
```bash
mvn test
```

## Belangrijke routes
- `/` – publiek overzicht van reizen.
- `/trip/{id}` – detailpagina met foto’s, reacties en 360°-viewer.
- `/login` – inloggen voor uploader/commenters.
- `/register` – registratie voor nieuwe commenters.
- `/dashboard` – beheeromgeving voor uploader (alleen Gijs).

## Licentie
MIT
