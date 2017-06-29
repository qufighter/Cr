[![Build Status](https://travis-ci.org/qufighter/Cr.svg?branch=master)](https://travis-ci.org/qufighter/Cr)

### Welcome to Cr.elm Library - think of it as document.create

The easy way to go from HTML to Javascript and back again!

This library is designed to make it easy to turn a static
block of HTML into a dynamic Javascript wonderhorse.

This library is great if you
 1. want to dynamically create elements in javascript
 2. wish to avoid innerHTML or document.write
 3. wish to populate node properties dynamically


Here is what the transition looks like:
[link](https://github.com/qufighter/ColorPick/commit/a3bd273409554702c25f6653808352e1ac55d644)

Harnessing the power of javascript to 
internationalize the chrome extension example above:
[link](https://github.com/qufighter/ColorPick/commit/5e9be5c6af7e0c1311d709aeac093ee86104e6dc)

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

### Event Listeners - - History - Present

[About Cr-Legacy and Cr-img](legacy)

### Cr Js - Installation

`npm install create-elements`

`var Cr = require('./node_modules/create-elements/Cr.js')(document); // client side you may omit document`

More Examples of [HTML to Javascript](http://vidsbee.com/Cr.elm/fromhtml/)

### Cr Node - Server Side

```
  var Cr = require('create-elements')(); // creates a new Cr-document using Cr-node.js
  var document = Cr.doc;
```
or
```
  var Cr = require('./node_modules/create-elements/Cr-node.js')();
  var document = Cr.doc;
```
oorr use a custom document
```
  var CrDocument = require('./node_modules/create-elements/DOM/Cr-document.js');
  var document = new CrDocument();
  var Cr = require('create-elements')(document);
```
ooorrr
```
  var document = new (require('./node_modules/create-elements/DOM/Cr-document.js'));
  var Cr = require('create-elements')(document);
```

##### (how to extend)

If you need to use `Cr-json.js` you'll have to require it.
```
  Cr = require('./node_modules/create-elements/Cr-json.js')(Cr);
```
or simply
```
  require('./node_modules/create-elements/Cr-json.js')(Cr);
```

include shortcuts including only Cr.div, Cr.span, Cr.a
```
  require('./node_modules/create-elements/Cr-shortcuts.js')(Cr);
```

See `Cr-node.js` - See that file for recommendations.

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

a special attribute childNodes may be used, and you may then omit the 3rd argument - this provides superior indentation:

```
  var elm1 = Cr.elm('div',{
    class:'cssrules',
    childNodes: [
      Cr.elm('a',{
        href:'#freshLinks',
        childNodes: [Cr.txt('Click Me '), Cr.ent('&nbsp;')]
      })
    ]
  },document.body);

  var link2 = Cr.elm('a',{
    href:'#link2',
    childNodes: [
      Cr.txt("You Know What to Do!"),
      Cr.elm('br'),
      Cr.txt("Make text")
    ]
  },elm1);

  Cr.insertNode(link2, document.body, elm1);

  Cr.elm('title',{
    childNodes: [Cr.txt("Document Title")]
  },document.head);

```

### (coffeescript)

It works, used in tests for more examples

```
  myDiv = Cr.elm 'div',
    style: "color:blue;"
    class: Cr.list ["magic"]
    [
      Cr.elm 'span', {href:"defined", class:"wildtest"}, [Cr.txt(string1)]
      Cr.elm 'span', {class:"word"}, [
        Cr.elm 'span', {class:"wildtest"}, [Cr.txt(string1)]
        Cr.elm 'span', {class:"word2 word"}, [Cr.txt(string2)]
      ]
      Cr.elm 'span', {class:"wildtest"}, [Cr.txt(string3)]
      Cr.elm 'span', {class:"up"},
        [Cr.elm 'span', {id:"woah",class:"woah1"}, [Cr.txt(string3)]]
      Cr.elm 'span', {class:"word2-yourmom word word3"}, [Cr.txt(string3)]
      Cr.elm 'span', {},
        [
          Cr.elm 'h3', {},
            [Cr.elm 'span', {id:"woah",class:"woah1"}, [Cr.txt(string1)]]
        ]
    ]
    document.body
```

a special attribute childNodes may be used, and you may then omit the 3rd argument child nodes array

##### (really how to render)
```
  document.outerHTML; // with doctype
```
or
```
  document.html.outerHTML; // without doctype
```
or
```
  document.body.outerHTML; // just the body
```
etc.


that should give you everything you would expect to send to the client.  You may set `document.doctype` as needed.
keep in mind `document` is not completely what you expect client side,
it is a trimmed down version with only essential functionality for Cr
and basic querySelectAll to retrieve "lost" node references.
The outer most node is returned.
```
See Cr-node-test-server.js
See Cr-node-test-server-fast.js
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
