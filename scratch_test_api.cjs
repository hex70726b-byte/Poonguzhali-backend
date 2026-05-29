const http = require("http");

http.get("http://localhost:5000/api/habits", (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    console.log("STATUS CODE:", res.statusCode);
    console.log("HABITS RESPONSE JSON:");
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  });
}).on("error", (err) => {
  console.error("API request failed:", err);
});
