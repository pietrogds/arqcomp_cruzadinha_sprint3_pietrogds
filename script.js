/* =========================================================
   SCRIPT.JS — núcleo do jogo
   - troca de telas
   - bolhas e peixinho do cenário
   - toast, modal e salvamento (localStorage)
   - registro dos módulos (história, cruzadinha...)
   ========================================================= */

"use strict";

const App = (() => {
  const CHAVE_SAVE = "bit-nucleo-cristal-v1";
  const modulos = {};

  /* ---------- estado salvo ---------- */
  function estadoPadrao() {
    return {
      som: true,
      gotas: 0,
      gotasUsadas: 0,
      zonas: {},        // { cpu: { feita: true, acertos: 3, total: 4 } }
      introVista: false,
      letras: {},       // { "linha,coluna": "A" }
      reveladas: {},    // casas reveladas com gota
      venceu: false,
    };
  }

  function carregar() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_SAVE));
      return Object.assign(estadoPadrao(), salvo || {});
    } catch (e) {
      return estadoPadrao();
    }
  }

  const estado = carregar();

  function salvar() {
    try {
      localStorage.setItem(CHAVE_SAVE, JSON.stringify(estado));
    } catch (e) {
      /* navegador sem localStorage: o jogo segue sem salvar */
    }
  }

  function novoJogo() {
    const som = estado.som;
    Object.assign(estado, estadoPadrao(), { som });
    salvar();
    atualizarHud();
  }

  /* ---------- módulos ---------- */
  function registrar(nome, modulo) {
    modulos[nome] = modulo;
  }

  /* ---------- telas ---------- */
  function garantirTela(id) {
    let tela = document.getElementById(id);
    if (!tela) {
      tela = document.createElement("section");
      tela.id = id;
      tela.className = "tela";
      document.getElementById("telas").appendChild(tela);
    }
    return tela;
  }

  function irPara(id) {
    document.querySelectorAll(".tela.ativa").forEach((t) => t.classList.remove("ativa"));
    const tela = garantirTela(id);
    tela.classList.add("ativa");
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.body.dataset.tela = id;
    document.getElementById("btn-inicio").hidden = id === "tela-titulo";
    document.dispatchEvent(new CustomEvent("trocou-tela", { detail: id }));
  }

  /* ---------- HUD ---------- */
  function atualizarHud() {
    const valor = document.getElementById("hud-gotas-valor");
    if (valor) valor.textContent = estado.gotas;
    atualizarBotaoSom();
    atualizarTitulo();
  }

  function pularGotas() {
    const el = document.getElementById("hud-gotas");
    el.classList.remove("pulo");
    void el.offsetWidth; // reinicia a animação
    el.classList.add("pulo");
  }

  function ganharGota(qtd = 1) {
    estado.gotas += qtd;
    salvar();
    atualizarHud();
    pularGotas();
    Sfx.gota();
  }

  function gastarGota() {
    if (estado.gotas <= 0) return false;
    estado.gotas--;
    estado.gotasUsadas++;
    salvar();
    atualizarHud();
    pularGotas();
    return true;
  }

  const ICONE_SOM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  const ICONE_MUDO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';

  function atualizarBotaoSom() {
    const btn = document.getElementById("btn-som");
    if (!btn) return;
    btn.innerHTML = estado.som ? ICONE_SOM : ICONE_MUDO;
    btn.setAttribute("aria-label", estado.som ? "Desligar som" : "Ligar som");
    btn.title = btn.getAttribute("aria-label");
    Sfx.ligado = estado.som;
  }

  /* ---------- toast e modal ---------- */
  let timerToast = null;
  function toast(texto, ms = 2400) {
    const el = document.getElementById("toast");
    el.textContent = texto;
    el.classList.add("visivel");
    clearTimeout(timerToast);
    timerToast = setTimeout(() => el.classList.remove("visivel"), ms);
  }

  /**
   * Abre uma janela de vidro.
   * botoes: [{ texto, classe, acao }] — acao pode retornar false para não fechar.
   */
  function modal({ titulo, html, botoes = [{ texto: "OK", classe: "" }] }) {
    const fundo = document.getElementById("modal");
    fundo.innerHTML = "";
    const caixa = document.createElement("div");
    caixa.className = "modal-caixa vidro";
    caixa.setAttribute("role", "dialog");
    caixa.setAttribute("aria-modal", "true");

    const h2 = document.createElement("h2");
    h2.textContent = titulo;
    const corpo = document.createElement("div");
    corpo.className = "modal-corpo";
    corpo.innerHTML = html;
    const barra = document.createElement("div");
    barra.className = "modal-botoes";

    botoes.forEach((b) => {
      const btn = document.createElement("button");
      btn.className = "btn pequeno " + (b.classe || "");
      btn.textContent = b.texto;
      btn.addEventListener("click", () => {
        Sfx.clique();
        const resultado = b.acao ? b.acao() : undefined;
        if (resultado !== false) fecharModal();
      });
      barra.appendChild(btn);
    });

    caixa.append(h2, corpo, barra);
    fundo.appendChild(caixa);
    fundo.classList.add("aberto");
    Sfx.abrir();
    const primeiro = barra.querySelector("button:last-child");
    if (primeiro) primeiro.focus();
  }

  function fecharModal() {
    document.getElementById("modal").classList.remove("aberto");
  }

  /* ---------- cenário: bolhas e peixinho ---------- */
  function criarBolha() {
    const camada = document.getElementById("bolhas");
    if (camada.childElementCount > 22 || document.hidden) return;
    const b = document.createElement("div");
    b.className = "bolha";
    const tam = 14 + Math.random() * 58;
    b.style.setProperty("--tam", tam + "px");
    b.style.setProperty("--dur", 10 + Math.random() * 10 + "s");
    b.style.setProperty("--balanco", (Math.random() * 120 - 60).toFixed(0) + "px");
    b.style.left = Math.random() * 100 + "vw";
    b.addEventListener("animationend", (e) => {
      if (e.target === b) b.remove();
    });
    b.addEventListener("pointerdown", () => estourar(b));
    camada.appendChild(b);
  }

  function estourar(bolha) {
    const r = bolha.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    bolha.classList.add("estourou");
    Sfx.bolha();
    for (let i = 0; i < 8; i++) {
      const p = document.createElement("div");
      p.className = "respingo";
      const ang = (Math.PI * 2 * i) / 8;
      const dist = r.width * 0.6 + 12;
      p.style.left = cx + "px";
      p.style.top = cy + "px";
      p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      p.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
    setTimeout(() => bolha.remove(), 360);
  }

  function soltarPeixe() {
    if (document.hidden) return;
    const peixe = Pixel.criar("aura", 3, { animar: true });
    peixe.classList.add("peixe-fundo");
    peixe.style.bottom = 8 + Math.random() * 22 + "vh";
    peixe.addEventListener("animationend", () => peixe.remove());
    document.body.appendChild(peixe);
  }

  function iniciarCenario() {
    for (let i = 0; i < 7; i++) setTimeout(criarBolha, i * 350);
    setInterval(criarBolha, 1100);
    setTimeout(soltarPeixe, 4000);
    setInterval(soltarPeixe, 30000);
  }

  /* ---------- tela de título ---------- */
  function atualizarTitulo() {
    const btn = document.querySelector('[data-acao="aventura"] span');
    if (btn) btn.textContent = estado.introVista ? "Continuar aventura" : "Começar aventura";
  }

  function comoJogar() {
    modal({
      titulo: "Como jogar",
      html: `
        <p>O vilão <b>Glitch</b> embaralhou as Palavras-Chave do Núcleo de Cristal. Ajude o <b>Bit</b> a consertar!</p>
        <ul>
          <li><b>Aventura:</b> visite as regiões da placa, aprenda com a Aura e responda às perguntas. Cada acerto vale uma <b>gota de energia</b>.</li>
          <li><b>Cruzadinha:</b> clique numa casa (ou numa pista) e digite as letras direto no tabuleiro. Clique de novo na casa para trocar entre horizontal e vertical.</li>
          <li><b>Conferir</b> mostra quais palavras estão certas ou erradas. <b>Reiniciar</b> limpa o tabuleiro.</li>
          <li>Travou? Gaste uma gota para revelar uma letra.</li>
          <li>Dica extra: estoure as bolhas do fundo. Não serve pra nada, mas é muito bom. 🫧</li>
        </ul>`,
      botoes: [{ texto: "Bora!", classe: "verde" }],
    });
  }

  function acaoTitulo(acao) {
    Sfx.clique();
    if (acao === "como") return comoJogar();
    if (acao === "aventura") {
      if (modulos.historia) return modulos.historia.abrir();
      return toast("A aventura está sendo construída... volte em breve! 🛠️");
    }
    if (acao === "cruzadinha") {
      if (modulos.cruzadinha) return modulos.cruzadinha.abrir();
      return toast("O Núcleo de Cristal ainda está sendo montado... 💎");
    }
  }

  /* ---------- início ---------- */
  function iniciar() {
    // bit flutuando na tela de título
    const bolhaBit = document.querySelector(".bolha-bit");
    if (bolhaBit) bolhaBit.appendChild(Pixel.criar("bit", 5, { animar: true }));

    // gotinha do HUD
    const icone = document.getElementById("hud-gotas-icone");
    if (icone) icone.appendChild(Pixel.criar("gota", 3));

    document.querySelectorAll("[data-acao]").forEach((btn) => {
      btn.addEventListener("click", () => acaoTitulo(btn.dataset.acao));
    });

    document.getElementById("btn-som").addEventListener("click", () => {
      estado.som = !estado.som;
      salvar();
      atualizarBotaoSom();
      if (estado.som) Sfx.clique();
    });

    document.getElementById("btn-inicio").addEventListener("click", () => {
      Sfx.clique();
      irPara("tela-titulo");
    });

    document.getElementById("modal").addEventListener("click", (e) => {
      if (e.target.id === "modal") fecharModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") fecharModal();
    });

    atualizarHud();
    iniciarCenario();

    // inicia os módulos que foram carregados (história, cruzadinha...)
    Object.values(modulos).forEach((m) => m.iniciar && m.iniciar());

    irPara("tela-titulo");
  }

  document.addEventListener("DOMContentLoaded", iniciar);

  return {
    estado,
    salvar,
    novoJogo,
    registrar,
    modulos,
    irPara,
    garantirTela,
    toast,
    modal,
    fecharModal,
    ganharGota,
    gastarGota,
    atualizarHud,
  };
})();
