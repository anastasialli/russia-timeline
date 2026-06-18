let all = [];
const tl = document.getElementById('timeline');
const filtersEl = document.getElementById('filters');
 
fetch('events.json').then(r => r.json()).then(d => {
  all = d;
  render(d);
 
  const cats = [...new Set(d.map(x => x.category))];
 
  // Кнопка "Все"
  const btnAll = document.createElement('button');
  btnAll.textContent = 'Все';
  btnAll.addEventListener('click', () => render(all));
  filtersEl.appendChild(btnAll);
 
  // Кнопки по категориям
  cats.forEach(c => {
    const btn = document.createElement('button');
    btn.textContent = c;
    btn.addEventListener('click', () => render(all.filter(x => x.category === c)));
    filtersEl.appendChild(btn);
  });
});
 
function render(arr) {
  tl.innerHTML = '';
  arr.forEach(e => {
    const div = document.createElement('div');
    div.className = 'event';
    div.innerHTML = `
      <div class="card">
        <div class="date">${e.date}</div>
        <h2>${e.title}</h2>
        <img src="${e.image}" alt="${e.title}">
        <p>${e.description}</p>
        <small>${e.category}</small>
      </div>`;
    tl.appendChild(div);
  });
 
  document.querySelectorAll('.card img').forEach(i => {
    i.addEventListener('click', () => {
      lightbox.style.display = 'flex';
      lightboxImg.src = i.src;
    });
  });
}
 
document.getElementById('search').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  render(all.filter(x => JSON.stringify(x).toLowerCase().includes(q)));
});
 
document.getElementById('lightbox').addEventListener('click', () => {
  lightbox.style.display = 'none';
});
