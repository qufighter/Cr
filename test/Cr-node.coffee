expect = require('chai').expect

string1 = 'Hello World'
string2 = 'Hell0 World0'
string3 = '0Hell World'

verifyTextNodeValue = (node, val)->
  expect(node.nodeValue).to.equal(val)
  expect(node.innerHTML).to.equal(val) # Cr-document only
  expect(node.outerHTML).to.equal(val) # Cr-document only
  # textContent is DOM only for now

document = new (require('../DOM/Cr-document.js'))
Cr = require('../Cr-node.js')(document)

describe 'Cr', ->
  describe '.txt', ->
    it "creates '#{string1}' node", ->
      myText = Cr.txt(string1)
      expect(myText.nodeType).to.equal(3)
      expect(myText.text).to.equal(string1) # this is a non standard attribute
      verifyTextNodeValue(myText, string1)
      myText.nodeValue=string2
      verifyTextNodeValue(myText, string2)
      myText.innerHTML=string3
      verifyTextNodeValue(myText, string3)
      myText.outerHTML=string1
      verifyTextNodeValue(myText, string1)

  describe '.elm', ->

    context 'with childNodes attribute', ->

      myDiv = Cr.elm 'div',
        style: "color:blue;"
        childNodes: [  # when its not an array, this breaks poorly
          Cr.txt string1
        ]

      it "simple div ", ->
        expect(myDiv.outerHTML).to.equal("<div style=\"color:blue;\">#{string1}</div>")


    context 'without childNodes attribute', ->

      myDiv = Cr.elm 'div',
        style: "color:blue;"
        [
          Cr.txt string1
        ]

      it "simple div ", ->
        expect(myDiv.outerHTML).to.equal("<div style=\"color:blue;\">#{string1}</div>")

      it "replace attribute", ->
        myDiv.setAttribute('class', 'class1')
        myDiv.removeAttribute('style');
        expect(myDiv.outerHTML).to.equal("<div class=\"class1\">#{string1}</div>")

      it "modify attribute list", ->
        myDiv.setAttribute('class', Cr.list(['class1','class2']))
        expect(myDiv.outerHTML).to.equal("<div class=\"class1 class2\">#{string1}</div>")

      it "modify attribute keys list", ->
        myDiv.setAttribute('class', Cr.list(Cr.keys({class1:1,class2:1,class3:0})))
        expect(myDiv.outerHTML).to.equal("<div class=\"class1 class2\">#{string1}</div>")

      it "modify attribute listKeys", ->
        myDiv.setAttribute('class', Cr.listKeys({class1:true,class2:true,class4:0}))
        expect(myDiv.outerHTML).to.equal("<div class=\"class1 class2\">#{string1}</div>")

      it "empty attribute", ->
        myDiv.setAttribute('class', '')
        expect(myDiv.outerHTML).to.equal("<div class=\"\">#{string1}</div>")

      it "omit null attribute", ->
        myDiv.setAttribute('class', null)
        expect(myDiv.outerHTML).to.equal("<div>#{string1}</div>")

      it "omit undefined attribute", ->
        myDiv.setAttribute('class', undefined)
        expect(myDiv.outerHTML).to.equal("<div>#{string1}</div>")