(function () {
  'use strict';

  var DATA = window.OBITUARIO_DATA || [];
  var monthsRoot = document.getElementById('meses');
  var navRoot = document.getElementById('nav-meses');

  var featureSide = 0; // alterna izquierda/derecha entre TODAS las filas "feature" de la página
  var duoShape = 0; // alterna circulo/cuadrado entre TODAS las filas "duo" de la página

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function personBlock(person) {
    var wrap = el('div', 'persona');
    wrap.appendChild(el('h3', 'persona__nombre', person.name));
    wrap.appendChild(el('p', 'persona__anios', person.years));
    wrap.appendChild(el('p', 'persona__rol', person.role));
    wrap.appendChild(el('p', 'persona__bio', person.bio));
    if (person.source) {
      wrap.appendChild(el('p', 'persona__fuente', 'Fuente: ' + person.source));
    }
    return wrap;
  }

  function photoBlock(person, extraClass) {
    var fig = el('figure', 'foto ' + (extraClass || ''));
    var img = document.createElement('img');
    img.src = person.img;
    img.alt = person.name;
    img.loading = 'lazy';
    fig.appendChild(img);
    return fig;
  }

  function buildFeatureRow(person, isFirstOfMonth, forceSide) {
    var side = forceSide || (featureSide % 2 === 0 ? 'izquierda' : 'derecha');
    featureSide++;
    var row = el('section', 'fila fila--feature fila--foto-' + side + (isFirstOfMonth ? ' fila--gris' : ' fila--blanca'));
    var photo = photoBlock(person, 'foto--feature');
    var text = personBlock(person);
    if (side === 'izquierda') {
      row.appendChild(photo);
      row.appendChild(text);
    } else {
      row.appendChild(text);
      row.appendChild(photo);
    }
    if (isFirstOfMonth) {
      var fondo = el('div', 'fila--gris-fondo');
      fondo.appendChild(row);
      return fondo;
    }
    return row;
  }

  function buildDuoRow(people) {
    var shape = duoShape % 2 === 0 ? 'circulo' : 'cuadrado';
    duoShape++;
    var row = el('section', 'fila fila--duo fila--duo-' + shape + ' fila--blanca');
    people.forEach(function (person) {
      var card = el('div', 'duo-card');
      card.appendChild(photoBlock(person, 'foto--' + shape));
      card.appendChild(personBlock(person));
      row.appendChild(card);
    });
    return row;
  }

  function buildMonthSection(month) {
    var section = el('section', 'mes');
    section.id = month.id;

    var header = el('div', 'mes__header');
    header.appendChild(el('h2', 'mes__titulo', month.label));
    section.appendChild(header);

    var people = month.people.slice();
    var firstRow = true;
    var noviembreSides = ['izquierda', 'derecha', 'izquierda'];
    var noviembreIndex = 0;
    month.pattern.forEach(function (type) {
      if (type === 'feature') {
        var p = people.shift();
        if (!p) return;
        var forceSide = month.id === 'noviembre' ? noviembreSides[noviembreIndex++] : null;
        section.appendChild(buildFeatureRow(p, firstRow, forceSide));
      } else if (type === 'duo') {
        var pair = [people.shift(), people.shift()].filter(Boolean);
        if (!pair.length) return;
        section.appendChild(buildDuoRow(pair));
      }
      firstRow = false;
    });

    return section;
  }

  function buildNavButton(month) {
    var btn = el('button', 'nav-mes');
    btn.type = 'button';
    btn.dataset.target = month.id;
    btn.textContent = month.label;
    btn.addEventListener('click', function () {
      var target = document.getElementById(month.id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    return btn;
  }

  function render() {
    DATA.forEach(function (month) {
      if (navRoot) navRoot.appendChild(buildNavButton(month));
      if (monthsRoot) monthsRoot.appendChild(buildMonthSection(month));
    });
  }

  function setupScrollSpy() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('.mes'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.nav-mes'));
    if (!sections.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            buttons.forEach(function (btn) {
              btn.classList.toggle('nav-mes--activo', btn.dataset.target === entry.target.id);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function setupHeroScrollButton() {
    var btn = document.querySelector('.hero__flecha');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var nav = document.querySelector('.hero__nav-meses');
      if (nav) nav.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  render();
  setupScrollSpy();
  setupHeroScrollButton();
})();
