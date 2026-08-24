// E2E login via progressive-enhancement form POST
const base = process.argv[2] || "http://localhost:3001";
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const html = await (await fetch(base + "/accedi")).text();
const formAction = ((html.match(/<form[^>]*method="POST"[^>]*action="([^"]*)"/i) || html.match(/<form[^>]*action="([^"]*)"[^>]*method="POST"/i) || ["", ""])[2] || "/accedi");
const hidden = [];
for (const m of html.matchAll(/<input[^>]*name="(\$ACTION[^"]*)"(?:[^>]*value="([^"]*)")?[^>]*>/g)) {
  hidden.push([m[1], m[2] ? decode(m[2]) : ""]);
}
console.log("form action:", formAction, "| hidden fields:", hidden.map((h) => h[0]).join(", "));

const body = new FormData();
for (const [k, v] of hidden) body.append(k, v);
body.append("email", "demo@contromano.it");
body.append("password", "demo1234");

const res = await fetch(base + formAction, {
  method: "POST",
  body,
  redirect: "manual",
});
const sc = res.headers.get("set-cookie") || "";
console.log("POST status:", res.status, "| cm_session:", sc.includes("cm_session") ? "OK" : "ASSENTE");
if (!sc.includes("cm_session")) {
  console.log("FAIL login");
  process.exit(1);
}
const session = sc.split(/cm_session=([^;]*)/)[1];

const imp = await fetch(base + "/impostazioni", { headers: { cookie: "cm_session=" + session } });
console.log("/impostazioni con sessione:", imp.status === 200 ? "PASS 200" : "FAIL " + imp.status);
const t = await imp.text();
console.log(t.includes("Zona di rischio") ? "PASS pagina impostazioni completa" : "CHECK contenuti");
process.exit(imp.status === 200 ? 0 : 1);
