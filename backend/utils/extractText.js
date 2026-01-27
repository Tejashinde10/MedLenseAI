import fs from "fs";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

const extractText = async (filePath, mimetype) => {
  if (mimetype.includes("word")) {
    const res = await mammoth.extractRawText({ path: filePath });
    return res.value;
  }
  if (mimetype.includes("pdf")) {
    const data = fs.readFileSync(filePath);
    const pdf = await pdfParse(data);
    return pdf.text;
  }
  return fs.readFileSync(filePath, "utf8");
};

export default extractText;
