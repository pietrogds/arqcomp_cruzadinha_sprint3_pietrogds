/* =========================================================
   HISTORIA.JS — modo aventura
   - diálogos com efeito de máquina de escrever
   - mapa da Aeroplaca com as regiões
   - perguntas (quiz) que dão gotas de energia
   - final do jogo
   ========================================================= */

const Historia = (() => {
  const estado = App.estado;

  const PERSONAGENS = {
    bit:      { nome: "Bit",      sprite: "bit",    escala: 5 },
    aura:     { nome: "Aura",     sprite: "aura",   escala: 5 },
    glitch:   { nome: "Glitch",   sprite: "glitch", escala: 5 },
    narrador: { nome: "Narrador", sprite: null },
  };

  // termos de cada região (aparecem no resumo)
  const TERMOS_ZONA = {
    cpu: ["CPU", "ULA", "UC", "REGISTRADORES"],
    memorias: ["RAM", "ROM", "EEPROM", "FLASH", "CACHE", "MEMORIADEMASSA"],
    barramentos: ["ADDRESSBUS", "DATABUS", "DMA"],
    nucleos: ["MICROCONTROLADOR", "DUALCORE", "QUADCORE"],
  };

  /* =======================================================
     DIÁLOGO
     ======================================================= */
  let dialogo = null; // { falas, i, aoTerminar, digitando, timer }

  function montarCena() {
    const tela = App.garantirTela("tela-cena");
    tela.innerHTML = `
      <div class="cena-faixa vidro pixel" id="cena-faixa"></div>
      <div class="cena-palco" id="cena-palco"></div>
      <div class="caixa-dialogo vidro" id="caixa-dialogo" tabindex="0" aria-live="polite">
        <div class="dialogo-retrato" id="dialogo-retrato"></div>
        <div class="dialogo-conteudo">
          <span class="dialogo-nome pixel" id="dialogo-nome"></span>
          <p class="dialogo-texto" id="dialogo-texto"></p>
        </div>
        <span class="dialogo-seta" aria-hidden="true">▼</span>
        <button class="btn vidro-btn pequeno dialogo-pular" id="dialogo-pular">Pular ⏭</button>
      </div>`;

    const caixa = tela.querySelector("#caixa-dialogo");
    caixa.addEventListener("click", (e) => {
      if (e.target.closest("#dialogo-pular")) return;
      avancar();
    });
    tela.querySelector("#dialogo-pular").addEventListener("click", () => {
      Sfx.clique();
      terminarDialogo();
    });
    document.addEventListener("keydown", (e) => {
      if (document.body.dataset.tela !== "tela-cena" || !dialogo) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        avancar();
      }
    });
  }

  /** Mostra uma sequência de falas e chama aoTerminar no fim. */
  function falar(falas, aoTerminar, { faixa = "", cenario = "" } = {}) {
    App.irPara("tela-cena");
    const tela = document.getElementById("tela-cena");
    tela.dataset.cenario = cenario;

    const elFaixa = document.getElementById("cena-faixa");
    elFaixa.textContent = faixa;
    elFaixa.hidden = !faixa;

    // coloca no palco todo mundo que fala nessa cena
    const palco = document.getElementById("cena-palco");
    palco.innerHTML = "";
    // o Bit fica sempre à esquerda; os outros entram na ordem em que falam
    const presentes = [...new Set(["bit", ...falas.map((f) => f[0])])].filter((p) => PERSONAGENS[p].sprite);
    presentes.forEach((id) => {
      const lugar = document.createElement("div");
      lugar.className = "ator ator-" + id;
      lugar.dataset.ator = id;
      const bolha = document.createElement("div");
      bolha.className = "ator-bolha";
      bolha.appendChild(Pixel.criar(PERSONAGENS[id].sprite, id === "glitch" ? 7 : 6, { animar: true }));
      lugar.appendChild(bolha);
      palco.appendChild(lugar);
    });

    dialogo = { falas, i: 0, aoTerminar, digitando: false, timer: null };
    mostrarFala();
    document.getElementById("caixa-dialogo").focus({ preventScroll: true });
  }

  function mostrarFala() {
    const [quem, texto] = dialogo.falas[dialogo.i];
    const p = PERSONAGENS[quem];
    const caixa = document.getElementById("caixa-dialogo");
    caixa.dataset.quem = quem;

    document.getElementById("dialogo-nome").textContent = p.nome;
    const retrato = document.getElementById("dialogo-retrato");
    retrato.innerHTML = "";
    if (p.sprite) retrato.appendChild(Pixel.criar(p.sprite, 4, { animar: true }));

    document.querySelectorAll(".ator").forEach((a) => {
      a.classList.toggle("falando", a.dataset.ator === quem);
    });
    if (quem === "glitch") Sfx.glitch();

    // efeito máquina de escrever
    const el = document.getElementById("dialogo-texto");
    el.textContent = "";
    dialogo.digitando = true;
    let n = 0;
    clearInterval(dialogo.timer);
    dialogo.timer = setInterval(() => {
      n++;
      el.textContent = texto.slice(0, n);
      if (n % 3 === 0 && texto[n - 1] !== " ") Sfx.fala();
      if (n >= texto.length) {
        clearInterval(dialogo.timer);
        dialogo.digitando = false;
      }
    }, 24);
  }

  function avancar() {
    if (!dialogo) return;
    if (dialogo.digitando) {
      // completa o texto na hora
      clearInterval(dialogo.timer);
      dialogo.digitando = false;
      document.getElementById("dialogo-texto").textContent = dialogo.falas[dialogo.i][1];
      return;
    }
    Sfx.clique();
    dialogo.i++;
    if (dialogo.i >= dialogo.falas.length) terminarDialogo();
    else mostrarFala();
  }

  function terminarDialogo() {
    if (!dialogo) return;
    clearInterval(dialogo.timer);
    const fim = dialogo.aoTerminar;
    dialogo = null;
    if (fim) fim();
  }

  /* =======================================================
     MAPA
     ======================================================= */
  function zonaLiberada(indice) {
    return indice === 0 || !!(estado.zonas[ZONAS[indice - 1].id] || {}).feita;
  }

  function todasFeitas() {
    return ZONAS.every((z) => (estado.zonas[z.id] || {}).feita);
  }

  function montarMapa() {
    const tela = App.garantirTela("tela-mapa");
    tela.innerHTML = `
      <div class="mapa vidro">
        <div class="mapa-cabecalho">
          <div>
            <h2>Mapa da Aeroplaca</h2>
            <p>Visite as regiões em ordem, ganhe gotas e chegue ao Núcleo de Cristal.</p>
          </div>
          <div class="mapa-progresso pixel" id="mapa-progresso"></div>
        </div>
        <div class="mapa-campo" id="mapa-campo">
          <svg class="mapa-trilha" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M10 72 C 18 40, 24 30, 30 32 S 44 72, 50 70 S 64 30, 70 30 S 84 60, 90 64" />
          </svg>
        </div>
      </div>`;
  }

  function desenharMapa() {
    const campo = document.getElementById("mapa-campo");
    campo.querySelectorAll(".no-mapa").forEach((n) => n.remove());

    const pontos = [[10, 72], [30, 32], [50, 70], [70, 30], [90, 64]];
    let proximo = -1;

    const nos = ZONAS.map((z, i) => ({ zona: z, i }));
    nos.push({ zona: null, i: ZONAS.length });

    nos.forEach(({ zona, i }) => {
      const ehNucleo = !zona;
      const liberado = ehNucleo ? todasFeitas() : zonaLiberada(i);
      const info = zona ? estado.zonas[zona.id] || {} : {};
      const feito = ehNucleo ? estado.venceu : !!info.feita;
      if (liberado && !feito && proximo === -1) proximo = i;

      const no = document.createElement("button");
      no.className = "no-mapa";
      no.style.setProperty("--x", pontos[i][0] + "%");
      no.style.setProperty("--y", pontos[i][1] + "%");
      no.style.setProperty("--atraso", i * 0.08 + "s");
      no.dataset.cor = ehNucleo ? "cristal" : zona.cor;
      no.classList.toggle("bloqueado", !liberado);
      no.classList.toggle("feito", feito);

      const orbe = document.createElement("span");
      orbe.className = "orbe";
      if (!liberado) orbe.appendChild(Pixel.criar("cadeado", 4));
      else if (ehNucleo) orbe.appendChild(Pixel.criar(estado.venceu ? "cristal" : "cristalCorrompido", 5));
      else {
        const sigla = document.createElement("span");
        sigla.className = "pixel orbe-sigla";
        sigla.textContent = zona.sigla;
        orbe.appendChild(sigla);
      }
      if (feito) {
        const estrela = Pixel.criar("estrela", 3);
        estrela.classList.add("orbe-estrela");
        orbe.appendChild(estrela);
      }

      const nome = document.createElement("span");
      nome.className = "no-nome";
      nome.textContent = ehNucleo ? "Núcleo de Cristal" : zona.nome;

      const status = document.createElement("span");
      status.className = "no-status pixel";
      if (!liberado) status.textContent = "BLOQUEADO";
      else if (ehNucleo) status.textContent = feito ? "RESTAURADO" : "CRUZADINHA";
      else if (feito) status.textContent = `${info.acertadas.length}/${zona.perguntas.length} ✔`;
      else status.textContent = "NOVO!";

      no.append(orbe, nome, status);
      no.setAttribute("aria-label", nome.textContent + " — " + status.textContent);
      no.addEventListener("click", () => {
        if (!liberado) {
          Sfx.erro();
          no.classList.remove("nao");
          void no.offsetWidth;
          no.classList.add("nao");
          return App.toast(ehNucleo ? "Termine as 4 regiões para abrir o Núcleo!" : "Termine a região anterior primeiro!");
        }
        Sfx.clique();
        if (ehNucleo) entrarNucleo();
        else entrarZona(zona);
      });
      campo.appendChild(no);
    });

    // Bit fica em cima da próxima região
    campo.querySelectorAll(".bit-mapa").forEach((b) => b.remove());
    const alvo = proximo === -1 ? ZONAS.length : proximo;
    const bit = document.createElement("div");
    bit.className = "bit-mapa";
    bit.style.setProperty("--x", pontos[alvo][0] + "%");
    bit.style.setProperty("--y", pontos[alvo][1] + "%");
    bit.style.setProperty("--ordem", alvo);
    bit.appendChild(Pixel.criar("bit", 3, { animar: true }));
    campo.appendChild(bit);

    const feitas = ZONAS.filter((z) => (estado.zonas[z.id] || {}).feita).length;
    document.getElementById("mapa-progresso").textContent = `${feitas}/${ZONAS.length} REGIÕES`;
  }

  function abrirMapa() {
    desenharMapa();
    App.irPara("tela-mapa");
  }

  /* =======================================================
     QUIZ
     ======================================================= */
  let quiz = null; // { zona, i, acertosAgora }

  function entrarZona(zona) {
    falar(zona.falas, () => comecarQuiz(zona), { faixa: zona.nome.toUpperCase(), cenario: zona.id });
  }

  function comecarQuiz(zona) {
    if (!estado.zonas[zona.id]) estado.zonas[zona.id] = { feita: false, acertadas: [] };
    quiz = { zona, i: 0, acertosAgora: 0, gotasAgora: 0 };
    App.irPara("tela-quiz");
    mostrarPergunta();
  }

  function montarQuiz() {
    const tela = App.garantirTela("tela-quiz");
    tela.innerHTML = `
      <div class="quiz vidro">
        <div class="quiz-topo">
          <span class="quiz-zona pixel" id="quiz-zona"></span>
          <span class="quiz-contagem pixel" id="quiz-contagem"></span>
        </div>
        <div class="quiz-pontos" id="quiz-pontos"></div>
        <h2 class="quiz-pergunta" id="quiz-pergunta"></h2>
        <div class="quiz-opcoes" id="quiz-opcoes"></div>
        <div class="quiz-retorno" id="quiz-retorno" hidden>
          <div class="quiz-retorno-aura"></div>
          <div>
            <strong id="quiz-retorno-titulo"></strong>
            <p id="quiz-retorno-texto"></p>
          </div>
          <button class="btn verde" id="quiz-proxima">Próxima ➜</button>
        </div>
      </div>`;
    tela.querySelector(".quiz-retorno-aura").appendChild(Pixel.criar("aura", 4, { animar: true }));
    tela.querySelector("#quiz-proxima").addEventListener("click", proximaPergunta);
  }

  function mostrarPergunta() {
    const { zona, i } = quiz;
    const q = zona.perguntas[i];
    document.getElementById("quiz-zona").textContent = zona.nome.toUpperCase();
    document.getElementById("quiz-contagem").textContent = `${i + 1}/${zona.perguntas.length}`;
    document.getElementById("quiz-pergunta").textContent = q.texto;

    const pontos = document.getElementById("quiz-pontos");
    pontos.innerHTML = zona.perguntas.map((_, j) => `<span class="ponto ${j < i ? "ok" : ""} ${j === i ? "agora" : ""}"></span>`).join("");

    const opcoes = document.getElementById("quiz-opcoes");
    opcoes.innerHTML = "";
    q.opcoes.forEach((texto, j) => {
      const btn = document.createElement("button");
      btn.className = "opcao";
      btn.style.setProperty("--atraso", j * 0.06 + "s");
      btn.innerHTML = `<span class="opcao-letra pixel">${"ABCD"[j]}</span><span class="opcao-texto"></span>`;
      btn.querySelector(".opcao-texto").textContent = texto;
      btn.addEventListener("click", () => responder(j, btn));
      opcoes.appendChild(btn);
    });

    document.getElementById("quiz-retorno").hidden = true;
  }

  function responder(escolha, botao) {
    const { zona, i } = quiz;
    const q = zona.perguntas[i];
    const botoes = document.querySelectorAll("#quiz-opcoes .opcao");
    botoes.forEach((b) => (b.disabled = true));
    botoes[q.certa].classList.add("certa");

    const acertou = escolha === q.certa;
    const registro = estado.zonas[zona.id];
    let ganhou = false;
    if (acertou) {
      quiz.acertosAgora++;
      if (!registro.acertadas.includes(i)) {
        registro.acertadas.push(i);
        ganhou = true;
        quiz.gotasAgora++;
      }
    } else {
      botao.classList.add("errada");
    }
    App.salvar();

    const titulo = document.getElementById("quiz-retorno-titulo");
    if (acertou) {
      Sfx.acerto();
      titulo.textContent = ganhou ? "Acertou! +1 gota de energia 💧" : "Acertou! (essa gota você já tinha)";
      if (ganhou) {
        voarGota(botao);
        setTimeout(() => App.ganharGota(1), 650);
      }
    } else {
      Sfx.erro();
      titulo.textContent = "Quase! A resposta certa está em verde.";
    }
    document.getElementById("quiz-retorno-texto").textContent = q.explica;
    const retorno = document.getElementById("quiz-retorno");
    retorno.dataset.tipo = acertou ? "certo" : "errado";
    retorno.hidden = false;
    document.getElementById("quiz-proxima").textContent = i + 1 < zona.perguntas.length ? "Próxima ➜" : "Concluir região ★";
    document.getElementById("quiz-proxima").focus({ preventScroll: true });
    retorno.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /** Gotinha que voa do botão até o contador do HUD. */
  function voarGota(origem) {
    const r = origem.getBoundingClientRect();
    const destino = document.getElementById("hud-gotas").getBoundingClientRect();
    const gota = Pixel.criar("gota", 4);
    gota.classList.add("gota-voando");
    gota.style.left = r.left + r.width / 2 + "px";
    gota.style.top = r.top + r.height / 2 + "px";
    gota.style.setProperty("--dx", destino.left + 20 - (r.left + r.width / 2) + "px");
    gota.style.setProperty("--dy", destino.top + 10 - (r.top + r.height / 2) + "px");
    document.body.appendChild(gota);
    setTimeout(() => gota.remove(), 800);
  }

  function proximaPergunta() {
    Sfx.clique();
    quiz.i++;
    if (quiz.i < quiz.zona.perguntas.length) mostrarPergunta();
    else concluirZona();
  }

  function concluirZona() {
    const { zona, acertosAgora, gotasAgora } = quiz;
    estado.zonas[zona.id].feita = true;
    App.salvar();
    const termos = TERMOS_ZONA[zona.id]
      .map((r) => PALAVRAS.find((p) => p.resposta === r))
      .map((p) => `<span class="chip">${p.termo}</span>`)
      .join("");
    const total = zona.perguntas.length;
    const ultima = ZONAS.indexOf(zona) === ZONAS.length - 1;

    App.modal({
      titulo: `${zona.nome} concluída! ★`,
      html: `
        <p>Você acertou <b>${acertosAgora} de ${total}</b> perguntas${gotasAgora ? ` e ganhou <b>${gotasAgora} gota${gotasAgora > 1 ? "s" : ""}</b>` : ""}.</p>
        <p>Palavras-Chave recuperadas nesta região:</p>
        <div class="chips">${termos}</div>
        ${ultima ? "<p><b>O caminho até o Núcleo de Cristal está aberto!</b></p>" : ""}`,
      botoes: [
        { texto: "Refazer", classe: "vidro-btn", acao: () => comecarQuiz(zona) },
        { texto: "Voltar ao mapa", classe: "verde", acao: abrirMapa },
      ],
    });
    Sfx.vitoria();
  }

  /* =======================================================
     NÚCLEO E FINAL
     ======================================================= */
  function entrarNucleo() {
    falar(ROTEIRO.nucleo, () => App.modulos.cruzadinha.abrir(), { faixa: "NÚCLEO DE CRISTAL", cenario: "nucleo" });
  }

  function final() {
    falar(ROTEIRO.final, mostrarFinal, { faixa: "NÚCLEO RESTAURADO", cenario: "nucleo" });
  }

  function montarFinal() {
    const tela = App.garantirTela("tela-final");
    tela.innerHTML = `
      <div class="final vidro">
        <div class="final-cristal"></div>
        <h2>Aeroplaca salva!</h2>
        <p class="final-sub">O velho PC ligou de novo, e você dominou os termos de Arquitetura Computacional.</p>
        <div class="final-stats" id="final-stats"></div>
        <div class="final-botoes">
          <button class="btn vidro-btn" id="final-tabuleiro">Ver o tabuleiro</button>
          <button class="btn verde" id="final-novo">↺ Novo jogo</button>
        </div>
        <p class="final-creditos pixel">OBRIGADO POR JOGAR!</p>
      </div>`;
    tela.querySelector(".final-cristal").appendChild(Pixel.criar("cristal", 12));
    tela.querySelector("#final-tabuleiro").addEventListener("click", () => {
      Sfx.clique();
      App.modulos.cruzadinha.abrir();
    });
    tela.querySelector("#final-novo").addEventListener("click", () => {
      Sfx.clique();
      App.modal({
        titulo: "Começar um novo jogo?",
        html: "<p>Isso apaga o progresso, as gotas e o tabuleiro.</p>",
        botoes: [
          { texto: "Cancelar", classe: "vidro-btn" },
          { texto: "Novo jogo", classe: "vermelho", acao: () => { App.novoJogo(); location.reload(); } },
        ],
      });
    });
  }

  function mostrarFinal() {
    // "boot" do PC: clarão + acorde
    const flash = document.createElement("div");
    flash.className = "boot-flash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 1600);
    Sfx.ligar();

    const totalPerguntas = ZONAS.reduce((s, z) => s + z.perguntas.length, 0);
    const certas = ZONAS.reduce((s, z) => s + ((estado.zonas[z.id] || {}).acertadas || []).length, 0);
    document.getElementById("final-stats").innerHTML = `
      <div class="stat"><span class="pixel">16/16</span><small>palavras</small></div>
      <div class="stat"><span class="pixel">${certas}/${totalPerguntas}</span><small>perguntas certas</small></div>
      <div class="stat"><span class="pixel">${estado.gotasUsadas}</span><small>gotas usadas</small></div>`;

    App.irPara("tela-final");
    // chuva de bolhas comemorativa
    for (let i = 0; i < 26; i++) {
      setTimeout(() => {
        const b = document.createElement("div");
        b.className = "bolha festa";
        b.style.setProperty("--tam", 16 + Math.random() * 40 + "px");
        b.style.setProperty("--dur", 4 + Math.random() * 3 + "s");
        b.style.setProperty("--balanco", Math.random() * 160 - 80 + "px");
        b.style.left = Math.random() * 100 + "vw";
        b.addEventListener("animationend", () => b.remove());
        document.getElementById("bolhas").appendChild(b);
      }, i * 90);
    }
  }

  /* =======================================================
     API
     ======================================================= */
  function abrir() {
    if (!estado.introVista) {
      falar(ROTEIRO.abertura, () => {
        estado.introVista = true;
        App.salvar();
        App.atualizarHud();
        abrirMapa();
      }, { faixa: "PRÓLOGO", cenario: "abertura" });
    } else {
      abrirMapa();
    }
  }

  function iniciar() {
    montarCena();
    montarMapa();
    montarQuiz();
    montarFinal();

    // botão "Mapa" no HUD (aparece depois do prólogo)
    const btnMapa = document.createElement("button");
    btnMapa.id = "btn-mapa";
    btnMapa.className = "btn vidro-btn pequeno";
    btnMapa.textContent = "🗺 Mapa";
    btnMapa.hidden = true;
    btnMapa.addEventListener("click", () => {
      Sfx.clique();
      abrirMapa();
    });
    document.querySelector(".hud-esquerda").appendChild(btnMapa);
    document.addEventListener("trocou-tela", (e) => {
      const fora = ["tela-titulo", "tela-mapa", "tela-cena"].includes(e.detail);
      btnMapa.hidden = fora || !estado.introVista;
    });
  }

  return { iniciar, abrir, abrirMapa, final };
})();

App.registrar("historia", Historia);
