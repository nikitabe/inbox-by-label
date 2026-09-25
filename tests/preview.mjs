const LABELS = [['Action','#ffad47'],['Needs reply','#ff5034'],['Empty','#aaaaaa']];
let state, listeners = [];
function initial() {
  return {enabled:true, countMode:'conversations', snapshot:{email:'demo@example.com',updatedAt:Date.now(),rows:LABELS.map(([name,color],i)=>({name,color,id:'l'+i,conversations:[24,57,0][i],messages:[100,101,0][i],unread:{conversations:[3,8,0][i],messages:[5,10,0][i]}}))}};
}
state=initial();
window.chrome = {runtime:{id:'fixture',sendMessage:async () => ({ok:true})},storage:{local:{get:async () => state},onChanged:{addListener:listener=>listeners.push(listener)}}};
function publish(next){state=next;for(const listener of listeners)listener(Object.fromEntries(Object.entries({...next,error:next.error}).map(([key,newValue])=>[key,{newValue}])),'local');}
const shell=document.getElementById('sidebar');
const native=document.createElement('div');native.className='nM';shell.append(native);
const sidebar=document.createElement('div');sidebar.className='TK';native.append(sidebar);
const inbox=document.createElement('div');inbox.className='aim';inbox.innerHTML='<div class="TO"><a href="#inbox">Inbox</a></div>';sidebar.append(inbox);
for(const [name] of LABELS){const wrapper=document.createElement('div');wrapper.className='aim'; const row=document.createElement('div');row.className='TO';const a=document.createElement('a');a.textContent=name;a.href='#label/'+encodeURIComponent(name);row.append(a);wrapper.append(row);sidebar.append(wrapper);}
document.getElementById('read').onclick=()=>{document.getElementById('feedback').textContent='Marked read: unread decreased, total stays unchanged.';publish({...state,snapshot:{...state.snapshot,updatedAt:Date.now(),rows:state.snapshot.rows.map((r,i)=>i?r:{...r,unread:{conversations:Math.max(0,r.unread.conversations-1),messages:Math.max(0,r.unread.messages-1)}})}});};
document.getElementById('archive').onclick=()=>{publish({...state,snapshot:{...state.snapshot,updatedAt:Date.now(),rows:state.snapshot.rows.map((r,i)=>i?r:{...r,conversations:Math.max(0,r.conversations-1),messages:Math.max(0,r.messages-1)})}});document.getElementById('feedback').textContent='Sample archived. Action count decreased.';};
document.getElementById('wrong').onclick=()=>{document.querySelector('a[aria-label]').setAttribute('aria-label','Google Account: Other (other@example.com)');publish({...state});};
document.getElementById('error').onclick=()=>publish({...state,error:'Sample network failure'});
document.getElementById('reset').onclick=()=>{document.querySelector('a[aria-label]').setAttribute('aria-label','Google Account: Demo (demo@example.com)');publish(initial());document.getElementById('feedback').textContent='';};
const script=document.createElement('script');script.src='../extension/content.js';document.body.append(script);

let rounds=0;const original=sidebar.innerHTML;const report=document.createElement('p');report.id='regression';document.body.append(report);
const stress=setInterval(()=>{sidebar.innerHTML=original;publish({...state,snapshot:{...state.snapshot,updatedAt:Date.now()}});rounds++;if(rounds===20){clearInterval(stress);setTimeout(()=>{const host=document.getElementById('inbox-by-label');report.textContent=host?.nextElementSibling===native && !native.contains(host) && sidebar.innerHTML===original && document.querySelectorAll('#inbox-by-label').length===1 ? 'PASS: 20 native sidebar rebuilds; no native rows changed; one independent section.' : 'FAIL: sidebar isolation';},500);}},300);

const oldButton=document.createElement('button');oldButton.textContent='Simulate expired counts';document.querySelector('.details').append(oldButton);oldButton.onclick=()=>publish({...state,snapshot:{...state.snapshot,updatedAt:Date.now()-600000}});
