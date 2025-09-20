const { JftnParser, ScriptRenderer } = require("./dist");

const parser = new JftnParser();
const renderer = new ScriptRenderer();

const jftnText = `Title: サンプル脚本
Author: 作者名

# シーン1

@太郎
こんにちは。

@花子
こんにちは、太郎さん。`;

console.log("Testing playscript-js...");

const result = parser.parse(jftnText);
console.log("Parse result:", result.success ? "SUCCESS" : "FAILED");

if (result.success) {
  const html = renderer.render(result.data);
  console.log("HTML generated successfully");
  console.log("Title:", result.data.metadata.title || "No title");
  console.log("Elements count:", result.data.elements.length);
}
