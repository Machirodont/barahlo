"use strict";
function log(msg){
    document.getElementById("console").innerHTML+=msg+"<br>";
}

log("start");

function Some(options){
    this.name=options.name;
    if(typeof(options.localId)==="number") {
        this.localId=options.localId;
        if(this.localId>Some.localCount){
            Some.localCount=this.localId;
        }
    }
    else {
        Some.localCount++;
        this.localId =Some.localCount;
    }
    Some.itemList[this.localId] = this;
    this.place=Some.itemList[1];
    log(this.name+" "+this.localId);
}
Some.localCount=0;
Some.itemList=[]; //Общий список всего что есть.

Some.prototype.remove=function () {
    delete Some.itemList[this.localId];
};

Some.prototype.putIn=function (place) {
    if(this.place!==undefined) {
        delete this.place.list[this.localId];
    }
    this.place=place;
    this.place.list[this.localId]=this;
};

Some.listToJSON=function(){
    var obj={};
    var i=0;
    for(var k in Some.itemList){
       obj[k]={
           localId:Some.itemList[k].localId,
           name:Some.itemList[k].name,
           constr: Some.itemList[k].constructor.name,
           placeId: Some.itemList[k].place.localId
       };
     }
    return JSON.stringify(obj);
};

Some.listFromJSON=function () {
  Some.localCount=0;
  Some.itemList=[];
  if(localStorage.getItem("itemList")!==null) {
      var loadedItemList = JSON.parse(localStorage.getItem("itemList"));
      console.log(loadedItemList);
      for (var key in loadedItemList) {
          var item;
          if (loadedItemList[key].constr === "Place") {
              item = new Place({name: loadedItemList[key].name, localId: key});
              item.putIn(Some.itemList[loadedItemList[key].placeId]);
          }
          else {
              item = new Some({name: loadedItemList[key].name, localId: key});
              console.log(key + " " + loadedItemList[key].placeId);
              item.putIn(Some.itemList[loadedItemList[key].placeId]);
          }
      }
      return true;
  }
  else{
      return false;
  }
};

function Place(options){
    var r=new Some(options);
    r.list={};
    r.constructor=Place;
    return r;
}


if(!Some.listFromJSON()) {
    new Place({name: "ROOT"});
    Some.itemList[1].putIn(Some.itemList[1]);
}
//;

var lPanel=document.getElementById("leftPanel");
var rPanel=document.getElementById("rightPanel");
lPanel.place=Some.itemList[1];
rPanel.place=Some.itemList[1];
lPanel.addEventListener("click",function () {
    setActive(this);
});
rPanel.addEventListener("click",function () {
    setActive(this);
});



var activePanel=lPanel;
lPanel.classList.add("active");
var selectedListElement;
refreshList(lPanel);
refreshList(rPanel);

document.getElementById("newItemButton").addEventListener("click",function(){
    var newName=document.getElementById("newItemName").value;
    var newSome = new Some({name:newName});
    newSome.putIn(activePanel.place);
    refreshList(lPanel);
    refreshList(rPanel);
});

document.getElementById("newPlaceButton").addEventListener("click",function(){
    var newName=document.getElementById("newItemName").value;
    var newPlace = new Place({name:newName});
    newPlace.putIn(activePanel.place);
    refreshList(lPanel);
    refreshList(rPanel);
});

document.getElementById("refreshList").addEventListener("click",function(){
    refreshList(lPanel);
    refreshList(rPanel);
});

document.getElementById("saveToLocalStore").addEventListener("click",function(){
   localStorage.setItem( "itemList", Some.listToJSON());
});

document.getElementById("deleteSelectedItem").addEventListener("click",function(){
    delete selectedListElement.itemPointer.place.list[selectedListElement.itemPointer.localId];
    selectedListElement.itemPointer.remove();
    refreshList(lPanel);
    refreshList(rPanel);
});

document.getElementById("moveSelectedItem").addEventListener("click",function(){
    var newPlace=lPanel.place;
    if(activePanel===lPanel){
        newPlace=rPanel.place;
    }

    var cycling=false;
    var container=newPlace;
    var c=0;
    while(container.localId!==1&!cycling&c<100){
        c++;
        if(container===selectedListElement.itemPointer) cycling=true;
        container=container.place;
    }

    if(!cycling) {
        selectedListElement.itemPointer.putIn(newPlace);
    }
    else
        console.log("Попытка поместить контейнер сам в себя");
    refreshList(lPanel);
    refreshList(rPanel);
});


function setActive(panel) {
    if(panel!==activePanel){
        activePanel=panel;
        lPanel.classList.toggle("active");
        rPanel.classList.toggle("active");
    }

    if(panel.place.constructor!==Place){
        document.getElementById("newItemButton").style.display="none";
        document.getElementById("newPlaceButton").style.display="none";
    }
    else{
        document.getElementById("newItemButton").style.display="inline-block";
        document.getElementById("newPlaceButton").style.display="inline-block";
    }
    return activePanel;
}

function refreshList(panel) {
     function elementInPanelDOM(e) {
        var itemDiv = document.createElement("div");
        itemDiv.textContent = e.name + " #" + (getCode(e.localId));
        itemDiv.itemPointer = e;

        if(e.constructor===Place) {
            itemDiv.classList.add("place");
        }

        itemDiv.addEventListener("click", function () {
            if(selectedListElement!==undefined) {
                selectedListElement.classList.remove("selected");
            }
            selectedListElement = this;
            this.classList.add("selected");
         });
        itemDiv.addEventListener("dblclick", function () {
            selectedListElement=undefined;
            activePanel.place = this.itemPointer;
            setActive(activePanel); //Для обновления статуса кнопок "создать предмет/место"
            refreshList(lPanel);
            refreshList(rPanel);
        });

        return itemDiv;
    }

    panel.innerHTML = "";



    var s1 = panel.place.place;
    var e1 = elementInPanelDOM(s1);
    e1.classList.add("rootElement");
    panel.appendChild(e1);

    s1 = panel.place;
    e1 = elementInPanelDOM(s1);
    e1.classList.add("rootElement");
    panel.appendChild(e1);

    for (var key in panel.place.list) {
        var s = panel.place.list[key];
        if (s !== panel.place) {
            var e = elementInPanelDOM(s);
            panel.appendChild(e);
        }
    }
}




function getCode(n){
    var numbers="0123456789abcdefghkmnpstwxyz";
    var raz=numbers.length ;

    var n28="";
    for(var i=3; i>=0; i--) {
        var razr=Math.floor(n / Math.pow(raz,i));
        n=n-razr*Math.pow(raz,i);
        n28+=numbers[razr];
    }
    return n28;
}

setInterval( function () {
    if (selectedListElement !== undefined) {
      document.getElementById("monitor").textContent = selectedListElement.itemPointer.name + " в " + activePanel.place.name;
    }
    else{
        document.getElementById("monitor").textContent = "В "+activePanel.place.name;

    }

},100);