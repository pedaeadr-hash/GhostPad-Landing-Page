<div align="center">

  <img src="assets/icon.png" alt="GhostPad Logo" width="96" height="96" />

  # GhostPad — Landing Page & Portal Técnico

  **Apresentação oficial, simulador interativo e documentação de arquitetura da ponte Bluetooth de baixa latência.**

  [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
  [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
  [![Gamepad API](https://img.shields.io/badge/Gamepad_API-W3C-green?style=for-the-badge)](https://w3c.github.io/gamepad/)
  [![GitHub Pages Ready](https://img.shields.io/badge/Deploy-GitHub_Pages-blue?style=for-the-badge&logo=github)](https://pages.github.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

  <br />

  <p align="center">
    <a href="#-sobre-o-projeto">Sobre</a> &bull;
    <a href="#-principais-recursos">Recursos</a> &bull;
    <a href="#-estrutura-do-projeto">Estrutura</a> &bull;
    <a href="#-como-executar-localmente">Como Executar</a> &bull;
    <a href="#-deploy">Deploy</a> &bull;
    <a href="#-personaliza%C3%A7%C3%A3o">Personalização</a> &bull;
    <a href="#-licen%C3%A7a">Licença</a>
  </p>

</div>

---

## 📖 Sobre o Projeto

Este repositório contém a **Landing Page e Portal Técnico Oficial** do **GhostPad** — uma solução que transforma qualquer smartphone (Android ou iOS) em um receptor Bluetooth sem fio para PC, capturando os inputs de qualquer controle pela Gamepad API do navegador e emulando um controle de Xbox 360 virtual no Windows via driver de kernel ViGEmBus.

A página foi construída com foco em **alta performance**, **design futurista dark/glassmorphic** e **zero dependências externas pesadas** (Vanilla HTML5, CSS3 e JavaScript Puro).

---

## ✨ Principais Recursos

- 🎮 **Sandbox Interativo de Gamepad**:
  - Detecção real de gamepads plugados ou conectados via Bluetooth através da W3C Gamepad API nativa.
  - Simulador interativo com joystick virtual, gatilhos analógicos e botões táteis com feedback sonoro via Web Audio API.
  - Visualização em tempo real de eixos X/Y, Deadzone configurada e botões pressionados.

- 🏗️ **Explorador Interativo de Arquitetura**:
  - Navegação passo a passo pelas 4 camadas do pipeline de dados:
    1. *Entrada Física* (Bluetooth HID).
    2. *Web Runtime Client* (Gamepad API + Screen Wake Lock).
    3. *Transporte LAN* (WebSockets / TCP assíncrono).
    4. *Kernel Emulation* (Driver ViGEmBus + XInput oficial).
  - Inspeção de especificações de latência, polling rate e trechos reais de código.

- 📊 **Telemetria e Benchmarking ao Vivo**:
  - Simulação de latência (RTT), taxa de envio de pacotes e gráfico comparativo com dongles proprietários e adaptadores USB genéricos.

- 🛠️ **Central de Diagnóstico & FAQ Interativo**:
  - Guia de resolução de problemas (Firewall do Windows, stick drift, isolamento de rede Wi-Fi, driver ViGEmBus).
  - Códigos prontos para diagnóstico via PowerShell com botão de cópia com um clique.

- 📱 **100% Responsivo e Otimizado**:
  - Layout adaptável para smartphones, tablets e desktops ultrawide.
  - Suporte completo a navegação por teclado e leitor de tela (Acessibilidade / ARIA).

---

## 📁 Estrutura do Projeto

```text
landing-page/
├── assets/
│   ├── icon.ico         # Ícone do aplicativo / Favicon ICO
│   └── icon.png         # Logo em alta resolução (PNG transparente)
├── app.js               # Lógica interativa: Gamepad API, áudio, pipeline e simulador
├── index.html           # Estrutura semântica e documentação técnica completa
├── style.css            # Design System (tokens, temas escuros, glassmorphism e animações)
├── .gitignore           # Regras de exclusão do Git
└── README.md            # Este arquivo de documentação
```

---

## 🚀 Como Executar Localmente

Como a aplicação é 100% estática (HTML/CSS/JS nativo), você pode executá-la com qualquer servidor web simples:

### Opção 1: Extensão Live Server (VS Code)
1. Instale a extensão **Live Server** no VS Code.
2. Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**.

### Opção 2: Python (Nativo no Windows/Linux/Mac)
```bash
# Navegue até a pasta da landing page
cd landing-page

# Inicie o servidor HTTP embutido
python -m http.server 3000
```
Depois abra seu navegador em: `http://localhost:3000`

### Opção 3: Node.js (`npx serve`)
```bash
npx serve .
```

---

## 🌐 Deploy em Produção

A página está pronta para publicação imediata em qualquer serviço de hospedagem estática gratuita:

### GitHub Pages
1. No repositório no GitHub, vá em **Settings** > **Pages**.
2. Em **Source**, selecione a branch `main` (ou pasta raiz `/` ou `/docs` se preferir).
3. Salve e aguarde a publicação automática em `https://<seu-usuario>.github.io/<repositorio>/`.

### Vercel
```bash
# Com a CLI da Vercel instalada
vercel
```
Ou simplesmente conecte seu repositório no dashboard da [Vercel](https://vercel.com).

### Cloudflare Pages / Netlify
Basta conectar o repositório Git e definir o diretório raiz como `.` (ou `landing-page`), sem nenhum comando de build necessário.

---

## 🎨 Personalização

- **Links de Download**:
  - Edite em `index.html` as tags `<a>` que possuem os IDs `btnDownloadNav` e `heroBtnDownload` com a URL da release oficial no GitHub (ex: `https://github.com/SEU_USUARIO/ghostpad/releases/latest/download/GhostPad.exe`).
- **Cores & Variáveis de Estilo**:
  - Todas as cores de destaque (accent), fundos, bordas e gradientes estão definidos nas variáveis CSS `:root` no topo do arquivo `style.css`.
- **Favicon & Logos**:
  - Substitua os arquivos dentro da pasta `assets/` mantendo as dimensões recomendadas.

---

## 🛡️ Tecnologias Utilizadas

- **HTML5 Semântico**: Estruturação acessível com tags semânticas e conformidade W3C.
- **CSS3 Moderno**: Flexbox, CSS Grid, Custom Properties (variáveis CSS), Glassmorphism com `backdrop-filter` e animações fluidas a 60 FPS.
- **JavaScript ES6+**:
  - W3C **Gamepad API** (`navigator.getGamepads`).
  - **Web Audio API** para síntese procedural de sons táteis (sem arquivos de áudio externos).
  - **Screen Wake Lock API** e Clipboard API nativa.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo `LICENSE` no repositório principal para mais informações.
