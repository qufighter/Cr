expect = require('chai').expect

string1 = 'Hello World'
string2 = 'Hell0 World0'
string3 = '0Hell World'

verifyTextNodeValue = (node, val)->
  expect(node.nodeValue).to.equal(val)
  expect(node.innerHTML).to.equal(val) # Cr-document only
  expect(node.outerHTML).to.equal(val) # Cr-document only
  expect(node.textContent).to.equal(val)

document = new (require('../DOM/Cr-document.js'))
Cr = require('../Cr-node.js')(document)

describe 'Null/Undefined Attribute Omission', ->
  it 'works', ->
    expect(Cr.elm('div',{a:undefined,b:null,c:0,d:false,e:1},[]).outerHTML)
      .to.equal('<div c="0" d="false" e="1"></div>')

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
      myText.textContent=string3
      verifyTextNodeValue(myText, string3)

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
        myDiv.setAttribute('class', Cr.classList(['class1','class2']))
        expect(myDiv.outerHTML).to.equal("<div class=\"class1 class2\">#{string1}</div>")

      it "modify attribute keys list", ->
        myDiv.setAttribute('class', Cr.classList(Cr.keys({class1:1,class2:1,class3:0})))
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

    context 'query-selectable-elements', ->
      # todo - test document.
      # document.querySelector('html') works in chrome
      myDiv = Cr.elm 'div',
        style: "color:blue;"
        class: Cr.classList ["magic"]
        [
          Cr.elm 'span', {href:"defined", class:"wildtest"}, [Cr.txt(string1)]
          Cr.elm 'span', {class:"word"}, [
            Cr.elm 'span', {class:"wildtest"}, [Cr.txt(string1)]
            Cr.elm 'span', {class:"word2 word"}, [Cr.txt(string2)]
          ]
          Cr.elm 'span', {class:"wildtest"}, [Cr.txt(string3)]
          Cr.elm 'span', {class:"up"},
            [Cr.elm 'span', {id:"woah",class:"woah1"}, [Cr.txt(string3)]]
          Cr.elm 'span', {class:"word2-yourmom~ word word3"}, [Cr.txt(string3)]
          Cr.elm 'span', {},
            [
              Cr.elm 'h3', {},
                [Cr.elm 'span', {id:"woah",class:"woah1"}, [Cr.txt(string1)]]
            ]
        ]

      firstSpanWordHtml = '<span class="wildtest">Hello World</span><span class="word2 word">Hell0 World0</span>'

      totalSpans = 10

      it "does not find div (containter itself)", ->
        results = myDiv.querySelectorAll('div')
        expect(results).to.equal(null)

      it "finds all `span`", ->
        results = myDiv.querySelectorAll('span')
        expect(results.length).to.equal(totalSpans)

      it "finds all `span.word`", ->
        results = myDiv.querySelectorAll('span.word')
        expect(results.length).to.equal(3)
        expect(results[0].innerHTML).to.equal(firstSpanWordHtml)
        expect(results[1].innerHTML).to.equal(string2)
        expect(results[2].innerHTML).to.equal(string3)

      it "finds a `span.word`", ->
        results = myDiv.querySelector('span.word')
        expect(results).to.be.ok
        expect(results.innerHTML).to.equal(firstSpanWordHtml)

      it "finds all `span[href=defined]`", ->
        results = myDiv.querySelectorAll('span[href=defined]')
        expect(results.length).to.equal(1)
        expect(results[0].innerHTML).to.equal(string1)

      it 'finds all `span[href="defined"]`', ->
        results = myDiv.querySelectorAll('span[href="defined"]')
        expect(results.length).to.equal(1)
        expect(results[0].innerHTML).to.equal(string1)

      it 'finds no `span[href="def"]`', ->
        results = myDiv.querySelectorAll('span[href="def"]')
        expect(results).to.equal(null)

      it 'finds all `span[href^="def"]`', ->
        results = myDiv.querySelectorAll('span[href^="def"]')
        expect(results.length).to.equal(1)
        expect(results[0].innerHTML).to.equal(string1)

      it 'finds all `span[href$="ined"]`', ->
        results = myDiv.querySelectorAll('span[href$="ined"]')
        expect(results.length).to.equal(1)
        expect(results[0].innerHTML).to.equal(string1)

      it 'finds all `span.word2`', ->
        results = myDiv.querySelectorAll('span.word2')
        expect(results.length).to.equal(1)
        expect(results[0].innerHTML).to.equal(string2)

      it 'finds all `span[class*="word2"]`', ->
        results = myDiv.querySelectorAll('span[class*="word2"]')
        expect(results.length).to.equal(2)
        expect(results[0].innerHTML).to.equal(string2)
        expect(results[1].innerHTML).to.equal(string3)

      it 'finds all `span[class|="word2"]`', ->
        results = myDiv.querySelectorAll('span[class|="word2"]') # seems to actually work right wiht 1 match
        expect(results.length).to.equal(1)
        expect(results[0].innerHTML).to.equal(string3)

      it 'finds all `span[class~="word2"]`', ->
        results = myDiv.querySelectorAll('span[class~="word2"]')
        expect(results.length).to.equal(1)
        expect(results[0].innerHTML).to.equal(string2)

      it 'finds all `span[class~="word2-yourmom~"]`', ->
        results = myDiv.querySelectorAll('span[class~="word2-yourmom~"]')
        expect(results.length).to.equal(1)
        expect(results[0].innerHTML).to.equal(string3)

      it 'finds no `span[href="undefined"]`', ->
        results = myDiv.querySelector('span[href="undefined"]')
        expect(results).to.equal(null)

      it "finds all `span[href]`", ->
        results = myDiv.querySelectorAll('span[href]')
        expect(results.length).to.equal(1)
        expect(results[0].innerHTML).to.equal(string1)

      it "finds no `span[hrzef]`", ->
        results = myDiv.querySelectorAll('span[hrzef]')
        expect(results).to.equal(null)

      it "finds all `span[]`", ->
        results = myDiv.querySelectorAll('span[]')
        expect(results.length).to.equal(totalSpans)

      it "finds all `span.woah1`", ->
        results = myDiv.querySelectorAll('span.woah1')
        expect(results.length).to.equal(2)
        expect(results[0].innerHTML).to.equal(string3)
        expect(results[1].innerHTML).to.equal(string1) # for some reason this is differnt in dom, probably because of ID

      it "finds all `span span.woah1`", ->
        results = myDiv.querySelectorAll('span span.woah1')
        expect(results.length).to.equal(2)
        expect(results[0].innerHTML).to.equal(string3)
        expect(results[1].innerHTML).to.equal(string1)

      it "finds all `span#woah`", ->
        results = myDiv.querySelectorAll('span#woah')
        expect(results.length).to.equal(2)
        expect(results[0].innerHTML).to.equal(string3)
        expect(results[1].innerHTML).to.equal(string1) # for some reason this is differnt in dom, probably because of ID

      it "finds all `span span#woah`", ->
        results = myDiv.querySelectorAll('span span#woah')
        expect(results.length).to.equal(2)
        expect(results[0].innerHTML).to.equal(string3)
        expect(results[1].innerHTML).to.equal(string1)

      it "finds all `span span`", ->
        results = myDiv.querySelectorAll('span span')
        expect(results.length).to.equal(4)
        expect(results[0].innerHTML).to.equal(string1)
        expect(results[1].innerHTML).to.equal(string2)
        expect(results[2].innerHTML).to.equal(string3)
        expect(results[3].innerHTML).to.equal(string1)

      it "finds all `span > span`", ->
        results = myDiv.querySelectorAll('span > span >')
        expect(results.length).to.equal(3)
        expect(results[0].innerHTML).to.equal(string1)
        expect(results[1].innerHTML).to.equal(string2)
        expect(results[2].innerHTML).to.equal(string3)

      it "finds all `span > span.woah1`", ->
        results = myDiv.querySelectorAll('span > span.woah1')
        expect(results.length).to.equal(1)
        expect(results[0].innerHTML).to.equal(string3)

      it "finds all `span > span#woah`", ->
        results = myDiv.querySelectorAll('span > span#woah')
        expect(results.length).to.equal(1)
        expect(results[0].innerHTML).to.equal(string3)

      it "finds all `span.wildtest`", ->
        results = myDiv.querySelectorAll("span.wildtest")
        expect(results.length).to.equal(3)
        expect(results[0].innerHTML).to.equal(string1)
        expect(results[1].innerHTML).to.equal(string1)
        expect(results[2].innerHTML).to.equal(string3)

      it "finds all `span.wildtest + span.word`", ->
        results = myDiv.querySelectorAll("span.wildtest + span.word")
        expect(results.length).to.equal(2)
        expect(results[0].innerHTML).to.equal(firstSpanWordHtml)
        expect(results[1].innerHTML).to.equal(string2)

      it "finds all `span + span.word`", ->
        results = myDiv.querySelectorAll("span + span.word")
        expect(results.length).to.equal(3)
        expect(results[0].innerHTML).to.equal(firstSpanWordHtml)
        expect(results[1].innerHTML).to.equal(string2)
        expect(results[2].innerHTML).to.equal(string3)

      it "finds all `span ~ span.word`", ->
        results = myDiv.querySelectorAll("span + span.word")
        expect(results.length).to.equal(3)
        expect(results[0].innerHTML).to.equal(firstSpanWordHtml)
        expect(results[1].innerHTML).to.equal(string2)
        expect(results[2].innerHTML).to.equal(string3)

      it "finds all `span.wildtest ~ span.word`", ->
        results = myDiv.querySelectorAll("span.wildtest ~ span.word")
        expect(results.length).to.equal(3)
        expect(results[0].innerHTML).to.equal(firstSpanWordHtml)
        expect(results[1].innerHTML).to.equal(string2)
        expect(results[2].innerHTML).to.equal(string3)

      it "finds all `span.word ~ span.up span#woah`", ->
        results = myDiv.querySelectorAll("span.word ~ span.up span#woah")
        expect(results.length).to.equal(1)
        expect(results[0].innerHTML).to.equal(string3)

      it "finds null `span.word + span.up", ->
        results = myDiv.querySelectorAll("span.word + span.up")
        expect(results).to.equal(null)

      it "finds null `span.word + span.up span#woah`", ->
        results = myDiv.querySelectorAll("span.word + span.up span#woah")
        expect(results).to.equal(null)

      it "finds null `span.word > span.up", ->
        results = myDiv.querySelectorAll("span.word > span.up")
        expect(results).to.equal(null)

      it "finds null `span.word > span.up span#woah`", ->
        results = myDiv.querySelectorAll("span.word > span.up span#woah")
        expect(results).to.equal(null)
