describe('match', function(){

    var create = function(html, i) {
        var _container = document.createElement('div');
        _container.innerHTML = html;
        return $p('*', _container)[i || 0];
    };

    beforeEach(function(){
        this.addMatchers({
            toMatchSelector: function(selector, context) {
                var actual = this.actual;
                if (typeof actual === 'string') {
                    actual = create(actual);
                }
                return $p.match(actual, selector, context);
            }
        });
    });

    describe('simple selector', function() {
        it('should match a simple id selector', function(){
            expect('<div id="id"></div>').toMatchSelector('#id');
        });

        it('should match a simple tag and id selector', function() {
            expect('<div id="id"></div>').toMatchSelector('div#id');
        });

        it('should match a simple class tag and id selector', function() {
            expect('<div id="id" class="class class2"></div>').toMatchSelector('div#id.class.class2');
        });

        it('should match a simple class tag pseudo and id selector', function() {
            expect('<div id="id" class="class class2"></div>').toMatchSelector('div#id.class.class2:empty:first-child');
        });
    });

    describe('match with the " " combinator', function() {
        it('should match when being the first child', function() {
            expect(create('<div id="id"><b></b></div>', 1)).toMatchSelector('div#id b');
        });

        it('should match with any child level', function() {
            expect(create('<div id="id"><b><i></i></b></div>', 2)).toMatchSelector('div#id i');
        });

        it('should match when using more than one time', function() {
            expect(create('<span><strong><em></em></strong></span>', 2)).toMatchSelector('span strong em');
        });

        it('should not match when it shouldnt', function() {
            expect(create('<span><strong><em></em></strong></span>', 2)).not.toMatchSelector('em strong span');
        });
    });

    describe('match with the ">" combinator', function() {
        it('should match when being the first child', function() {
            expect(create('<div id="id"><b></b></div>', 1)).toMatchSelector('div#id > b');
        });

        it('should match when using more than one time', function() {
            expect(create('<div id="id"><b><i></i></b></div>', 2)).toMatchSelector('div#id > b > i');
        });

        it('should not match when it shouldnt', function() {
            expect(create('<span><strong><em></em></strong></span>', 2)).not.toMatchSelector('span > em');
        });
    });

    describe('match with the "~" combinator', function() {
        it('should match on the simplest case', function() {
            expect(create('<i></i><b></b>', 1)).toMatchSelector('i ~ b');
        });

        it('should match when combined with other combinators', function() {
            expect(create('<div><i></i><b></b></div>', 2)).toMatchSelector('div > i ~ b');
        });

        it('should match when its the nextSibling from the nextSibling', function() {
            expect(create('<i></i><span></span><b></b>', 2)).toMatchSelector('i ~ b');
        });
    });

    describe('match with the "+" combinator', function() {
        it('should match on the simplest case', function() {
            expect(create('<i></i><b></b>', 1)).toMatchSelector('i + b');
        });

        it('should match even when theres a text sibling', function() {
            expect(create('<span></span> <b></b>', 1)).toMatchSelector('span + b');
        });

        it('should not match when its the nextSibling from the nextSibling', function() {
            expect(create('<i></i><span></span><b></b>', 2)).not.toMatchSelector('i + b');
        });
    });

    describe('with context', function() {
        beforeEach(function() {
            this.context = create('<div id="out"><div id="context"></div></div>', 1);
            $p.context = this.context;
        });
        afterEach(function() {
            $p.context = null;
        });

        it('should match a simple selector', function() {
            var el = create('<i></i>');
            this.context.appendChild(el);
            expect(el).toMatchSelector('i');
        });

        it('should not match a simple selector, if the element is not into the context', function() {
            expect('<i></i>').not.toMatchSelector('i');
        });

        it('should match a compound selector', function() {
            var el = create('<i><b></b></i>');
            this.context.appendChild(el);
            expect(el).toMatchSelector('i b');
        });

        it('should not match a compound selector, if the element is not into the context', function() {
            expect('<i><b></b></i>').not.toMatchSelector('i b');
        });

        it('should not match a compound selector with an out of scope element', function() {
            var el = create('<i><b></b></i>');
            this.context.appendChild(el);
            expect(el).not.toMatchSelector('#out i b');
        });
    });

});

