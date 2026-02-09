// Daily seed generator - generates same crime for all players on same day
export function getDailySeed() {
  const today = new Date()
  const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  
  // Simple hash function for deterministic seed
  let hash = 0
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  return Math.abs(hash)
}

// Sample crimes database - Crimes da década de 80
const CRIMES_DATABASE = [
  {
    id: 1,
    type: 'ROUBO',
    location: 'LOJA DE ELETRÔNICOS',
    time: '23:15',
    description: [
      'CASO #001 - ROUBO EM LOJA DE ELETRÔNICOS',
      '',
      'Uma loja de eletrônicos foi arrombada durante a madrugada.',
      'Equipamentos de som e vídeo foram levados. Evidências apontam para planejamento.',
      '',
      'Sua missão: identificar o responsável, o local exato do crime e o método utilizado.',
      '',
      'Analise as pistas e testemunhas com cuidado. Algumas informações podem ser falsas.'
    ],
    suspects: [
      { name: 'João Silva', criminalRecord: 'Passagem por furto em 1982' },
      { name: 'Maria Santos', criminalRecord: 'Sem antecedentes' },
      { name: 'Carlos Oliveira', criminalRecord: 'Passagem por roubo em 1984' },
      { name: 'Ana Costa', criminalRecord: 'Sem antecedentes' }
    ],
    locations: ['Porta dos Fundos', 'Vitrine Principal', 'Depósito', 'Escritório'],
    methods: ['Arrombamento', 'Chave falsa', 'Ajuda interna', 'Janela lateral'],
    clues: [
      { type: 'HORARIO', text: 'Crime ocorreu às 23:15', revealed: false },
      { type: 'LOCAL', text: 'Local exato: Porta dos Fundos', revealed: false },
      { type: 'ACESSO', text: 'Ferramentas encontradas: alicate e chave de fenda', revealed: false },
      { type: 'ALIBI', text: 'João Silva estava em casa (confirmado por vizinho)', revealed: false },
      { type: 'COMPORTAMENTO', text: 'Suspeito deixou pegadas de tênis Nike', revealed: false },
      { type: 'EVIDENCIA', text: 'Fio de cabelo encontrado no local', revealed: false }
    ],
    witnesses: [
      {
        name: 'Roberto, Segurança Noturno',
        statement: 'Vi uma pessoa alta saindo pela porta dos fundos por volta das 23:20',
        isTruthful: true
      },
      {
        name: 'Lucia, Vizinha',
        statement: 'João estava em casa assistindo TV às 23:15. Vi pela janela.',
        isTruthful: false
      },
      {
        name: 'Pedro, Funcionário',
        statement: 'A porta dos fundos estava trancada quando saí às 22:00',
        isTruthful: true
      }
    ],
    solution: {
      suspect: 'João Silva',
      location: 'Porta dos Fundos',
      method: 'Arrombamento'
    }
  },
  {
    id: 2,
    type: 'FURTO',
    location: 'VIDEOLOCADORA',
    time: '20:30',
    description: [
      'CASO #002 - FURTO EM VIDEOLOCADORA',
      '',
      'Uma videolocadora foi furtada durante o horário de funcionamento.',
      'Fitas de vídeo e dinheiro do caixa foram levados. Evidências apontam para ação rápida.',
      '',
      'Sua missão: identificar o responsável, o local exato do crime e o método utilizado.',
      '',
      'Analise as pistas e testemunhas com cuidado. Algumas informações podem ser falsas.'
    ],
    suspects: [
      { name: 'Paulo Mendes', criminalRecord: 'Passagem por furto em 1983' },
      { name: 'Fernanda Lima', criminalRecord: 'Sem antecedentes' },
      { name: 'Ricardo Souza', criminalRecord: 'Passagem por furto em 1981 e 1985' },
      { name: 'Juliana Alves', criminalRecord: 'Sem antecedentes' }
    ],
    locations: ['Caixa Registradora', 'Estante de Fitas', 'Banheiro', 'Entrada'],
    methods: ['Distração', 'Aproveitou descuido', 'Ajuda de cúmplice', 'Força'],
    clues: [
      { type: 'HORARIO', text: 'Crime ocorreu às 20:30', revealed: false },
      { type: 'LOCAL', text: 'Local exato: Caixa Registradora', revealed: false },
      { type: 'ACESSO', text: 'Caixa estava aberto, sem sinais de arrombamento', revealed: false },
      { type: 'ALIBI', text: 'Paulo Mendes estava em casa (confirmado por mãe)', revealed: false },
      { type: 'COMPORTAMENTO', text: 'Suspeito usou boné e óculos escuros', revealed: false },
      { type: 'EVIDENCIA', text: 'Impressão digital encontrada no caixa', revealed: false }
    ],
    witnesses: [
      {
        name: 'Marcos, Cliente',
        statement: 'Vi uma pessoa mexendo no caixa às 20:25. Parecia nervosa.',
        isTruthful: true
      },
      {
        name: 'Sandra, Funcionária',
        statement: 'Paulo estava na loja comprando pipoca às 20:30. Vi ele saindo.',
        isTruthful: false
      },
      {
        name: 'Antonio, Dono',
        statement: 'O caixa estava fechado quando saí para o banheiro às 20:20',
        isTruthful: true
      }
    ],
    solution: {
      suspect: 'Paulo Mendes',
      location: 'Caixa Registradora',
      method: 'Distração'
    }
  }
]

export function getDailyCrime() {
  // For testing, always return the first case
  // Later, use seed to select random case
  const seed = getDailySeed()
  const crimeIndex = seed % CRIMES_DATABASE.length
  const baseCrime = CRIMES_DATABASE[crimeIndex]
  
  // Create unique crime ID based on date
  const today = new Date()
  const dateString = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  const crimeId = parseInt(dateString)
  
  // Transform suspects array to match old format for compatibility
  const suspects = baseCrime.suspects.map(s => typeof s === 'object' ? s.name : s)
  
  return {
    ...baseCrime,
    id: crimeId,
    date: today.toLocaleDateString('pt-BR'),
    suspects: suspects, // Keep both formats for compatibility
    suspectsWithRecords: baseCrime.suspects // New format with criminal records
  }
}
