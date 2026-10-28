/* KAI-Netics enrollment basket.
   Keeps enrollments in this browser only (localStorage) and adds a basket
   icon with a count to the site header. Payment happens on Stripe (card)
   or by Zelle from cart.html. */
(function () {
  var KEY = 'kn_basket_v1';

  var CATALOG = {
    'p107-inaugural': {
      sku: 'p107-inaugural',
      name: 'FAA Part 107 Ground School',
      detail: 'Inaugural in-person cohort · 6 weeks · 12 sessions · 24 hours · includes one initial FAA knowledge-test attempt',
      priceCard: 721,
      priceZelle: 699,
      stripe: 'https://buy.stripe.com/eVq9AT6BAh2b81bePA4ko00',
      page: 'part107-exam-prep.html'
    }
  };

  function read() {
    try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function write(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
    render();
  }

  var Cart = {
    catalog: CATALOG,
    items: function () {
      return read().filter(function (i) { return CATALOG[i.sku]; }).map(function (i) {
        var p = CATALOG[i.sku], o = {};
        for (var k in p) o[k] = p[k];
        o.enrollee = i.enrollee || '';
        o.addedAt = i.addedAt;
        return o;
      });
    },
    count: function () { return Cart.items().length; },
    add: function (sku, enrollee) {
      if (!CATALOG[sku]) return;
      var items = read().filter(function (i) { return i.sku !== sku; });
      items.push({ sku: sku, enrollee: enrollee || '', addedAt: new Date().toISOString() });
      write(items);
    },
    remove: function (sku) { write(read().filter(function (i) { return i.sku !== sku; })); },
    clear: function () { write([]); }
  };
  window.KNCart = Cart;

  var ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/></svg>';

  function style() {
    if (document.getElementById('kn-cart-style')) return;
    var s = document.createElement('style');
    s.id = 'kn-cart-style';
    s.textContent =
      '.kn-cart{position:relative;display:inline-flex;align-items:center;gap:6px;color:#fff;text-decoration:none;font-weight:750;font-size:.92rem;padding:8px 6px;border-radius:10px;white-space:nowrap}' +
      '.kn-cart:hover{color:#2FD08F}' +
      '.kn-cart .kn-badge{position:absolute;top:0;left:20px;min-width:19px;height:19px;padding:0 5px;border-radius:10px;background:#F2A53A;color:#071c34;font-size:12px;font-weight:800;line-height:19px;text-align:center}' +
      '.kn-cart .kn-badge[hidden]{display:none}' +
      '@media(max-width:650px){.kn-cart .kn-label{display:none}}';
    document.head.appendChild(s);
  }

  function render() {
    var nav = document.querySelector('header .nav');
    if (!nav) return;
    style();
    var a = document.getElementById('kn-cart');
    if (!a) {
      a = document.createElement('a');
      a.id = 'kn-cart';
      a.className = 'kn-cart';
      a.href = 'cart.html';
      a.innerHTML = ICON + '<span class="kn-badge" hidden></span><span class="kn-label">Basket</span>';
      var mobile = nav.querySelector('.mobile');
      nav.insertBefore(a, mobile || null);
    }
    var n = Cart.count();
    var b = a.querySelector('.kn-badge');
    b.textContent = n;
    b.hidden = n === 0;
    a.setAttribute('aria-label', 'Basket, ' + n + (n === 1 ? ' item' : ' items'));
    if (/cart\.html$/.test(location.pathname)) a.setAttribute('aria-current', 'page');
  }

  window.addEventListener('storage', function (e) { if (e.key === KEY) render(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
