import"./hoisted.BjD8LBda.js";import"./hoisted.AR9T7Jwc.js";const e=document.getElementById("enquiry");e?.addEventListener("submit",o=>{o.preventDefault();const n=[...new FormData(e).entries()].map(([t,d])=>`${t}: ${d}`).join(`
`);location.href=`mailto:hello@disside.com?subject=${encodeURIComponent("New project enquiry")}&body=${encodeURIComponent(n)}`});
