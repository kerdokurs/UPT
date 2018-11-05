function query() {
  const a = window.location.search.substr(1).split('&'),
    b = {};
  for (let c = 0; c < a.length; c++) {
    const d = a[c].split('=');
    'undefined' == typeof b[d[0]]
      ? (b[d[0]] = decodeURIComponent(d[1]))
      : 'string' == typeof b[d[0]]
        ? (b[d[0]] = [b[d[0]], decodeURIComponent(d[1])])
        : b[d[0]].push(decodeURIComponent(d[1]));
  }
  return b;
}
