/* =========================================================
   PERGUNTAS.JS — regiões da Aeroplaca, falas e perguntas
   certa = índice da opção correta (começa em 0)
   ========================================================= */

const ZONAS = [
  {
    id: "cpu",
    nome: "Ilha do Processador",
    sigla: "CPU",
    cor: "aqua",
    falas: [
      ["aura", "Esta é a CPU, o cérebro da Aeroplaca. Ela vive num ciclo sem fim: buscar, decodificar e executar instruções."],
      ["aura", "A UC é a maestrina: lê cada instrução e diz quem faz o quê. A ULA é a calculadora: faz as contas e as comparações."],
      ["aura", "E os registradores? São gavetinhas dentro da própria CPU. Minúsculas, mas as mais rápidas de todas!"],
      ["glitch", "Gavetinhas, é? Vou bagunçar TODAS elas! HÉHÉHÉ!"],
      ["bit", "Nem vem, Glitch! Aura, pode mandar as perguntas!"],
    ],
    perguntas: [
      {
        texto: "Qual parte da CPU realiza somas, subtrações e comparações?",
        opcoes: ["UC", "ULA", "Cache", "DMA"],
        certa: 1,
        explica: "A ULA faz as operações aritméticas e lógicas. A UC só coordena quem faz o quê.",
      },
      {
        texto: "Quem busca a instrução, decodifica e avisa cada componente a hora de agir?",
        opcoes: ["ULA", "RAM", "UC", "Registradores"],
        certa: 2,
        explica: "A Unidade de Controle (UC) é a maestrina da CPU: interpreta as instruções e coordena tudo.",
      },
      {
        texto: "Onde a CPU guarda os valores que está usando NESTE instante, com o acesso mais rápido possível?",
        opcoes: ["Memória de massa", "Registradores", "ROM", "Flash"],
        certa: 1,
        explica: "Os registradores ficam dentro da CPU: são pouquíssimos bytes, mas os mais rápidos da hierarquia.",
      },
      {
        texto: "Qual é a ordem do ciclo de instrução da CPU?",
        opcoes: ["Executar → Buscar → Decodificar", "Decodificar → Executar → Buscar", "Buscar → Decodificar → Executar", "Buscar → Executar → Decodificar"],
        certa: 2,
        explica: "Primeiro a CPU busca a instrução na memória, depois decodifica (entende) e só então executa.",
      },
    ],
  },
  {
    id: "memorias",
    nome: "Lagoa das Memórias",
    sigla: "MEM",
    cor: "verde",
    falas: [
      ["aura", "Bem-vindo à Lagoa das Memórias, Bit! Aqui cada peixe guarda dados de um jeito diferente."],
      ["aura", "A RAM guarda o que está aberto agora, mas é volátil: desligou, apagou! Já a ROM vem gravada de fábrica."],
      ["aura", "EEPROM e Flash não apagam ao desligar e podem ser regravadas. A EEPROM regrava byte a byte; a Flash, em blocos: pendrive, SSD, cartão SD."],
      ["aura", "A cache fica coladinha na CPU com os dados mais usados. E a memória de massa (HD, SSD) guarda tudo, em grande volume, para sempre."],
      ["bit", "Então quanto mais perto da CPU, mais rápida... e menor a memória?"],
      ["aura", "Exatamente! Isso se chama hierarquia de memória. Vamos testar?"],
    ],
    perguntas: [
      {
        texto: "Você desligou o PC sem salvar e o trabalho sumiu. Ele estava em qual memória volátil?",
        opcoes: ["ROM", "Memória de massa", "RAM", "EEPROM"],
        certa: 2,
        explica: "A RAM é volátil: precisa de energia para manter os dados. Desligou, perdeu.",
      },
      {
        texto: "Qual memória já vem gravada de fábrica e normalmente não é alterada pelo usuário?",
        opcoes: ["ROM", "Cache", "RAM", "Registradores"],
        certa: 0,
        explica: "A ROM é gravada na fabricação e guarda, por exemplo, o programa de inicialização de um aparelho.",
      },
      {
        texto: "Pendrives, cartões SD e SSDs usam qual tecnologia regravável em blocos?",
        opcoes: ["EEPROM", "Flash", "ROM", "Cache"],
        certa: 1,
        explica: "A memória Flash é uma evolução da EEPROM que apaga e grava em blocos, por isso é rápida e barata.",
      },
      {
        texto: "Qual memória não volátil pode ser apagada e regravada byte a byte, muito usada para guardar configurações?",
        opcoes: ["EEPROM", "RAM", "Cache", "Memória de massa"],
        certa: 0,
        explica: "A EEPROM permite reescrever byte a byte por sinal elétrico, ótima para pequenas configurações.",
      },
      {
        texto: "Por que a cache existe?",
        opcoes: [
          "Para guardar arquivos para sempre",
          "Para manter perto da CPU os dados mais usados e evitar esperar a RAM",
          "Para substituir o HD",
          "Para ligar os periféricos à placa",
        ],
        certa: 1,
        explica: "A RAM é lenta perto da CPU. A cache guarda cópias do que é mais usado para a CPU não ficar esperando.",
      },
      {
        texto: "Qual sequência vai da memória MAIS RÁPIDA para a MAIS LENTA?",
        opcoes: [
          "RAM → Cache → Registradores → Memória de massa",
          "Memória de massa → RAM → Cache → Registradores",
          "Cache → Registradores → Memória de massa → RAM",
          "Registradores → Cache → RAM → Memória de massa",
        ],
        certa: 3,
        explica: "Hierarquia de memória: registradores, cache, RAM e memória de massa. Quanto mais rápida, menor e mais cara.",
      },
    ],
  },
  {
    id: "barramentos",
    nome: "Ponte dos Barramentos",
    sigla: "BUS",
    cor: "laranja",
    falas: [
      ["aura", "Barramentos são as estradas da placa! Pelo address bus, a CPU diz ONDE quer ler ou escrever na memória."],
      ["aura", "Pelo data bus viaja O QUE está sendo lido ou escrito. Ele vai e volta: é bidirecional."],
      ["aura", "E o DMA é um atalho: deixa um dispositivo copiar dados direto para a RAM, sem a CPU carregar byte por byte."],
      ["glitch", "Vou engarrafar TODAS essas estradas! Bzzzt!"],
      ["bit", "Com o DMA a gente passa direto! Manda ver, Aura!"],
    ],
    perguntas: [
      {
        texto: "Por qual barramento a CPU informa EM QUAL posição da memória quer ler ou escrever?",
        opcoes: ["Data bus", "Address bus", "DMA", "Cache"],
        certa: 1,
        explica: "O address bus (barramento de endereço) carrega o endereço, isto é, a posição na memória.",
      },
      {
        texto: "E por qual barramento viaja o conteúdo, o valor em si?",
        opcoes: ["Address bus", "Data bus", "ROM", "UC"],
        certa: 1,
        explica: "O data bus (barramento de dados) transporta o valor que está sendo lido ou escrito.",
      },
      {
        texto: "O address bus é unidirecional (sai da CPU). E o data bus?",
        opcoes: [
          "Também é unidirecional, só da CPU para a memória",
          "Bidirecional: os dados vão e voltam entre CPU e memória",
          "Só funciona quando o PC está desligado",
          "Não existe, os dados viajam pelo address bus",
        ],
        certa: 1,
        explica: "O data bus é bidirecional: a CPU tanto lê quanto escreve dados por ele.",
      },
      {
        texto: "Um HD precisa copiar um arquivo grande para a RAM. Que recurso faz isso sem ocupar a CPU?",
        opcoes: ["ULA", "DMA", "Registradores", "Quad core"],
        certa: 1,
        explica: "Com o DMA (acesso direto à memória), o dispositivo transfere os dados e a CPU fica livre para outras tarefas.",
      },
    ],
  },
  {
    id: "nucleos",
    nome: "Torre dos Núcleos",
    sigla: "CORE",
    cor: "roxo",
    falas: [
      ["aura", "Última região! Um processador pode ter vários núcleos, e cada núcleo executa instruções sozinho."],
      ["aura", "Dual core tem 2 núcleos; quad core tem 4. Mais núcleos = mais tarefas em paralelo de verdade."],
      ["aura", "Já o microcontrolador é um computador inteiro num chip só: CPU, memória e periféricos. Como o do Arduino!"],
      ["bit", "Um computador inteiro num chip?! Que demais!"],
      ["glitch", "Grrr... vocês estão aprendendo rápido demais!"],
    ],
    perguntas: [
      {
        texto: "Um processador com 4 núcleos independentes é chamado de:",
        opcoes: ["Dual core", "Quad core", "Microcontrolador", "Single core"],
        certa: 1,
        explica: "Quad = quatro. Um quad core tem 4 núcleos executando instruções ao mesmo tempo.",
      },
      {
        texto: "Qual a vantagem de um dual core sobre um processador de um núcleo só?",
        opcoes: [
          "Ter o dobro de RAM",
          "Não precisar de cache",
          "Executar duas tarefas realmente ao mesmo tempo",
          "Dispensar os barramentos",
        ],
        certa: 2,
        explica: "Com dois núcleos, duas sequências de instruções rodam em paralelo de verdade.",
      },
      {
        texto: "O chip do Arduino junta CPU, memória e entradas/saídas num lugar só. Ele é um:",
        opcoes: ["Microcontrolador", "Address bus", "Memória de massa", "Quad core"],
        certa: 0,
        explica: "O microcontrolador integra processador, memórias (RAM, Flash, EEPROM) e periféricos no mesmo chip.",
      },
      {
        texto: "Onde um microcontrolador costuma ser usado?",
        opcoes: [
          "Só em supercomputadores",
          "Em micro-ondas, controles remotos e projetos com Arduino",
          "Apenas como placa de vídeo",
          "Ele não é usado, é só teoria",
        ],
        certa: 1,
        explica: "Microcontroladores estão em eletrodomésticos, brinquedos, carros e projetos de automação.",
      },
    ],
  },
];

/* Falas da abertura, do Núcleo e do final */
const ROTEIRO = {
  abertura: [
    ["narrador", "Ano 2007. Num quarto qualquer, um velho PC zumbia baixinho em cima da escrivaninha..."],
    ["narrador", "Lá dentro, entre trilhas de cobre e bolhas de luz, existe um mundo inteiro: a Aeroplaca."],
    ["glitch", "HÉHÉHÉ! Embaralhei todas as Palavras-Chave do Núcleo de Cristal! Sem elas, este PC NUNCA mais liga!"],
    ["bit", "Ei! O Núcleo é o que mantém a Aeroplaca funcionando!"],
    ["aura", "Calma, Bit. Eu sou a Aura, guardiã do aquário de dados. Dá pra consertar isso!"],
    ["aura", "Vamos visitar as 4 regiões da placa. Em cada uma eu te explico tudo e depois faço umas perguntas."],
    ["aura", "Cada resposta certa vale uma Gota de Energia. No Núcleo, cada gota revela uma letra da cruzadinha."],
    ["bit", "Bora! Primeira parada: a Ilha do Processador!"],
  ],
  nucleo: [
    ["glitch", "Vocês chegaram longe... mas o Núcleo continua embaralhado! HÉHÉHÉ!"],
    ["aura", "Bit, agora é com você. Escreva as 16 Palavras-Chave na cruzadinha do Núcleo."],
    ["aura", "Use as gotas se travar. E aperte Conferir para ver quais palavras já estão certas!"],
    ["bit", "Deixa comigo!"],
  ],
  final: [
    ["narrador", "O Núcleo de Cristal brilhou num azul profundo, e as 16 Palavras-Chave voltaram aos seus lugares."],
    ["glitch", "N-não! Minhas palavras embaralhadas... estão... ORGANIZADAS?! Argh! Bzzzt..."],
    ["aura", "Você conseguiu, Bit! Agora cada termo está no lugar certo. E na sua cabeça também!"],
    ["bit", "Bora ligar esse PC!"],
    ["narrador", "Bzzzz... plim! O velho PC ligou de novo. A Aeroplaca está salva."],
  ],
};
