'use strict';
const KEY='mis_finanzas_v1';const MONTH='2026-11';const money=n=>'$'+Math.round(n||0).toLocaleString('es-CL');
const categories=['Supermercado','Combustible','Perfumes','Vestuario','Regalos','Suscripciones','Mascotas','Restaurantes','Delivery','Hogar','Hogar / Mantenciones','Salud','Otros'];
const mk=(id,description,amount,date,account,category,billingMonth='2026-11',installmentCount=1,type='expense',isSeed=true)=>({id,description,amount,date,account,category,billingMonth,installmentCount,type,isSeed});
function seed(){return {balance:197999,savings:1000000,budgets:{Supermercado:200000,Combustible:120000,Mascotas:115000,Restaurantes:50000,Delivery:50000},movements:[
mk('s1','HC La Serena Balmaceda',28096,'2026-08-15','TC Santander','Otros'),mk('s2','Perfumes Dreams (cuota)',29363,'2026-09-12','TC Santander','Perfumes'),mk('s3','Saxoline (cuota)',16763,'2026-10-20','TC Santander','Vestuario'),
mk('s4','Invictus EDT',66990,'2026-10-30','TC Santander','Perfumes',MONTH,3),mk('s5','Zapatillas Marcela',49990,'2026-11-01','TC Santander','Vestuario',MONTH,3),mk('s6','Jumbo Ulriksen',54782,'2026-10-26','TC Santander','Supermercado'),mk('s7','Falabella regalo',20240,'2026-10-31','TC Santander','Regalos'),mk('s8','Claude',23812,'2026-10-28','TC Santander','Suscripciones'),mk('s9','Hiper 4 Esquina',21725,'2026-11-02','TC Santander','Supermercado'),mk('s10','Disfraz Mercado Libre',28490,'2026-10-29','TC Santander','Otros'),mk('s11','FL Cloud',49200,'2026-11-01','TC Santander','Suscripciones'),
mk('t1','Mercado Libre (cuota 4/6)',13325,'2026-11-01','TC Tenpo','Otros'),mk('t2','Mercado Libre (cuota 2/3)',14530,'2026-11-01','TC Tenpo','Otros'),mk('t3','CIC (cuota 2/3)',11660,'2026-11-01','TC Tenpo','Hogar'),mk('t4','Mercado Pago (cuota 1/3)',45222,'2026-11-01','TC Tenpo','Otros',MONTH,3),mk('t5','SuperZoo (cuota 1/3)',96771,'2026-11-01','TC Tenpo','Mascotas',MONTH,3),mk('d1','Combustible pagado con débito',70000,'2026-11-01','Cta. cte. Santander','Combustible')],refunds:[{id:'r1',description:'Disfraz Mercado Libre',amount:28490,account:'TC Santander',status:'pending'},{id:'r2',description:'FL Cloud',amount:49200,account:'TC Santander',status:'pending'},{id:'r3',description:'Seguro SURA',amount:77161,account:'Cta. cte. Santander',status:'pending'}],plans:[{name:'HC Balmaceda',amounts:[28096],next:'2026-11'},{name:'Perfumes Dreams',amounts:[29363,29363],next:'2026-11'},{name:'Saxoline',amounts:[16764,16763],next:'2026-11'},{name:'Mercado Libre Tenpo (6)',amounts:[13325,13325,13325],next:'2026-11'},{name:'Mercado Libre Tenpo (3)',amounts:[14530,14530],next:'2026-11'},{name:'CIC Tenpo',amounts:[11660,11660],next:'2026-11'}],adjustmentSantander:1};}
let editingId=null;
let state;try{state=JSON.parse(localStorage.getItem(KEY))||seed()}catch{state=seed()};function migrate(){if(state.accountVersion===2)return;const names={'Santander':'TC Santander','Tenpo':'TC Tenpo','Débito':'Cta. cte. Santander','Banco':'Cta. cte. Santander'};for(const m of state.movements){m.account=names[m.account]||m.account;if(m.id==='t4'&&m.amount===15074)m.amount=45222;if(m.id==='t5'&&m.amount===32257)m.amount=96771;if(m.description.toLowerCase().includes('vidrier')){m.category='Hogar / Mantenciones';if(m.account==='Cta. cte. Santander'&&m.type==='expense')state.balance-=m.amount;}}for(const r of state.refunds)r.account=names[r.account]||r.account;state.accountVersion=2;persist()}function persist(){localStorage.setItem(KEY,JSON.stringify(state))}migrate();function el(id){return document.getElementById(id)}function monthAdd(ym,n){let [y,m]=ym.split('-').map(Number);let d=new Date(y,m-1+n,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function due(m,month=MONTH){if(m.type!=='expense')return 0;let i=(+month.slice(0,4)-+m.billingMonth.slice(0,4))*12+(+month.slice(5)-+m.billingMonth.slice(5));if(i<0||i>=m.installmentCount)return 0;return Math.floor(m.amount/m.installmentCount)+(i===m.installmentCount-1?m.amount%m.installmentCount:0)}
function totals(){let s=0,t=0;for(const m of state.movements){if(m.account==='TC Santander')s+=due(m);if(m.account==='TC Tenpo')t+=due(m)}s+=(state.adjustmentSantander||0);let returns=state.refunds.filter(r=>r.account==='TC Santander'&&r.status==='pending').reduce((a,r)=>a+r.amount,0);return{s,t,returns,net:s-returns,total:s-returns+t}}
function safe(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function notify(msg){let n=el('notice');n.textContent=msg;n.style.display='block';setTimeout(()=>n.style.display='none',2800)}
function render(){const t=totals();el('balance').textContent=money(state.balance);el('savings').textContent=money(state.savings);el('santander').textContent=money(t.net);el('tenpo').textContent=money(t.t);el('sGross').textContent=money(t.s);el('sReturns').textContent='−'+money(t.returns);el('sNet').textContent=money(t.net);el('tTotal').textContent=money(t.t);el('cardsTotal').textContent=money(t.total);
let refundSum=state.refunds.filter(r=>r.status==='pending').reduce((a,r)=>a+r.amount,0);el('refundTotal').textContent=money(refundSum);el('refunds').innerHTML=state.refunds.map(r=>`<div class="entry"><div><strong>${safe(r.description)}</strong><span class="muted">${safe(r.account)} · ${r.status==='pending'?'Pendiente':'Recibido'}</span></div><div style="text-align:right"><strong>${money(r.amount)}</strong><button class="secondary small" onclick="toggleRefund('${r.id}')">${r.status==='pending'?'Marcar recibido':'Reabrir'}</button></div></div>`).join('');
let spent={};for(const m of state.movements){if(m.type==='expense'){spent[m.category]=(spent[m.category]||0)+due(m)}}
el('budgets').innerHTML=Object.entries(state.budgets).map(([name,b])=>{let v=spent[name]||0,p=Math.min(100,v/b*100);return `<div style="margin-bottom:17px"><div class="flex"><strong>${safe(name)}</strong><span class="small">${money(v)} / ${money(b)}</span></div><div class="bar"><div class="fill" style="width:${p}%;background:${v>b?'#e49b63':'#51a8f6'}"></div></div><div class="small muted">${v>b?'Exceso '+money(v-b):'Disponible '+money(b-v)}</div></div>`}).join('');
let recent=[...state.movements].filter(m=>!m.isSeed).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);el('recentMovements').innerHTML=recent.length?recent.map(m=>`<div class="entry"><div><strong>${safe(m.description)}</strong><span class="muted">${safe(m.date)} · ${safe(m.account)} · ${safe(m.category)}</span></div><strong>${m.type==='expense'?'−':'+'}${money(m.amount)}</strong></div>`).join(''):'<div class="empty">Sin movimientos nuevos</div>';let filter=el('accountFilter').value;let list=state.movements.filter(m=>!filter||m.account===filter).sort((a,b)=>b.date.localeCompare(a.date));el('movementList').innerHTML=list.length?list.map(m=>`<div class="entry"><div><strong>${safe(m.description)}</strong><span class="muted">${safe(m.date)} · ${safe(m.account)} · ${safe(m.category)}${m.installmentCount>1?' · '+m.installmentCount+' cuotas':''}</span></div><div style="text-align:right"><strong>${money(due(m)||m.amount)}</strong><button class="secondary small" onclick="editMovement('${m.id}')">Editar</button> <button class="danger small" onclick="removeMovement('${m.id}')">Eliminar</button></div></div>`).join(''):'<div class="empty">No hay movimientos</div>';
let installmentLines=state.movements.filter(m=>m.installmentCount>1).map(m=>{let rem=[];for(let i=0;i<m.installmentCount;i++){let month=monthAdd(m.billingMonth,i);if(month>MONTH)rem.push(`${month}: ${money(due(m,month))}`)}return rem.length?`<div class="entry"><div><strong>${safe(m.description)}</strong><span class="muted">${rem.join(' · ')}</span></div></div>`:''}).join('');el('installments').innerHTML=installmentLines||'<div class="empty">Sin cuotas nuevas pendientes</div>';
let sorted=Object.entries(spent).sort((a,b)=>b[1]-a[1]);el('categories').innerHTML=sorted.map(([name,val])=>`<div class="entry"><span>${safe(name)}</span><strong>${money(val)}</strong></div>`).join('');let max=Math.max(...Object.values(state.budgets),1);el('bars').innerHTML=`<div class="chart">${Object.entries(state.budgets).map(([name,b])=>`<div><div class="column" style="height:${Math.round((spent[name]||0)/max*95)}px"></div>${safe(name.slice(0,8))}</div>`).join('')}</div><p class="hint">Barras: consumo registrado de cada categoría. Compara el detalle en Inicio contra su límite presupuestado.</p>`;
el('balanceInput').value=state.balance;el('savingsInput').value=state.savings;el('budgetEditor').innerHTML=Object.entries(state.budgets).map(([name,val])=>`<label>${safe(name)} ($)<input type="number" min="0" data-budget="${safe(name)}" value="${val}"></label>`).join('');}
function navigate(view){document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id===view));document.querySelectorAll('.nav button[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view===view));el('heading').textContent=({inicio:'Resumen de noviembre',movimientos:'Movimientos',tarjetas:'Tarjetas y cuotas',analisis:'Análisis de gastos',ajustes:'Configuración'})[view];scrollTo(0,0);render()}
function openForm(){editingId=null;el('formHeading').textContent='Nuevo movimiento';el('formSubmit').textContent='Guardar';el('movementForm').reset();el('movementForm').elements.date.value=new Date().toISOString().slice(0,10);el('movementForm').elements.billingMonth.value=MONTH;el('movementDialog').showModal()}
el('categorySelect').innerHTML=categories.map(c=>`<option>${c}</option>`).join('');function editMovement(id){
 const m=state.movements.find(x=>x.id===id);if(!m)return;
 editingId=id;const f=el('movementForm');f.reset();
 for(const field of ['description','amount','date','account','type','category','billingMonth','installmentCount'])f.elements[field].value=m[field];
 el('formHeading').textContent='Editar movimiento';el('formSubmit').textContent='Guardar cambios';el('movementDialog').showModal();
}
function bankEffect(m){return m.account==='Cta. cte. Santander'&&!m.isSeed?(m.type==='expense'?-m.amount:m.amount):0}
function validForm(m){return Number.isSafeInteger(m.amount)&&m.amount>0&&Number.isInteger(m.installmentCount)&&m.installmentCount>=1&&m.installmentCount<=48&&m.description.length>0&&/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(m.date)&&/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(m.billingMonth)&&!(m.installmentCount>1&&!m.account.startsWith('TC '))}
el('movementForm').addEventListener('submit',e=>{
 e.preventDefault();const f=new FormData(e.target);
 const m=mk(editingId||'u'+Date.now(),String(f.get('description')).trim(),Number(f.get('amount')),f.get('date'),f.get('account'),f.get('category'),f.get('billingMonth'),Number(f.get('installmentCount')),f.get('type'),false);
 if(!validForm(m))return notify('Revisa fecha, monto, cuenta y cuotas');
 if(editingId){const index=state.movements.findIndex(x=>x.id===editingId);if(index<0)return notify('Movimiento no encontrado');const old=state.movements[index];m.isSeed=old.isSeed;state.balance+=bankEffect(m)-bankEffect(old);state.movements[index]=m}
 else{state.movements.push(m);state.balance+=bankEffect(m)}
 persist();editingId=null;el('movementDialog').close();render();notify('Movimiento guardado');
});
function removeMovement(id){if(!confirm('¿Eliminar este movimiento?'))return;let old=state.movements.find(m=>m.id===id);if(old)state.balance-=bankEffect(old);state.movements=state.movements.filter(m=>m.id!==id);persist();render()}
function toggleRefund(id){let r=state.refunds.find(x=>x.id===id);if(!r)return;r.status=r.status==='pending'?'received':'pending';persist();render();notify(r.status==='received'?'Marcado recibido. Revisa el saldo bancario por separado.':'Reembolso pendiente nuevamente')}
function saveBalances(){state.balance=Number(el('balanceInput').value)||0;state.savings=Number(el('savingsInput').value)||0;persist();render();notify('Saldos guardados')}
function saveBudgets(){document.querySelectorAll('[data-budget]').forEach(e=>state.budgets[e.dataset.budget]=Number(e.value)||0);persist();render();notify('Presupuestos guardados')}
function exportData(){let blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mis-finanzas-respaldo-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function importData(event){let f=event.target.files[0];if(!f)return;try{let x=JSON.parse(await f.text());if(!x||!Array.isArray(x.movements)||!Array.isArray(x.refunds)||!x.budgets||typeof x.budgets!=='object'||!Number.isFinite(x.balance)||!Number.isFinite(x.savings)||!x.movements.every(m=>m&&typeof m.id==='string'&&typeof m.description==='string'&&Number.isFinite(m.amount)&&typeof m.account==='string'))throw Error('Formato inválido');if(!confirm('¿Reemplazar los datos actuales por este respaldo?'))return;state=x;state.accountVersion=2;persist();render();notify('Respaldo importado')}catch(e){notify('No se pudo importar: '+e.message)}event.target.value=''}
function resetData(){if(confirm('¿Restaurar datos iniciales? Se perderán los cambios locales.')){state=seed();persist();render()}}

// Importacion local desde ChatGPT. Enlace: #importar=BASE64URL(JSON UTF-8).
const CHAT_ACCOUNTS=['Cta. cte. Santander','TC Santander','TC Tenpo','Efectivo'];
let pendingChatImport=null;
function openImportDialog(raw=''){pendingChatImport=null;el('chatImportText').value=raw;el('chatImportPreview').style.display='none';el('chatImportSave').disabled=true;el('chatImportDialog').showModal();if(raw)previewChatImport()}
function closeImportDialog(){el('chatImportDialog').close();pendingChatImport=null}
function parseChatImport(raw){
 const m=JSON.parse(raw);if(!m||Array.isArray(m)||typeof m!=='object')throw Error('Se espera un movimiento JSON');
 const description=String(m.description||'').trim();if(!description||description.length>90)throw Error('Descripción inválida');
 const amount=Number(m.amount),installmentCount=Number(m.installmentCount??1);
 if(!Number.isSafeInteger(amount)||amount<1||amount>1000000000)throw Error('Monto inválido');
 if(!Number.isInteger(installmentCount)||installmentCount<1||installmentCount>48)throw Error('Cuotas inválidas');
 if(!CHAT_ACCOUNTS.includes(m.account))throw Error('Cuenta no reconocida');
 if(!categories.includes(m.category))throw Error('Categoría no reconocida');
 if(!['expense','income','refund'].includes(m.type||'expense'))throw Error('Tipo inválido');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(m.date)||!Number.isFinite(Date.parse(m.date+'T12:00:00Z'))||new Date(m.date+'T12:00:00Z').toISOString().slice(0,10)!==m.date)throw Error('Fecha inválida');
 const billingMonth=m.billingMonth||m.date.slice(0,7);
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(billingMonth))throw Error('Mes de facturación inválido');
 if(installmentCount>1&&!m.account.startsWith('TC '))throw Error('Las cuotas requieren una tarjeta de crédito');
 return {description,amount,date:m.date,account:m.account,category:m.category,billingMonth,installmentCount,type:m.type||'expense'};
}
function duplicateChatImport(m){return state.movements.some(x=>x.description.trim().toLowerCase()===m.description.toLowerCase()&&x.amount===m.amount&&x.date===m.date&&x.account===m.account&&x.type===m.type)}
function previewChatImport(){try{const m=parseChatImport(el('chatImportText').value.trim());pendingChatImport=m;let duplicate=duplicateChatImport(m);el('chatImportPreview').innerHTML=`<strong>${safe(m.description)}</strong><div class="big">${money(m.amount)}</div><p class="hint">${safe(m.date)} · ${safe(m.account)} · ${safe(m.category)} · ${m.installmentCount} cuota(s) · Factura ${safe(m.billingMonth)} · ${safe(m.type)}</p>${duplicate?'<p class="warning">Posible duplicado: este movimiento ya está registrado.</p>':''}`;el('chatImportPreview').style.display='block';el('chatImportSave').disabled=duplicate;if(duplicate)notify('Movimiento posiblemente duplicado')}catch(e){pendingChatImport=null;el('chatImportSave').disabled=true;el('chatImportPreview').style.display='none';notify('Error: '+e.message)}}
function saveChatImport(){if(!pendingChatImport)return;const m=pendingChatImport;if(duplicateChatImport(m)){notify('Ya existe un movimiento igual');return}const entry=mk('chat'+Date.now(),m.description,m.amount,m.date,m.account,m.category,m.billingMonth,m.installmentCount,m.type,false);state.movements.push(entry);if(m.account==='Cta. cte. Santander')state.balance+=(m.type==='expense'?-m.amount:m.amount);persist();closeImportDialog();render();notify('Importado y guardado correctamente')}
function loadChatLink(){
 // Compatible con enlaces antiguos #importar= y nuevos ?importar=.
 // No elimina la URL hasta haber validado el movimiento.
 let payload='';
 try {
  const params=new URLSearchParams(location.search);
  payload=params.get('importar')||'';
  if(!payload&&location.hash.startsWith('#importar='))payload=location.hash.substring('#importar='.length);
  if(!payload)return;
  payload=decodeURIComponent(payload).replace(/-/g,'+').replace(/_/g,'/').replace(/\s/g,'');
  payload+='='.repeat((4-payload.length%4)%4);
  const bytes=Uint8Array.from(atob(payload),c=>c.charCodeAt(0));
  const raw=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
  parseChatImport(raw); // Valida antes de mostrar confirmación.
  openImportDialog(raw);
  history.replaceState(null,'',location.pathname);
 }catch(e){notify('No se pudo abrir la importación: '+e.message);}
}
window.addEventListener('hashchange',loadChatLink);
loadChatLink();

render();if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js?v=6', {updateViaCache:'none'}).catch(()=>{});
