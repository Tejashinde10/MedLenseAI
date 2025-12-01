import natural from "natural";

export const calculateSimilarity = (text1, text2) => {
  const tfidf = new natural.TfIdf();
  tfidf.addDocument(text1);
  tfidf.addDocument(text2);

  const vec1 = {};
  const vec2 = {};

  tfidf.listTerms(0).forEach((item) => (vec1[item.term] = item.tfidf));
  tfidf.listTerms(1).forEach((item) => (vec2[item.term] = item.tfidf));

  const keys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  let dot = 0,
    mag1 = 0,
    mag2 = 0;
  keys.forEach((k) => {
    const v1 = vec1[k] || 0;
    const v2 = vec2[k] || 0;
    dot += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  });
  return mag1 && mag2 ? dot / (Math.sqrt(mag1) * Math.sqrt(mag2)) : 0;
};
