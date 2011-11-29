describe('match', function(){

    var _cointainer = document.createElement('div');
    var create = function(html, i) {
        _cointainer.innerHTML = html;
        return _cointainer.getElementsByTagName('*')[i || 0];
    };

    beforeEach(function(){
        this.addMatchers({
            toMatchSelector: function(selector) {
                var actual = this.actual;
                if (typeof actual === 'string') {
                    actual = create(actual);
                }
                return $p.match(actual, selector);
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

    it('should match a compound selector', function() {
        expect(create('<div id="id"><b></b></div>', 1)).toMatchSelector('div#id b');
    });

});

