(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const listA = byId('listA');
  const listB = byId('listB');
  const ignoreCase = byId('ignoreCase');
  const trimSpaces = byId('trimSpaces');
  const ignoreBlank = byId('ignoreBlank');

  function splitInput(text) {
    return text.split(/\r?\n|,/g);
  }

  function prepare(text) {
    let items = splitInput(text);
    if (trimSpaces.checked) items = items.map((item) => item.trim());
    if (ignoreBlank.checked) items = items.filter((item) => item !== '');

    const seen = new Set();
    const prepared = [];

    for (const original of items) {
      const key = ignoreCase.checked ? original.toLocaleLowerCase() : original;
      if (seen.has(key)) continue;
      seen.add(key);
      prepared.push({ original, key });
    }

    return prepared;
  }

  function render(id, values, emptyText = '—') {
    byId(id).textContent = values.length ? values.map((item) => item.original).join('\n') : emptyText;
  }

  function updateInputCounts() {
    byId('countA').textContent = `${prepare(listA.value).length} items`;
    byId('countB').textContent = `${prepare(listB.value).length} items`;
  }

  function compare() {
    const a = prepare(listA.value);
    const b = prepare(listB.value);
    const aKeys = new Set(a.map((item) => item.key));
    const bKeys = new Set(b.map((item) => item.key));

    const common = a.filter((item) => bKeys.has(item.key));
    const onlyA = a.filter((item) => !bKeys.has(item.key));
    const onlyB = b.filter((item) => !aKeys.has(item.key));

    render('commonResult', common);
    render('onlyAResult', onlyA);
    render('onlyBResult', onlyB);

    byId('commonCount').textContent = common.length;
    byId('onlyACount').textContent = onlyA.length;
    byId('onlyBCount').textContent = onlyB.length;
    updateInputCounts();
  }

  byId('compareBtn').addEventListener('click', compare);

  byId('swapBtn').addEventListener('click', () => {
    const temp = listA.value;
    listA.value = listB.value;
    listB.value = temp;
    updateInputCounts();
    if (listA.value || listB.value) compare();
  });

  byId('clearBtn').addEventListener('click', () => {
    listA.value = '';
    listB.value = '';
    byId('commonResult').textContent = 'Run a comparison to see results.';
    byId('onlyAResult').textContent = '—';
    byId('onlyBResult').textContent = '—';
    byId('commonCount').textContent = '0';
    byId('onlyACount').textContent = '0';
    byId('onlyBCount').textContent = '0';
    updateInputCounts();
    listA.focus();
  });

  byId('exampleBtn').addEventListener('click', () => {
    listA.value = 'apple\nbanana\norange\npear';
    listB.value = 'banana\norange\ngrape\nkiwi';
    compare();
  });

  [listA, listB].forEach((field) => field.addEventListener('input', updateInputCounts));
  [ignoreCase, trimSpaces, ignoreBlank].forEach((option) => option.addEventListener('change', () => {
    updateInputCounts();
    if (listA.value || listB.value) compare();
  }));

  document.querySelectorAll('.copy-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = byId(button.dataset.target);
      const text = target.textContent;
      if (!text || text === '—' || text.startsWith('Run a comparison')) return;

      try {
        await navigator.clipboard.writeText(text);
        const oldLabel = button.textContent;
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = oldLabel; }, 1200);
      } catch (_) {
        const range = document.createRange();
        range.selectNodeContents(target);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
  });

  updateInputCounts();
})();
