(function(){
   "use strict";

   var Treeningkava = function(){

     // SEE ON SINGLETON PATTERN
     if(Treeningkava.instance){
       return Treeningkava.instance;
     }
     //this viitab Treeningkava fn
     Treeningkava.instance = this;

     this.routes = Treeningkava.routes;
     // this.routes['home-view'].render()

     console.log('treeningkava sees');

     // KÕIK muuutujad, mida muudetakse ja on rakendusega seotud defineeritakse siin
     this.click_count = 0;
     this.currentRoute = null;
     console.log(this);

     // hakkan hoidma kõiki purke
     this.jars = [];

     // Kui tahan Moosipurgile referenci siis kasutan THIS = MOOSIPURGI RAKENDUS ISE
     this.init();
   };

   window.Treeningkava = Treeningkava; // Paneme muuutja külge

   Treeningkava.routes = {
     'home-view': {
       'render': function(){
         // käivitame siis kui lehte laeme
         console.log('>>>>avaleht');
       }
     },
     'list-view': {
       'render': function(){
         // käivitame siis kui lehte laeme
         console.log('>>>>loend');
       }
     },
     'manage-view': {
       'render': function(){
         // käivitame siis kui lehte laeme
       }
     }
   };

   // Kõik funktsioonid lähevad Moosipurgi külge
   Treeningkava.prototype = {

     init: function(){
       console.log('Rakendus läks tõõle');

       //kuulan aadressirea vahetust
       window.addEventListener('hashchange', this.routeChange.bind(this));

       // kui aadressireal ei ole hashi siis lisan juurde
       if(!window.location.hash){
         window.location.hash = 'home-view';
         // routechange siin ei ole vaja sest käsitsi muutmine käivitab routechange event'i ikka
       }else{
         //esimesel käivitamisel vaatame urli üle ja uuendame menüüüd
         this.routeChange();
       }

       //saan kätte purgid localStorage kui on
       if(localStorage.jars){
           //võtan stringi ja teen tagasi objektideks
           this.jars = JSON.parse(localStorage.jars);
           console.log('laadisin localStorageist massiiivi ' + this.jars.length);

           //tekitan loendi htmli
           this.jars.forEach(function(jar){

               var new_jar = new Jar(jar.id, jar.title, jar.amount, jar.sets);

               var li = new_jar.createHtmlElement();
               document.querySelector('.list-of-jars').appendChild(li);

           });

       }


       // esimene loogika oleks see, et kuulame hiireklikki nupul
       this.bindEvents();

     },

     bindEvents: function(){
       document.querySelector('.add-new-jar').addEventListener('click', this.addNewClick.bind(this));

       //kuulan trükkimist otsikastis
       document.querySelector('#search').addEventListener('keyup', this.search.bind(this));

     },
     deleteJar: function(event){

  		// millele vajutasin SPAN
  		console.log(event.target);

  		// tema parent ehk mille sees ta on LI
  		console.log(event.target.parentNode);

  		//mille sees see on UL
  		console.log(event.target.parentNode.parentNode);

  		//id
  		console.log(event.target.dataset.id);

  		var c = confirm("Oled kindel?");

  		// vajutas no, pani ristist kinni
  		if(!c){	return; }

  		//KUSTUTAN
  		console.log('kustutan');

  		// KUSTUTAN HTMLI
  		var ul = event.target.parentNode.parentNode;
  		var li = event.target.parentNode;

  		ul.removeChild(li);

  		//KUSTUTAN OBJEKTI ja uuenda localStoragit

  		var delete_id = event.target.dataset.id;

  		for(var i = 0; i < this.jars.length; i++){

  			if(this.jars[i].id == delete_id){
  				//see on see
  				//kustuta kohal i objekt ära
  				this.jars.splice(i, 1);
  				break;
  			}
  		}

  		localStorage.setItem('jars', JSON.stringify(this.jars));



  	 },

     search: function(event){
         //otsikasti väärtus
         var needle = document.querySelector('#search').value.toLowerCase();
         console.log(needle);

         var list = document.querySelectorAll('ul.list-of-jars li');
         console.log(list);

         for(var i = 0; i < list.length; i++){

             var li = list[i];

             // ühe listitemi sisu tekst
             var stack = li.querySelector('.content').innerHTML.toLowerCase();

             //kas otsisõna on sisus olemas
             if(stack.indexOf(needle) !== -1){
                 //olemas
                 li.style.display = 'list-item';

             }else{
                 //ei ole, index on -1, peidan
                 li.style.display = 'none';

             }

         }
     },

     addNewClick: function(event){
       //salvestame purgi
       //console.log(event);

       var title = document.querySelector('.title').value;
       var amount = document.querySelector('.amount').value;
       var sets = document.querySelector('.sets').value;
       var id = guid();

       //console.log(title + ' ' + amount);
       //1) tekitan uue Jar'i
       var new_jar = new Jar(id, title, amount, sets);

       //lisan massiiivi purgi
       this.jars.push(new_jar);
       console.log(JSON.stringify(this.jars));
       // JSON'i stringina salvestan localStorage'isse
       localStorage.setItem('jars', JSON.stringify(this.jars));

       // 2) lisan selle htmli listi juurde
       var li = new_jar.createHtmlElement();
       document.querySelector('.list-of-jars').appendChild(li);


     },

     routeChange: function(event){

       //kirjutan muuutujasse lehe nime, võtan maha #
       this.currentRoute = location.hash.slice(1);
       console.log(this.currentRoute);

       //kas meil on selline leht olemas?
       if(this.routes[this.currentRoute]){

         //muudan menüü lingi aktiivseks
         this.updateMenu();

         this.routes[this.currentRoute].render();


       }else{
         /// 404 - ei olnud
       }


     },

     updateMenu: function() {
       //http://stackoverflow.com/questions/195951/change-an-elements-class-with-javascript
       //1) võtan maha aktiivse menüülingi kui on
       document.querySelector('.active-menu').className = document.querySelector('.active-menu').className.replace('active-menu', '');

       //2) lisan uuele juurde
       //console.log(location.hash);
       document.querySelector('.'+this.currentRoute).className += ' active-menu';

     }

   }; // TREENINGKAVA LõPP

   var Jar = function(new_id, new_title, new_amount, new_sets){
     this.id = new_id;
     this.title = new_title;
     this.amount = new_amount;
     this.sets = new_sets;
     console.log('created new jar');
   };

   Jar.prototype = {
     createHtmlElement: function(){

       // võttes title ja amount ->
       /*
       li
        span.letter
          M <- title esimene täht
        span.content
          title | amount
       */

       var li = document.createElement('li');

       var span = document.createElement('span');
       span.className = 'letter';

       var letter = document.createTextNode(this.sets + ' setti');
       span.appendChild(letter);

       li.appendChild(span);

       var btn = document.createElement("button");
       var t = document.createTextNode("PEIDA");
       btn.appendChild(t);

       var span_with_content = document.createElement('span');
       span_with_content.className = 'content';

       var content = document.createTextNode(this.amount + ' x ' + this.title);
       span_with_content.appendChild(content);

       li.appendChild(span_with_content);
       li.appendChild(btn);
       btn.onclick = function () {
         li.style.display = 'none';
       //this.parentElement.removeChild(this);
 };
      var span_delete = document.createElement('span');
      span_delete.style.color = "red";
      span_delete.style.cursor = "pointer";

      //kustutamiseks panen id kaasa
      span_delete.setAttribute("data-id", this.id);

      span_delete.innerHTML = " Delete";

      li.appendChild(span_delete);

      //keegi vajutas nuppu
      span_delete.addEventListener("click", Treeningkava.instance.deleteJar.bind(Treeningkava.instance));



       return li;

     }
   };


     //HELPER
     function guid(){
      var d = new Date().getTime();
      if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
      }
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
    }

   // kui leht laetud käivitan treeningkava rakenduse
   window.onload = function(){
     var app = new Treeningkava();
   };

})();
