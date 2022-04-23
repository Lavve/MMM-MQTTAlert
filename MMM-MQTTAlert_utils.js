const makeId = (str) => {
  const idClean = str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '');
  return `id_mqttalert_${idClean}`;
};

const makeFontSize = (size) => {
  return /[a-z]+$/g.test(size) ? size : size + 'px'
};

if (typeof window === 'undefined' || navigator.userAgent.includes('jsdom')) {
  module.exports = { makeId, makeFontSize };
}
