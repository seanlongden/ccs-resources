const menu=document.querySelector('#menu');
menu?.addEventListener('click',()=>{const open=document.body.classList.toggle('nav-open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close':'Menu';});
document.querySelectorAll('.copy').forEach(button=>button.addEventListener('click',async()=>{
  const text=button.parentElement.querySelector('code').textContent;
  try{await navigator.clipboard.writeText(text);button.textContent='Copied';setTimeout(()=>button.textContent='Copy instruction',1800);}catch{button.textContent='Select the text below to copy';}
}));
let documents;
const input=document.querySelector('#search'),results=document.querySelector('#search-results');
input?.addEventListener('input',async()=>{
  const query=input.value.trim().toLowerCase();
  results.replaceChildren();if(query.length<2)return;
  try{documents??=await fetch('/api/preview-search').then(r=>{if(!r.ok)throw Error('Search unavailable');return r.json();});
    if(input.value.trim().toLowerCase()!==query)return;
    const terms=query.split(/\s+/),found=documents.filter(p=>terms.every(t=>(p.title+' '+p.description+' '+p.text).toLowerCase().includes(t))).slice(0,12);
    if(!found.length){const p=document.createElement('p');p.textContent='No matching lessons. Try a shorter word.';results.append(p);}
    for(const page of found){const a=document.createElement('a');a.href='/resources/'+page.slug;a.textContent=page.title;results.append(a);}
  }catch{results.textContent='Search is unavailable. Use the track links below.';}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('nav-open');menu?.setAttribute('aria-expanded','false');if(menu)menu.textContent='Menu';}});
