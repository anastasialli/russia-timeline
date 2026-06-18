
let all=[];const tl=document.getElementById('timeline');
fetch('events.json').then(r=>r.json()).then(d=>{all=d;render(d);
const cats=[...new Set(d.map(x=>x.category))];
filters.innerHTML='<button onclick="render(all)">Все</button>'+cats.map(c=>`<button onclick="render(all.filter(x=>x.category==='${c}'))">${c}</button>`).join('');
});
function render(arr){tl.innerHTML='';arr.forEach(e=>{const div=document.createElement('div');div.className='event';div.innerHTML=`<div class="card"><div class="date">${e.date}</div><h2>${e.title}</h2><img src="${e.image}"><p>${e.description}</p><small>${e.category}</small></div>`;tl.appendChild(div);});document.querySelectorAll('.card img').forEach(i=>i.onclick=()=>{lightbox.style.display='flex';lightboxImg.src=i.src});}
search.oninput=e=>{const q=e.target.value.toLowerCase();render(all.filter(x=>JSON.stringify(x).toLowerCase().includes(q)))}
lightbox.onclick=()=>lightbox.style.display='none';
