 
 const electron=require('electron');
 const ipc=electron.ipcRenderer;
 var app =require('electron').remote;
 const {Menu, MenuItem} = electron.remote;
 var dialog =app.dialog;
//  const { dialog} = require('electron').remote;
//  console.log("1");
 var fs=require('fs');
  var jsonobj,graphjsonobj;
  var graphjson='{"Data":[{"Recordnumber":"1","TxnName":"abc","timestamp":"124"}]}';
 // Build menu one item at a time, unlike
 var highlightflag=[];
 var err=0,warn=0,exep=0,alw=0;
 var data;
// loading GenTrace table
   ipc.on("call-loadDoc",(event,arg)=>{
     //alert("hello");
     document.getElementById("spinner").style="display:block";
     console.log("calling loadDoc");
     //console.log(arg);
     loadDoc(arg);
     //document.getElementById("logfiledisplay").style="background-image:none";
   })

   ipc.on("filterattributes",(e,rowvalue,columnvalue)=>{
     console.log("entered into renderer");
     console.log(rowvalue+" "+columnvalue);
     displaywithfilter(jsonobj,rowvalue,columnvalue);

   })

  //loading filter window
  function openfilterwindow(){
    console.log("hello");
    ipc.send("open-filter-window");
    console.log("hello2");
  }
  
  function loadDoc(str) {
  // console.log(str);
    console.log("1");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
         var xmldoc=this.responseXML;
         jsonobj=xmlToJson(xmldoc);
         Display(0,str,jsonobj);
        //myFunction(this);
          
      }
    };
    xhttp.open("GET",str, true);
    xhttp.send();
  }
  function Display(k,str,jsonobj){
    //alert(k+" "+jsonobj["GENTRACE"]["Z"][0]["Q"]["#text"]);
    if(k==0){
      var str2=str;
      lst=str2.lastIndexOf("\\");
       if (lst >= 0) {
         str2 = str2.substring(lst + 1);
       }
      var table=document.getElementById("recenttable");
    var row=table.insertRow(0);
    var cell0=row.insertCell(0);
    var cell1 = row.insertCell(1);
   cell0.innerHTML= "<span>&#10006<span>";
    cell1.innerHTML="<a id='recent'>"+str2+"</a>";
   document.getElementById('recent').onclick=function(){
     console.log("recent");
     Display(1,str,jsonobj);
   }
   document.getElementById("tabs").innerHTML+='<button class="tablinks" id=tab>'+str2+'</button>';
   document.getElementById('tab').onclick=function(){
    console.log("recent2");
    Display(1,str,jsonobj);
  }
    cell0.style="display:none";
     
    }
    var table1="<tr><th>Record number</th><th>TimeStamp<th>RESPONSIBILITY</th><th>OWNER</th><th>Supply Point Type</th><th>Function</th></tr>";
	for(i=0;i<jsonobj["GENTRACE"]["Z"].length;i++){
    jsonobj["GENTRACE"]["Z"][i]["bookmark"]=0;
  var T=jsonobj["GENTRACE"]["Z"][i]["T"]["#text"];
  var rowno=i+1;
    //var time2=converttimestamp(time);
    if(T=="12"){
      err++;
      table1+="<tr  style='background-color:red' id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
    }else if(T=="10"){
      warn++;
      table1+="<tr style='background-color:yellow' id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
    }else if(T=="11"){
      table1+="<tr style='background-color:orange'  id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
      exep++
    }else{
      table1+="<tr  id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
        alw++;   
    }
    
		table1 += "<td>"+rowno+"</td><td>"+jsonobj["GENTRACE"]["Z"][i]["Q"]["#text"]+
      "</td><td>"+jsonobj["GENTRACE"]["Z"][i]["R"]["#text"]+
        "</td><td>"+jsonobj["GENTRACE"]["Z"][i]["O"]["#text"];  
        if(T=="15"){
          table1+="</td><td>Always On";
        }else if(T=="12"){
          table1+="</td><td>Error";
        }else if(T=="10"){
          table1+="</td><td>Exception";
        }else if(T=="11"){
          table1+="</td><td>Warning";
        }
        if(jsonobj["GENTRACE"]["Z"][i]["F"]!=null){
          var funcname=jsonobj["GENTRACE"]["Z"][i]["F"]["#text"];
          var time=jsonobj["GENTRACE"]["Z"][i]["Q"]["#text"];
          if((funcname=='WithdrawalTransaction:WithdrawalBase.Execute')||(funcname=='DepositTransaction.Execute')||(funcname=='TransferTransaction.Execute')||(funcname=='BalanceTransaction.Execute')||(funcname=='SupervisorManager.TriggerEntry'))
          {
            var obj=JSON.parse(graphjson);
          obj['Data'].push({"RecordNumber":i+1,"TxnName":funcname,"TimeStamp":time});
          graphjson=JSON.stringify(obj);
         
          console.log(i);
        }
          table1+="</td><td>"+jsonobj["GENTRACE"]["Z"][i]["F"]["#text"];
        }else{
          table1+="</td><td> ";
        }
        table1+="</td></tr>";
        highlightflag[i]=0;
     }

  document.getElementById("demo").innerHTML = table1;
    var table = document.getElementById('demo');
   // resizableGrid(table);
    document.getElementById("spinner").style="display:none";
    data={"Error":err,"Exception":exep,"Warning":warn,"Always On":alw};
    graphjsonobj=JSON.parse(graphjson);
    console.log(data);
    
  }
  function displaywithfilter(jsonobj,rowvalue,columnvalue){
    console.log("1"+rowvalue+" "+columnvalue);
    var table1="<tr><th>Record number</th><th>TimeStamp<th>RESPONSIBILITY</th><th>OWNER</th><th>Supply Point Type<th>Function</th></tr>";
    if(columnvalue=="Responsibility"){
        for(i=0;i<jsonobj["GENTRACE"]["Z"].length;i++){
          var T=jsonobj["GENTRACE"]["Z"][i]["T"]["#text"];
    var rowno=i+1;
      if(T=="12"){
        table1+="<tr  style='background-color:red' id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
      }else if(T=="10"){
        table1+="<tr style='background-color:yellow' id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
      }else if(T=="11"){
        table1+="<tr style='background-color:orange'  id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
        
      }else{
        table1+="<tr  id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
      }
        if(jsonobj["GENTRACE"]["Z"][i]["R"]["#text"]==rowvalue){
        table1 += "<td>"+rowno+"</td><td>"+jsonobj["GENTRACE"]["Z"][i]["Q"]["#text"]+
        "</td><td>"+jsonobj["GENTRACE"]["Z"][i]["R"]["#text"]+
          "</td><td>"+jsonobj["GENTRACE"]["Z"][i]["O"]["#text"];
          if(T=="15"){
            table1+="</td><td>Always On";
          }else if(T=="12"){
            table1+="</td><td>Error";
          }else if(T=="10"){
            table1+="</td><td>Exception";
          }else if(T=="11"){
            table1+="</td><td>Warning";
          }
          if(jsonobj["GENTRACE"]["Z"][i]["F"]!=null){
            table1+="</td><td>"+jsonobj["GENTRACE"]["Z"][i]["F"]["#text"];
          }else{
            table1+="</td><td> ";
          }
          table1+="</td></tr>";
          highlightflag[i]=0;
        }
      }
       }else if(columnvalue=="Owner"){
        for(i=0;i<jsonobj["GENTRACE"]["Z"].length;i++){
          var T=jsonobj["GENTRACE"]["Z"][i]["T"]["#text"];
    var rowno=i+1;
      if(T=="12"){
        table1+="<tr  style='background-color:red' id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
      }else if(T=="10"){
        table1+="<tr style='background-color:yellow' id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
      }else if(T=="11"){
        table1+="<tr style='background-color:orange'  id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
        
      }else{
        table1+="<tr  id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
      }
        if(jsonobj["GENTRACE"]["Z"][i]["O"]["#text"]==rowvalue){
          table1 +="<td>"+rowno+"</td><td>"+jsonobj["GENTRACE"]["Z"][i]["Q"]["#text"]+
          "</td><td>"+jsonobj["GENTRACE"]["Z"][i]["R"]["#text"]+
            "</td><td>"+jsonobj["GENTRACE"]["Z"][i]["O"]["#text"];
            if(T=="15"){
              table1+="</td><td>Always On";
            }else if(T=="12"){
              table1+="</td><td>Error";
            }else if(T=="10"){
              table1+="</td><td>Exception";
            }else if(T=="11"){
              table1+="</td><td>Warning";
            }
            if(jsonobj["GENTRACE"]["Z"][i]["F"]!=null){
              table1+="</td><td>"+jsonobj["GENTRACE"]["Z"][i]["F"]["#text"];
            }else{
              table1+="</td><td> ";
            }
            table1+="</td></tr>";
            highlightflag[i]=0;
        }
      }
    }else if(columnvalue=="SupplyPoint"){
      var x;
      for(i=0;i<jsonobj["GENTRACE"]["Z"].length;i++){
        var T=jsonobj["GENTRACE"]["Z"][i]["T"]["#text"];
    var rowno=i+1;
      if(T=="12"){
        table1+="<tr  style='background-color:red' id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
      }else if(T=="10"){
        table1+="<tr style='background-color:yellow' id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
      }else if(T=="11"){
        table1+="<tr style='background-color:orange'  id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
        
      }else{
        table1+="<tr  id='row"+i+"' oncontextmenu=showcontextmenu("+i+"); onclick=showproperties("+i+")>";
      }
          if(rowvalue=="Always On")
          x='15';
          else if(rowvalue=="Error")
          x="12";
          else if(rowvalue=="Warning")
          x="11";
          else if(rowvalue=="Exception")
          x="10"
      if(jsonobj["GENTRACE"]["Z"][i]["T"]["#text"]==x){
        table1 += "<td>"+i+"</td><td>"+jsonobj["GENTRACE"]["Z"][i]["Q"]["#text"]+
        "</td><td>"+jsonobj["GENTRACE"]["Z"][i]["R"]["#text"]+
          "</td><td>"+jsonobj["GENTRACE"]["Z"][i]["O"]["#text"];
          table1+="</td><td>"+rowvalue;
          if(jsonobj["GENTRACE"]["Z"][i]["F"]!=null){
            table1+="</td><td>"+jsonobj["GENTRACE"]["Z"][i]["F"]["#text"];
          }else{
            table1+="</td><td> ";
          }
          table1+="</td></tr>";
          highlightflag[i]=0;
      }
    }
  }
    document.getElementById("demo").innerHTML = table1;
   var table = document.getElementById('demo');
      resizableGrid(table);
}
  function showcontextmenu(j){
    const menu = new Menu();
    menu.append(new MenuItem ({
      label: 'properties in detail',
      click() { 
        showproperties(j);
      }
   }))
   
   menu.append(new MenuItem({type: 'separator'}))
   menu.append(new MenuItem({label: 'MenuItem2', type: 'checkbox', checked: true}))
   if(highlightflag[j]==0){
    menu.append(new MenuItem ({
      label: 'highlight',
      click() {
            highlightflag[j]=1; 
         document.getElementById("row"+j).style="background-color:green";

      }
   }))
   }else{
    menu.append(new MenuItem ({
      label: 'Remove highlight',
      click() {
         
         document.getElementById("row"+j).style="background-color:rgb(249, 254, 255)";

      }
   }))
   }
   
  menu.popup(app.getCurrentWindow())
  }

  
  function showproperties(j){
         var x=j,y=j+1;
         var tabcontent=" ";
        // document.getElementById("row"+j).style="color:blue";
         document.getElementById("bookmark").onclick=function(){
          jsonobj["GENTRACE"]["Z"][j]["bookmark"]=1;
           // document.getElementById("row"+x).style="background-color:blue";
         }
         document.getElementById("bookmarkforward").onclick=function(){
          //document.getElementById("row"+x).style="background-color:white";
          x=x+1;
          //document.getElementById("row"+x).style="background-color:blue";
          showproperties(x);
         }
         document.getElementById("bookmarkbackward").onclick=function(){
          document.getElementById("row"+x).style="background-color:white";
          x=x-1;
          document.getElementById("row"+x).style="background-color:blue";
          showproperties(x);
         }
    
    console.log(j);
       tabcontent +='<tr><td><b>RecordNo</b></td><td>'+y+'</td><tr>';
       tabcontent+='<tr><td><b>Responsibility</b></td><td>'+jsonobj["GENTRACE"]["Z"][j]["R"]["#text"]+'</td></tr>';
       tabcontent+='<tr><td><b>Owner</b></td><td>'+jsonobj["GENTRACE"]["Z"][j]["O"]["#text"]+'</td></tr>';
       if(jsonobj["GENTRACE"]["Z"][j]["F"]!=null){
        tabcontent+='<tr><td><b>Function</b></td><td>'+jsonobj["GENTRACE"]["Z"][j]["F"]["#text"]+'</td></tr>';
       }
       
      //  tabcontent+='<tr><th>Y</th><td>:</td><td>'+jsonobj["GENTRACE"]["Z"][j]["Y"]["#text"]+'</td></tr>';
       document.getElementById("prop").innerHTML=tabcontent;
  }



  function xmlToJson(xml) {
    
    // Create the return object
    var obj = {};
  
    if (xml.nodeType == 1) { // element
      // do attributes
      if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
        for (var j = 0; j < xml.attributes.length; j++) {
          var attribute = xml.attributes.item(j);
          obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType == 3) { // text
      obj = xml.nodeValue;
    }
  
    // do children
    if (xml.hasChildNodes()) {
      for(var i = 0; i < xml.childNodes.length; i++) {
        var item = xml.childNodes.item(i);
        var nodeName = item.nodeName;
        if (typeof(obj[nodeName]) == "undefined") {
          obj[nodeName] = xmlToJson(item);
        } else {
          if (typeof(obj[nodeName].push) == "undefined") {
            var old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xmlToJson(item));
        }
      }
    }
    return obj;
  };

// document.getElementById("bookmark").onclick=function(){
//    console.log("bookmark icon clicked");

// } 

 function searchclick(){
    document.getElementById("clonedisplay").style="display:none";
    document.getElementById("searchdisplay").style="display:block";
    document.getElementById("codeforkdisplay").style="display:none";
    document.getElementById("bugdisplay").style="display:none";
    document.getElementById("dashboarddisplay").style="display:none";
    document.getElementById("settingdisplay").style="display:none";
    document.getElementById("searchicon").style=" background-color: #4CAF50";
    document.getElementById("cloneicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("codeforkicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("bugicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("dashboardicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("setting").style="background-color: rgb(221, 219, 219)";

  }

 function cloneclick(){
  document.getElementById("clonedisplay").style="display:block";
  document.getElementById("searchdisplay").style="display:none";
  document.getElementById("codeforkdisplay").style="display:none";
  document.getElementById("bugdisplay").style="display:none";
    document.getElementById("dashboarddisplay").style="display:none";
    document.getElementById("settingdisplay").style="display:none";
  document.getElementById("searchicon").style=" background-color: rgb(221, 219, 219) ";
  document.getElementById("cloneicon").style="background-color: #4CAF50";
  document.getElementById("codeforkicon").style="background-color: rgb(221, 219, 219)";
  document.getElementById("bugicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("dashboardicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("setting").style="background-color: rgb(221, 219, 219)";

 }
 function codeforkclick(){
  document.getElementById("clonedisplay").style="display:none";
  document.getElementById("searchdisplay").style="display:none";
  document.getElementById("codeforkdisplay").style="display:block";
  document.getElementById("bugdisplay").style="display:none";
    document.getElementById("dashboarddisplay").style="display:none";
    document.getElementById("settingdisplay").style="display:none";
  document.getElementById("searchicon").style=" background-color: rgb(221, 219, 219)";
  document.getElementById("cloneicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("codeforkicon").style="background-color: #4CAF50";
    document.getElementById("bugicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("dashboardicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("setting").style="background-color: rgb(221, 219, 219)";
}
function bugclick(){
  document.getElementById("clonedisplay").style="display:none";
  document.getElementById("searchdisplay").style="display:none";
  document.getElementById("codeforkdisplay").style="display:none";
  document.getElementById("bugdisplay").style="display:block";
    document.getElementById("dashboarddisplay").style="display:none";
    document.getElementById("settingdisplay").style="display:none";
  document.getElementById("searchicon").style=" background-color: rgb(221, 219, 219)";
  document.getElementById("cloneicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("codeforkicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("bugicon").style="background-color: #4CAF50";
    document.getElementById("dashboardicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("setting").style="background-color: rgb(221, 219, 219)";
}
function dashboardclick(){
  document.getElementById("clonedisplay").style="display:none";
  document.getElementById("searchdisplay").style="display:none";
  document.getElementById("codeforkdisplay").style="display:none";
  document.getElementById("bugdisplay").style="display:none";
    document.getElementById("dashboarddisplay").style="display:block";
    document.getElementById("settingdisplay").style="display:none";
  document.getElementById("searchicon").style=" background-color: rgb(221, 219, 219)";
  document.getElementById("cloneicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("codeforkicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("bugicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("dashboardicon").style="background-color: #4CAF50";
    document.getElementById("setting").style="background-color: rgb(221, 219, 219)";
  // opening dashboard window
   ipc.send("open-dashboard",graphjsonobj,JSON.stringify(data));
     

  }
function settingclick(){
  document.getElementById("clonedisplay").style="display:none";
  document.getElementById("searchdisplay").style="display:none";
  document.getElementById("codeforkdisplay").style="display:none";
  document.getElementById("bugdisplay").style="display:none";
    document.getElementById("dashboarddisplay").style="display:none";
    document.getElementById("settingdisplay").style="display:block";
  document.getElementById("searchicon").style=" background-color: rgb(221, 219, 219)";
  document.getElementById("cloneicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("codeforkicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("bugicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("dashboardicon").style="background-color: rgb(221, 219, 219)";
    document.getElementById("setting").style="background-color: #4CAF50";
}

function converttimestamp(str){
  var str2=str;
  for(i=0;i<str.length;i++){
    if(i==4|i==7){
      str2[i]='/';
  }else if(i==11){
    str2[i]==' ';
  }else{
   str2[i]=str[i];
  }
}
  return str2;
}
