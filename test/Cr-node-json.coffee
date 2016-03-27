expect = require('chai').expect

string1 = 'Hello World'

document = new (require('../DOM/Cr-document.js'))
Cr = require('../Cr-node.js')(document)
require('../Cr-json.js')(Cr);

describe 'Cr Simple JSON', ->
  describe '.txt', ->
    it "creates '#{string1}' node", ->
      myText = Cr.fromJson text: string1
      expect(myText.nodeType).to.equal(3)
      expect(myText.text).to.equal(string1) # this is a non standard attribute
      expect(myText.outerHTML).to.equal(string1)

  describe '.elm', ->

    context 'with childNodes attribute', ->

      myDiv = Cr.fromJson
        div:
          style: Cr.css color:"blue"
          childNodes: [  # when its not an array, this breaks poorly
            text: string1
          ]

      it "simple div ", ->
        expect(myDiv.outerHTML).to.equal("<div style=\"color:blue;\">#{string1}</div>")

describe 'Cr JSON Object (legacy)', ->
  describe '.txt', ->
    it "creates '#{string1}' node", ->
      myText = Cr.fromJson txt: [string1]
      expect(myText.nodeType).to.equal(3)
      expect(myText.text).to.equal(string1) # this is a non standard attribute
      expect(myText.outerHTML).to.equal(string1)

  describe '.elm', ->

    context 'with childNodes attribute', ->

      myDiv = Cr.fromJson
        elm: [
          'div',
            style: Cr.css color:"blue"
            [
              txt: [string1]
            ]
        ]

      it "simple div ", ->
        expect(myDiv.outerHTML).to.equal("<div style=\"color:blue;\">#{string1}</div>")

describe 'Cr JSON String', ->

  it "Simple JSON", ->
    myDiv = Cr.fromJsonString('{"div":{"style":"color:red;","childNodes":[{"txt":"Hello World"}]}}')
    expect(myDiv.outerHTML).to.equal("<div style=\"color:red;\">Hello World</div>")

  it "JSON Object", ->
    myDiv = Cr.fromJsonString('{"elm":["div",{"style":"color:red;"},[{"txt":["Hello World"]}],"document.body"]}')
    expect(myDiv.outerHTML).to.equal("<div style=\"color:red;\">Hello World</div>")
