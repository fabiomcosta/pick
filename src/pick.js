(function(global, document) {

    var pseudos = {},
        root = document.documentElement;

    var supports_querySelectorAll = !!document.querySelectorAll,
        nativeMatchesSelector = root.matchesSelector || root.msMatchesSelector || root.mozMatchesSelector || root.webkitMatchesSelector;

    if (nativeMatchesSelector) try {
        nativeMatchesSelector.call(root, ':_pick');
        nativeMatchesSelector = null;
    } catch(e) {}

    var $p = function(selector, _context, append) {
        var elements = append || [],
            context = _context || $p.context || document;

        if (supports_querySelectorAll) try {
            return arrayFrom(context.querySelectorAll(selector));
        } catch (e) {}

        return find(context.ownerDocument || context, context, elements, $p.parse(selector)[0]);
    };

    var matchSelector = function(node, parsed) {
        var i, _parsed;

        if ((_parsed = parsed.tag)) {
            var nodeName = node.nodeName.toUpperCase();
            if (_parsed === '*') {
                if (nodeName < '@') return false; // Fix for comment nodes and closed nodes
            } else {
                if (nodeName !== _parsed) return false;
            }
        }

        if (parsed.id && node.getAttribute('id') !== parsed.id) {
            return false;
        }

        if ((_parsed = parsed.classes)) {
            var className = (' ' + node.className + ' ');
            for (i = _parsed.length; i--;) {
                if (className.indexOf(' ' + _parsed[i] + ' ') < 0) return false;
            }
        }

        if ((_parsed = parsed.pseudos)) {
            for (i = _parsed.length; i--;) {
                var pseudoClass = pseudos[_parsed[i]];
                if (!pseudoClass) throw Error('pick: pseudo-class ":'+_parsed[i]+'" is not defined.');
                if (!pseudoClass.call($p, node)) return false;
            }
        }

        return true;
    };

    var find = function(doc, context, elements, parsed) {
        var parsedId = parsed.id,
            merge = ((parsedId && parsed.tag || parsed.classes || parsed.pseudos)
                || (!parsedId && (parsed.classes || parsed.pseudos))) ?
                arrayFilterAndMerge : arrayMerge;

        if (parsedId) {
            var element = doc.getElementById(parsedId);
            if (element && (doc === context || contains(context, element))){
                merge([element], elements, parsed);
            }
        } else {
            merge(context.getElementsByTagName(parsed.tag || '*'), elements, parsed);
        }

        return elements;
    };

    var node;
    var combinatorsMatchers = {
        ' ': function(parsed) {
            while ((node = node.parentNode)) {
                if (matchSelector(node, parsed)) {
                    return true;
                }
            }
            return false;
        },
        '>': function(parsed) {
            return matchSelector((node = node.parentNode), parsed);
        },
        '~': function(parsed) {
            while ((node = node.previousSibling)) {
                if (matchSelector(node, parsed)) {
                    return true;
                }
            }
            return false;
        },
        '+': function(parsed) {
            while ((node = node.previousSibling)) {
                if (node.nodeType === 1) {
                    return matchSelector(node, parsed);
                }
            }
            return false;
        }
    };

    var match = function(element, selector, context) {
        if (nativeMatchesSelector) {
            var contextId, hasId;
            if (context) {
                hasId = !!(contextId = context.id);
                selector = '#' + (hasId ? contextId : context.id = '__pickid__') + ' ' + selector;
            }
            try {
                return nativeMatchesSelector.call(element, selector);
            } finally {
                if (context && !hasId) {
                    context.removeAttribute('id');
                }
            }
        }

        node = element;

        var parsed = $p.parse(selector),
            matches = matchSelector(element, parsed[parsed.length - 1]);

        for (var i = parsed.length - 1; i--;) {
            matches = matches && combinatorsMatchers[parsed[i+1].combinator](parsed[i]);
        }
        if (context) {
            matches = matches && contains(context, node);
        }

        return matches;
    };

    // parser
    (function() {
        var token,
            parsed,
            reTrim = /^\s+|\s+$/g,
            splitter = /(?:\s*([>+~])\s*|(\s))?([#.:])?([^#.:+>~\s]*)/,
            reUnescape = /\\/g;

        var parse = function(selector) {
            selector = selector.replace(reTrim, '');
            parsed = [], token = null;
            while ((selector = selector.replace(splitter, parser))) {};
            return parsed;
        };

        var parser = function(all, combinator, spaceCombinator, symbol, name) {
            combinator = combinator || spaceCombinator;
            if (!token || combinator != null) {
                parsed.push(token = {combinator: combinator || ' '});
            }

            name = name.replace(reUnescape, '');
            if (!symbol){
                token.tag = name.toUpperCase();
            } else if (symbol === '#') {
                token.id = name;
            } else if (symbol === '.') {
                if (token.classes) {
                    token.classes.push(name);
                } else {
                    token.classes = [name];
                }
            } else if (symbol === ':') {
                if (token.pseudos) {
                    token.pseudos.push(name);
                } else {
                    token.pseudos = [name];
                }
            }
            return '';
        };

        $p['parse'] = parse;
    }());


    // utils
    var slice = Array.prototype.slice,
        arrayFrom;

    try {
        slice.call(root.childNodes, 0);
        arrayFrom = function(collection) {
            return slice.call(collection, 0);
        };
    } catch(e) {
        arrayFrom = function(collection) {
            var array = [];
            for (var i = 0, node; node = collection[i++];) {
                array.push(node);
            }
            return array;
        };
    }
    var arrayMerge = function(collection, elements) {
        for (var i = 0, node; node = collection[i++];) {
            elements.push(node);
        }
    };
    var arrayFilterAndMerge = function(collection, elements, parsed) {
        for (var i = 0, node; node = collection[i++];){
            if (matchSelector(node, parsed)) elements.push(node);
        }
    };
    var contains = function(context, node) {
        do {
            if (node === context) return true;
        } while ((node = node.parentNode));
        return false;
    };

    $p['pseudos'] = pseudos;
    $p['match'] = match;
    $p['context'] = document;
    global['pick'] = $p;
    if (!global['$p']) global['$p'] = $p;

})(typeof exports == 'undefined' ? this : exports, document);

