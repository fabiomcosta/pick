/*! pick | Fabio Miranda Costa 2011 | The MIT License (http://www.opensource.org/licenses/mit-license.php) */

(function(global, document, undefined) {

    var $p = function(selector, context, elements) {

        if (!selector) return [];
        context = context || $p.context;

        var doc = context ? context.ownerDocument || context : document,
            contextIsNotParent = reSiblingSelector.test(selector),
            contextIsNode = (context && context.nodeType === 1),
            findContext = contextIsNode ? (contextIsNotParent ? context.parentNode : context) : doc;

        if (supports_querySelectorAll) {
            var _selector = selector,
                contextId;

            if (contextIsNode) {
                if (!(contextId = context.id)) {
                    context.id = '_pickid_';
                }
                _selector = '#' + (contextId || '_pickid_') + ' ' + selector;
            }
            try {
                return arrayFrom(findContext.querySelectorAll(_selector));
            } catch (e) {
            } finally {
                if (contextIsNode && !contextId) {
                    context.removeAttribute('id');
                }
            }
        }

        elements = elements || [];

        var parsed = $p.parse(selector),
            rightMostParsed = parsed[parsed.length - 1],
            match = $p.match,
            el, i = 0,
            found = find(doc, findContext, rightMostParsed),
            matchRightMost = !(rightMostParsed.tag ^ rightMostParsed.id && !rightMostParsed.classes && !rightMostParsed.pseudos);

        while ((el = found[i++])) {
            if (match(el, parsed, context, matchRightMost)) {
                elements.push(el);
            }
        }

        return elements;
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

    //matcher
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
                return ((node = node.parentNode).nodeType === 1) && matchParsedSelector(node, parsed);
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

        var match = function(element, selector, context, matchRightMost) {
            if (nativeMatchesSelector) {
                var contextId, hasId, _selector = selector,
                    contextIsNode = (context && context.nodeType === 1);
                if (contextIsNode) {
                    hasId = !!(contextId = context.id);
                    _selector = '#' + (hasId ? contextId : context.id = '_pickid_') + ' ' + selector;
                }
                try {
                    return nativeMatchesSelector.call(element, _selector);
                } catch (e) {
                } finally {
                    if (contextIsNode && !hasId) {
                        context.removeAttribute('id');
                    }
                }
            }

            node = element;

            var parsed = (typeof selector === 'string') ? $p.parse(selector) : selector;

            if (matchRightMost && !matchParsedSelector(element, parsed[parsed.length - 1])) return false;

            for (var i = parsed.length - 1; i--;) {
                if (!combinatorsMatchers[parsed[i+1].combinator](parsed[i])) return false;
            }

            if (context && context.nodeType !== 9 && !combinatorsMatchers[parsed[0].combinator](context)) return false;

            return true;
        };

        var matchParsedSelector = function(node, parsed) {
            var i, _parsed;

            if (parsed.nodeType) {
                return node === parsed;
            }

            if ((_parsed = parsed.tag)) {
                var nodeName = node.nodeName;
                if (_parsed === '*') {
                    if (nodeName < '@') return false; // Fix for comment nodes and closed nodes
                } else {
                    if (nodeName.toLowerCase() !== _parsed) return false;
                }
            }

            if ((_parsed = parsed.id) && node.getAttribute('id') !== _parsed) {
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
                    if (!pseudoClass) throw Error('pick: pseudo-class ":'+ _parsed[i] +'" is not defined.');
                    if (!pseudoClass.call($p, node)) return false;
                }
            }

            return true;
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
            return cache[cacheKey] = parsed;
        };

        var parser = function(all, combinator, spaceCombinator, symbol, name) {
            combinator = combinator || spaceCombinator;
            if (!token || combinator) {
                parsed.push(token = {combinator: combinator || ' '});
            }

            name = name.replace(reUnescape, '');
            if (!symbol) {
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
        reSiblingSelector = /^\s*[+~]/,
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

