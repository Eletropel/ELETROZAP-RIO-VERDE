/* Eletropel WhatsApp Web helper (v1.2)
   Anexa a imagem (colando no chat) e preenche a legenda. NÃO clica em Enviar. */
const KEY = 'eletro_caption_pending';
const log = (...a) => console.log('[Eletropel]', ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Guarda a legenda assim que a página carrega (o WhatsApp apaga os parâmetros da URL depois).
log('extensão carregada v1.10');
(function capture() {
  try {
    const c = new URL(location.href).searchParams.get('eletro_caption');
    if (c) sessionStorage.setItem(KEY, c);
  } catch {}
})();

async function waitFor(fn, timeout = 15000, step = 100) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const v = fn();
    if (v) return v;
    await sleep(step);
  }
  return null;
}

const visible = el => !!(el && (el.offsetParent || el.getClientRects().length));

// Caixa de mensagem principal (rodapé do chat)
function findComposer() {
  const all = [...document.querySelectorAll('div[contenteditable="true"]')].filter(visible);
  return all.find(e => e.closest('footer')) || all.find(e => e.getAttribute('data-tab') === '10') || all.find(e => !e.closest('#side') && !e.closest('header')) || null;
}

// Caixa de legenda do preview de mídia: qualquer campo editável que NÃO seja a caixa principal
let mainComposer = null;
function findCaptionBox() {
  const list = [...document.querySelectorAll('div[contenteditable="true"]')].filter(el =>
    visible(el) && !el.closest('#side') && !el.closest('header') &&
    el !== mainComposer && !(mainComposer && mainComposer.contains(el)) && !el.contains(mainComposer)
  );
  if (!list.length) return null;
  return list.find(el => /legenda|caption/i.test((el.getAttribute('aria-label') || '') + (el.getAttribute('data-placeholder') || ''))) || list[list.length - 1];
}

// Insere texto preservando as quebras de linha (cola como texto puro; o WhatsApp mantém os \n)
async function setText(el, text) {
  el.focus();
  const sel = getSelection();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);

  const dt = new DataTransfer();
  dt.setData('text/plain', text);
  el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  await sleep(150);
  if (el.textContent.trim()) return;

  // Reserva: digita linha por linha com Shift+Enter
  log('colar texto falhou, digitando linha por linha');
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]) document.execCommand('insertText', false, lines[i]);
    if (i < lines.length - 1) {
      const k = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, shiftKey: true, bubbles: true, cancelable: true };
      el.dispatchEvent(new KeyboardEvent('keydown', k));
      el.dispatchEvent(new KeyboardEvent('keyup', k));
    }
  }
}

async function loadFile() {
  const res = await fetch(chrome.runtime.getURL('convite.png'));
  const blob = await res.blob();
  return new File([blob], 'convite.png', { type: blob.type || 'image/png' });
}

// Método 1: colar a imagem na caixa de mensagem (abre o preview com legenda)
function pasteImage(composer, file) {
  composer.focus();
  const dt = new DataTransfer();
  dt.items.add(file);
  const ev = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
  composer.dispatchEvent(ev);
}

// Método 2 (reserva): abrir o menu de anexo e usar o input de arquivo
async function attachViaInput(file) {
  const btn = document.querySelector('footer [data-icon="plus"], footer [data-icon="plus-rounded"], footer [data-icon="clip"], footer [data-icon="attach-menu-plus"]');
  if (btn) (btn.closest('button, [role="button"]') || btn).click();
  const input = await waitFor(() =>
    findPhotoInput, 5000);
  if (!input) return false;
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

async function getCaption() {
  const s = sessionStorage.getItem(KEY);
  if (s) return s;
  try {
    const r = await chrome.storage.local.get('eletro');
    if (r.eletro && Date.now() - r.eletro.ts < 120000) return r.eletro.caption;
  } catch {}
  return '';
}
function clearCaption() {
  sessionStorage.removeItem(KEY);
  try { chrome.storage.local.remove('eletro'); } catch {}
}

function findPhotoInput() {
  return [...document.querySelectorAll('input[type="file"]')].find(i => {
    const a = (i.accept || '').toLowerCase();
    return a.includes('video') && a.includes('image') && !a.includes('webp');
  }) || null;
}

let running = false;
async function prepare() {
  if (running) return;
  running = true;
  const caption = await getCaption();
  if (!caption) { running = false; return; }
  log('legenda encontrada, aguardando chat...');
  try {
    const composer = await waitFor(findComposer, 60000);
    if (!composer) { log('caixa de mensagem NÃO encontrada'); return; }
    log('chat pronto, colando imagem...');
    await sleep(900);
    const file = await loadFile();

    mainComposer = composer;
    // Legenda primeiro: escreve na caixa de mensagem; o WhatsApp leva o texto para a legenda da imagem
    await setText(composer, caption);
    log('legenda escrita na caixa de mensagem');
    await sleep(100);
    let box = null;
    // Até 3 tentativas: 1) campo de fotos, 2) colar, 3) campo de fotos de novo.
    // Só repete se o preview NÃO abriu (box vazio), então não duplica a imagem.
    for (let tentativa = 1; tentativa <= 3 && !box; tentativa++) {
      if (tentativa === 2) {
        log('preview não abriu, tentando colar a imagem...');
        pasteImage(composer, file);
        clearCaption();
      } else {
        const input = await waitFor(findPhotoInput, 8000);
        if (input) {
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
          clearCaption(); // evita reinjetar a imagem em outra execução
          log('imagem enviada ao campo de arquivo (tentativa ' + tentativa + ')');
        } else {
          log('campo de fotos não encontrado (tentativa ' + tentativa + ')');
        }
      }
      box = await waitFor(findCaptionBox, 6000);
    }
    if (!box) throw new Error('Não consegui abrir o preview da imagem.');

    await sleep(250);
    if (!box.textContent.trim()) await setText(box, caption); // só preenche se o WhatsApp não levou o texto
    log('legenda inserida');
    document.title = 'Eletropel • imagem + legenda prontas';
    setTimeout(() => { document.title = 'WhatsApp'; }, 2500);
  } catch (e) {
    console.warn('[Eletropel]', e);
  } finally {
    running = false;
  }
}

window.addEventListener('load', prepare);
setInterval(prepare, 500);
