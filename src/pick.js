(function(global, document) {

    var elements,
        parsed,
        parsedClasses,
        parsedPseudos,
        pseudos = {},
        context,
        currentDocument,
        root = document.documentElement;

    var supports_querySelectorAll = !!document.querySelectorAll,
        nativeMatchesSelector = root.matchesSelector || root.msMatchesSelector || root.mozMatchesSelector || root.webkitMatchesSelector;

    if (nativeMatchesSelector) try {
        nativeMatchesSelector.call(root, ':pick');
        nativeMatchesSelector = null;
    } catch(e){};

    var $p = function(selector, _context, append) {
        elements = append || [];
        context = _context || $p.context;
        if (supports_querySelectorAll){
            try{
                arrayFrom(context.querySelectorAll(selector));
                return elements;
            } catch (e){}
        }

        currentDocument = context.ownerDocument || context;
        parse(selector);
        find();

        return elements;
    };

    var matchSelector = function(node) {
        var i;

        if (parsed.tag){
            var nodeName = node.nodeName.toUpperCase();
            if (parsed.tag === '*') {
                if (nodeName < '@') return false; // Fix for comment nodes and closed nodes
            } else {
                if (nodeName !== parsed.tag) return false;
            }
        }

        if (parsed.id && node.getAttribute('id') !== parsed.id) {
            return false;
        }

        if ((parsedClasses = parsed.classes)) {
            var className = (' ' + node.className + ' ');
            for (i = parsedClasses.length; i--;){
                if (className.indexOf(' ' + parsedClasses[i] + ' ') < 0) return false;
            }
        }

        if ((parsedPseudos = parsed.pseudos)) {
            for (i = parsedPseudos.length; i--;){
                var pseudoClass = pseudos[parsedPseudos[i]];
                if (!(pseudoClass && pseudoClass.call($p, node))) return false;
            }
        }

        return true;
    };

    var find = function() {

        var parsedId = parsed.id,
            merge = ((parsedId && parsed.tag || parsed.classes || parsed.pseudos)
                || (!parsedId && (parsed.classes || parsed.pseudos))) ?
                arrayFilterAndMerge : arrayMerge;

        if (parsedId) {

            var el = currentDocument.getElementById(parsedId);
            if (el && (currentDocument === context || contains(el))){
                merge([el]);
            }

        } else {

            merge(context.getElementsByTagName(parsed.tag || '*'));

        }

    };

    var match = function(el, selector) {
        if (nativeMatchesSelector) {
            try {
                return nativeMatchesSelector.call(el, selector);
            } catch(e) {}
        }

        parse(selector);
        return matchSelector(el);
    };

    var obj,
        firstSelector,
        reTrim = /^\s+|\s+$/g,
        splitter = /(?:\s*([>+~])\s*|(\s))?([#.:])?([^#.:+>~\s]*)/,
        reUnescape = /\\/g;

    var parse = function(selector) {
        selector = selector.replace(reTrim, '');
        parsed = [], firstSelector = true;
        while ((selector = selector.replace(splitter, parser))) {};

        // temporary stuff...
        parsed = parsed[0];

        return parsed;
    };

    var parser = function(all, combinator, spaceCombinator, simbol, name) {

        combinator = combinator || spaceCombinator;
        if (firstSelector || combinator != null){
            firstSelector = false;
            parsed.push(obj = {combinator: combinator || ' '});
        }

        name = name.replace(reUnescape, '');
        if (!simbol){
            obj.tag = name.toUpperCase();
        } else if (simbol == '#') {
            obj.id = name;
        } else if (simbol == '.') {
            if (obj.classes) {
                obj.classes.push(name);
            } else {
                obj.classes = [name];
            }
        } else if (simbol == ':') {
            if (obj.pseudos) {
                obj.pseudos.push(name);
            } else {
                obj.pseudos = [name];
            }
        }
        return '';
    };

    var slice = Array.prototype.slice;
    var arrayFrom = function(collection) {
        elements = slice.call(collection, 0);
    };
    var arrayMerge = function(collection) {
        for (var i = 0, node; node = collection[i++];) {
            elements.push(node);
        }
    };
    try {
        slice.call(root.childNodes, 0);
    } catch(e) {
        arrayFrom = arrayMerge;
    }

    var arrayFilterAndMerge = function(found) {
        for (var i = 0, node; node = found[i++];){
            if (matchSelector(node)) elements.push(node);
        }
    };

    var contains = function(node) {
        do {
            if (node === context) return true;
        } while ((node = node.parentNode));
        return false;
    };

    $p['pseudos'] = pseudos;
    $p['parse'] = parse;
    $p['context'] = document;
    $p['match'] = match;
    global['pick'] = $p;
    if (!global['$p']) global['$p'] = $p;

})(typeof exports == 'undefined' ? this : exports, document);
