import sw from "stopword";

const preprocessText = (text) => {
  const lower = text.toLowerCase();
  const tokens = lower
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  return sw.removeStopwords(tokens).join(" ");
};

export default preprocessText;
