/* Paynet protocol utilities. No dependencies; works from file:// and HTTPS. */
(function(root){
'use strict';
const API='https://ecom-api-test.paynet.md';
const CHECKOUT='https://test.paynet.md/ecom/checkout';
const FORM_KEY='F90D6485-9CCC-458B-96A3-8958AF9B4458';
const NOTIFY_KEY='D9873689-E5F8-4272-A67F-0D8BA3F9BAA7';
const AUTH={grantType:'password',username:'771064',password:'sLgMnGWJ'};
const signedFields=['Amount','Currency','CustomerCode','CustomerEmail','CustomerNameFirst','CustomerNameLast','CustomerPhoneNumber','Description','ExpiryDate','Lang','LinkUrlCancel','LinkUrlSuccess','Merchant','MoneyType','Order','SaleAreaCode'];
function md5base64(text){
 const bytes=new TextEncoder().encode(text), n=Math.ceil((bytes.length+9)/64)*64, buffer=new Uint8Array(n);buffer.set(bytes);buffer[bytes.length]=128;
 const view=new DataView(buffer.buffer);view.setUint32(n-8,(bytes.length*8)>>>0,true);view.setUint32(n-4,Math.floor(bytes.length/536870912),true);
 let a0=0x67452301,b0=0xefcdab89,c0=0x98badcfe,d0=0x10325476;
 const shifts=[7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21];
 for(let offset=0;offset<n;offset+=64){let a=a0,b=b0,c=c0,d=d0;
  for(let i=0;i<64;i++){let f,g;if(i<16){f=(b&c)|(~b&d);g=i;}else if(i<32){f=(d&b)|(~d&c);g=(5*i+1)%16;}else if(i<48){f=b^c^d;g=(3*i+5)%16;}else{f=c^(b|~d);g=(7*i)%16;}
   const k=Math.floor(Math.abs(Math.sin(i+1))*4294967296),shift=shifts[Math.floor(i/16)*4+i%4];
   const x=(a+f+k+view.getUint32(offset+g*4,true))|0;
   a=d;d=c;c=b;b=(b+((x<<shift)|(x>>>(32-shift))))|0;
  }a0=(a0+a)|0;b0=(b0+b)|0;c0=(c0+c)|0;d0=(d0+d)|0;
 }
 const result=new Uint8Array(16),rv=new DataView(result.buffer);[a0,b0,c0,d0].forEach((v,i)=>rv.setInt32(i*4,v,true));
 return btoa(String.fromCharCode(...result));
}
const str=v=>v==null?'':String(v);
const encode=v=>encodeURIComponent(str(v)).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
function formSignature(fields,key=FORM_KEY){const prepared=signedFields.filter(k=>Object.hasOwn(fields,k)).map(k=>encode(fields[k])).join('');return {prepared,hash:md5base64(prepared+key)};}
function notificationSignature(n,key=NOTIFY_KEY){const p=n.Payment||{};const prepared=[n.EventDate,n.Eventid,n.EventType,p.Amount,p.Customer,p.ExternalId,p.Id,p.Merchant,p.StatusDate].map(str).join('');return {prepared,hash:md5base64(prepared+key)};}
function tomorrow(now=new Date()){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Chisinau',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));
 const d=new Date(Date.UTC(+parts.year,+parts.month-1,+parts.day+1,+parts.hour,+parts.minute,+parts.second));return d.toISOString().slice(0,19);
}
let lastId=0;function orderId(){return lastId=Math.max(Date.now(),lastId+1);}
const vectorForm={Order:1762444800000,Currency:'498',Merchant:'265505',SaleAreaCode:'onlidocumentation_md',Amount:'1235',Description:'Test&Co SRL',CustomerCode:'5555',CustomerNameFirst:'First name',CustomerNameLast:'Last name',CustomerPhoneNumber:'060000000',CustomerEmail:'test@gmail.com',ExpiryDate:'2026-12-31T23:59:59',LinkUrlCancel:'https://test.oplta.md/cancel',LinkUrlSuccess:'https://test.oplta.md/ok',Lang:'ro',MoneyType:'Card'};
const vectorNotification={Eventid:1000001,EventType:'PAID',EventDate:'2026-11-09T12:00:00',Payment:{Id:1234567,ExternalId:1762444800000,Merchant:'265505',Customer:'37369XXX111',StatusDate:'2026-11-09T12:00:00',Amount:1235}};
function testVectors(){return [formSignature(vectorForm).hash==='cxr/+yLYZp34aR0KXLkb2A==',notificationSignature(vectorNotification).hash==='lq3+OCn0J/zSyNF5iAoShg=='];}
root.Paynet={API,CHECKOUT,FORM_KEY,NOTIFY_KEY,AUTH,signedFields,md5base64,formSignature,notificationSignature,tomorrow,orderId,vectorForm,vectorNotification,testVectors};
if(typeof module!=='undefined')module.exports=root.Paynet;
})(globalThis);
