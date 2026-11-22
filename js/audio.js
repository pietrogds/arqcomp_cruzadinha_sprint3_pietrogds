/* =========================================================
   AUDIO.JS — efeitos sonoros sintetizados (Web Audio API)
   Nada de arquivo de som: tudo é gerado na hora.
   ========================================================= */

const Sfx = (() => {
  let ctx = null;
  let ligado = true;

  function contexto() {
    if (!ligado) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  /** Toca uma nota simples com envelope suave. */
  function nota(freq, { dur = 0.14, tipo = "sine", vol = 0.12, atraso = 0, ate = null } = {}) {
    const ac = contexto();
    if (!ac) return;
    const t = ac.currentTime + atraso;
    const osc = ac.createOscillator();
    const ganho = ac.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(freq, t);
    if (ate) osc.frequency.exponentialRampToValueAtTime(ate, t + dur);
    ganho.gain.setValueAtTime(0.0001, t);
    ganho.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    ganho.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(ganho).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** Sino de vidro: nota + harmônico brilhante. */
  function sino(freq, atraso = 0, vol = 0.1) {
    nota(freq, { dur: 0.5, tipo: "sine", vol, atraso });
    nota(freq * 2, { dur: 0.35, tipo: "triangle", vol: vol * 0.35, atraso });
    nota(freq * 3.01, { dur: 0.2, tipo: "sine", vol: vol * 0.15, atraso });
  }

  return {
    get ligado() { return ligado; },
    set ligado(v) { ligado = !!v; },

    bolha() { nota(380 + Math.random() * 200, { dur: 0.12, vol: 0.14, ate: 1300 + Math.random() * 400 }); },
    clique() { nota(880, { dur: 0.06, tipo: "triangle", vol: 0.07 }); },
    tecla() { nota(1200 + Math.random() * 120, { dur: 0.035, tipo: "square", vol: 0.025 }); },
    fala() { nota(520 + Math.random() * 160, { dur: 0.03, tipo: "square", vol: 0.018 }); },
    abrir() { sino(659); sino(988, 0.08, 0.07); },
    acerto() { [784, 988, 1319].forEach((f, i) => sino(f, i * 0.07, 0.09)); },
    erro() {
      nota(300, { dur: 0.16, tipo: "triangle", vol: 0.12 });
      nota(220, { dur: 0.22, tipo: "triangle", vol: 0.12, atraso: 0.12 });
    },
    gota() { nota(600, { dur: 0.18, vol: 0.12, ate: 1600 }); sino(1568, 0.1, 0.06); },
    glitch() {
      for (let i = 0; i < 6; i++) {
        nota(100 + Math.random() * 900, { dur: 0.04, tipo: "sawtooth", vol: 0.03, atraso: i * 0.035 });
      }
    },
    vitoria() {
      const notas = [523, 659, 784, 1047, 784, 1047, 1319, 1568];
      notas.forEach((f, i) => sino(f, i * 0.11, 0.09));
    },
    ligar() {
      // "plim" de computador ligando (acorde que abre)
      [392, 523, 659, 784, 1047].forEach((f, i) => sino(f, i * 0.16, 0.08));
      nota(196, { dur: 1.6, tipo: "sine", vol: 0.06 });
    },
  };
})();
