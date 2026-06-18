let all = [];
const tl = document.getElementById('timeline');
const filtersEl = document.getElementById('filters');
let activeCategory = null;

fetch('events.json').then(r => r.json()).then(d => {
  all = d;
  render(d);

  const cats = [...new Set(d.map(x => x.category))];

  const btnAll = document.createElement('button');
  btnAll.textContent = 'Все';
  btnAll.classList.add('active');
  btnAll.addEventListener('click', () => {
    setActive(btnAll);
    activeCategory = null;
    render(all);
  });
  filtersEl.appendChild(btnAll);

  cats.forEach(c => {
    const btn = document.createElement('button');
    btn.textContent = c;
    btn.addEventListener('click', () => {
      setActive(btn);
      activeCategory = c;
      render(all.filter(x => x.category === c));
    });
    filtersEl.appendChild(btn);
  });
});

function setActive(btn) {
  document.querySelectorAll('#filters button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function render(arr) {
  tl.innerHTML = '';
  if (arr.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Ничего не найдено';
    tl.appendChild(empty);
    return;
  }
  arr.forEach(e => {
    const div = document.createElement('div');
    div.className = 'event';
    div.innerHTML = `
      <div class="card">
        <div class="card-meta">
          <span class="date">${e.date}</span>
          <span class="category-pill">${e.category}</span>
        </div>
        <h2>${e.title}</h2>
        <img src="${e.image}" alt="${e.title}" loading="lazy">
        <p>${e.description}</p>
      </div>
      <div class="dot"></div>
      <div class="spacer"></div>`;
    tl.appendChild(div);
  });

  document.querySelectorAll('.card img').forEach(img => {
    img.addEventListener('click', () => {
      document.getElementById('lightbox').style.display = 'flex';
      document.getElementById('lightboxImg').src = img.src;
    });
  });
}

document.getElementById('search').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  const filtered = all.filter(x => JSON.stringify(x).toLowerCase().includes(q));
  setActive(document.querySelector('#filters button'));
  render(filtered);
});

document.getElementById('lightbox').addEventListener('click', () => {
  document.getElementById('lightbox').style.display = 'none';
});
 
