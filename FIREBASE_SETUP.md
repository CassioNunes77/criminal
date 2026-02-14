# Firebase - Nexo Terminal

## Checklist – O que falta?

| Etapa | Comando/Ação | Status |
|-------|--------------|--------|
| 1. Deploy Firestore Rules | `firebase deploy --only firestore:rules` | ⬜ |
| 2. Service Account | Firebase Console → Service accounts → Gerar nova chave | ⬜ |
| 3. Netlify Env Vars | `GROQ_API_KEY`, `FIREBASE_SERVICE_ACCOUNT` (JSON) | ⬜ |
| 4. App `.env.local` | Variáveis `VITE_FIREBASE_*` do Console | ⬜ |
| 5. Deploy Netlify | Push para repositório conectado | ⬜ |

---

## Arquitetura

```
[Netlify Scheduled] → [Netlify Function] → [Groq API] → [Firestore]
   (0 3 * * * UTC)      (Node.js)           (llama-3.1-8b)   (crimes)
```

Um caso novo é gerado por IA todo dia às 00:00 (America/Sao_Paulo). O mesmo caso para todos os jogadores globalmente. Usa **Netlify Scheduled Functions** (gratuito), sem necessidade de plano Blaze.

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

## Netlify Scheduled Functions

### Função agendada

- **Arquivo:** `netlify/functions/generate-daily-case.mjs`
- **Schedule:** `0 3 * * *` (03:00 UTC = 00:00 America/Sao_Paulo)
- **Custo:** Gratuito

### Variáveis de ambiente (Netlify)

Configure no Netlify: **Site settings → Environment variables**:

| Nome | Valor | Sensível |
|------|-------|----------|
| `GROQ_API_KEY` | Chave da API Groq (https://console.groq.com) | Sim |
| `FIREBASE_SERVICE_ACCOUNT` | JSON completo da service account (Firebase Console → Project settings → Service accounts → Generate new private key) | Sim |
| `TRIGGER_SECRET` | Token secreto para forçar geração manual (ex: `openssl rand -hex 32`) | Sim |

O JSON da service account deve ser colado inteiro em uma única linha (remova quebras de linha do arquivo baixado). Exemplo do formato:
```json
{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

### Como forçar um novo caso (manual)

Endpoint HTTP para gerar caso na hora:

```bash
curl -X POST https://SEU-SITE.netlify.app/.netlify/functions/trigger-daily-case \
  -H "Authorization: Bearer SEU_TRIGGER_SECRET"
```

Ou com header alternativo:

```bash
curl -X POST https://SEU-SITE.netlify.app/.netlify/functions/trigger-daily-case \
  -H "X-Trigger-Secret: SEU_TRIGGER_SECRET"
```

Configure `TRIGGER_SECRET` nas variáveis de ambiente do Netlify (pode gerar com `openssl rand -hex 32`).

### Como testar

1. **Netlify UI:** Site → Functions → `generate-daily-case` → **Run now**
2. **Trigger manual:** `curl -X POST .../trigger-daily-case -H "Authorization: Bearer SEU_SECRET"`
3. **Script:** `TRIGGER_SECRET=seu_secret ./scripts/trigger-case.sh`
4. **CLI:** `netlify dev` e depois `netlify functions:invoke generate-daily-case`

### Troubleshooting: caso não gerado após 00:00

- **Scheduled functions só rodam em deploy publicado** (não em preview/branch)
- **Proteção por senha no site** desativa as funções agendadas
- **Gerar manualmente agora:** Netlify → Functions → `generate-daily-case` → **Run now**
- Ou: `TRIGGER_SECRET=xxx ./scripts/trigger-case.sh`

### Deploy Firestore Rules (apenas uma vez)

```bash
firebase login
firebase use <seu-projeto>
firebase deploy --only firestore:rules
```

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

A escrita em `crimes` e `_meta` é feita apenas pela Netlify Function (Firebase Admin SDK).

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

O prompt completo está em `prompts/generateDailyCase.js`. A função usa Groq (llama-3.1-8b-instant) e segue as regras de ouro do game.
