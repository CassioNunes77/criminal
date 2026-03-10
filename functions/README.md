# Nexo - Cloud Functions

Função agendada que gera um caso novo por dia via IA (OpenAI) e salva no Firestore.

## Setup

```bash
npm install
firebase use <seu-projeto>
firebase functions:secrets:set OPENAI_API_KEY
```

## Deploy

```bash
firebase deploy --only functions
```

## Requisitos

- Plano Blaze (pay-as-you-go) para Cloud Scheduler
- Chave da API OpenAI
