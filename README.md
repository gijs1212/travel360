# Travel360

Productieklare React + Supabase webapp voor het beheren en beleven van reizen, inclusief 360° foto's en Polarsteps-embed. De app ondersteunt één uploader-account (Gijs) die reizen en foto's kan beheren; alle andere gebruikers kunnen registreren om reacties achter te laten.

## Belangrijkste features

- **Authenticatie** met Supabase; inloggen kan met gebruikersnaam of e-mail.
- **Uploader dashboard** om reizen aan te maken, Polarsteps-links te koppelen en foto's te uploaden (normaal of 360°).
- **360° viewer** via [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/) met drag/gyro-ondersteuning.
- **Reactiesysteem** zodat geregistreerde gebruikers feedback kunnen geven op foto's.
- **Polarsteps integratie**: plak een publieke link en de app genereert automatisch de embed URL.
- **Supabase Storage** voor foto-bestanden met signed URLs.

## Project structuur

```
.
├── src/                  # React + TypeScript codebase
├── supabase/             # Database migraties, storage policies en seed scripts
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## Voorwaarden

- Node.js 18+
- Supabase project (self-hosted of Supabase.com)
- Supabase CLI voor lokale migraties (`npm install -g supabase`)

## Installatie

```bash
npm install
```

### Omgevingsvariabelen

Maak een `.env` bestand op basis van `.env.example`:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<public-anon-key>
```

## Supabase configuratie

1. **Migraties draaien**
   ```bash
   supabase db push
   ```

2. **Storage bucket + policies**
   ```bash
   supabase db execute --file supabase/storage-policies.sql
   ```
   Of voer de SQL-inhoud uit in de SQL-editor van Supabase.

3. **Seeder voor uploader-account (Gijs)**

   Draai het seed-script met service-role rechten (bijv. via Supabase SQL editor of `psql` met service key):
   ```sql
   \i supabase/seeds/000_gijs.sql
   ```

   Dit maakt (of actualiseert) de gebruiker met:
   - **Gebruikersnaam:** `Gijs`
   - **E-mail:** `gijs@travel360.app`
   - **Wachtwoord:** `Gijs1212`
   - **Rol:** `uploader`

4. **Storage bucket `photos`**

   Zorg dat de bucket bestaat en dat bovenstaande policies actief zijn. De app verwacht dat bestanden in de `photos` bucket worden opgeslagen.

## Development

Start de lokale ontwikkelserver:

```bash
npm run dev
```

De app draait standaard op `http://localhost:5173`.

## Belangrijke flows

- **Registratie**: nieuwe gebruikers registreren met gebruikersnaam, e-mail en wachtwoord. Zij krijgen automatisch de rol `commenter` en mogen reacties plaatsen.
- **Inloggen**: werkt met gebruikersnaam of e-mail. De app zoekt indien nodig de bijbehorende e-mail op in `profiles` en voert vervolgens een normale Supabase login uit.
- **Dashboard** (`/dashboard`): alleen bereikbaar voor de uploader. Hier kunnen nieuwe reizen worden aangemaakt, Polarsteps-links worden gekoppeld en foto's worden geüpload/verwijderd.
- **Reisdetail** (`/trip/:id`): toont een fotogrid, de 360° viewer (bij panorama's), reacties en optioneel de Polarsteps embed kaart.

## Tests & quality

- TypeScript strict mode staat aan.
- TailwindCSS voor styling.
- Gebruik `npm run build` om te valideren dat het project compileert (vereist geïnstalleerde dependencies).

## Productie

1. Deploy de frontend (bijv. Vercel/Netlify) met de juiste `VITE_SUPABASE_*` variabelen.
2. Zorg dat Supabase database, auth en storage zijn geconfigureerd volgens bovenstaande stappen.
3. Stel CORS in op Supabase (Dashboard → Authentication → URL Configuration) met de URL van de hosting.

## Credentials samenvatting

| Type     | Waarde            |
|----------|-------------------|
| Uploader | gebruiker: `Gijs`<br>e-mail: `gijs@travel360.app`<br>wachtwoord: `Gijs1212` |

Alle overige gebruikers registreren zichzelf en ontvangen automatisch de rol `commenter`.
