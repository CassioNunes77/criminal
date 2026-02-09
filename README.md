# Selene - Terminal de Crimes

Jogo diário de resolução de crimes com estética terminal DOS verde clássico.

## Conceito

- **1 Crime por Dia**: Todo dia aparece um novo caso criminal fictício
- **Investigação**: Analise pistas e descubra quem, onde e como
- **Foco em raciocínio**: Dedução e investigação, nada gráfico ou pesado

## Stack

- **Frontend**: React + Vite
- **Deploy**: Netlify (configurado)
- **Mobile**: Capacitor (estrutura preparada, não implementado)
- **Backend**: Firebase (não implementado ainda)
- **Auth**: Google/Apple (não implementado ainda)

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## Deploy

O projeto está configurado para deploy automático no Netlify. O arquivo `netlify.toml` contém as configurações necessárias.

## Estrutura

- `src/components/` - Componentes React (Home, Investigation, Result)
- `src/utils/` - Utilitários (daily seed, crimes database)
- `src/index.css` - Estilos globais com tema terminal verde
- `src/App.jsx` - Lógica principal do jogo

## Tema Visual

- Fundo: `#020403` (quase preto com leve verde)
- Texto principal: `#00CC55`
- Destaque: `#00FF66`
- Fontes: IBM Plex Mono (UI) + VT323 (títulos)
- Efeitos: CRT scanlines, glow de texto, animações typewriter
