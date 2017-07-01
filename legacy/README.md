NOTE: `Cr-legacy.js` ONLY - delayed listener attachment is removed from `Cr.js`

Back in the day only one of these addEventListener would work
```
 var d=document.createElement('a');
 var t=document.createTextNode('link text');
 d.appendChild(t);
-d.addEventListener('click',doSomething);
 document.body.appendChild(t);
+d.addEventListener('click',doSomething);
```
Cr-legacy.js is backward compatible and accounts for 
this issue!
```
  Cr.elm('div',{'event':['click',doSomething]},[
    Cr.txt('link text')
  ],document.body);
```
The event is only added after the node is appended...
You may also do this
```
  var d = Cr.elm('div',{'event':['click',doSomething]},[
    Cr.txt('link text')
  ]);
  Cr.insertNode(d, document.body);
```
Or an even more traditional approach
```
  var d = Cr.elm('div',{'event':['click',doSomething]},[
    Cr.txt('link text')
  ]);
  document.body.appendChild(d);
  Cr.addListeners();
```
If you don't need to target IE7 or earlier, I recommend you just use `Cr.js` instead of `Cr-legacy.js`.

Events are not added until the elements are
appended to the DOM tree.  The 3 ways to do this
are illustrated above :D

The key 'event' is interchangeable with 'events'
and can be an array of arrays instead of just one.

If you really must attach events earlier 
(before appending to the tree)
use 'loadevents' instead of 'events' (only available in `Cr-legacy.js` and only useful for images, see `Cr-img.js`)

Some more info about how to handle events can be found here: [Javascript on events to addEventListener](http://vidsbee.com/Cr.elm/fromhtml/#howtouse)

Fast forward to current version to find 
```
Cr.elm('div', {
  events: Cr.events(Cr.event('click', doSomething), Cr.evt('mouseup', doSomething)),
  childNodes: [
    Cr.txt('link text')
  ]
}, document.body);
