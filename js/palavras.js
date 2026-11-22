/* =========================================================
   PALAVRAS.JS — as 16 palavras do Núcleo, pistas e posições
   linha/coluna começam em 0 (canto de cima à esquerda)
   direcao: "H" = horizontal, "V" = vertical
   ========================================================= */

const TABULEIRO = { linhas: 16, colunas: 14 };

const PALAVRAS = [
  {
    resposta: "CPU",
    termo: "CPU",
    pista: "O cérebro do computador: busca, decodifica e executa as instruções.",
    linha: 11, coluna: 10, direcao: "V",
  },
  {
    resposta: "ULA",
    termo: "ULA",
    pista: "Parte do processador que faz as contas e as comparações.",
    linha: 11, coluna: 4, direcao: "H",
  },
  {
    resposta: "UC",
    termo: "UC (Unidade de Controle)",
    pista: "Maestrina do processador: interpreta cada ordem e coordena os outros componentes.",
    linha: 4, coluna: 9, direcao: "H",
  },
  {
    resposta: "REGISTRADORES",
    termo: "registradores",
    pista: "Minúsculos espaços dentro do processador, os mais rápidos de todos.",
    linha: 8, coluna: 0, direcao: "H",
  },
  {
    resposta: "RAM",
    termo: "RAM",
    pista: "Guarda os aplicativos abertos agora, mas perde tudo ao desligar.",
    linha: 0, coluna: 10, direcao: "V",
  },
  {
    resposta: "ROM",
    termo: "ROM",
    pista: "Vem gravada de fábrica e normalmente não pode ser alterada.",
    linha: 8, coluna: 0, direcao: "V",
  },
  {
    resposta: "EEPROM",
    termo: "EEPROM",
    pista: "Não volátil, regravável byte a byte; guarda pequenas configurações.",
    linha: 6, coluna: 1, direcao: "H",
  },
  {
    resposta: "FLASH",
    termo: "Flash",
    pista: "Tecnologia regravável em blocos usada em pendrives, cartões SD e SSDs.",
    linha: 5, coluna: 12, direcao: "V",
  },
  {
    resposta: "CACHE",
    termo: "cache",
    pista: "Pequena e rapidíssima, guarda perto da CPU o que é mais usado.",
    linha: 0, coluna: 13, direcao: "V",
  },
  {
    resposta: "MEMORIADEMASSA",
    termo: "memória de massa (armazenamento)",
    pista: "Guarda arquivos de forma permanente e em grande volume, como HD e SSD.",
    linha: 1, coluna: 0, direcao: "H",
  },
  {
    resposta: "DMA",
    termo: "DMA",
    pista: "Deixa um periférico copiar dados para a RAM sem ocupar a CPU.",
    linha: 11, coluna: 8, direcao: "V",
  },
  {
    resposta: "ADDRESSBUS",
    termo: "address bus (barramento de endereço)",
    pista: "Vias que indicam em qual posição da RAM a CPU vai ler ou escrever.",
    linha: 15, coluna: 2, direcao: "H",
  },
  {
    resposta: "DATABUS",
    termo: "data bus (barramento de dados)",
    pista: "Vias de mão dupla por onde o conteúdo viaja entre CPU e RAM.",
    linha: 13, coluna: 5, direcao: "H",
  },
  {
    resposta: "MICROCONTROLADOR",
    termo: "microcontrolador",
    pista: "Chip que junta processador, memória e periféricos; o coração do Arduino.",
    linha: 0, coluna: 5, direcao: "V",
  },
  {
    resposta: "DUALCORE",
    termo: "dual core",
    pista: "Processador com duas unidades de execução independentes no mesmo chip.",
    linha: 4, coluna: 0, direcao: "H",
  },
  {
    resposta: "QUADCORE",
    termo: "quad core",
    pista: "Processador com quatro unidades de execução trabalhando em paralelo.",
    linha: 3, coluna: 9, direcao: "V",
  },
];
