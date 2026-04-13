# Strømpris

En fullstack-applikasjon som visualiserer norske strømpriser i sanntid.

## Live
[fredriks-strompris.up.railway.app](https://fredriks-strompris.up.railway.app)

## Funksjoner
- **Dagvisning** — se strømpriser time for time med navigasjon mellom dager
- **Historisk graf** — månedlige gjennomsnittspriser tilbake til 2021
- **Gjennomsnitt** — sammenlign priser over en valgfri periode
- **Kostnadskalkulator** — beregn hva det koster å bruke ulike apparater
- **Lær mer** — AI-drevet opplysningsside med spørsmål og svar om norsk strøm

## Teknologier
- **Frontend:** React, Vite, Tailwind CSS, Recharts
- **Backend:** FastAPI, SQLAlchemy, Alembic
- **Database:** PostgreSQL
- **AI:** Anthropic Claude API
- **Deployment:** Docker, Railway

## Kjør lokalt

### Krav
- Docker og Docker Compose
- Anthropic API-nøkkel

### Oppsett
1. Klon repoet
```bash
   git clone https://github.com/fredrikudengen/strompris-api.git
   cd strompris-api
```

2. Lag en `.env`-fil i rotmappen:
ANTHROPIC_API_KEY=din_nøkkel_her

3. Start applikasjonen:
```bash
   docker compose up --build
```

4. Åpne [http://localhost:3000](http://localhost:3000) i nettleseren

5. Hent inn prisdata:
http://localhost:8000/admin/fetch-date?from_date=2021-10-01&to_date=2026-04-13

## Datakilde
Strømpriser hentes fra [hvakosterstrommen.no](https://www.hvakosterstrommen.no/strompris-api)