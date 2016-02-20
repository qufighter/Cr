### Welcome to Cr.elm Library - think of it as document.create

The easy way to go from HTML to Javascript and back again!

This library is designed to make it easy to turn a static
block of HTML into a dynamic Javascript wonderhorse.

This library is great if you
 1. want to dynamically create elements in javascript
 2. wish to avoid innerHTML or document.write
 3. wish to populate node properties dynamically

Here is what the transition looks like:
https://github.com/qufighter/ColorPick/commit/a3bd273409554702c25f6653808352e1ac55d644

Harnessing the power of javascript to 
internationalize the chrome extension example above:
https://github.com/qufighter/ColorPick/commit/5e9be5c6af7e0c1311d709aeac093ee86104e6dc

The javascript grew by only 1KB in size from HTML, 
everything is in the same place it was...
And now you can do neat things with it!

For Example: Call internationalization functions while 
creating the elements you need.

```
  Cr.elm('div',{'event':['click',doSomething]},[
    Cr.txt(chrome.i18n.getMessage('buttonTextTranslation'))
  ],document.body);
```

The HTML into Cr.elm nested javascript converter 
can be found here:
  http://vidsbee.com/Cr.elm/fromhtml/

### Event Listeners - - History - Present - - - - - - - - - - - -

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
These conventions are up for debate, and the
delay of listener adding may become optional
and only apply to dated web browsers.

Events are not added until the elements are
appended to the DOM tree.  The 3 ways to do this
are illustrated above :D

The key 'event' is interchangeable with 'events'
and can be an array of arrays instead of just one.

If you really must attach events earlier 
(before appending to the tree)
use 'loadevents' instead of 'events'

### Cr Node - Server Side - - - - - - - - - - - - - - - - - - - -

(UNTESTED via NPM)
```
  var Cr = require('Cr')();
  var document = Cr.doc;
```
or
```
  var Cr = require('./node_modules/Cr/Cr-node.js')();
  var document = Cr.doc;
```
oorr
```
  var CrDocument = require('.node_modules/Cr/DOM/Cr-document.js');
  var document = new CrDocument();
  var Cr = require('Cr')(document); // by default returns a new document
```
##### (how to extend)

If you need to use Cr-json you'll have to require it, but its missing a
module exports and wont work nicely like it does on the web just yet.

##### (how to render)

Turns out it's a lot faster to try to re-use the same document between requests
```
  var elm1 = Cr.elm('div',{class:'cssrules'},[
    Cr.elm('a',{'href':'#freshLinks'},[Cr.txt('Click Me '), Cr.ent('&nbsp;')])
  ],document.body);

  var link2 = Cr.elm('a',{'href':'#link2'},[
    Cr.txt("You Know What to Do!"),
    Cr.elm('br'),
    Cr.txt("Make text")
  ],elm1);

  Cr.insertNode(link2, document.body, elm1);

  Cr.elm('title',{},[
    Cr.txt("Document Title")
  ],document.head);

  var headerFrag = Cr.frag([
    Cr.elm("script",{src:"Cr.js"}),
    Cr.elm("script",{src:"Cr-json.js"}),
    Cr.elm("link",{href:"test.css", type:'text/css', rel:'stylesheet'})
  ]);

  document.head.appendChild(headerFrag);
```
##### (really how to render)
```
  document.html.outerHTML // witout doctype
  document.outerHTML // with doctype
```
that should give you everything except doctype declaration
keep in mind document is not completely what you expect client side,
it is a trimmed down version with only essential functionality for Cr
```
See Cr-node-example-server.js
See Cr-node-example-server-fast.js
See Cr-node-test.js
See Cr-node.js to see how its initialized - this is what is required by default
```

### License
You can use this in your projects.  There are no guarantees.
If you make money using this then you or those who profit
should share the wealth.  If you use this it is your
responsibility to make sure that the use of this code
is fair to it's developers.  This may include attribution
and/or direct payment.  Otherwise see LICENSE file.

Contact or Paypal: samlarison [at] gmail [dot] com