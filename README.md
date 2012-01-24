pick
====
A small, super fast, javascript selector engine to be used anywhere
-------------------------------------------------------------------

pick, is a node selector for HTML documents that uses css expressions to select nodes.
It's based on [Slick](https://github.com/mootools/slick), the selector used on the [Mootools](http://mootools.net) javascript framework.

### Supported selectors
* tag
* id
* class
* custom pseudo-classes

### Unsupported selectors
* multiple expressions (expressions with comma, ex: "div, span")
* attribute (ex: "a[title='title']")

### Suported with the pickPseudoClasses module
* :empty
* :first-child
* :last-child
* :only-child
* :first-of-type
* :last-of-type
* :only-of-type
* :disabled
* :checked
* :selected

note: To build with these pseudo-selectors included do `make build all=true`

How to use
----------

`$p('your-selector')` -> returns an array of nodes that match the selector

Create your own pseudo-class
--------------------------------

	$p.pseudo['your-custom-pseudo'] = function(node){
		return boolean;
	};

It should return true if the passed node fits the behavior of your pseudo. see the ["src/pickPseudoClasses.js"](https://github.com/fabiomcosta/pick/blob/master/src/pickPseudoClasses.js)

Examples
--------

	<div>
		<span>text</span>
		<strong class="strong-class">strong-text</strong>
		<div id="id" class="div-class"></div>
	</div>

* $p('strong.strong-class') -> [<strong.strong-class>]
* $p('span') -> [\<span\>]
* $p('#id') -> [<div#id.div-class>]
* $p('div#id') -> [<div#id.div-class>]
* $p('div#id.div-class') -> [<div#id.div-class>]
* $p('em') -> []

Run Tests
---------

Enter the tests/ folder on your browser.
You'll need PHP on your server to run them.

License
-------

The MIT License (http://www.opensource.org/licenses/mit-license.php)

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
