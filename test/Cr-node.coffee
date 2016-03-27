expect = require('chai').expect

string1 = 'Hello World'
string2 = 'Hell0 World0'
string3 = '0Hell World'

verifyTextNodeValue = (node, val)->
  expect(node.nodeValue).to.equal(val)
  expect(node.innerHTML).to.equal(val) # Cr-document only
  expect(node.outerHTML).to.equal(val) # Cr-document only

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

      it "simple div ", ->

      myDiv = Cr.elm 'div',
        style: "color:blue;"
        childNodes: [  # when its not an array, this breaks poorly
          Cr.txt string1
        ]

      expect(myDiv.outerHTML).to.equal("<div style=\"color:blue;\">#{string1}</div>")

    context 'without childNodes attribute', ->

      it "simple div ", ->

      myDiv = Cr.elm 'div',
        style: "color:blue;"
        [
          Cr.txt string1
        ]

      expect(myDiv.outerHTML).to.equal("<div style=\"color:blue;\">#{string1}</div>")
