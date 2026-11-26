(function () {
  'use strict';

  var DATA = window.OBITUARIO_DATA || [];
  var monthsRoot = document.getElementById('meses');
  var navRoot = document.getElementById('nav-meses');
  var navMovilRoot = document.getElementById('nav-meses-movil');
  var navStickyRoot = document.getElementById('nav-sticky');
  var tabMeses = document.getElementById('tab-meses');
  var panelMeses = document.getElementById('panel-meses');
  var panelLista = document.getElementById('panel-meses-lista');

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
    var picture = document.createElement('picture');

    var source = document.createElement('source');
    source.media = '(max-width: 760px)';
    source.srcset = person.img.replace('img/', 'img/movil/');
    picture.appendChild(source);

    var img = document.createElement('img');
    img.src = person.img;
    img.alt = person.name;
    picture.appendChild(img);

    fig.appendChild(picture);
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

  function buildPanelItem(month) {
    var li = el('li');
    var btn = el('button', 'panel-meses__mes');
    btn.type = 'button';
    btn.dataset.target = month.id;
    btn.textContent = month.label;
    btn.addEventListener('click', function () {
      var target = document.getElementById(month.id);
      closePanel(false);
      if (target) {
        setTimeout(function () {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    });
    li.appendChild(btn);
    return li;
  }

  function openPanel() {
    if (!panelMeses) return;
    panelMeses.classList.add('panel-meses--abierto');
    panelMeses.setAttribute('aria-hidden', 'false');
    tabMeses.setAttribute('aria-expanded', 'true');
    document.body.classList.add('panel-meses-abierto');
    var cerrar = panelMeses.querySelector('.panel-meses__cerrar');
    if (cerrar) cerrar.focus();
  }

  function closePanel(returnFocus) {
    if (!panelMeses || !panelMeses.classList.contains('panel-meses--abierto')) return;
    panelMeses.classList.remove('panel-meses--abierto');
    panelMeses.setAttribute('aria-hidden', 'true');
    tabMeses.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('panel-meses-abierto');
    if (returnFocus !== false) tabMeses.focus();
  }

  function setupPanelMeses() {
    if (!tabMeses || !panelMeses) return;
    tabMeses.addEventListener('click', openPanel);
    var cerrar = panelMeses.querySelector('.panel-meses__cerrar');
    if (cerrar) cerrar.addEventListener('click', function () { closePanel(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePanel();
    });
  }

  function buildNavOption(month) {
    var option = el('option', null, month.label);
    option.value = month.id;
    return option;
  }

  function setupNavMovil() {
    if (!navMovilRoot) return;
    navMovilRoot.addEventListener('change', function () {
      var target = document.getElementById(navMovilRoot.value);
      if (!target) return;
      navMovilRoot.blur();
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    });
  }

  function render() {
    DATA.forEach(function (month, i) {
      if (navRoot) navRoot.appendChild(buildNavButton(month));
      if (navMovilRoot) navMovilRoot.appendChild(buildNavOption(month));
      if (navStickyRoot) {
        if (i > 0) {
          var sep = el('span', 'nav-sticky__sep', '-');
          sep.setAttribute('aria-hidden', 'true');
          navStickyRoot.appendChild(sep);
        }
        navStickyRoot.appendChild(buildNavButton(month));
      }
      if (panelLista) panelLista.appendChild(buildPanelItem(month));
      if (monthsRoot) monthsRoot.appendChild(buildMonthSection(month));
    });
  }

  function setupScrollSpy() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('.mes'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.nav-mes, .panel-meses__mes'));
    if (!sections.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            buttons.forEach(function (btn) {
              btn.classList.toggle('nav-mes--activo', btn.dataset.target === entry.target.id);
            });
            if (navMovilRoot) navMovilRoot.value = entry.target.id;
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

  // Muestra el menú sticky cuando .hero__nav-meses sale del viewport por arriba
  function setupNavSticky() {
    var trigger = document.querySelector('.hero__nav-meses');
    if (!trigger || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      var entry = entries[0];
      var visible = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      if (navStickyRoot) {
        navStickyRoot.classList.toggle('nav-sticky--visible', visible);
        navStickyRoot.setAttribute('aria-hidden', visible ? 'false' : 'true');
      }
      if (tabMeses) {
        tabMeses.classList.toggle('tab-meses--visible', visible);
        tabMeses.setAttribute('aria-hidden', visible ? 'false' : 'true');
        tabMeses.tabIndex = visible ? 0 : -1;
      }
    }, { threshold: 0 });

    observer.observe(trigger);
  }

  render();
  setupScrollSpy();
  setupNavSticky();
  setupPanelMeses();
  setupHeroScrollButton();
  setupNavMovil();
})();
