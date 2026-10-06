/* Eletropel WhatsApp Web helper.
   Prepara imagem + legenda, mas NÃO clica em Enviar. */
const sleep = ms => new Promise(r => setTimeout(r, ms));

function getCaptionFromUrl(){
  try { return new URL(location.href).searchParams.get('text') || ''; } catch { return ''; }
}
function findEditable(){
  const els=[...document.querySelectorAll('div[contenteditable="true"]')];
  return els.find(e=>e.getAttribute('role')==='textbox' || /Mensagem|Type a message|Digite uma mensagem/i.test(e.getAttribute('data-placeholder')||'')) || els[els.length-1] || null;
}
function setText(el,text){
  if(!el)return false;
  el.focus();
  const sel=window.getSelection(); const range=document.createRange(); range.selectNodeContents(el); range.collapse(false); sel.removeAllRanges(); sel.addRange(range);
  document.execCommand('insertText',false,text);
  el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:text}));
  return true;
}
async function waitFor(fn,timeout=12000,step=250){
  const end=Date.now()+timeout;
  while(Date.now()<end){ const v=fn(); if(v)return v; await sleep(step); }
  return null;
}
async function injectImage(){
  const url=chrome.runtime.getURL('convite.png');
  const res=await fetch(url); const blob=await res.blob();
  const file=new File([blob],'convite.png',{type:blob.type||'image/png'});
  const input=await waitFor(()=>[...document.querySelectorAll('input[type="file"]')].find(i=>/image|video|jpeg|png/i.test(i.accept||'')) || document.querySelector('input[type="file"]'),15000);
  if(!input) throw new Error('Campo de imagem do WhatsApp não encontrado.');
  const dt=new DataTransfer(); dt.items.add(file); input.files=dt.files;
  input.dispatchEvent(new Event('change',{bubbles:true}));
  return true;
}
async function prepare(){
  const caption=getCaptionFromUrl();
  if(!caption)return;
  await sleep(1800);
  // Se o WhatsApp ainda estiver carregando, espera pela área de conversa.
  await waitFor(()=>findEditable(),15000);
  try {
    await injectImage();
  } catch(e) {
    console.warn('[Eletropel] imagem:',e);
    // Continua para deixar pelo menos a legenda disponível.
    const el=findEditable(); if(el) setText(el,caption);
    return;
  }
  // Ao selecionar a mídia, o WhatsApp abre o compositor de prévia. Aguarda e preenche a legenda.
  const captionBox=await waitFor(()=>findEditable(),15000);
  if(captionBox){
    await sleep(500);
    setText(captionBox,caption);
    document.title='Eletropel • imagem + legenda prontas';
    setTimeout(()=>{document.title='WhatsApp';},2500);
  }
}

let lastUrl=location.href;
(async()=>{await prepare();})();
setInterval(()=>{
  if(location.href!==lastUrl){ lastUrl=location.href; prepare(); }
},1000);
