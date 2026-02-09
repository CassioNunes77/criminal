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

// Sample crimes database
const CRIMES_DATABASE = [
  {
    id: 1,
    type: 'ROUBO',
    location: 'MUSEU AURORA',
    time: '22:40',
    description: [
      'CASO #001 - ROUBO DE OBRA DE ARTE',
      '',
      'Uma obra de arte valiosa foi roubada do Museu Aurora durante a noite.',
      'O sistema de seguranca foi comprometido e evidencias apontam para acesso interno.',
      '',
      'Sua missao: identificar o responsavel, o local exato do crime e o metodo utilizado.',
      '',
      'Analise as pistas com cuidado. Cada detalhe importa.'
    ],
    suspects: ['Funcionário', 'Visitante', 'Segurança', 'Curador'],
    locations: ['Galeria Principal', 'Depósito', 'Sala de Exposição', 'Escritório'],
    methods: ['Forçou a fechadura', 'Usou chave falsa', 'Desativou alarme', 'Acesso interno'],
    clues: [
      { text: '[HORARIO] Crime ocorreu as 22:40' },
      { text: '[LOCAL] Local exato: Galeria Principal' },
      { text: '[CAMERA] Camera desativada as 22:35' },
      { text: '[EVIDENCIA] Luva encontrada no local' },
      { text: '[ALIBI] Visitante estava em casa' },
      { text: '[ACESSO] Chave mestra acessada as 22:38' }
    ],
    solution: {
      suspect: 'Funcionário',
      location: 'Galeria Principal',
      method: 'Acesso interno'
    }
  },
  {
    id: 2,
    type: 'FRAUDE',
    location: 'BANCO CENTRAL',
    time: '14:20',
    description: [
      'CASO #002 - FRAUDE BANCARIA',
      '',
      'Uma transferencia nao autorizada foi detectada no Banco Central.',
      'Logs do sistema indicam acesso suspeito aos servidores principais.',
      '',
      'Sua missao: identificar o responsavel, o local exato do crime e o metodo utilizado.',
      '',
      'Analise as pistas com cuidado. Cada detalhe importa.'
    ],
    suspects: ['Gerente', 'Cliente VIP', 'TI', 'Segurança'],
    locations: ['Cofre', 'Sala de Servidores', 'Caixa Eletrônico', 'Escritório'],
    methods: ['Transferência não autorizada', 'Hackeou sistema', 'Falsificou documento', 'Acesso privilegiado'],
    clues: [
      { text: '[HORARIO] Crime ocorreu as 14:20' },
      { text: '[LOG] Log de acesso suspeito detectado' },
      { text: '[EMAIL] Email de confirmacao enviado' },
      { text: '[SENHA] Senha administrativa usada' },
      { text: '[ALIBI] Gerente estava em reuniao' },
      { text: '[DISPOSITIVO] Dispositivo desconhecido conectado' }
    ],
    solution: {
      suspect: 'TI',
      location: 'Sala de Servidores',
      method: 'Hackeou sistema'
    }
  },
  {
    id: 3,
    type: 'DESAPARECIMENTO',
    location: 'PARQUE CENTRAL',
    time: '18:00',
    description: [
      'CASO #003 - DESAPARECIMENTO SUSPEITO',
      '',
      'Uma pessoa desapareceu no Parque Central durante o entardecer.',
      'Evidencias encontradas sugerem que nao foi um acidente.',
      '',
      'Sua missao: identificar o responsavel, o local exato do crime e o metodo utilizado.',
      '',
      'Analise as pistas com cuidado. Cada detalhe importa.'
    ],
    suspects: ['Amigo', 'Familiar', 'Estranho', 'Colega'],
    locations: ['Entrada Principal', 'Lago', 'Bosque', 'Estacionamento'],
    methods: ['Planejado', 'Acidental', 'Coerção', 'Fuga voluntária'],
    clues: [
      { text: '[HORARIO] Ultima vista as 18:00' },
      { text: '[EVIDENCIA] Celular encontrado no lago' },
      { text: '[PEGADAS] Pegadas na direcao do bosque' },
      { text: '[ALIBI] Familiar estava em casa' },
      { text: '[CHAMADA] Ultima chamada: Amigo' },
      { text: '[VEICULO] Carro ainda no estacionamento' }
    ],
    solution: {
      suspect: 'Amigo',
      location: 'Bosque',
      method: 'Planejado'
    }
  }
]

export function getDailyCrime() {
  const seed = getDailySeed()
  const crimeIndex = seed % CRIMES_DATABASE.length
  const baseCrime = CRIMES_DATABASE[crimeIndex]
  
  // Create unique crime ID based on date
  const today = new Date()
  const dateString = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  const crimeId = parseInt(dateString)
  
  return {
    ...baseCrime,
    id: crimeId,
    date: today.toLocaleDateString('pt-BR')
  }
}
