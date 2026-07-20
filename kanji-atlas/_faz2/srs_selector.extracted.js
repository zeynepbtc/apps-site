function inKanjiReviewScope(data, key){
  const item = data && data.chars ? data.chars[key] : null;
  return Boolean(item && item.type === "kanji");
}
function buildKanjiReviewQueue(state, data, now){
  if(!Number.isFinite(now)) return [];                          // now doğrulaması → risksiz boş kuyruk
  return Object.entries((state && state.srs) || {})
    .filter(([id, rec]) =>
      inKanjiReviewScope(data, id) &&
      Number.isFinite(rec && rec.next) &&                       // string/null/NaN/Infinity ELENİR
      rec.next <= now)
    .sort(([idA, a], [idB, b]) =>
      (a.next - b.next) ||                                      // 1) en eski next önce
      ((Number.isFinite(a.mastery) ? a.mastery : 0) -
       (Number.isFinite(b.mastery) ? b.mastery : 0)) ||         // 2) düşük mastery önce
      idA.localeCompare(idB))                                   // 3) ID tie-break → deterministik
    .map(([id]) => id);
}
function inspectKanjiReviewData(state, data){
  const unknownKeys=[], invalidNext=[];
  for(const [id, rec] of Object.entries((state && state.srs) || {})){
    if(!inKanjiReviewScope(data, id)) unknownKeys.push(id);
    else if(!Number.isFinite(rec && rec.next)) invalidNext.push(id);
  }
  return { unknownKeys, invalidNext };
}
module.exports = { inKanjiReviewScope, buildKanjiReviewQueue, inspectKanjiReviewData };
