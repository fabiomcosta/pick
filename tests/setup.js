(function(global){

var Mock = SlickSpec.Mock;
var Browser = SlickSpec.Browser;

var registerSpecs = function(){
    new Mock(/html/i, finderSpecs);
};

var createMocks = function(){
    Mock.CreateTemplate('Generic HTML4 (quirks)',               'mocks/template-quirks.php');
    Mock.CreateTemplate('Generic HTML5',                        'mocks/template-html5.php');

    if (Browser.ie && Browser.version >= 8){
        Mock.CreateTemplate('Generic HTML4 (IE8 as IE7)',       'mocks/template-transitional-ie7.php');
    }
};

global.onload = function(){
    createMocks();
    registerSpecs();
};

global.runnerOnLoad = function(){
    jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
    jasmine.getEnv().execute();
};

})(this);
