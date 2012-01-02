/*! pick | Fabio Miranda Costa 2011 | The MIT License (http://www.opensource.org/licenses/mit-license.php) */

(function(global, document, undefined) {

    var $p = function(selector, _context, append) {
        var elements = append || [],
            match = $p.match,
            context = _context || $p.context,
            doc = context.ownerDocument || context;

        //if (supports_querySelectorAll) {
            //var contextId, hasId, _selector = selector,
                //contextParent = (context && context.parentNode),
                //contextIsNode = (context && context.nodeType === 1);

            //if (contextIsNode) {
                //hasId = !!(contextId = context.id);
                //_selector = '#' + (hasId ? contextId : context.id = '_pickid_') + ' ' + selector;
            //}
            //try {
                //return arrayFrom(contextParent.querySelectorAll(_selector));
            //} catch (e) {
            //} finally {
                //if (contextIsNode && !hasId) {
                    //context.removeAttribute('id');
                //}
            //}
        //}

        var parsed = $p.parse(selector),
            firstParsed = parsed[0],
            findContext = context,
            el;

        if (context && context.nodeType === 1 && firstParsed.combinator === '+' || firstParsed.combinator === '~') {
            findContext = context.parentNode || context;
        }

        var found = find(doc, findContext || doc, parsed[parsed.length - 1]);

        for (i = 0; el = found[i++];) {
            if (match(el, selector, context)) {
                elements.push(el);
            }
        }

        return elements;
    };

    var matchParsedSelector = function(node, parsed) {
        var i, _parsed;

        if ('nodeType' in parsed) {
            return node === parsed;
        }

        if ((_parsed = parsed.tag)) {
            var nodeName = node.nodeName.toLowerCase();
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

    var find = function(doc, context, parsed) {
        var parsedId = parsed.id;

        if (parsedId) {
            var element = doc.getElementById(parsedId);
            if (element && (doc === context || contains(context, element))){
                return [element];
            }
        }

        return context.getElementsByTagName(parsed.tag || '*');
    };

    // matcher
    (function() {
        var node;
        var combinatorsMatchers = {
            ' ': function(parsed) {
                while ((node = node.parentNode) && node.nodeType === 1) {
                    if (matchParsedSelector(node, parsed)) {
                        return true;
                    }
                }
                return false;
            },
            '>': function(parsed) {
                return (node.nodeType === 1) && matchParsedSelector((node = node.parentNode), parsed);
            },
            '~': function(parsed) {
                while ((node = node.previousSibling)) {
                    if (node.nodeType === 1 && matchParsedSelector(node, parsed)) {
                        return true;
                    }
                }
                return false;
            },
            '+': function(parsed) {
                while ((node = node.previousSibling)) {
                    if (node.nodeType === 1) {
                        return matchParsedSelector(node, parsed);
                    }
                }
                return false;
            }
        };

        var match = function(element, selector, context) {
            //if (nativeMatchesSelector) {
                //var contextId, hasId, _selector = selector,
                    //contextIsNode = (context && context.nodeType === 1);
                //if (contextIsNode) {
                    //hasId = !!(contextId = context.id);
                    //_selector = '#' + (hasId ? contextId : context.id = '_pickid_') + ' ' + selector;
                //}
                //try {
                    //return nativeMatchesSelector.call(element, _selector);
                //} catch (e) {
                //} finally {
                    //if (contextIsNode && !hasId) {
                        //context.removeAttribute('id');
                    //}
                //}
            //}

            node = element;

            var parsed = $p.parse(selector),
                matches = matchParsedSelector(element, parsed[parsed.length - 1]);

            if (matches) {
                for (var i = parsed.length - 1; i--;) {
                    if (!combinatorsMatchers[parsed[i+1].combinator](parsed[i])) return false;
                }
                if (context && context.nodeType !== 9) {
                    if (!combinatorsMatchers[parsed[0].combinator](context)) return false;
                }
            }

            return matches;
        };

        $p['match'] = match;
    }());

    // parser
    (function() {
        var token,
            parsed,
            cache = {},
            reTrim = /^\s+|\s+$/g,
            splitter = /(?:\s*([>+~])\s*|(\s))?([#.:])?([^#.:+>~\s]*)/,
            reUnescape = /\\/g;

        var parse = function(selector) {
            selector = selector.replace(reTrim, '');
            var cacheKey = selector;
            if (cache[cacheKey]) return cache[cacheKey];
            parsed = [], token = null;
            while ((selector = selector.replace(splitter, parser))) {};
            cache[cacheKey] = parsed;
            return parsed;
        };

        var parser = function(all, combinator, spaceCombinator, symbol, name) {
            combinator = combinator || spaceCombinator;
            if (!token || combinator) {
                parsed.push(token = {combinator: combinator || ' '});
            }

            name = name.replace(reUnescape, '');
            if (!symbol){
                token.tag = name.toLowerCase();
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
        arrayFrom,
        pseudos = {},
        root = document.documentElement;

    var supports_querySelectorAll = !!document.querySelectorAll,
        nativeMatchesSelector = root.matchesSelector || root.msMatchesSelector || root.mozMatchesSelector || root.webkitMatchesSelector;

    if (nativeMatchesSelector) try {
        nativeMatchesSelector.call(root, ':_pick');
        nativeMatchesSelector = null;
    } catch(e) {}

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
    var contains = ('contains' in root) ? function(context, node) {
        return context !== node && context.contains(node);
    } : function(context, node) {
        while ((node = node.parentNode)) {
            if (node === context) return true;
        }
        return false;
    };

    $p['pseudos'] = pseudos;
    $p['context'] = undefined;
    global['pick'] = $p;
    if (!global['$p']) global['$p'] = $p;

})(typeof exports == 'undefined' ? this : exports, document);

