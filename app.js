/**
 * GhostPad — Interactive Engine & Telemetry Simulator
 * Handles Gamepad API, virtual joystick physics, architecture state, and telemetry.
 */

// State
const state = {
  activeStep: 1,
  gamepadConnected: false,
  gamepadId: null,
  simulatedAxes: [0, 0, 0, 0],
  simulatedButtons: [],
  ltValue: 0,
  rtValue: 0,
  isDraggingStickL: false,
  isDraggingStickR: false,
  packetsSent: 1420,
  ping: 3.2,
};

// Architecture Pipeline Data
const pipelineData = {
  1: {
    badge: "CAMADA 01 // ENTRADA FÍSICA",
    title: "Pareamento Bluetooth HID Nativo",
    desc: "O controle (DualShock 4, DualSense, Xbox, 8BitDo ou genérico) conecta-se diretamente ao smartphone via Bluetooth HID padrão. Nenhum driver especial é necessário no celular, pois o kernel do Android/iOS gerencia a pilha Bluetooth e expõe o periférico como Standard Gamepad.",
    specs: [
      { label: "Protocolo Físico", val: "Bluetooth 4.2 / 5.0+ LE / BR/EDR" },
      { label: "Perfis HID", val: "Standard Gamepad Profile (0x05)" },
      { label: "Polling Rate Bluetooth", val: "125 Hz – 250 Hz (~4ms)" },
      { label: "Suporte", val: "Android 8+ / iOS 14.5+ (Safari / Chrome)" }
    ],
    codeTitle: "navigator.getGamepads() // Gamepad API",
    code: `<span class="hl-com">// Leitura em 60/120 FPS no loop de animação</span>
<span class="hl-kw">function</span> <span class="hl-fn">lerControle</span>() {
  <span class="hl-kw">const</span> gamepads = navigator.<span class="hl-fn">getGamepads</span>();
  <span class="hl-kw">const</span> gp = [...gamepads].<span class="hl-fn">find</span>(g => g !== <span class="hl-kw">null</span>);
  <span class="hl-kw">if</span> (gp) {
    <span class="hl-com">// Normaliza analógicos e deadzone</span>
    <span class="hl-kw">const</span> eixos = gp.axes.<span class="hl-fn">map</span>(v => Math.<span class="hl-fn">abs</span>(v) &lt; <span class="hl-num">0.08</span> ? <span class="hl-num">0</span> : +v.<span class="hl-fn">toFixed</span>(<span class="hl-num">3</span>));
    <span class="hl-fn">despacharPacket</span>(gp.buttons, eixos);
  }
  requestAnimationFrame(lerControle);
}`
  },
  2: {
    badge: "CAMADA 02 // WEB RUNTIME CLIENT",
    title: "Gamepad API & Wake Lock no Celular",
    desc: "A página web servida localmente pelo GhostPad é carregada no Chrome (Android) ou Safari (iOS). Utiliza a W3C Gamepad API com deadzone calculada em JavaScript (threshold 0.08) e aciona a Screen Wake Lock API do navegador para evitar que o celular apague a tela ou pause os sockets em background.",
    specs: [
      { label: "Deadzone Analógicos", val: "Radial ±0.08 (evita stick drift)" },
      { label: "Prevenção de Sleep", val: "navigator.wakeLock.request('screen')" },
      { label: "Payload Frame", val: "Delta JSON compactado (botões + eixos)" },
      { label: "Instalação", val: "Zero — Roda 100% no navegador" }
    ],
    codeTitle: "HTML_CELULAR // WakeLock & Delta Loop",
    code: `<span class="hl-com">// Mantém a tela ligada no celular</span>
<span class="hl-kw">async function</span> <span class="hl-fn">ativarWakeLock</span>() {
  <span class="hl-kw">try</span> {
    wake = <span class="hl-kw">await</span> navigator.wakeLock.<span class="hl-fn">request</span>(<span class="hl-str">"screen"</span>);
    $(<span class="hl-str">"btn"</span>).textContent = <span class="hl-str">"Tela sempre ativa"</span>;
  } <span class="hl-kw">catch</span> (err) {
    console.<span class="hl-fn">warn</span>(<span class="hl-str">"WakeLock indisponível"</span>, err);
  }
}`
  },
  3: {
    badge: "CAMADA 03 // REDE LOCAL & SEGURANÇA",
    title: "Túnel WebSocket Seguro (WSS / HTTPS)",
    desc: "A comunicação ocorre via WebSocket seguro sobre TLS 1.3 na porta 8443. Os navegadores modernos exigem contexto seguro (HTTPS) para habilitar certas APIs de hardware. O GhostPad gera automaticamente certificados autoassinados X.509 em memória com extensão SAN (Subject Alternative Name) contendo o IP local.",
    specs: [
      { label: "Criptografia", val: "TLS 1.3 / X.509 SAN Auto-gerado" },
      { label: "Porta Padrão", val: "TCP 8443 (HTTP/WSS)" },
      { label: "Keepalive Heartbeat", val: "Ping/Pong a cada 10 segundos" },
      { label: "Latência LAN (Wi-Fi 5GHz)", val: "&lt; 2.5 ms típico" }
    ],
    codeTitle: "ghostpad.py // Geração TLS em Memória",
    code: `<span class="hl-kw">from</span> cryptography <span class="hl-kw">import</span> x509
<span class="hl-kw">from</span> cryptography.hazmat.primitives <span class="hl-kw">import</span> hashes, rsa

<span class="hl-com"># Gera certificado com IP local no SAN para validação</span>
san = x509.<span class="hl-fn">SubjectAlternativeName</span>([
    x509.<span class="hl-fn">IPAddress</span>(ipaddress.<span class="hl-fn">ip_address</span>(ip))
])
cert = x509.<span class="hl-fn">CertificateBuilder</span>()\\
    .<span class="hl-fn">subject_name</span>(nome)\\
    .<span class="hl-fn">add_extension</span>(san, critical=<span class="hl-kw">False</span>)\\
    .<span class="hl-fn">sign</span>(chave, hashes.<span class="hl-fn">SHA256</span>())`
  },
  4: {
    badge: "CAMADA 04 // SERVIÇO DESKTOP",
    title: "GhostPad Engine (Python Asyncio & aiohttp)",
    desc: "O núcleo do GhostPad roda em Python assíncrono com aiohttp. Ele escuta conexões concorrentes, extrai os vetores de eixos e estados de botões, inverte o eixo Y do navegador (HTML5 tem Y positivo para baixo, enquanto XInput espera Y positivo para cima) e mapeia os triggers analógicos LT e RT.",
    specs: [
      { label: "Runtime", val: "Python 3.12+ / aiohttp async worker" },
      { label: "Inversão de Coordenadas", val: "left_joystick_float(a[0], -a[1])" },
      { label: "Triggers LT / RT", val: "Analog Float (0.000 a 1.000)" },
      { label: "Thread Model", val: "Asyncio loop isolado com Thread Lock" }
    ],
    codeTitle: "ghostpad.py // Mapeamento & Coordenadas",
    code: `<span class="hl-kw">def</span> <span class="hl-fn">_aplicar</span>(self, d):
    pad = self._pad
    pad.<span class="hl-fn">reset</span>()
    <span class="hl-kw">for</span> i <span class="hl-kw">in</span> d.<span class="hl-fn">get</span>(<span class="hl-str">"b"</span>, []):
        <span class="hl-kw">if</span> i <span class="hl-kw">in</span> self._mapa:
            pad.<span class="hl-fn">press_button</span>(self._mapa[i])
    a = d.<span class="hl-fn">get</span>(<span class="hl-str">"a"</span>, [<span class="hl-num">0</span>, <span class="hl-num">0</span>, <span class="hl-num">0</span>, <span class="hl-num">0</span>])
    <span class="hl-com"># Inverte Y: HTML5 down=+ / XInput up=+</span>
    pad.<span class="hl-fn">left_joystick_float</span>(a[<span class="hl-num">0</span>], -a[<span class="hl-num">1</span>])
    pad.<span class="hl-fn">right_joystick_float</span>(a[<span class="hl-num">2</span>], -a[<span class="hl-num">3</span>])
    pad.<span class="hl-fn">left_trigger_float</span>(d.<span class="hl-fn">get</span>(<span class="hl-str">"lt"</span>, <span class="hl-num">0</span>))
    pad.<span class="hl-fn">right_trigger_float</span>(d.<span class="hl-fn">get</span>(<span class="hl-str">"rt"</span>, <span class="hl-num">0</span>))
    pad.<span class="hl-fn">update</span>()`
  },
  5: {
    badge: "CAMADA 05 // KERNEL DO WINDOWS",
    title: "Driver de Kernel ViGEmBus (XInput Nativo)",
    desc: "Através da biblioteca vgamepad conectada ao driver de barramento de kernel ViGEmBus (Virtual Gamepad Emulation Bus), o Windows registra um dispositivo USB Xbox 360 legítimo. Todos os jogos, Steam, Game Pass e emuladores reconhecem o controle instantaneamente sem programas intermediários.",
    specs: [
      { label: "Driver de Kernel", val: "ViGEmBus v1.22.0 (XUSB.SYS)" },
      { label: "Interface do SO", val: "Microsoft XInput 1.4 / DirectInput" },
      { label: "Identificação no Windows", val: "Xbox 360 Controller for Windows" },
      { label: "Verificação", val: "Win + R -> joy.cpl" }
    ],
    codeTitle: "vgamepad // Inicialização de Dispositivo",
    code: `<span class="hl-kw">import</span> vgamepad <span class="hl-kw">as</span> vg

<span class="hl-com"># Instancia o controle virtual no barramento ViGEm</span>
pad = vg.<span class="hl-fn">VX360Gamepad</span>()
B = vg.XUSB_BUTTON

<span class="hl-com"># Mapeia botões padrão da W3C Gamepad API para XUSB</span>
mapa = {
    <span class="hl-num">0</span>: B.XUSB_GAMEPAD_A,  <span class="hl-num">1</span>: B.XUSB_GAMEPAD_B,
    <span class="hl-num">2</span>: B.XUSB_GAMEPAD_X,  <span class="hl-num">3</span>: B.XUSB_GAMEPAD_Y,
    <span class="hl-num">4</span>: B.XUSB_GAMEPAD_LEFT_SHOULDER,
    <span class="hl-num">5</span>: B.XUSB_GAMEPAD_RIGHT_SHOULDER,
}`
  }
};

// DOM Utilities
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  initPipeline();
  initVirtualSticks();
  initGamepadListener();
  initTabs();
  initTroubleshootingAccordion();
  initCopyButtons();
  startTelemetrySimulation();
});

// Pipeline interaction
function initPipeline() {
  const steps = $$(".pipeline-step");
  steps.forEach((step) => {
    step.addEventListener("click", () => {
      const stepNum = parseInt(step.dataset.step);
      selectStep(stepNum);
    });
  });
  selectStep(1);
}

function selectStep(stepNum) {
  state.activeStep = stepNum;
  $$(".pipeline-step").forEach((el) => {
    el.classList.toggle("active", parseInt(el.dataset.step) === stepNum);
  });

  const data = pipelineData[stepNum];
  if (!data) return;

  $("detailBadge").textContent = data.badge;
  $("detailHeading").textContent = data.title;
  $("detailBody").textContent = data.desc;

  const specsContainer = $("detailSpecs");
  specsContainer.innerHTML = data.specs
    .map(
      (s) => `
    <div class="detail-spec-row">
      <span>${s.label}</span>
      <span>${s.val}</span>
    </div>
  `
    )
    .join("");

  $("codeHeaderTitle").textContent = data.codeTitle;
  $("codeContentBlock").innerHTML = data.code;
}

// Virtual Joystick Interaction (Replicating ghostpad mobile app)
function initVirtualSticks() {
  const stickL = $("stickL");
  const stickR = $("stickR");
  const dotL = $("dotL");
  const dotR = $("dotR");

  if (!stickL || !stickR) return;

  setupStickEvents(stickL, dotL, (x, y) => {
    state.simulatedAxes[0] = x;
    state.simulatedAxes[1] = y;
    updateTelemetryDisplay();
  });

  setupStickEvents(stickR, dotR, (x, y) => {
    state.simulatedAxes[2] = x;
    state.simulatedAxes[3] = y;
    updateTelemetryDisplay();
  });
}

function setupStickEvents(stickEl, dotEl, onMove) {
  let isDown = false;
  const radius = 39; // bounds inside 104px circle

  const handlePointer = (e) => {
    if (!isDown) return;
    const rect = stickEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = e.clientX - centerX;
    let dy = e.clientY - centerY;

    const dist = Math.hypot(dx, dy);
    const maxDist = rect.width / 2 - 14;

    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    dotEl.style.transform = `translate(${dx}px, ${dy}px)`;

    const normX = +(dx / maxDist).toFixed(3);
    const normY = +(dy / maxDist).toFixed(3);

    // Deadzone 0.08
    const cleanX = Math.abs(normX) < 0.08 ? 0 : normX;
    const cleanY = Math.abs(normY) < 0.08 ? 0 : normY;

    onMove(cleanX, cleanY);
  };

  const start = (e) => {
    isDown = true;
    handlePointer(e);
  };

  const end = () => {
    if (!isDown) return;
    isDown = false;
    dotEl.style.transform = "translate(0px, 0px)";
    onMove(0, 0);
  };

  stickEl.addEventListener("pointerdown", start);
  window.addEventListener("pointermove", handlePointer);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
}

// Gamepad API integration
function initGamepadListener() {
  window.addEventListener("gamepadconnected", (e) => {
    console.log("Controle conectado:", e.gamepad.id);
    state.gamepadConnected = true;
    state.gamepadId = e.gamepad.id.split(" (")[0].slice(0, 30);
    updateGamepadUI();
  });

  window.addEventListener("gamepaddisconnected", () => {
    state.gamepadConnected = false;
    state.gamepadId = null;
    updateGamepadUI();
  });

  // Main polling loop
  function pollLoop() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = [...gamepads].find((g) => g !== null);

    if (gp) {
      if (!state.gamepadConnected) {
        state.gamepadConnected = true;
        state.gamepadId = gp.id.split(" (")[0].slice(0, 30);
        updateGamepadUI();
      }

      // Read axes
      const a = [0, 1, 2, 3].map((i) => {
        const v = gp.axes[i] || 0;
        return Math.abs(v) < 0.08 ? 0 : +v.toFixed(3);
      });
      state.simulatedAxes = a;

      // Read buttons
      const b = [];
      gp.buttons.forEach((bt, idx) => {
        if (bt.pressed) b.push(idx);
      });
      state.simulatedButtons = b;

      // Triggers
      state.ltValue = +(gp.buttons[6]?.value || 0).toFixed(3);
      state.rtValue = +(gp.buttons[7]?.value || 0).toFixed(3);

      // Move visual dots
      updateStickDotsFromAxes(a);
      updateControllerSvg();
      updateTelemetryDisplay();
    }

    requestAnimationFrame(pollLoop);
  }

  requestAnimationFrame(pollLoop);
}

function updateStickDotsFromAxes(a) {
  const dotL = $("dotL");
  const dotR = $("dotR");
  if (!dotL || !dotR) return;

  const maxDist = 38;
  dotL.style.transform = `translate(${a[0] * maxDist}px, ${a[1] * maxDist}px)`;
  dotR.style.transform = `translate(${a[2] * maxDist}px, ${a[3] * maxDist}px)`;
}

function updateGamepadUI() {
  const statusPad = $("simStatusPad");
  const statusLed = $("simPadLed");
  const padHint = $("gamepadStatusHint");

  if (state.gamepadConnected) {
    if (statusPad) {
      statusPad.textContent = state.gamepadId || "Controle Conectado";
      statusPad.className = "flet-val ok";
    }
    if (statusLed) {
      statusLed.className = "led ok pulse";
    }
    if (padHint) {
      padHint.innerHTML = `<span class="led ok"></span> <strong>${state.gamepadId}</strong> detectado! Aperte botões ou mova analógicos.`;
    }
  } else {
    if (statusPad) {
      statusPad.textContent = "Modo Demo / Toque nos Joysticks";
      statusPad.className = "flet-val ok";
    }
    if (padHint) {
      padHint.innerHTML = `<span class="led warn"></span> Dica: Conecte qualquer controle Bluetooth ou arraste os analógicos virtuais acima.`;
    }
  }
}

// Telemetry & Packet Stream Display
function updateTelemetryDisplay() {
  const streamEl = $("telemetryLiveStream");
  const axisValL = $("axisValL");
  const axisValR = $("axisValR");

  const a = state.simulatedAxes;
  if (axisValL) axisValL.textContent = `X: ${a[0].toFixed(2)} | Y: ${a[1].toFixed(2)}`;
  if (axisValR) axisValR.textContent = `X: ${a[2].toFixed(2)} | Y: ${a[3].toFixed(2)}`;

  if (streamEl) {
    const payload = {
      b: state.simulatedButtons,
      a: a,
      lt: state.ltValue,
      rt: state.rtValue,
    };
    streamEl.textContent = JSON.stringify(payload);
  }
}

function updateControllerSvg() {
  // Reset all
  $$(".btn-part").forEach((el) => el.classList.remove("active"));

  // Mapping standard:
  // 0: A (bottom), 1: B (right), 2: X (left), 3: Y (top)
  // 4: LB, 5: RB, 6: LT, 7: RT, 8: Back, 9: Start, 10: LS, 11: RS, 12: D-Up, 13: D-Down, 14: D-Left, 15: D-Right, 16: Guide
  state.simulatedButtons.forEach((btnIndex) => {
    const target = $(`svgBtn_${btnIndex}`);
    if (target) {
      target.classList.add("active");
    }
  });

  if (state.ltValue > 0.1) {
    const lt = $("svgBtn_6");
    if (lt) lt.classList.add("active");
  }
  if (state.rtValue > 0.1) {
    const rt = $("svgBtn_7");
    if (rt) rt.classList.add("active");
  }
}

// Telemetry periodic simulation when idle
function startTelemetrySimulation() {
  let tick = 0;
  setInterval(() => {
    state.packetsSent += Math.floor(Math.random() * 3) + 1;
    state.ping = +(2.8 + Math.random() * 1.2).toFixed(1);

    const pingEl = $("livePingVal");
    if (pingEl) pingEl.textContent = `${state.ping} ms`;

    // If no real gamepad connected and not dragging, apply gentle alive micro-idle animation
    if (!state.gamepadConnected && state.simulatedAxes.every((v) => v === 0)) {
      tick++;
      if (tick % 40 === 0) {
        // subtle jitter demo packet
        const fakeBtn = Math.random() > 0.6 ? [Math.floor(Math.random() * 4)] : [];
        const streamEl = $("telemetryLiveStream");
        if (streamEl) {
          streamEl.textContent = JSON.stringify({
            b: fakeBtn,
            a: [0, 0, 0, 0],
            lt: 0,
            rt: 0,
          });
        }
      }
    }
  }, 100);
}

// Tab Switching
function initTabs() {
  const tabBtns = $$(".tab-btn");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      $$(".tab-content").forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.dataset.tab;
      const targetContent = $(targetId);
      if (targetContent) targetContent.classList.add("active");
    });
  });
}

// Troubleshooting Accordion
function initTroubleshootingAccordion() {
  const items = $$(".trouble-item");
  items.forEach((item) => {
    const header = item.querySelector(".trouble-header");
    if (header) {
      header.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        items.forEach((i) => i.classList.remove("open"));
        if (!isOpen) {
          item.classList.add("open");
        }
      });
    }
  });
}

// Copy Code Buttons
function initCopyButtons() {
  $$(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      let textToCopy = "";

      if (targetId) {
        const el = $(targetId);
        textToCopy = el ? el.innerText || el.textContent : "";
      } else {
        const codeBlock = btn.closest(".code-block-container")?.querySelector(".code-content");
        textToCopy = codeBlock ? codeBlock.innerText : "";
      }

      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy.trim()).then(() => {
          const original = btn.textContent;
          btn.textContent = "Copiado!";
          btn.style.color = "#8fe3ac";
          setTimeout(() => {
            btn.textContent = original;
            btn.style.color = "";
          }, 2000);
        });
      }
    });
  });
}
