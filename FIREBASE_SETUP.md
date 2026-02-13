# Firebase - Nexo Terminal

## Arquitetura

```
[Cloud Scheduler] → [Cloud Function] → [OpenAI API] → [Firestore]
     (diário 00:00)     (Node.js)         (GPT-4o-mini)    (crimes)
```

Um caso novo é gerado por IA todo dia às 00:00 (America/Sao_Paulo). O mesmo caso para todos os jogadores globalmente.

---

## Estrutura do Firestore

**Coleção:** `crimes`  
**Documento ID:** `YYYY-MM-DD` (ex: `2026-02-12`)

**Coleção:** `_meta` (interno)  
**Documento:** `counters` – contador para `lastCaseNumber`

### Formato do documento (crimes)

```json
{
  "type": "ROUBO",
  "location": "LOJA DE ELETRÔNICOS",
  "time": "23:15",
  "description": ["CASO #0001 - ROUBO EM...", "", "..."],
  "suspects": [
    { "name": "João Silva", "criminalRecord": "Passagem por furto em 1982" }
  ],
  "locations": ["Porta dos Fundos", "Vitrine Principal", "Depósito", "Escritório"],
  "methods": ["Arrombamento", "Chave falsa", "Ajuda interna", "Janela lateral"],
  "clues": [
    { "type": "HORARIO", "text": "Crime ocorreu às 23:15" },
    { "type": "LOCAL", "text": "Local exato: Porta dos Fundos" },
    { "type": "ACESSO", "text": "..." },
    { "type": "ALIBI", "text": "..." },
    { "type": "COMPORTAMENTO", "text": "..." },
    { "type": "EVIDENCIA", "text": "..." }
  ],
  "witnesses": [
    {
      "name": "Roberto, Segurança Noturno",
      "statement": "Vi uma pessoa alta saindo...",
      "isTruthful": true
    }
  ],
  "solution": {
    "suspect": "João Silva",
    "location": "Porta dos Fundos",
    "method": "Arrombamento"
  },
  "caseNumber": "0001",
  "caseCode": "X7K9M2P4",
  "dossier": "Texto completo interno (caso + solução + provas)",
  "date": "2026-02-12",
  "createdAt": "2026-02-12T03:00:00.000Z"
}
```

- **caseNumber**: Sequencial (#0001, #0002...)
- **caseCode**: Código alfanumérico randômico (8 chars) para referência futura
- **dossier**: Dados internos, não expostos ao jogador

---

## Firebase Cloud Functions

### Deploy

```bash
cd criminal
firebase login
firebase use <seu-projeto>
cd functions
npm install
firebase deploy --only functions
```

### Variáveis de ambiente (Functions)

Configure a chave da OpenAI como secret:

```bash
firebase functions:secrets:set OPENAI_API_KEY
```

(O valor será solicitado interativamente. Use sua chave da API OpenAI.)

A variável ficará disponível como `process.env.OPENAI_API_KEY` na função.

### Função agendada

- **Nome:** `generateDailyCase`
- **Schedule:** `0 0 * * *` (00:00 diário)
- **TimeZone:** America/Sao_Paulo
- **Region:** us-central1

---

## Regras de segurança (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /crimes/{date} {
      allow read: if true;
      allow write: if false;
    }
    match /_meta/{document} {
      allow read, write: if false;
    }
  }
}
```

A escrita em `crimes` e `_meta` é feita apenas pela Cloud Function (Admin SDK).

---

## Variáveis de ambiente (App)

**`.env.local`** (não commitado):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Para deploy (Netlify): adicione as variáveis `VITE_FIREBASE_*` nas configurações do projeto.

---

## Fallback

Se o Firebase falhar ou não houver crime para o dia, o app usa o banco local (`dailySeed.js`).

---

## Modo offline

O crime do dia é armazenado em cache (localStorage) ao ser carregado com sucesso:

- **Chave de cache:** `nexo_crime_cache_YYYY-MM-DD`
- **Fluxo:** Firebase → (erro) → cache do dia → (não encontrado) → dailySeed local

---

## Prompt de IA

O prompt completo está em `prompts/generateDailyCase.js`. A função usa OpenAI (GPT-4o-mini) e segue as regras de ouro do game.
