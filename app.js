(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const listA = $('listA');
  const listB = $('listB');
  const options = {
    trim: $('trim'),
    ignoreEmpty: $('ignoreEmpty'),
    dedupe: $('dedupe'),
    caseSensitive: $('caseSensitive')
  };

  const splitValues = (text) => text.split(/\r?\n|,|;/g);

  function prepare(text) {
    let items = splitValues(text);
    if (options.trim.checked) items = items.map((v) => v.trim());
    if (options.ignoreEmpty.checked) items = items.filter((v) => v !== '');

    const keyed = items.map((original) => ({
      original,
      key: options.caseSensitive.checked ? original : original.toLocaleLowerCase()
    }));

    if (!options.dedupe.checked) return keyed;
    const seen = new Set();
    return keyed.filter((item) => {
      if (seen.has(item.key)) return false;
      seen.add(item.key);
      return true;
    });
  }

  function compare() {
    const a = prepare(listA.value);
    const b = prepare(listB.value);
    const aKeys = new Set(a.map((item) => item.key));
    const bKeys = new Set(b.map((item) => item.key));

    const common = a.filter((item) => bKeys.has(item.key));
    const onlyA = a.filter((item) => !bKeys.has(item.key));
    const onlyB = b.filter((item) => !aKeys.has(item.key));

    const union = [];
    const unionKeys = new Set();
    [...a, ...b].forEach((item) => {
      if (!unionKeys.has(item.key)) {
        unionKeys.add(item.key);
        union.push(item);
      }
    });

    render('commonResult', common);
    render('onlyAResult', onlyA);
    render('onlyBResult', onlyB);
    render('unionResult', union);
    $('commonCount').textContent = common.length;
    $('onlyACount').textContent = onlyA.length;
    $('onlyBCount').textContent = onlyB.length;
    $('unionCount').textContent = union.length;
    updateCounts();
  }

  function render(id, items) {
    $(id).textContent = items.length ? items.map((item) => item.original).join('\n') : '—';
  }

  function updateCounts() {
    $('countA').textContent = `${prepare(listA.value).length} items`;
    $('countB').textContent = `${prepare(listB.value).length} items`;
  }

  function clearAll() {
    listA.value = '';
    listB.value = '';
    ['commonResult', 'onlyAResult', 'onlyBResult', 'unionResult'].forEach((id) => { $(id).textContent = '—'; });
    ['commonCount', 'onlyACount', 'onlyBCount', 'unionCount'].forEach((id) => { $(id).textContent = '0'; });
    updateCounts();
    listA.focus();
  }

  $('compareButton').addEventListener('click', compare);
  $('clearButton').addEventListener('click', clearAll);
  $('swapLists').addEventListener('click', () => {
    [listA.value, listB.value] = [listB.value, listA.value];
    updateCounts();
    compare();
  });
  $('loadExample').addEventListener('click', () => {
    listA.value = 'apple\nbanana\norange\npear\nkiwi';
    listB.value = 'banana\norange\ngrape\nkiwi\nmango';
    compare();
  });

  [listA, listB].forEach((element) => element.addEventListener('input', updateCounts));
  Object.values(options).forEach((element) => element.addEventListener('change', () => {
    updateCounts();
    if (listA.value || listB.value) compare();
  }));

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = $(button.dataset.copy);
      const text = target.textContent === '—' ? '' : target.textContent;
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const previous = button.textContent;
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = previous; }, 1200);
      } catch (_) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(target);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
  });

  updateCounts();
})();
