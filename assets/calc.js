(function () {
  var root = document.getElementById('calc');
  if (!root) return;
  var kind = root.getAttribute('data-kind');
  var lang = (document.documentElement.lang || 'en') + '-u-nu-latn';
  function fmt(x, digits) {
    if (!isFinite(x)) return '—';
    return new Intl.NumberFormat(lang, { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(x);
  }
  function money(x) { return isFinite(x) ? new Intl.NumberFormat(lang, { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(x) : '—'; }
  function val(id) {
    var el = root.querySelector('[data-in="' + id + '"]');
    var x = parseFloat(String(el.value).replace(',', '.'));
    return isFinite(x) ? x : NaN;
  }
  function put(id, text) { root.querySelector('[data-out="' + id + '"]').textContent = text; }
  var calc = {
    size: function () {
      var amount = val('balance') * val('risk') / 100;
      var distance = Math.abs(val('entry') - val('stop'));
      var size = amount / (distance * val('pv'));
      put('amount', money(amount));
      put('size', distance > 0 && size > 0 ? fmt(size, size < 1 ? 3 : 2) : '—');
    },
    rr: function () {
      var risk = val('entry') - val('stop'), reward = val('target') - val('entry');
      var ratio = risk !== 0 && reward !== 0 && (risk > 0) === (reward > 0) ? reward / risk : NaN;
      put('ratio', isFinite(ratio) ? '1 : ' + fmt(ratio, 2) : '—');
      put('be', isFinite(ratio) ? fmt(100 / (1 + ratio), 1) + '%' : '—');
    },
    pip: function () { put('value', fmt(val('lots') * val('contract') * val('pip'), 4)); },
    expectancy: function () {
      var w = val('win') / 100, aw = val('avgwin'), al = val('avgloss');
      var e = w * aw - (1 - w) * al;
      put('exp', isFinite(e) ? money(e) + ' · ' + fmt(e / al, 2) + ' R' : '—');
      put('pf', al > 0 && w < 1 ? fmt(w * aw / ((1 - w) * al), 2) : '—');
      put('be', aw + al > 0 ? fmt(al / (aw + al) * 100, 1) + '%' : '—');
    },
    drawdown: function () {
      var d = val('dd');
      put('gain', d >= 0 && d < 100 ? fmt(d / (100 - d) * 100, 1) + '%' : '—');
    },
    compound: function () {
      var balance = val('start'), r = val('rate') / 100, n = Math.round(val('months')), dep = val('deposit') || 0, paid = 0;
      if (!isFinite(balance) || !isFinite(r) || !(n >= 0) || n > 1200) { put('end', '—'); put('profit', '—'); return; }
      for (var i = 0; i < n; i++) { balance = balance * (1 + r) + dep; paid += dep; }
      put('end', money(balance));
      put('profit', money(balance - val('start') - paid));
    }
  };
  var inputs = root.querySelectorAll('input');
  for (var i = 0; i < inputs.length; i++) inputs[i].addEventListener('input', calc[kind]);
  calc[kind]();
})();
