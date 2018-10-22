"use strict";

function log(msg) {
    document.getElementById("console").innerHTML += msg + "<br>";
}

log("start");

/*
@localId
@name
+itemList
+localCount
+rootList
 */
class Some {
    constructor(options) {
        this.name = options.name;
        if (typeof(options.localId) === "number") {
            this.localId = options.localId;
            if (this.localId > Some.localCount) {
                Some.localCount = this.localId;
            }
        }
        else {
            if (!Some.localCount) {
                Some.localCount = 0;
                Some.itemList = [];
                Some.rootList = [];
            }
            Some.localCount++;
            this.localId = Some.localCount;
        }
        Some.itemList[this.localId] = this;
        Some.rootList[this.localId] = this;
        this.place = null;
        log(this.name + " " + this.localId);
    }

    remove() {
        delete Some.itemList[this.localId];
    };

    /*
    @place может быть объектом Place или id в Some.itemList
     */
    putIn(place) {
        let newPlace = (place instanceof Place) ? place : (typeof(place) === 'number' && Some.itemList[place] !== undefined) ? Some.itemList[place] : null;
        if (newPlace !== null) {
            if (this.place) {
                delete this.place.list[this.localId];
            }
            else{
                delete Some.rootList[this.localId];
            }
            this.place = newPlace;
            this.place.list[this.localId] = this;
        }
    };

    static listToJSON() {
        var obj = {};
        var i = 0;
        for (var k in Some.itemList) {
            obj[k] = {
                localId: Some.itemList[k].localId,
                name: Some.itemList[k].name,
                constr: Some.itemList[k].constructor.name,
                placeId: Some.itemList[k].place ? Some.itemList[k].place.localId : null
            };
        }
        return JSON.stringify(obj);
    };

    static listFromJSON() {
        Some.localCount = 0;
        Some.itemList = [];
        if (localStorage.getItem("itemList") !== null) {
            var loadedItemList = JSON.parse(localStorage.getItem("itemList"));
            console.log(loadedItemList);
            for (var key in loadedItemList) {
                var item;
                if (loadedItemList[key].constr === "Place") {
                    item = new Place({name: loadedItemList[key].name, localId: key});
                }
                else {
                    item = new Some({name: loadedItemList[key].name, localId: key});
                }
                item.putIn(Some.itemList[loadedItemList[key].placeId]);
            }
            return true;
        }
        else {
            return false;
        }
    };
}

/*
@list
 */
class Place extends Some {
    constructor(options) {
        super(options);
        this.list = {};
    }
}

var lPanel = document.getElementById("leftPanel");
var rPanel = document.getElementById("rightPanel");
lPanel.place = null;
rPanel.place = null;
lPanel.addEventListener("click", function () {
    setActive(this);
});
rPanel.addEventListener("click", function () {
    setActive(this);
});


var activePanel = lPanel;
lPanel.classList.add("active");
var selectedListElement;
refreshList(lPanel);
refreshList(rPanel);

document.getElementById("newItemButton").addEventListener("click", function () {
    var newName = document.getElementById("newItemName").value;
    var newSome = new Some({name: newName});
    newSome.putIn(activePanel.place);
    refreshList(lPanel);
    refreshList(rPanel);
});

document.getElementById("newPlaceButton").addEventListener("click", function () {
    var newName = document.getElementById("newItemName").value;
    var newPlace = new Place({name: newName});
    newPlace.putIn(activePanel.place);
    refreshList(lPanel);
    refreshList(rPanel);
});

document.getElementById("refreshList").addEventListener("click", function () {
    refreshList(lPanel);
    refreshList(rPanel);
});

document.getElementById("saveToLocalStore").addEventListener("click", function () {
    localStorage.setItem("itemList", Some.listToJSON());
});

document.getElementById("deleteSelectedItem").addEventListener("click", function () {
    delete selectedListElement.itemPointer.place.list[selectedListElement.itemPointer.localId];
    selectedListElement.itemPointer.remove();
    refreshList(lPanel);
    refreshList(rPanel);
});

document.getElementById("moveSelectedItem").addEventListener("click", function () {
    var newPlace = lPanel.place;
    if (activePanel === lPanel) {
        newPlace = rPanel.place;
    }

    var cycling = false;
    var container = newPlace;
    var c = 0;
    while (container !== null & !cycling & c < 100) {
        c++;
        if (container === selectedListElement.itemPointer) cycling = true;
        container = container.place;
    }

    if (!cycling) {
        selectedListElement.itemPointer.putIn(newPlace);
    }
    else
        console.log("Попытка поместить контейнер сам в себя");
    refreshList(lPanel);
    refreshList(rPanel);
});


$("#loadAll").on("click", function () {
    $.ajax({
        url: "ajax.php",
        dataType: "json",
        method: "POST",
        data: {"f": "load_all"},
        success: function (data) {
            console.log("AJAX SUCCESS");
            if (data.f === "load_all") {
                Some.localCount = 0;
                Some.itemList = [];
                Some.rootList = [];
                let items=data.items;
                console.log(typeof items);
                data.items.forEach(function (item) {
                    let newNode= (item.is_container==="1") ? new Place({localId:item.item_id, name:item.name}) : new Some({localId:item.item_id, name:item.name});
                    console.log(item.container_id);
                    newNode.putIn(parseInt(item.container_id));
                });
                lPanel.place=null;
                rPanel.place=null;
                refreshList(lPanel);
                refreshList(rPanel);
            }
        }
    });
});


function setActive(panel) {
    if (panel !== activePanel) {
        activePanel = panel;
        lPanel.classList.toggle("active");
        rPanel.classList.toggle("active");
    }

    if (panel.place && panel.place.constructor !== Place) {
        document.getElementById("newItemButton").style.display = "none";
        document.getElementById("newPlaceButton").style.display = "none";
    }
    else {
        document.getElementById("newItemButton").style.display = "inline-block";
        document.getElementById("newPlaceButton").style.display = "inline-block";
    }
    return activePanel;
}

function refreshList(panel) {
    function elementInPanelDOM(e) {
        var itemDiv = document.createElement("div");
        itemDiv.textContent = (e) ? e.name + " #" + (getCode(e.localId)) : "ROOT";
        itemDiv.itemPointer = e;

        if (e) {
            if (e.constructor === Place) {
                itemDiv.classList.add("place");
            }
        }

        itemDiv.addEventListener("click", function () {
            if (selectedListElement !== undefined) {
                selectedListElement.classList.remove("selected");
            }
            selectedListElement = this;
            this.classList.add("selected");
        });
        itemDiv.addEventListener("dblclick", function () {
            selectedListElement = undefined;
            activePanel.place = (e) ? this.itemPointer : null;
            setActive(activePanel); //Для обновления статуса кнопок "создать предмет/место"
            refreshList(lPanel);
            refreshList(rPanel);
        });
        return itemDiv;
    }

    panel.innerHTML = "";

    let s1 = (panel.place) ? panel.place.place : null;
    var e1 = elementInPanelDOM(s1);
    e1.textContent = ".. (" + e1.textContent + ")";
    e1.classList.add("rootElement");
    panel.appendChild(e1);

    let list = (panel.place) ? panel.place.list : Some.rootList;
    for (var key in list) {
        var s = list[key];
        if (s !== panel.place) {
            var e = elementInPanelDOM(s);
            panel.appendChild(e);
        }
    }
}


function getCode(n) {
    var numbers = "0123456789abcdefghkmnpstwxyz";
    var raz = numbers.length;

    var n28 = "";
    for (var i = 3; i >= 0; i--) {
        var razr = Math.floor(n / Math.pow(raz, i));
        n = n - razr * Math.pow(raz, i);
        n28 += numbers[razr];
    }
    return n28;
}

setInterval(function () {
    if (selectedListElement !== undefined) {
        document.getElementById("monitor").textContent = ((selectedListElement.itemPointer) ? selectedListElement.itemPointer.name +"["+selectedListElement.itemPointer.constructor.name+"]" : "ROOT") + " в " + ((activePanel.place) ? activePanel.place.name : "ROOT");
    }
    else {
        document.getElementById("monitor").textContent = "В " + ((activePanel.place) ? activePanel.place.name : "ROOT");

    }

}, 100);
