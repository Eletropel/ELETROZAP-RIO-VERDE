const MSG = `Olá, {NOME}! 

A Eletropel tem uma novidade muito especial para você! 🎉

Estamos inaugurando nossa nova filial em Rio Verde/GO e queremos convidar você para estar conosco nesse momento.

📅 07/10 — quarta-feira
🕘 Às 9h
📍 Av. Presidente Vargas, nº 3027
QD 44 • LT 04 • Vila Maria — Rio Verde/GO

Você é nosso convidado especial!

Esperamos você! ❤️💛

Eletropel — Distribuidora de Auto Peças
📲 (64) 3050-9700
;

let clients = JSON.parse(localStorage.getItem('eletropel_clients') || '[]');
let current = -1;
const $ = id => document.getElementById(id);

function persist(){ localStorage.setItem('eletropel_clients', JSON.stringify(clients)); }
function cleanPhone(v){
  let d = String(v ?? '').normalize('NFKC').replace(/\D/g,'');
  if ((d.length===10 || d.length===11) && !d.startsWith('55')) d='55'+d;
  return d;
}
function displayName(raw){
  let s = String(raw || '').replace(/\s+/g,' ').trim();
  // Remove códigos numéricos no começo, como "48.678.622 " ou "12345 - ".
  s = s.replace(/^\s*\d[\d.\/-]*\s*[-–—:]?\s*/,'');
  return s || 'cliente';
}
function msg(c){ return MSG.replace('{NOME}', displayName(c.name)); }
function esc(s){ return String(s ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }

function render(){
  const total=clients.length;
  const p=clients.filter(x=>x.status==='PENDENTE'||x.status==='EM_ATENDIMENTO').length;
  const s=clients.filter(x=>x.status==='ENVIADO').length;
  const e=clients.filter(x=>x.status==='ERRO').length;
  $('total').textContent=total; $('pending').textContent=p; $('sent').textContent=s; $('errors').textContent=e;
  if(current>=0 && clients[current]) show(false);
  else { $('name').textContent=total?'Selecione um cliente':'Nenhum cliente carregado'; $('phone').textContent='—'; $('message').value=''; }
  const q=$('search').value.toLowerCase();
  $('list').innerHTML=clients.map((c,i)=>({c,i})).filter(o=>`${o.c.name} ${o.c.phone}`.toLowerCase().includes(q)).slice(0,150).map(o=>
    `<div class="row" data-i="${o.i}"><div><b>${esc(displayName(o.c.name))}</b><br><small>${esc(o.c.phone)}</small></div><div class="status ${esc(o.c.status)}">${esc(o.c.status)}</div><div></div></div>`
  ).join('');
  document.querySelectorAll('.row').forEach(r=>r.onclick=()=>select(+r.dataset.i));
  const done=s+e; $('bar').style.width=total ? (done/total*100)+'%' : '0%'; $('progressText').textContent=`${done} / ${total}`;
}
function show(mark=true){
  const c=clients[current]; if(!c)return;
  $('name').textContent=displayName(c.name); $('phone').textContent=c.phone; $('message').value=msg(c);
  if(mark && c.status==='PENDENTE'){ c.status='EM_ATENDIMENTO'; persist(); }
}
function select(i){ current=i; show(); render(); }
function next(){
  let i=clients.findIndex(x=>x.status==='PENDENTE');
  if(i<0)i=clients.findIndex(x=>x.status==='ERRO');
  if(i<0){alert('Não há mais clientes pendentes.');return;}
  current=i; show(); render(); openWhatsApp();
}
function openWhatsApp(){
  if(current<0 || !clients[current]) return;
  const c=clients[current];
  const text=msg(c);
  // A extensão do Chrome lê text/phone da URL e prepara a imagem + legenda.
  const url=`https://web.whatsapp.com/send?phone=${encodeURIComponent(c.phone)}&eletro_caption=${encodeURIComponent(text)}`;
  window.postMessage({type:'ELETRO_CAPTION',caption:text},'*');
  setTimeout(()=>window.open(url,'_blank'),250);
}
$('open').onclick=openWhatsApp;
$('sentBtn').onclick=()=>{
  if(current<0)return;
  const old=current; clients[current].status='ENVIADO'; clients[current].sentAt=new Date().toISOString(); persist();
  let i=clients.findIndex((x,j)=>j>old && x.status==='PENDENTE'); if(i<0)i=clients.findIndex(x=>x.status==='PENDENTE');
  current=i; render(); if(i>=0) show(false);
};
$('skipBtn').onclick=()=>{if(current<0)return;clients[current].status='ERRO';persist();next()};
$('search').oninput=render;
$('file').onchange=async e=>{
  const f=e.target.files[0]; if(!f)return;
  try{
    const data=await f.arrayBuffer();
    const wb=XLSX.read(data,{type:'array',cellDates:false});
    const ws=wb.Sheets[wb.SheetNames[0]];
    const rows=XLSX.utils.sheet_to_json(ws,{defval:'',raw:false});
    const out=rows.map(r=>{
      const keys=Object.keys(r);
      const nameKey=keys.find(k=>/^(nome|nome completo|razao social|razão social|nome fantasia|cliente)$/i.test(String(k).trim()))
        || keys.find(k=>/nome|raz[aã]o social|fantasia|cliente/i.test(String(k)));
      const phoneKey=keys.find(k=>/^(telefone|celular|whatsapp|fone|phone)$/i.test(String(k).trim()))
        || keys.find(k=>/telefone|celular|whatsapp|fone|phone/i.test(String(k)));
      return {name:String(r[nameKey||keys[0]]||'').trim(), phone:cleanPhone(r[phoneKey||keys[1]]), status:'PENDENTE'};
    }).filter(x=>x.phone.length>=12);
    const seen=new Set();
    const unique=out.filter(x=>{if(seen.has(x.phone))return false;seen.add(x.phone);return true;});
    clients=unique; current=-1; persist(); render(); alert(`${unique.length} clientes carregados.\n${out.length-unique.length} duplicados foram removidos.`);
  }catch(err){alert('Não consegui ler o arquivo: '+err.message)}
};
render();
