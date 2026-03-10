/**
 * 5 casos criminais para Nexo Terminal (#0001 a #0005)
 * Seguem 100% a lógica do game.
 *
 * #0001 - Furto de fitas raras em videolocadora (caso especial - primeiro)
 * #0002 a #0005 - Outros crimes leves da década de 80
 *
 * Evidências: 1 física, 1 comportamental, 1 temporal.
 * Suspeitos: nome + cargo + histórico + característica (correlacionada a pistas/testemunhas).
 * Mínimo 3 suspeitos citados na descrição, pistas ou depoimentos.
 */

export const CASES_001_TO_005 = [
  {
    caseNumber: '0001',
    caseCode: 'NX7K2M9P',
    type: 'FURTO',
    location: 'VIDEOLOCADORA',
    time: '21:00',
    description: [
      'CASO #0001 - FURTO DE FITAS RARAS EM VIDEOLOCADORA',
      '',
      'Uma videolocadora foi furtada durante o horário de funcionamento. Fitas raras da seção de colecionadores foram levadas. O culpado conhecia o layout e foi direto ao local. Um ex-funcionário de cabelos longos foi visto no estabelecimento. Ricardo, entregador de fitas, passou pela loja antes do crime. Claudia, cliente colecionadora, estava na área de novidades.',
      '',
      'Sua missão: identificar o responsável, o local exato do crime e o método utilizado.',
      '',
      'Analise as pistas e testemunhas com cuidado. Algumas informações podem ser falsas.'
    ],
    suspects: [
      { name: 'Bruno Costa, ex-funcionário da videolocadora', criminalRecord: 'Passagem por furto em 1983', caracteristica: 'Cabelos longos até os ombros' },
      { name: 'Claudia Mendes, cliente colecionadora', criminalRecord: 'Sem antecedentes', caracteristica: 'Usa óculos de aro grosso' },
      { name: 'Ricardo Farias, entregador de fitas', criminalRecord: 'Passagem por furto em 1982', caracteristica: 'Costuma usar jaqueta de couro' },
      { name: 'Tereza Santos, vizinha do dono', criminalRecord: 'Sem antecedentes', caracteristica: 'Usa brincos grandes dourados' }
    ],
    locations: ['Seção de Colecionadores', 'Balcão de Atendimento', 'Entrada', 'Depósito de Fitas'],
    methods: ['Aproveitou descuido', 'Distração', 'Ajuda de cúmplice', 'Chave dos fundos'],
    clues: [
      { type: 'HORARIO', text: 'Crime ocorreu por volta das 21:00' },
      { type: 'LOCAL', text: 'Local exato: Seção de Colecionadores' },
      { type: 'ACESSO', text: 'Conhecia o layout da loja, foi direto à seção de raros' },
      { type: 'ALIBI', text: 'Bruno Costa estava em casa (confirmado pela irmã)' },
      { type: 'COMPORTAMENTO', text: 'Suspeito foi direto à seção de fitas raras, sem hesitar' },
      { type: 'EVIDENCIA', text: 'Fio de cabelo longo encontrado na prateleira de raros' }
    ],
    witnesses: [
      { name: 'Marcos, cliente da locadora', statement: 'Vi um homem de cabelo longo na seção de raros às 20:55. Parecia conhecer o lugar.', isTruthful: true },
      { name: 'Helena, irmã do ex-funcionário', statement: 'Bruno estava em casa comigo a noite toda. Assistimos TV até tarde.', isTruthful: false },
      { name: 'Oswaldo, dono da videolocadora', statement: 'A seção de colecionadores fica no fundo. Só quem conhece vai direto. Bruno trabalhava aqui e sabia onde ficavam as fitas raras.', isTruthful: true }
    ],
    solution: { suspect: 'Bruno Costa, ex-funcionário da videolocadora', location: 'Seção de Colecionadores', method: 'Aproveitou descuido' },
    dossier: `CASO #0001 - FURTO DE FITAS RARAS EM VIDEOLOCADORA

SOLUÇÃO: Bruno Costa (ex-funcionário) + Seção de Colecionadores + Aproveitou descuido

PROVA DO CULPADO:
- Evidência física: Fio de cabelo longo na prateleira (Bruno tem cabelos longos até os ombros).
- Evidência comportamental: Suspeito foi direto à seção de raros sem hesitar (só ex-funcionário conhecia o layout).
- Evidência temporal: Helena (irmã) mentiu no álibi; Marcos viu homem de cabelo longo às 20:55.
- Oswaldo confirmou: Bruno trabalhava na loja e sabia onde ficavam as fitas raras.

POR QUE OS OUTROS NÃO SÃO:
- Claudia: Estava na área de novidades; óculos de aro grosso não conectam às pistas; sem evidência física.
- Ricardo: Usa jaqueta de couro, não cabelo longo; evidência física aponta para cabelo longo.
- Tereza: Brincos grandes não aparecem em nenhuma pista; não tinha conhecimento do layout interno.`
  },
  {
    caseNumber: '0002',
    caseCode: 'NX8L3N1Q',
    type: 'FURTO',
    location: 'VIDEOLOCADORA',
    time: '20:30',
    description: [
      'CASO #0002 - FURTO EM VIDEOLOCADORA',
      '',
      'Uma videolocadora foi furtada durante o horário de funcionamento. Fitas e dinheiro do caixa foram levados. O caixa estava aberto no momento. Paulo, cliente habitual que usa boné, foi visto próximo ao balcão.',
      '',
      'Sua missão: identificar o responsável, o local exato do crime e o método utilizado.',
      '',
      'Analise as pistas e testemunhas com cuidado. Algumas informações podem ser falsas.'
    ],
    suspects: [
      { name: 'Paulo Mendes, cliente habitual', criminalRecord: 'Passagem por furto em 1983', caracteristica: 'Anda sempre de boné' },
      { name: 'Fernanda Lima, funcionária do caixa', criminalRecord: 'Sem antecedentes', caracteristica: 'Cabelos curtos pintados de ruivo' },
      { name: 'Ricardo Souza, entregador de fitas', criminalRecord: 'Passagem por furto em 1981 e 1985', caracteristica: 'Costuma usar jaqueta de couro' },
      { name: 'Juliana Alves, moradora do bairro', criminalRecord: 'Sem antecedentes', caracteristica: 'Usa brincos grandes dourados' }
    ],
    locations: ['Caixa Registradora', 'Estante de Fitas', 'Banheiro', 'Entrada'],
    methods: ['Distração', 'Aproveitou descuido', 'Ajuda de cúmplice', 'Força'],
    clues: [
      { type: 'HORARIO', text: 'Crime ocorreu às 20:30' },
      { type: 'LOCAL', text: 'Local exato: Caixa Registradora' },
      { type: 'ACESSO', text: 'Caixa estava aberto, sem sinais de arrombamento' },
      { type: 'ALIBI', text: 'Paulo Mendes estava em casa (confirmado por mãe)', revealed: false },
      { type: 'COMPORTAMENTO', text: 'Suspeito usou boné e óculos escuros' },
      { type: 'EVIDENCIA', text: 'Impressão digital encontrada no caixa' }
    ],
    witnesses: [
      { name: 'Marcos, cliente da loja', statement: 'Vi um homem de boné mexendo no caixa às 20:25. Parecia nervoso. O Paulo usa aquele boné.', isTruthful: true },
      { name: 'Sandra, funcionária da locadora', statement: 'Paulo estava comprando pipoca às 20:30. Vi ele saindo.', isTruthful: false },
      { name: 'Antonio, dono do estabelecimento', statement: 'O caixa estava fechado quando saí às 20:20. Fernanda ficou sozinha. Ricardo passou antes.', isTruthful: true }
    ],
    solution: { suspect: 'Paulo Mendes, cliente habitual', location: 'Caixa Registradora', method: 'Distração' },
    dossier: 'CASO #0002 - FURTO EM VIDEOLOCADORA. Paulo Mendes (cliente, característica: boné) furtou na Caixa Registradora às 20:30 com Distração. Marcos viu homem de boné. Sandra mentiu. Antonio confirmou. Solução: Paulo Mendes + Caixa Registradora + Distração.'
  },
  {
    caseNumber: '0003',
    caseCode: 'NX9M4P2R',
    type: 'FURTO',
    location: 'LANCHONETE',
    time: '14:30',
    description: [
      'CASO #0003 - FURTO EM LANCHONETE',
      '',
      'O caixa de uma lanchonete foi furtado durante o almoço. O dinheiro do cofre foi levado. A fechadura intacta indica chave. Bruno, ex-garçom de cabelos longos, frequentava o local e conhecia o sistema.',
      '',
      'Sua missão: identificar o responsável, o local exato do crime e o método utilizado.',
      '',
      'Analise as pistas e testemunhas com cuidado. Algumas informações podem ser falsas.'
    ],
    suspects: [
      { name: 'Bruno Ferreira, ex-garçom da lanchonete', criminalRecord: 'Passagem por furto em 1983', caracteristica: 'Cabelos longos até os ombros' },
      { name: 'Camila Rocha, cozinheira', criminalRecord: 'Sem antecedentes', caracteristica: 'Sempre de avental branco' },
      { name: 'Diego Martins, fornecedor', criminalRecord: 'Passagem por furto em 1982', caracteristica: 'Barba por fazer' },
      { name: 'Elena Campos, cliente fixa', criminalRecord: 'Sem antecedentes', caracteristica: 'Usa lenço no cabelo' }
    ],
    locations: ['Caixa', 'Cozinha', 'Área de Estoque', 'Banheiro'],
    methods: ['Chave falsa', 'Aproveitou descuido', 'Ajuda de cúmplice', 'Janela dos fundos'],
    clues: [
      { type: 'HORARIO', text: 'Crime ocorreu às 14:30' },
      { type: 'LOCAL', text: 'Local exato: Caixa' },
      { type: 'ACESSO', text: 'Fechadura do caixa intacta, sem sinais de força' },
      { type: 'ALIBI', text: 'Bruno estava no almoço (confirmado por vizinho)', revealed: false },
      { type: 'COMPORTAMENTO', text: 'Suspeito deixou fio de cabelo longo no cofre' },
      { type: 'EVIDENCIA', text: 'Pegadas de chinelo no local' }
    ],
    witnesses: [
      { name: 'Roberto, garçom da lanchonete', statement: 'Vi uma pessoa de cabelo longo saindo pela cozinha com saco às 14:35. Era o Bruno.', isTruthful: true },
      { name: 'Sonia, cozinheira do turno', statement: 'Bruno estava no almoço comigo às 14:30. Não saiu da mesa.', isTruthful: false },
      { name: 'Gilberto, gerente do estabelecimento', statement: 'O caixa estava fechado quando saí às 14:25. Bruno trabalhava aqui e conhecia a chave.', isTruthful: true }
    ],
    solution: { suspect: 'Bruno Ferreira, ex-garçom da lanchonete', location: 'Caixa', method: 'Chave falsa' },
    dossier: 'CASO #0003 - FURTO EM LANCHONETE. Bruno Ferreira (ex-garçom, cabelos longos) furtou no Caixa às 14:30 com Chave falsa. Roberto viu pessoa de cabelo longo. Fio de cabelo longo no cofre. Sonia mentiu. Solução: Bruno Ferreira + Caixa + Chave falsa.'
  },
  {
    caseNumber: '0004',
    caseCode: 'NX1N5Q3S',
    type: 'ROUBO',
    location: 'JOALHERIA',
    time: '19:00',
    description: [
      'CASO #0004 - ROUBO EM JOALHERIA',
      '',
      'Uma joalheria foi arrombada após o fechamento. Relógios e anéis foram levados. A vitrine principal foi quebrada. André, ex-empregado da obra vizinha, usava jaqueta azul e conhecia o local.',
      '',
      'Sua missão: identificar o responsável, o local exato do crime e o método utilizado.',
      '',
      'Analise as pistas e testemunhas com cuidado. Algumas informações podem ser falsas.'
    ],
    suspects: [
      { name: 'André Ribeiro, ex-empregado da obra vizinha', criminalRecord: 'Passagem por roubo em 1983', caracteristica: 'Costuma usar jaqueta azul' },
      { name: 'Cristina Almeida, vendedora da joalheria', criminalRecord: 'Sem antecedentes', caracteristica: 'Unhas sempre pintadas de vermelho' },
      { name: 'Rodrigo Lima, entregador de joias', criminalRecord: 'Passagem por furto em 1985', caracteristica: 'Tem tatuagem no braço' },
      { name: 'Tatiana Oliveira, cliente da loja', criminalRecord: 'Sem antecedentes', caracteristica: 'Usa perfume forte' }
    ],
    locations: ['Vitrine Principal', 'Cofre', 'Entrada', 'Sala dos Fundos'],
    methods: ['Martelo na vitrine', 'Chave falsa', 'Soco no vidro', 'Ajuda interna'],
    clues: [
      { type: 'HORARIO', text: 'Crime ocorreu às 19:00' },
      { type: 'LOCAL', text: 'Local exato: Vitrine Principal' },
      { type: 'ACESSO', text: 'Vidro quebrado com marcas de martelo' },
      { type: 'ALIBI', text: 'André estava no bar (confirmado por amigo)', revealed: false },
      { type: 'COMPORTAMENTO', text: 'Suspeito deixou fiapos de tecido azul no vidro' },
      { type: 'EVIDENCIA', text: 'Pedaço de jaqueta azul encontrado no local' }
    ],
    witnesses: [
      { name: 'Wilson, porteiro do prédio', statement: 'Vi um homem forte de jaqueta azul correndo às 19:05. Saiu pela vitrine. André da obra usa aquela jaqueta.', isTruthful: true },
      { name: 'Helena, amiga do acusado', statement: 'André estava no bar comigo às 19:00. Não saiu.', isTruthful: false },
      { name: 'Oswaldo, dono da joalheria', statement: 'Fechei às 18:55. Vitrine intacta. André trabalhava na obra ao lado.', isTruthful: true }
    ],
    solution: { suspect: 'André Ribeiro, ex-empregado da obra vizinha', location: 'Vitrine Principal', method: 'Martelo na vitrine' },
    dossier: 'CASO #0004 - ROUBO EM JOALHERIA. André Ribeiro (ex-empregado, jaqueta azul) roubou na Vitrine Principal às 19:00 com Martelo na vitrine. Wilson viu homem de jaqueta azul. Tecido azul no local. Helena mentiu. Solução: André Ribeiro + Vitrine Principal + Martelo na vitrine.'
  },
  {
    caseNumber: '0005',
    caseCode: 'NX2P6R4T',
    type: 'APROPRIAÇÃO INDÉBITA',
    location: 'ESCRITÓRIO DE CONTABILIDADE',
    time: '17:45',
    description: [
      'CASO #0005 - APROPRIAÇÃO INDÉBITA EM ESCRITÓRIO',
      '',
      'Valores sumiram do cofre do escritório. O cofre na sala do cofre foi aberto com a combinação. Oscar, contador que usa óculos de grau, era um dos dois com acesso.',
      '',
      'Sua missão: identificar o responsável, o local exato do crime e o método utilizado.',
      '',
      'Analise as pistas e testemunhas com cuidado. Algumas informações podem ser falsas.'
    ],
    suspects: [
      { name: 'Oscar Teixeira, contador do escritório', criminalRecord: 'Passagem por apropriação em 1981', caracteristica: 'Usa óculos de grau escuros' },
      { name: 'Priscila Rocha, secretária', criminalRecord: 'Sem antecedentes', caracteristica: 'Cabelo cacheado' },
      { name: 'Quirino Alves, office-boy', criminalRecord: 'Passagem por furto em 1983', caracteristica: 'Sempre de tênis branco' },
      { name: 'Rita Souza, recepcionista', criminalRecord: 'Sem antecedentes', caracteristica: 'Usa pulseira de prata' }
    ],
    locations: ['Sala do Cofre', 'Recepção', 'Sala de Reuniões', 'Copa'],
    methods: ['Conhecia a combinação', 'Observou digitação', 'Chave do cofre', 'Forçou a fechadura'],
    clues: [
      { type: 'HORARIO', text: 'Crime ocorreu às 17:45' },
      { type: 'LOCAL', text: 'Local exato: Sala do Cofre' },
      { type: 'ACESSO', text: 'Cofre aberto sem sinais de violência' },
      { type: 'ALIBI', text: 'Oscar já tinha ido embora (confirmado por porteiro)', revealed: false },
      { type: 'COMPORTAMENTO', text: 'Suspeito deixou marca de óculos na mesa' },
      { type: 'EVIDENCIA', text: 'Log do cofre registra abertura às 17:45' }
    ],
    witnesses: [
      { name: 'Sergio, contador sócio', statement: 'Vi Oscar na sala do cofre às 17:44. Usava os óculos escuros. Disse que ia buscar documentos.', isTruthful: true },
      { name: 'Teresa, secretária do andar', statement: 'Oscar saiu às 17:30. Vi ele no elevador.', isTruthful: false },
      { name: 'Ulisses, sócio do escritório', statement: 'O cofre é aberto só por mim e pelo Oscar. Combinação compartilhada. Oscar usa aqueles óculos.', isTruthful: true }
    ],
    solution: { suspect: 'Oscar Teixeira, contador do escritório', location: 'Sala do Cofre', method: 'Conhecia a combinação' },
    dossier: 'CASO #0005 - APROPRIAÇÃO INDÉBITA. Oscar Teixeira (contador, óculos escuros) apropriou na Sala do Cofre às 17:45 Conhecendo a combinação. Sergio e Ulisses confirmaram. Marca de óculos na mesa. Teresa mentiu. Solução: Oscar Teixeira + Sala do Cofre + Conhecia a combinação.'
  }
]
