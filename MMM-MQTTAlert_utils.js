const makeId = (id) => {
  const idClean = id.toLowerCase().trim().replace(/[^a-z0-9]+/g, '');
  return `id_${this.name}_${idClean}`;
};

const makeFontSize = (size) => {
  return /[a-z]+$/g.test(size.trim()) ? size.trim() : size.trim() + 'px'
};

if (typeof window === 'undefined' || navigator.userAgent.includes('jsdom')) {
  module.exports = { makeId, makeFontSize };
}
