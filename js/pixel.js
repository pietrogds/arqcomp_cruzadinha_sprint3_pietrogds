/* =========================================================
   PIXEL.JS — desenha os personagens em pixel art num <canvas>
   Cada sprite é uma lista de linhas; cada letra é uma cor.
   "." = transparente
   ========================================================= */

const Pixel = (() => {
  const SPRITES = {
    // Bit: a gotinha-robô protagonista
    bit: {
      cores: { k: "#0b3b66", b: "#3ec8ff", d: "#1a8fd6", w: "#ffffff", y: "#ffe14d", p: "#ff8fb8" },
      quadros: [
        [
          ".......y.......",
          ".......k.......",
          "......kdk......",
          ".....kbbbk.....",
          "....kbwbbbk....",
          "...kbwbbbbbk...",
          "..kbwbbbbbbbk..",
          "..kbbbbbbbbbk..",
          ".kbbbkbbbkbbbk.",
          ".kbbbkbbbkbbbk.",
          ".kbpbbbbbbbpbk.",
          ".kbbbbkkkbbbbk.",
          "..kbbbbbbbbbk..",
          "...kkdddddkk...",
          ".....kkkkk.....",
        ],
        [
          ".......y.......",
          ".......k.......",
          "......kdk......",
          ".....kbbbk.....",
          "....kbwbbbk....",
          "...kbwbbbbbk...",
          "..kbwbbbbbbbk..",
          "..kbbbbbbbbbk..",
          ".kbbbbbbbbbbbk.",
          ".kbbbkbbbkbbbk.",
          ".kbpbbbbbbbpbk.",
          ".kbbbbkkkbbbbk.",
          "..kbbbbbbbbbk..",
          "...kkdddddkk...",
          ".....kkkkk.....",
        ],
      ],
    },

    // Aura: a peixinha-guia do aquário de dados
    aura: {
      cores: { o: "#ff9a3c", y: "#ffd07a", w: "#ffffff", k: "#3a1a00", r: "#e8642a" },
      quadros: [
        [
          ".....ooo.......",
          "...oooooo...rr.",
          "..oowooooo.rrr.",
          ".oowkoooooorr..",
          "ooooooooooorr..",
          ".oyoooooooorr..",
          "..oyyooooo.rrr.",
          "...oooooo...rr.",
          ".....ooo.......",
        ],
        [
          ".....ooo.......",
          "...oooooo......",
          "..oowooooo..rr.",
          ".oowkooooooorr.",
          "ooooooooooorr..",
          ".oyoooooooooorr",
          "..oyyooooo..rr.",
          "...oooooo......",
          ".....ooo.......",
        ],
      ],
    },

    // Glitch: o vilão que embaralhou as palavras
    glitch: {
      cores: { m: "#b04bff", n: "#7a1fd1", w: "#ffffff", k: "#1b0033" },
      quadros: [
        [
          "..m...m...m..",
          ".mmm.mmm.mmm.",
          "mmmmmmmmmmmmm",
          "mmwwmmmmmwwmm",
          "mmwkmmmmmwkmm",
          "mmmmmmmmmmmmm",
          "mmkmkmkmkmkmm",
          "mmmkmkmkmkmmm",
          "mnmmmmmmmmmnm",
          ".mn.mmmmm.nm.",
          "m..m.m.m.m..m",
        ],
        [
          ".m...m...m...",
          "mmm.mmm.mmm..",
          "mmmmmmmmmmmmm",
          "mmkwmmmmmkwmm",
          "mmwwmmmmmwwmm",
          "mmmmmmmmmmmmm",
          "mmmkmkmkmkmmm",
          "mmkmkmkmkmkmm",
          "mnmmmmmmmmmnm",
          ".nm.mmmmm.mn.",
          ".m..m.m.m..m.",
        ],
      ],
    },

    // Gota de energia (moeda do jogo)
    gota: {
      cores: { k: "#0b3b66", b: "#4fd8ff", d: "#1590d8", w: "#ffffff" },
      quadros: [
        [
          "...k...",
          "..kbk..",
          ".kwbbk.",
          ".kwbbk.",
          "kwbbbdk",
          "kbbbbdk",
          "kbbbddk",
          ".kbddk.",
          "..kkk..",
        ],
      ],
    },

    // Núcleo de Cristal
    cristal: {
      cores: { w: "#ffffff", c: "#6fe3ff", d: "#1d9be0" },
      quadros: [
        [
          ".....w.....",
          "....wcc....",
          "...wcccc...",
          "..wccccdd..",
          ".wcccccddd.",
          "wccccccdddd",
          ".cccccdddd.",
          "..cccdddd..",
          "...ccddd...",
          "....cdd....",
          ".....d.....",
        ],
      ],
    },

    // Núcleo corrompido pelo Glitch
    cristalCorrompido: {
      cores: { w: "#f3d6ff", c: "#b56bff", d: "#6a1fb8" },
      quadros: [
        [
          ".....w.....",
          "....wcc....",
          "...wcdcc...",
          "..wccccdd..",
          ".wccdccddd.",
          "wcccccdcddd",
          ".ccdccdddd.",
          "..cccdcdd..",
          "...ccddd...",
          "....cdd....",
          ".....d.....",
        ],
      ],
    },

    // Cadeado (regiões bloqueadas no mapa)
    cadeado: {
      cores: { k: "#2b4a66", g: "#c9d9e6", y: "#ffd34d", d: "#c99a1a" },
      quadros: [
        [
          "..kkkkk..",
          ".kg...gk.",
          ".kg...gk.",
          "kkkkkkkkk",
          "kyyyyyyyk",
          "kyyykyyyk",
          "kyyykyydk",
          "kdyyyyddk",
          "kkkkkkkkk",
        ],
      ],
    },

    // Estrela (regiões concluídas)
    estrela: {
      cores: { k: "#8a5a00", y: "#ffe14d", w: "#fffbe0", o: "#ffb400" },
      quadros: [
        [
          "....k....",
          "...kyk...",
          "...kwk...",
          "kkkkyykkk",
          "kywyyyyok",
          ".kyyyyok.",
          "..kyyyk..",
          ".kyokoyk.",
          "kook.kook",
        ],
      ],
    },
  };

  /** Desenha um quadro do sprite dentro do canvas. */
  function desenhar(canvas, nome, quadro = 0) {
    const sprite = SPRITES[nome];
    if (!sprite) return;
    const linhas = sprite.quadros[quadro % sprite.quadros.length];
    const escala = Number(canvas.dataset.escala) || 4;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    linhas.forEach((linha, y) => {
      [...linha].forEach((letra, x) => {
        const cor = sprite.cores[letra];
        if (!cor) return;
        ctx.fillStyle = cor;
        ctx.fillRect(x * escala, y * escala, escala, escala);
      });
    });
  }

  /**
   * Cria um <canvas> com o sprite.
   * opcoes.animar = true troca os quadros sozinho (piscar, nadar...)
   */
  function criar(nome, escala = 4, opcoes = {}) {
    const sprite = SPRITES[nome];
    const canvas = document.createElement("canvas");
    canvas.className = "sprite sprite-" + nome;
    if (!sprite) return canvas;

    const larg = sprite.quadros[0][0].length;
    const alt = sprite.quadros[0].length;
    canvas.width = larg * escala;
    canvas.height = alt * escala;
    canvas.dataset.escala = escala;
    canvas.setAttribute("aria-hidden", "true");
    desenhar(canvas, nome, 0);

    if (opcoes.animar && sprite.quadros.length > 1) {
      animar(canvas, nome);
    }
    return canvas;
  }

  // O Bit pisca de vez em quando; os outros alternam quadros direto.
  function animar(canvas, nome) {
    if (nome === "bit") {
      const piscar = () => {
        if (!canvas.isConnected) return;
        desenhar(canvas, nome, 1);
        setTimeout(() => desenhar(canvas, nome, 0), 140);
        setTimeout(piscar, 2200 + Math.random() * 2600);
      };
      setTimeout(piscar, 1200);
    } else {
      let q = 0;
      const timer = setInterval(() => {
        if (!canvas.isConnected) { clearInterval(timer); return; }
        q++;
        desenhar(canvas, nome, q);
      }, nome === "glitch" ? 260 : 420);
    }
  }

  return { criar, desenhar, SPRITES };
})();
