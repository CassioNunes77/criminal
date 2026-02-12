# Firebase - Nexo Terminal

## Estrutura do Firestore

**Coleção:** `crimes`  
**Documento ID:** `YYYY-MM-DD` (ex: `2026-02-12`)

### Formato do documento

```json
{
  "type": "ROUBO",
  "location": "LOJA DE ELETRÔNICOS",
  "time": "23:15",
  "description": [
    "CASO #001 - ROUBO EM LOJA DE ELETRÔNICOS",
    "",
    "Uma loja de eletrônicos foi arrombada...",
    ""
  ],
  "suspects": [
    { "name": "João Silva", "criminalRecord": "Passagem por furto em 1982" },
    { "name": "Maria Santos", "criminalRecord": "Sem antecedentes" }
  ],
  "locations": ["Porta dos Fundos", "Vitrine Principal", "Depósito"],
  "methods": ["Arrombamento", "Chave falsa", "Ajuda interna"],
  "clues": [
    { "type": "HORARIO", "text": "Crime ocorreu às 23:15" },
    { "type": "LOCAL", "text": "Local exato: Porta dos Fundos" }
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
  }
}
```

## Regras de segurança (Firestore)

Para permitir leitura pública (apenas leitura):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /crimes/{date} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Variáveis de ambiente

O arquivo `.env.local` já está configurado. O `.env.local` não é commitado (está no `.gitignore`).

Para deploy (Netlify): adicione as variáveis `VITE_FIREBASE_*` nas configurações do projeto.

## Fallback

Se o Firebase falhar ou não houver crime para o dia, o app usa o banco local (`dailySeed.js`).

## Modo offline

O crime do dia é armazenado em cache (localStorage) ao ser carregado com sucesso. Isso permite:

- **Continuar jogando sem internet**: se o usuário já carregou o app online no mesmo dia, o crime fica em cache e é usado quando estiver offline.
- **Chave de cache**: `nexo_crime_cache_YYYY-MM-DD`
- **Fluxo**: Firebase → (erro) → cache do dia → (não encontrado) → dailySeed local
