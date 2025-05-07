/**
 * Возвращает YYYY.MM.DD в часовом поясе timeZone
 */
function getDateStringInTZ(timeZone) {
  const now = new Date();
  // форматируем как 2025-11-20
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now); // "2025-11-20"
  // переводим в ваш формат
  return parts;
}

module.exports = { getDateStringInTZ };
