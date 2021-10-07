// var ftpClient = require('ftp-client'),
//     config = {
//         host: '',
//         port: ,
//         user: '',
//         password: ''
//     },
//     options = {
//         logging: 'basic'
//     },
//     client = new ftpClient(config);

// client.connect(function () {


//     client.download('/apv5','C:/Users/marko.nikolic/projekti/react/posta/client/src/components', {
//         overwrite: 'all'
//     }, function (result) {
//         console.log(result);
//     });
// });
const fetch = require("node-fetch");
const fs = require('fs').promises;

const token='';
//posta token 
//marko token 


const CitanjeCsv=async()=>{
let data=await fs.readFile('C:/Users/marko.nikolic/projekti/react/posta/client/src/components/APV5_VOZACI.csv','utf8')
data="id;vozilo;pocetak;kraj;idVozaca;imeVozaca;prezimeVozaca;brojTelefonaVozaca;idDispecera;imeDispecera;prezimeDispecera;brojTelefonaDispecera;sifraRadnogZadatka;radniZadatak\n"+data;
const data2=await KonverzijaJSON(data);

for(let i=0;i<data2.length;i++){
    if(data2[i].id.length<7)
    data2.splice(i)
    }
return data2;
}
const KonverzijaJSON=async(csv)=>{
    var lines=csv.split("\n");
  
    var result = [];
  
    var headers=lines[0].split(";");
  
    for(var i=1;i<lines.length;i++){
  
        var obj = {};
        var currentline=lines[i].split(";");
  
        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
  
        result.push(obj);
    }
    return result;
  }
const Login=async()=>{
    const data=await(await fetch(encodeURI(`https://hst-api.wialon.com/wialon/ajax.html?svc=token/login&params={"token":"${token}"}`))).json();
    let resId=data.user.bact;
    let eid=data.eid;

const dataCsv=await CitanjeCsv();
//const vozaci= await AwaitUpisVozaca(dataCsv,eid,resId);

const nizVozaca=await NizVozaca(eid);  
const nizUnita=await NizUnita(eid);

const bind=await AwaitBindovanjeUnbindovanje(dataCsv,eid,resId,nizUnita,nizVozaca)

const eventi=await AwaitUpisEventa(dataCsv,eid,resId,nizUnita);


}

const ProveraEventa=async(eid,vozilo,pocetak,nizUnita,kraj,index)=>{

let rezultat=false;

const pocetakSmene=await KonverzijaVremena(pocetak);
const idVozilo=await VoziloBindMap(nizUnita,vozilo);


const data=await(await fetch(encodeURI(`https://hst-api.wialon.com/wialon/ajax.html?svc=messages/load_interval&params={
    "itemId":"${idVozilo}",
    "timeFrom":"${pocetakSmene}",
    "timeTo":"${pocetakSmene}",
    "flags":1536,
    "flagsMask":65280,
    "loadCount":1}&sid=${eid}`))).json();

    console.log(data)
    
    // if(data.messages.length==0&&kraj.length){
    //     rezultat=true;
    // }
    //     else{
    //         rezultat=false;
    //     }
    return rezultat
}
const AwaitBindovanjeUnbindovanje=async(dataCsv,eid,resId,nizUnita,nizVozaca)=>{// funkcija koja iterira kroz Cvs niz i pokrece BindUnbind funkciju

    let offset = 0;

    dataCsv.map(m=>{
    setTimeout(function(){
    BindUnbind(eid,resId,m.idVozaca,m.pocetak,m.kraj,m.vozilo,nizUnita,nizVozaca,m.imeVozaca,m.prezimeVozaca,m.brojTelefonaVozaca);
}, 250 + offset);    
offset += 250;
})
return "done";
}
const BindUnbind=async(eid,resId,idVozaca,pocetak,kraj,vozilo,nizUnita,nizVozaca,imeVozaca,prezimeVozaca,brojTelefonaVozaca)=>{// funkcija koja binduje i unbinduje vozace naizmenicno
    let pocetakSmene;
    let krajSmene;
   
    if(pocetak)
     pocetakSmene=await KonverzijaVremena(pocetak);
    if(kraj)
     krajSmene=await KonverzijaVremena(kraj);
    const idVozac=await VozacBindMap(nizVozaca,idVozaca);
    const idVozilo=await VoziloBindMap(nizUnita,vozilo)
    let brtel;
    if(brojTelefonaVozaca)    
    brtel = brojTelefonaVozaca.replace(/[^0-9]/g, '');
    let broj=encodeURIComponent("+"+brtel)
    let imePre=encodeURI(`${imeVozaca} ${prezimeVozaca}`)


const data=await(await fetch(`https://hst-api.wialon.com/wialon/ajax.html?svc=core/batch&params=[{
"svc":"resource/bind_unit_driver",
"params":{
"resourceId":"${resId}",
"unitId":"${idVozilo}",
"driverId":"${idVozac}",
"time":"${pocetakSmene}",
"mode":"1"}
},
{
    "svc":"resource/bind_unit_driver",
    "params":{
    "resourceId":"${resId}",
    "unitId":"${idVozilo}",
    "driverId":"${idVozac}",
    "time":"${krajSmene}",
    "mode":"0"}
    },
    {
        "svc":"resource/update_driver",
        "params":{
            "itemId":"${resId}",
            "id":"${idVozac}",
            "callMode":"update",
            "c":"${idVozaca}",
            "ds":"",
            "n":"${imePre}",
            "p":"${broj}"}
       
}]&sid=${eid}`)).json();
console.log(data)
}
const AwaitUpisVozaca=async(dataCsv,eid,resId)=>{//funkcija koja iterira kroz Cvs niz i pokrece funkciju UpisVozaca
dataCsv.map(m=>{ 
    UpisVozaca(eid,resId,m.imeVozaca,m.prezimeVozaca,m.brojTelefonaVozaca,m.idVozaca)
})
return "done";
}
const AwaitUpisEventa=async(dataCsv,eid,resId,nizUnita)=>{//funkcija koja iterira kroz Cvs niz i pokrece funkciju UpisEventa

    let offset = 0;

dataCsv.map((m,index)=>{
    const str=`Id: ${m.id}| Vozilo: ${m.vozilo}| Početak: ${m.pocetak}| Kraj: ${m.kraj}| Id vozača: ${m.idVozaca}| Ime vozača: ${m.imeVozaca}| Prezime vozača: ${m.prezimeVozaca}| Broj telefona vozača: ${"+"}${m.brojTelefonaVozaca}| Id Dispečera: ${m.idDispecera}| Ime Dispečera: ${m.imeDispecera}| Prezime Dispečera: ${m.prezimeDispecera}| Broj telefona dispečera: ${m.brojTelefonaDispecera}| Šifra radnog zadatka: ${m.sifraRadnogZadatka}| Radni zadatak: ${m.radniZadatak}|`; 
    if(m.kraj.length>0){
        setTimeout(function(){
    UpisUEvente(eid,m.pocetak,m.vozilo,str,nizUnita,m.kraj)
}, 250 + offset);    
offset += 250;
    }
})
return "done";
}
const UpisVozaca=async(eid,resId,imeVozaca,prezimeVozaca,brojTelefonaVozaca,idVozaca)=>{//funkcija koja kreira nove Vozace, ne moze da napravi duplikat jer broj telefona mora biti jedinstven
let broj;
brojTelefonaVozaca = brojTelefonaVozaca.replace(/[^0-9]/g, '');

const duplikat=await ProveraVozaca(eid,idVozaca)
 broj=encodeURIComponent("+"+brojTelefonaVozaca)

 let imePre=encodeURI(`${imeVozaca} ${prezimeVozaca}`)


 if(duplikat===false){
const data=await(await fetch(`https://hst-api.wialon.com/wialon/ajax.html?svc=resource/update_driver&params={
"itemId":"${resId}",
"id":"0",
"callMode":"create",
"c":"${idVozaca}",
"ds":"",
"n":"${imePre}",
"p":"${broj}"}&sid=${eid}`)).json();
console.log(`vozac ${imeVozaca} ${prezimeVozaca} je kreiran`)
}
else{
console.log(`vozac ${imeVozaca} ${prezimeVozaca} vec postoji`)
}
}
const VozacBindMap=async(nizVozaca,idVozaca)=>{//funkcija koja iterira kroz NizVozaca i vraca ID vozaca
let vrednost;
nizVozaca.map(n=>{
    if(n.code===idVozaca)
    vrednost=n.id
})
return vrednost;
}
const VoziloBindMap=async(nizUnita,vozilo)=>{//funkcija koja iterira kroz NizUnita i vraca ID unita/vozila
let vrednost;
nizUnita.map(n=>{
    if(n.name.includes(vozilo))
    vrednost=n.id
})
return vrednost;
}
const KonverzijaVremena=async(vreme)=>{//funkcija koja konvertuje vreme iz Cvs-a u UNIX
let vremeKonv=vreme;
vremeKonv = vremeKonv.substr(6,4)+vremeKonv.substr(2,3)+"-"+vremeKonv.substr(0,2)+" "+vremeKonv.substr(11,5)
vremeKonv=new Date(vremeKonv).getTime() / 1000
return vremeKonv;
}
const UpisUEvente=async(eid,pocetak,vozilo,str,nizUnita,kraj)=>{//upis celog objekta iz Cvs-a u event u vreme pocetka

const pocetakSmene=await KonverzijaVremena(pocetak);
const idVozilo=await VoziloBindMap(nizUnita,vozilo)

const proveraEventa=await ProveraEventa(eid,vozilo,pocetak,nizUnita,kraj);

if(proveraEventa===true){
const data=await(await fetch(encodeURI(`https://hst-api.wialon.com/wialon/ajax.html?svc=unit/registry_custom_event&params={
"date":"${pocetakSmene}",
"x":"20.486203562436987",
"y":"44.792050675460835",
"description":"${str}",
"violation":"0",
"itemId":"${idVozilo}"}&sid=${eid}`))).json();

    console.log("upis eventa "+str)
}
else{
    console.log("event postoji")
}
}
const NizVozaca=async(eid)=>{//funkcija koja vraca niz svih vozaca sa Wialona (objekti sa id vozaca, nazivom vozaca i brojem telefona vozaca)
const data=await(await fetch(encodeURI(`https://hst-api.wialon.com/wialon/ajax.html?svc=core/search_items&params={"spec":{
    "itemsType":"avl_resource",  
    "propName":"",           
    "propValueMask":"", 
    "sortType":""
     },
     "force":"1",                                   
     "flags":"0x00000100",                                                
         "from":"0",                                                
     "to":"0"}&sid=${eid}`))).json();
const vozaciWialon=[]
const dataVozaciW=data.items[0].drvrs
const keys = Object.entries(dataVozaciW)
keys.map(m=>{
    vozaciWialon.push({id:m[1].id,name:m[1].n,phone:m[1].p,code:m[1].c})
})
return vozaciWialon;
}
const NizUnita=async(eid)=>{//funkcija koja vraca niz unita sa Wialona (objekati sa id unita i nazivom unita)
const unitiWialon=[]
const data=await(await fetch(encodeURI(`https://hst-api.wialon.com/wialon/ajax.html?svc=core/search_items&params={"spec":{
    "itemsType":"avl_unit",            
    "propName":"",           
    "propValueMask":"*",              
    "sortType":""
     },
     "force":"0",                                   
     "flags":"0x1",                                                
         "from":"0",                                                
     "to":"0"}&sid=${eid}`))).json();
data.items.map(m=>{
   unitiWialon.push({id:m.id,name:m.nm})
})
return unitiWialon;
}
const ProveraVozaca=async(eid,idVozaca)=>{
let vrednost=false;
const nizVozaca=await NizVozaca(eid);
nizVozaca.map(m=>{
    if(m.code===idVozaca)
    vrednost=true;
})
return vrednost;
}

Login()

