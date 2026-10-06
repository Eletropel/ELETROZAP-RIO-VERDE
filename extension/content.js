/* Heurística para WhatsApp Web. O DOM do WhatsApp pode mudar; o envio NÃO é automatizado. */
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function findComposer(){return document.querySelector('div[contenteditable="true"][data-tab]')||document.querySelector('div[contenteditable="true"]');}
async function setCaption(text){let el=findComposer();if(!el)return false;el.focus();document.execCommand('insertText',false,text);el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:text}));return true;}
async function prepare(caption){
  await sleep(1200);
  // A extensão não injeta arquivo diretamente por caminho local. A etapa de imagem fica preparada via clipboard/browser UI quando suportada.
  // Para manter compatibilidade e evitar envio automático, colocamos a legenda no compositor e sinalizamos a etapa da imagem.
  await setCaption(caption||'');
  const old=document.title;document.title='Eletropel • legenda pronta';setTimeout(()=>document.title=old,1800);
}
chrome.runtime.onMessage.addListener((m)=>{if(m.type==='prepare')prepare(m.caption)});
