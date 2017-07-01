expect = require('chai').expect

document = new (require('../DOM/Cr-document.js'))
Cr = require('../Cr-node.js')(document)
require('../Cr-json.js')(Cr);

textString1 = "the 'only' child node"

myDiv = Cr.fromJson
  div:
    style: Cr.css color:"blue"
    childNodes: [  # when its not an array, this breaks poorly
      text: textString1
    ]

addTestChildren = (node) ->
  node.appendChild( Cr.fromJson
    div:
      style: Cr.css color:"blue"
      childNodes: [  # when its not an array, this breaks poorly
        text: "the 'first' child node"
      ]
  )

  node.appendChild( Cr.fromJson
    text: "the 'second' child node"
  )


verifyOrigional = () ->
  expect(myDiv.childNodes.length).to.equal(1)
  expect(Object.keys(myDiv.attributes).length).to.equal(1)
  expect(myDiv.childNodes[0].text).to.equal(textString1)


describe 'DOM Manipulations', ->

  describe '.cloneNode', ->

    it "origional verifies", ->
      verifyOrigional()

    it "shallow copies node without referencing origional node", ->

      myShallowClone = myDiv.cloneNode(false);
      myShallowClone.setAttribute('second-div', 123);
      expect(myShallowClone.getAttribute('second-div')).to.equal(123)
      expect(myDiv.getAttribute('second-div')).to.equal(undefined)
      expect(myShallowClone.childNodes.length).to.equal(0);

      addTestChildren(myShallowClone)
      expect(myShallowClone.childNodes.length).to.equal(2);

      verifyOrigional()

    it "copies node without referencing origional node", ->

      mySecondDiv = myDiv.cloneNode(true);
      mySecondDiv.setAttribute('second-div', 123);
      expect(mySecondDiv.getAttribute('second-div')).to.equal(123)
      expect(myDiv.getAttribute('second-div')).to.equal(undefined)
      expect(mySecondDiv.childNodes.length).to.equal(1);

      Cr.empty(mySecondDiv)
      expect(mySecondDiv.childNodes.length).to.equal(0);

      addTestChildren(mySecondDiv)
      expect(mySecondDiv.childNodes.length).to.equal(2);

      verifyOrigional()

    it "fragment does clone", -> # todo compare to fragment clone in dom

      emptyFrag = myDiv.__fragment.cloneNode(false);
      expect(emptyFrag.childNodes.length).to.equal(0);

      newFrag = myDiv.__fragment.cloneNode(true);
      expect(newFrag.childNodes.length).to.equal(1);

      Cr.empty(newFrag)
      expect(newFrag.childNodes.length).to.equal(0);

      addTestChildren(newFrag)
      expect(newFrag.childNodes.length).to.equal(2);

      verifyOrigional()

