/* =========================================================
   CRUZADINHA.JS — o Núcleo de Cristal
   - monta o tabuleiro a partir de PALAVRAS
   - digitação direto nas casas + navegação por teclado
   - Conferir, Reiniciar, contador e dica com gota
   ========================================================= */

const Cruzadinha = (() => {
  const estado = App.estado;
  let tela, grade, barraPista, listaH, listaV, contador, btnDica;

  const casas = {};        // "l,c" -> { input, div, palavras: [] }
  let selecao = { palavra: null, linha: 0, coluna: 0 };
  let resultado = {};      // índice da palavra -> true/false (após Conferir)

  /* ---------- utilidades ---------- */
  const chave = (l, c) => l + "," + c;

  function celulasDa(p) {
    const lista = [];
    for (let i = 0; i < p.resposta.length; i++) {
      const l = p.direcao === "V" ? p.linha + i : p.linha;
      const c = p.direcao === "H" ? p.coluna + i : p.coluna;
      lista.push({ l, c, letra: p.resposta[i] });
    }
    return lista;
  }

  function normalizar(texto) {
    return texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toUpperCase()
      .replace(/[^A-Z]/g, "");
  }

  /* ---------- numeração (como numa cruzadinha de jornal) ---------- */
  function numerar() {
    const inicios = [...new Set(PALAVRAS.map((p) => chave(p.linha, p.coluna)))];
    inicios.sort((a, b) => {
      const [la, ca] = a.split(",").map(Number);
      const [lb, cb] = b.split(",").map(Number);
      return la - lb || ca - cb;
    });
    PALAVRAS.forEach((p) => {
      p.numero = inicios.indexOf(chave(p.linha, p.coluna)) + 1;
    });
  }

  /* ---------- montagem da tela ---------- */
  function montar() {
    tela = App.garantirTela("tela-cruzadinha");
    tela.innerHTML = `
      <div class="cz-topo vidro">
        <div class="cz-titulo">
          <span class="cz-cristal"></span>
          <div>
            <h2>O Núcleo de Cristal</h2>
            <p>Preencha as 16 Palavras-Chave de Arquitetura Computacional</p>
          </div>
        </div>
        <div class="cz-placar" aria-live="polite">
          <span class="cz-placar-num" id="cz-contador">0 de ${PALAVRAS.length}</span>
          <span class="cz-placar-txt">palavras certas</span>
          <div class="cz-barra"><div class="cz-barra-fill" id="cz-barra"></div></div>
        </div>
      </div>

      <div class="cz-acoes">
        <button class="btn verde" id="cz-conferir">✔ Conferir</button>
        <button class="btn" id="cz-dica">💧 Revelar letra</button>
        <button class="btn vermelho" id="cz-reiniciar">↺ Reiniciar</button>
      </div>

      <div class="cz-area">
        <div class="cz-tabuleiro-wrap vidro">
          <div class="cz-pista-atual" id="cz-pista-atual">Clique numa casa para começar!</div>
          <div class="cz-grade" id="cz-grade" role="grid" aria-label="Tabuleiro da cruzadinha"></div>
        </div>

        <div class="cz-pistas vidro">
          <h3><span class="seta">➜</span> Horizontais</h3>
          <ol class="cz-lista" id="cz-lista-h"></ol>
          <h3><span class="seta">⬇</span> Verticais</h3>
          <ol class="cz-lista" id="cz-lista-v"></ol>
        </div>
      </div>`;

    tela.querySelector(".cz-cristal").appendChild(Pixel.criar("cristalCorrompido", 4));
    grade = tela.querySelector("#cz-grade");
    barraPista = tela.querySelector("#cz-pista-atual");
    listaH = tela.querySelector("#cz-lista-h");
    listaV = tela.querySelector("#cz-lista-v");
    contador = tela.querySelector("#cz-contador");
    btnDica = tela.querySelector("#cz-dica");

    montarGrade();
    montarPistas();

    tela.querySelector("#cz-conferir").addEventListener("click", conferir);
    tela.querySelector("#cz-reiniciar").addEventListener("click", pedirReinicio);
    btnDica.addEventListener("click", usarDica);
  }

  function montarGrade() {
    grade.style.setProperty("--colunas", TABULEIRO.colunas);
    grade.style.setProperty("--linhas", TABULEIRO.linhas);

    // casas vazias (fundo do tabuleiro)
    for (let l = 0; l < TABULEIRO.linhas; l++) {
      for (let c = 0; c < TABULEIRO.colunas; c++) {
        const vazio = document.createElement("div");
        vazio.className = "cz-vazio";
        vazio.style.gridRow = l + 1;
        vazio.style.gridColumn = c + 1;
        grade.appendChild(vazio);
      }
    }

    // casas das palavras
    PALAVRAS.forEach((p, indice) => {
      celulasDa(p).forEach(({ l, c }, i) => {
        const k = chave(l, c);
        if (!casas[k]) {
          const div = document.createElement("div");
          div.className = "cz-casa";
          div.style.gridRow = l + 1;
          div.style.gridColumn = c + 1;

          const input = document.createElement("input");
          input.type = "text";
          input.maxLength = 2;
          input.autocomplete = "off";
          input.spellcheck = false;
          input.setAttribute("autocapitalize", "characters");
          input.setAttribute("aria-label", `Casa linha ${l + 1}, coluna ${c + 1}`);
          input.dataset.l = l;
          input.dataset.c = c;
          input.value = estado.letras[k] || "";

          div.appendChild(input);
          grade.appendChild(div);
          casas[k] = { input, div, palavras: [] };

          input.addEventListener("focus", () => aoFocar(l, c));
          input.addEventListener("mousedown", (e) => aoClicar(e, l, c));
          input.addEventListener("input", () => aoDigitar(l, c));
          input.addEventListener("keydown", (e) => aoTeclar(e, l, c));
        }
        casas[k].palavras.push(indice);
        if (i === 0) {
          const num = document.createElement("span");
          num.className = "cz-num";
          num.textContent = p.numero;
          if (!casas[k].div.querySelector(".cz-num")) casas[k].div.appendChild(num);
        }
      });
    });

    // casas reveladas com gota ficam travadas
    Object.keys(estado.reveladas).forEach((k) => travarRevelada(k));
  }

  function montarPistas() {
    const ordenadas = PALAVRAS.map((p, i) => ({ p, i })).sort((a, b) => a.p.numero - b.p.numero);
    ordenadas.forEach(({ p, i }) => {
      const li = document.createElement("li");
      li.className = "cz-item";
      li.dataset.indice = i;
      li.tabIndex = 0;
      li.innerHTML = `<b class="cz-item-num">${p.numero}</b><span class="cz-item-txt">${p.pista} <small>(${p.resposta.length})</small></span><span class="cz-item-status" aria-hidden="true"></span>`;
      li.addEventListener("click", () => selecionarPalavra(i, true));
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selecionarPalavra(i, true);
        }
      });
      (p.direcao === "H" ? listaH : listaV).appendChild(li);
    });
  }

  /* ---------- seleção ---------- */
  function selecionarPalavra(indice, focar, celula = null) {
    selecao.palavra = indice;
    const p = PALAVRAS[indice];
    const cels = celulasDa(p);
    let alvo = celula;
    if (!alvo) {
      // vai para a primeira casa vazia da palavra
      alvo = cels.find(({ l, c }) => !casas[chave(l, c)].input.value) || cels[0];
    }
    selecao.linha = alvo.l;
    selecao.coluna = alvo.c;
    destacar();
    if (focar) casas[chave(alvo.l, alvo.c)].input.focus({ preventScroll: true });
  }

  function destacar() {
    Object.values(casas).forEach((casa) => casa.div.classList.remove("na-palavra", "atual"));
    tela.querySelectorAll(".cz-item.ativo").forEach((li) => li.classList.remove("ativo"));
    if (selecao.palavra === null) return;

    const p = PALAVRAS[selecao.palavra];
    celulasDa(p).forEach(({ l, c }) => casas[chave(l, c)].div.classList.add("na-palavra"));
    casas[chave(selecao.linha, selecao.coluna)].div.classList.add("atual");

    const li = tela.querySelector(`.cz-item[data-indice="${selecao.palavra}"]`);
    li.classList.add("ativo");
    const dir = p.direcao === "H" ? "Horizontal" : "Vertical";
    barraPista.innerHTML = `<b>${p.numero} ${dir}</b> ${p.pista} <small>(${p.resposta.length} letras)</small>`;
  }

  // ao clicar de novo na casa atual, troca horizontal <-> vertical
  let trocarNoProximoFoco = false;
  function aoClicar(e, l, c) {
    const k = chave(l, c);
    trocarNoProximoFoco = document.activeElement === casas[k].input;
    if (trocarNoProximoFoco) {
      e.preventDefault();
      alternarDirecao(l, c);
    }
  }

  function alternarDirecao(l, c) {
    const lista = casas[chave(l, c)].palavras;
    if (lista.length > 1) {
      const outra = lista.find((i) => i !== selecao.palavra);
      selecionarPalavra(outra, false, { l, c });
      Sfx.clique();
    }
  }

  function aoFocar(l, c) {
    const lista = casas[chave(l, c)].palavras;
    // mantém a palavra atual se a casa fizer parte dela
    const indice = lista.includes(selecao.palavra) ? selecao.palavra : lista[0];
    selecao = { palavra: indice, linha: l, coluna: c };
    destacar();
  }

  /* ---------- digitação ---------- */
  function aoDigitar(l, c) {
    const k = chave(l, c);
    const input = casas[k].input;
    const letra = normalizar(input.value).slice(-1);
    input.value = letra;
    estado.letras[k] = letra;
    App.salvar();
    limparMarcas(k);
    if (letra) {
      Sfx.tecla();
      casas[k].div.classList.remove("pop");
      void casas[k].div.offsetWidth;
      casas[k].div.classList.add("pop");
      mover(1);
    }
  }

  function aoTeclar(e, l, c) {
    const k = chave(l, c);
    // casa revelada não aceita letra: só pula para a próxima
    if (casas[k].input.readOnly && /^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      mover(1);
      return;
    }
    switch (e.key) {
      case "Backspace":
        if (!casas[k].input.value) {
          e.preventDefault();
          mover(-1, true);
        }
        break;
      case "ArrowRight": e.preventDefault(); andarSeta(l, c + 1, "H"); break;
      case "ArrowLeft":  e.preventDefault(); andarSeta(l, c - 1, "H"); break;
      case "ArrowDown":  e.preventDefault(); andarSeta(l + 1, c, "V"); break;
      case "ArrowUp":    e.preventDefault(); andarSeta(l - 1, c, "V"); break;
      case "Enter":
      case " ":
        e.preventDefault();
        alternarDirecao(l, c);
        break;
      case "Tab": {
        e.preventDefault();
        const ordem = PALAVRAS.map((p, i) => i).sort((a, b) =>
          (PALAVRAS[a].direcao + PALAVRAS[a].numero).localeCompare(PALAVRAS[b].direcao + PALAVRAS[b].numero, undefined, { numeric: true }));
        const pos = ordem.indexOf(selecao.palavra);
        const prox = ordem[(pos + (e.shiftKey ? -1 : 1) + ordem.length) % ordem.length];
        selecionarPalavra(prox, true);
        break;
      }
    }
  }

  function andarSeta(l, c, dir) {
    const k = chave(l, c);
    if (!casas[k]) return;
    const lista = casas[k].palavras;
    const daDirecao = lista.find((i) => PALAVRAS[i].direcao === dir);
    selecao.palavra = daDirecao !== undefined ? daDirecao : lista[0];
    casas[k].input.focus();
  }

  /** Anda dentro da palavra selecionada (passo 1 ou -1). */
  function mover(passo, apagar = false) {
    if (selecao.palavra === null) return;
    const cels = celulasDa(PALAVRAS[selecao.palavra]);
    const pos = cels.findIndex(({ l, c }) => l === selecao.linha && c === selecao.coluna);
    const prox = cels[pos + passo];
    if (!prox) return;
    const k = chave(prox.l, prox.c);
    if (apagar && !casas[k].input.readOnly) {
      casas[k].input.value = "";
      estado.letras[k] = "";
      App.salvar();
      limparMarcas(k);
    }
    selecao.linha = prox.l;
    selecao.coluna = prox.c;
    casas[k].input.focus();
  }

  /* ---------- conferir ---------- */
  function palavraCerta(p) {
    return celulasDa(p).every(({ l, c, letra }) => (estado.letras[chave(l, c)] || "") === letra);
  }

  function limparMarcas(k) {
    casas[k].div.classList.remove("certa", "errada");
    casas[k].palavras.forEach((i) => {
      if (i in resultado) {
        delete resultado[i];
        const li = tela.querySelector(`.cz-item[data-indice="${i}"]`);
        li.classList.remove("certa", "errada");
      }
    });
  }

  function conferir() {
    Sfx.clique();
    resultado = {};
    let acertos = 0;

    PALAVRAS.forEach((p, i) => {
      const ok = palavraCerta(p);
      resultado[i] = ok;
      if (ok) acertos++;
      const li = tela.querySelector(`.cz-item[data-indice="${i}"]`);
      li.classList.toggle("certa", ok);
      li.classList.toggle("errada", !ok);
    });

    // casa verde se pertence a alguma palavra certa; vermelha se só está em palavras erradas
    Object.values(casas).forEach((casa) => {
      const algumaCerta = casa.palavras.some((i) => resultado[i]);
      casa.div.classList.remove("certa", "errada", "brilho");
      void casa.div.offsetWidth;
      casa.div.classList.add(algumaCerta ? "certa" : "errada");
      if (algumaCerta) casa.div.classList.add("brilho");
    });

    atualizarContador(acertos);

    if (acertos === PALAVRAS.length) {
      Sfx.vitoria();
      estado.venceu = true;
      App.salvar();
      tela.classList.add("vitoria");
      setTimeout(() => {
        if (App.modulos.historia) App.modulos.historia.final();
        else App.modal({ titulo: "Núcleo restaurado! 💎", html: "<p>Você acertou as 16 palavras. Parabéns!</p>", botoes: [{ texto: "Uhul!", classe: "verde" }] });
      }, 900);
    } else if (acertos > 0) {
      Sfx.acerto();
      App.toast(`✔ ${acertos} de ${PALAVRAS.length} palavras certas. Continue!`);
    } else {
      Sfx.erro();
      App.toast("Nenhuma palavra completa ainda... confira as pistas!");
    }
  }

  function atualizarContador(acertos) {
    contador.textContent = `${acertos} de ${PALAVRAS.length}`;
    tela.querySelector("#cz-barra").style.width = (acertos / PALAVRAS.length) * 100 + "%";
    contador.classList.remove("pulo");
    void contador.offsetWidth;
    contador.classList.add("pulo");
    const cristal = tela.querySelector(".cz-cristal");
    cristal.innerHTML = "";
    cristal.appendChild(Pixel.criar(acertos === PALAVRAS.length ? "cristal" : "cristalCorrompido", 4));
  }

  /* ---------- reiniciar ---------- */
  function pedirReinicio() {
    Sfx.clique();
    App.modal({
      titulo: "Reiniciar o tabuleiro?",
      html: "<p>Todas as letras serão apagadas (as gotas que você já gastou não voltam).</p>",
      botoes: [
        { texto: "Cancelar", classe: "vidro-btn" },
        { texto: "Limpar tudo", classe: "vermelho", acao: reiniciar },
      ],
    });
  }

  function reiniciar() {
    estado.letras = {};
    estado.reveladas = {};
    estado.venceu = false;
    App.salvar();
    resultado = {};
    Object.values(casas).forEach((casa) => {
      casa.input.value = "";
      casa.input.readOnly = false;
      casa.div.classList.remove("certa", "errada", "revelada", "brilho");
    });
    tela.querySelectorAll(".cz-item").forEach((li) => li.classList.remove("certa", "errada"));
    tela.classList.remove("vitoria");
    atualizarContador(0);
    selecao.palavra = null;
    destacar();
    barraPista.textContent = "Tabuleiro limpo! Clique numa casa para começar.";
    Sfx.bolha();
    App.toast("Tabuleiro reiniciado 🫧");
  }

  /* ---------- dica: gastar gota para revelar letra ---------- */
  function travarRevelada(k) {
    const casa = casas[k];
    if (!casa) return;
    casa.input.readOnly = true;
    casa.div.classList.add("revelada");
  }

  function usarDica() {
    if (selecao.palavra === null) {
      Sfx.erro();
      return App.toast("Primeiro selecione uma palavra no tabuleiro.");
    }
    const p = PALAVRAS[selecao.palavra];
    const alvo = celulasDa(p).find(({ l, c, letra }) => estado.letras[chave(l, c)] !== letra);
    if (!alvo) {
      return App.toast("Essa palavra já está certinha! ✨");
    }
    if (estado.gotas <= 0) {
      Sfx.erro();
      return App.toast("Sem gotas! Ganhe mais respondendo perguntas na aventura. 💧");
    }
    App.gastarGota();
    const k = chave(alvo.l, alvo.c);
    estado.letras[k] = alvo.letra;
    estado.reveladas[k] = true;
    App.salvar();
    casas[k].input.value = alvo.letra;
    limparMarcas(k);
    travarRevelada(k);
    Sfx.gota();
    selecionarPalavra(selecao.palavra, true);
    atualizarBotaoDica();
  }

  function atualizarBotaoDica() {
    btnDica.textContent = `💧 Revelar letra (${estado.gotas})`;
  }

  /* ---------- API do módulo ---------- */
  function abrir() {
    App.irPara("tela-cruzadinha");
    atualizarBotaoDica();
    setTimeout(() => {
      if (selecao.palavra === null) {
        const primeira = PALAVRAS.findIndex((p) => p.numero === 1);
        selecionarPalavra(primeira, window.innerWidth > 800);
      }
    }, 300);
  }

  function iniciar() {
    numerar();
    montar();
  }

  return { iniciar, abrir, atualizarBotaoDica };
})();

App.registrar("cruzadinha", Cruzadinha);
