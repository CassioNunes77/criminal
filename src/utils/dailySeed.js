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
    suspects: ['Funcionário', 'Visitante', 'Segurança', 'Curador'],
    locations: ['Galeria Principal', 'Depósito', 'Sala de Exposição', 'Escritório'],
    methods: ['Forçou a fechadura', 'Usou chave falsa', 'Desativou alarme', 'Acesso interno'],
    clues: [
      { emoji: '⏰', text: 'Horário do crime: 22:40' },
      { emoji: '📍', text: 'Local exato: Galeria Principal' },
      { emoji: '🎥', text: 'Câmera desativada às 22:35' },
      { emoji: '🧤', text: 'Luva encontrada no local' },
      { emoji: '🧾', text: 'Álibi verificado: Visitante estava em casa' },
      { emoji: '🔑', text: 'Chave mestra acessada às 22:38' }
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
    suspects: ['Gerente', 'Cliente VIP', 'TI', 'Segurança'],
    locations: ['Cofre', 'Sala de Servidores', 'Caixa Eletrônico', 'Escritório'],
    methods: ['Transferência não autorizada', 'Hackeou sistema', 'Falsificou documento', 'Acesso privilegiado'],
    clues: [
      { emoji: '⏰', text: 'Horário: 14:20' },
      { emoji: '💻', text: 'Log de acesso suspeito' },
      { emoji: '📧', text: 'Email de confirmação enviado' },
      { emoji: '🔐', text: 'Senha administrativa usada' },
      { emoji: '🧾', text: 'Álibi: Gerente estava em reunião' },
      { emoji: '📱', text: 'Dispositivo desconhecido conectado' }
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
    suspects: ['Amigo', 'Familiar', 'Estranho', 'Colega'],
    locations: ['Entrada Principal', 'Lago', 'Bosque', 'Estacionamento'],
    methods: ['Planejado', 'Acidental', 'Coerção', 'Fuga voluntária'],
    clues: [
      { emoji: '⏰', text: 'Última vista: 18:00' },
      { emoji: '📱', text: 'Celular encontrado no lago' },
      { emoji: '👟', text: 'Pegadas na direção do bosque' },
      { emoji: '🧾', text: 'Álibi: Familiar estava em casa' },
      { emoji: '📞', text: 'Última chamada: Amigo' },
      { emoji: '🚗', text: 'Carro ainda no estacionamento' }
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
