var f=false;
(function(i,j){function r(d){for(var b=0,a;a=d[b++];)s(a)&&g.push(a)}function n(d){for(var b=0,a;a=d[b++];)g.push(a)}function o(d){g=p.call(d,0)}function t(d,b,a){if(b)if(b=="#")c.id=a;else if(b==".")if(c.a)c.a.push(a);else c.a=[a];else{if(b==":")if(c.b)c.b.push(a);else c.b=[a]}else c.c=a.toUpperCase();return""}function s(d){if(c.c){var b=d.nodeName.toUpperCase();if(c.c=="*"){if(b<"@")return f}else if(b!=c.c)return f}if(c.id&&d.getAttribute("id")!=c.id)return f;if(k=c.a){var a=" "+d.className+" ";
for(b=k.length;b--;)if(a.indexOf(" "+k[b]+" ")<0)return f}if(l=c.b)for(b=l.length;b--;){a=q[l[b]];if(!(a&&a.call(h,d)))return f}return true}function h(d,b,a){g=a||[];e=b||h.d;if(u)try{o(e.querySelectorAll(d));return g}catch(w){}m=e.ownerDocument||e;d=d.replace(v,"");for(c={};d=d.replace(/([#.:])?([^#.:]*)/,t););d=(b=c.id)&&c.c||c.a||c.b||!b&&(c.a||c.b)?r:n;if(b){if(a=b=m.getElementById(b))if(!(a=m===e))a:{a=b;do if(a===e){a=true;break a}while(a=a.parentNode);a=f}a&&d([b])}else d(e.getElementsByTagName(c.c||
"*"));return g}var g,c,k,l,q={},e,m,v=/^\s+|\s+$/g,u=!!j.querySelectorAll,p=Array.prototype.slice;try{p.call(j.documentElement.childNodes,0)}catch(x){o=n}h.pseudos=q;h.context=j;i.uSelector=h;i.$u||(i.$u=h)})(this,document);
