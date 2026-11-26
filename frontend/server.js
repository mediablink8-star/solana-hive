import http from "http";
import fs from "fs";
import path from "path";
const root = process.cwd();
const server = http.createServer((req,res)=>{
  let file = req.url === "/" ? "/index.html" : req.url;
  const p = path.join(root, file);
  fs.readFile(p,(err,data)=>{
    if(err){res.statusCode=404;res.end("not found");return;}
    res.end(data);
  });
});
server.listen(5173,()=>console.log("frontend on :5173"));