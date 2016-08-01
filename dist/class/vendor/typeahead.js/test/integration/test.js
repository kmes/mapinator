'use strict';

/* jshint esnext: true, evil: true, sub: true */

var wd = require('yiewd'),
    colors = require('colors'),
    expect = require('chai').expect,
    _ = require('underscore'),
    f = require('util').format,
    env = process.env;

var browser, caps;

browser = (process.env.BROWSER || 'chrome').split(':');

caps = {
  name: f('[%s] typeahead.js ui', browser.join(' , ')),
  browserName: browser[0]
};

setIf(caps, 'version', browser[1]);
setIf(caps, 'platform', browser[2]);
setIf(caps, 'tunnel-identifier', env['TRAVIS_JOB_NUMBER']);
setIf(caps, 'build', env['TRAVIS_BUILD_NUMBER']);
setIf(caps, 'tags', env['CI'] ? ['CI'] : ['local']);

function setIf(obj, key, val) {
  val && (obj[key] = val);
}

describe('jquery-typeahead.js', function () {
  var driver,
      body,
      input,
      hint,
      dropdown,
      allPassed = true;

  this.timeout(300000);

  before(function (done) {
    var host = 'ondemand.saucelabs.com',
        port = 80,
        username,
        password;

    if (env['CI']) {
      host = 'localhost';
      port = 4445;
      username = env['SAUCE_USERNAME'];
      password = env['SAUCE_ACCESS_KEY'];
    }

    driver = wd.remote(host, port, username, password);
    driver.configureHttp({
      timeout: 30000,
      retries: 5,
      retryDelay: 200
    });

    driver.on('status', function (info) {
      console.log(info.cyan);
    });

    driver.on('command', function (meth, path, data) {
      console.log(' > ' + meth.yellow, path.grey, data || '');
    });

    driver.run(regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.init(caps);

            case 2:
              _context.next = 4;
              return this.get('http://localhost:8888/test/integration/test.html');

            case 4:

              body = this.elementByTagName('body');
              _context.next = 7;
              return this.elementById('states');

            case 7:
              input = _context.sent;
              _context.next = 10;
              return this.elementByClassName('tt-hint');

            case 10:
              hint = _context.sent;
              _context.next = 13;
              return this.elementByClassName('tt-dropdown-menu');

            case 13:
              dropdown = _context.sent;


              done();

            case 15:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
  });

  beforeEach(function (done) {
    driver.run(regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return body.click();

            case 2:
              _context2.next = 4;
              return this.execute('window.jQuery("#states").typeahead("val", "")');

            case 4:
              done();

            case 5:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));
  });

  afterEach(function () {
    allPassed = allPassed && this.currentTest.state === 'passed';
  });

  after(function (done) {
    driver.run(regeneratorRuntime.mark(function _callee3() {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return this.quit();

            case 2:
              _context3.next = 4;
              return driver.sauceJobStatus(allPassed);

            case 4:
              done();

            case 5:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));
  });

  describe('on blur', function () {
    it('should close dropdown', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return input.click();

              case 2:
                _context4.next = 4;
                return input.type('mi');

              case 4:
                _context4.next = 6;
                return dropdown.isDisplayed();

              case 6:
                _context4.t0 = _context4.sent;
                expect(_context4.t0).to.equal(true);
                _context4.next = 10;
                return body.click();

              case 10:
                _context4.next = 12;
                return dropdown.isDisplayed();

              case 12:
                _context4.t1 = _context4.sent;
                expect(_context4.t1).to.equal(false);


                done();

              case 15:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));
    });

    it('should clear hint', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return input.click();

              case 2:
                _context5.next = 4;
                return input.type('mi');

              case 4:
                _context5.next = 6;
                return hint.getValue();

              case 6:
                _context5.t0 = _context5.sent;
                expect(_context5.t0).to.equal('michigan');
                _context5.next = 10;
                return body.click();

              case 10:
                _context5.next = 12;
                return hint.getValue();

              case 12:
                _context5.t1 = _context5.sent;
                expect(_context5.t1).to.equal('');


                done();

              case 15:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));
    });
  });

  describe('on query change', function () {
    it('should open dropdown if suggestions', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee6() {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return input.click();

              case 2:
                _context6.next = 4;
                return input.type('mi');

              case 4:
                _context6.next = 6;
                return dropdown.isDisplayed();

              case 6:
                _context6.t0 = _context6.sent;
                expect(_context6.t0).to.equal(true);


                done();

              case 9:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));
    });

    it('should close dropdown if no suggestions', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee7() {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return input.click();

              case 2:
                _context7.next = 4;
                return input.type('huh?');

              case 4:
                _context7.next = 6;
                return dropdown.isDisplayed();

              case 6:
                _context7.t0 = _context7.sent;
                expect(_context7.t0).to.equal(false);


                done();

              case 9:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));
    });

    it('should render suggestions if suggestions', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee8() {
        var suggestions;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return input.click();

              case 2:
                _context8.next = 4;
                return input.type('mi');

              case 4:
                _context8.next = 6;
                return dropdown.elementsByClassName('tt-suggestion');

              case 6:
                suggestions = _context8.sent;


                expect(suggestions).to.have.length('4');
                _context8.next = 10;
                return suggestions[0].text();

              case 10:
                _context8.t0 = _context8.sent;
                expect(_context8.t0).to.equal('Michigan');
                _context8.next = 14;
                return suggestions[1].text();

              case 14:
                _context8.t1 = _context8.sent;
                expect(_context8.t1).to.equal('Minnesota');
                _context8.next = 18;
                return suggestions[2].text();

              case 18:
                _context8.t2 = _context8.sent;
                expect(_context8.t2).to.equal('Mississippi');
                _context8.next = 22;
                return suggestions[3].text();

              case 22:
                _context8.t3 = _context8.sent;
                expect(_context8.t3).to.equal('Missouri');


                done();

              case 25:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));
    });

    it('should show hint if top suggestion is a match', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee9() {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return input.click();

              case 2:
                _context9.next = 4;
                return input.type('mi');

              case 4:
                _context9.next = 6;
                return hint.getValue();

              case 6:
                _context9.t0 = _context9.sent;
                expect(_context9.t0).to.equal('michigan');


                done();

              case 9:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));
    });

    it('should match hint to query', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee10() {
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return input.click();

              case 2:
                _context10.next = 4;
                return input.type('NeW    JE');

              case 4:
                _context10.next = 6;
                return hint.getValue();

              case 6:
                _context10.t0 = _context10.sent;
                expect(_context10.t0).to.equal('NeW    JErsey');


                done();

              case 9:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));
    });

    it('should not show hint if top suggestion is not a match', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee11() {
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return input.click();

              case 2:
                _context11.next = 4;
                return input.type('ham');

              case 4:
                _context11.next = 6;
                return hint.getValue();

              case 6:
                _context11.t0 = _context11.sent;
                expect(_context11.t0).to.equal('');


                done();

              case 9:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));
    });

    it('should not show hint if there is query overflow', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee12() {
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _context12.next = 2;
                return input.click();

              case 2:
                _context12.next = 4;
                return input.type('this    is    a very long    value     so ');

              case 4:
                _context12.next = 6;
                return hint.getValue();

              case 6:
                _context12.t0 = _context12.sent;
                expect(_context12.t0).to.equal('');


                done();

              case 9:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));
    });
  });

  describe('on up arrow', function () {
    it('should cycle through suggestions', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee13() {
        var suggestions;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _context13.next = 2;
                return input.click();

              case 2:
                _context13.next = 4;
                return input.type('mi');

              case 4:
                _context13.next = 6;
                return dropdown.elementsByClassName('tt-suggestion');

              case 6:
                suggestions = _context13.sent;
                _context13.next = 9;
                return input.type(wd.SPECIAL_KEYS['Up arrow']);

              case 9:
                _context13.next = 11;
                return input.getValue();

              case 11:
                _context13.t0 = _context13.sent;
                expect(_context13.t0).to.equal('Missouri');
                _context13.next = 15;
                return suggestions[3].getAttribute('class');

              case 15:
                _context13.t1 = _context13.sent;
                expect(_context13.t1).to.equal('tt-suggestion tt-cursor');
                _context13.next = 19;
                return input.type(wd.SPECIAL_KEYS['Up arrow']);

              case 19:
                _context13.next = 21;
                return input.getValue();

              case 21:
                _context13.t2 = _context13.sent;
                expect(_context13.t2).to.equal('Mississippi');
                _context13.next = 25;
                return suggestions[2].getAttribute('class');

              case 25:
                _context13.t3 = _context13.sent;
                expect(_context13.t3).to.equal('tt-suggestion tt-cursor');
                _context13.next = 29;
                return input.type(wd.SPECIAL_KEYS['Up arrow']);

              case 29:
                _context13.next = 31;
                return input.getValue();

              case 31:
                _context13.t4 = _context13.sent;
                expect(_context13.t4).to.equal('Minnesota');
                _context13.next = 35;
                return suggestions[1].getAttribute('class');

              case 35:
                _context13.t5 = _context13.sent;
                expect(_context13.t5).to.equal('tt-suggestion tt-cursor');
                _context13.next = 39;
                return input.type(wd.SPECIAL_KEYS['Up arrow']);

              case 39:
                _context13.next = 41;
                return input.getValue();

              case 41:
                _context13.t6 = _context13.sent;
                expect(_context13.t6).to.equal('Michigan');
                _context13.next = 45;
                return suggestions[0].getAttribute('class');

              case 45:
                _context13.t7 = _context13.sent;
                expect(_context13.t7).to.equal('tt-suggestion tt-cursor');
                _context13.next = 49;
                return input.type(wd.SPECIAL_KEYS['Up arrow']);

              case 49:
                _context13.next = 51;
                return input.getValue();

              case 51:
                _context13.t8 = _context13.sent;
                expect(_context13.t8).to.equal('mi');
                _context13.next = 55;
                return suggestions[0].getAttribute('class');

              case 55:
                _context13.t9 = _context13.sent;
                expect(_context13.t9).to.equal('tt-suggestion');
                _context13.next = 59;
                return suggestions[1].getAttribute('class');

              case 59:
                _context13.t10 = _context13.sent;
                expect(_context13.t10).to.equal('tt-suggestion');
                _context13.next = 63;
                return suggestions[2].getAttribute('class');

              case 63:
                _context13.t11 = _context13.sent;
                expect(_context13.t11).to.equal('tt-suggestion');
                _context13.next = 67;
                return suggestions[3].getAttribute('class');

              case 67:
                _context13.t12 = _context13.sent;
                expect(_context13.t12).to.equal('tt-suggestion');


                done();

              case 70:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));
    });
  });

  describe('on down arrow', function () {
    it('should cycle through suggestions', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee14() {
        var suggestions;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                _context14.next = 2;
                return input.click();

              case 2:
                _context14.next = 4;
                return input.type('mi');

              case 4:
                _context14.next = 6;
                return dropdown.elementsByClassName('tt-suggestion');

              case 6:
                suggestions = _context14.sent;
                _context14.next = 9;
                return input.type(wd.SPECIAL_KEYS['Down arrow']);

              case 9:
                _context14.next = 11;
                return input.getValue();

              case 11:
                _context14.t0 = _context14.sent;
                expect(_context14.t0).to.equal('Michigan');
                _context14.next = 15;
                return suggestions[0].getAttribute('class');

              case 15:
                _context14.t1 = _context14.sent;
                expect(_context14.t1).to.equal('tt-suggestion tt-cursor');
                _context14.next = 19;
                return input.type(wd.SPECIAL_KEYS['Down arrow']);

              case 19:
                _context14.next = 21;
                return input.getValue();

              case 21:
                _context14.t2 = _context14.sent;
                expect(_context14.t2).to.equal('Minnesota');
                _context14.next = 25;
                return suggestions[1].getAttribute('class');

              case 25:
                _context14.t3 = _context14.sent;
                expect(_context14.t3).to.equal('tt-suggestion tt-cursor');
                _context14.next = 29;
                return input.type(wd.SPECIAL_KEYS['Down arrow']);

              case 29:
                _context14.next = 31;
                return input.getValue();

              case 31:
                _context14.t4 = _context14.sent;
                expect(_context14.t4).to.equal('Mississippi');
                _context14.next = 35;
                return suggestions[2].getAttribute('class');

              case 35:
                _context14.t5 = _context14.sent;
                expect(_context14.t5).to.equal('tt-suggestion tt-cursor');
                _context14.next = 39;
                return input.type(wd.SPECIAL_KEYS['Down arrow']);

              case 39:
                _context14.next = 41;
                return input.getValue();

              case 41:
                _context14.t6 = _context14.sent;
                expect(_context14.t6).to.equal('Missouri');
                _context14.next = 45;
                return suggestions[3].getAttribute('class');

              case 45:
                _context14.t7 = _context14.sent;
                expect(_context14.t7).to.equal('tt-suggestion tt-cursor');
                _context14.next = 49;
                return input.type(wd.SPECIAL_KEYS['Down arrow']);

              case 49:
                _context14.next = 51;
                return input.getValue();

              case 51:
                _context14.t8 = _context14.sent;
                expect(_context14.t8).to.equal('mi');
                _context14.next = 55;
                return suggestions[0].getAttribute('class');

              case 55:
                _context14.t9 = _context14.sent;
                expect(_context14.t9).to.equal('tt-suggestion');
                _context14.next = 59;
                return suggestions[1].getAttribute('class');

              case 59:
                _context14.t10 = _context14.sent;
                expect(_context14.t10).to.equal('tt-suggestion');
                _context14.next = 63;
                return suggestions[2].getAttribute('class');

              case 63:
                _context14.t11 = _context14.sent;
                expect(_context14.t11).to.equal('tt-suggestion');
                _context14.next = 67;
                return suggestions[3].getAttribute('class');

              case 67:
                _context14.t12 = _context14.sent;
                expect(_context14.t12).to.equal('tt-suggestion');


                done();

              case 70:
              case 'end':
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));
    });
  });

  describe('on escape', function () {
    it('should close dropdown', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee15() {
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _context15.next = 2;
                return input.click();

              case 2:
                _context15.next = 4;
                return input.type('mi');

              case 4:
                _context15.next = 6;
                return dropdown.isDisplayed();

              case 6:
                _context15.t0 = _context15.sent;
                expect(_context15.t0).to.equal(true);
                _context15.next = 10;
                return input.type(wd.SPECIAL_KEYS['Escape']);

              case 10:
                _context15.next = 12;
                return dropdown.isDisplayed();

              case 12:
                _context15.t1 = _context15.sent;
                expect(_context15.t1).to.equal(false);


                done();

              case 15:
              case 'end':
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));
    });

    it('should clear hint', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee16() {
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                _context16.next = 2;
                return input.click();

              case 2:
                _context16.next = 4;
                return input.type('mi');

              case 4:
                _context16.next = 6;
                return hint.getValue();

              case 6:
                _context16.t0 = _context16.sent;
                expect(_context16.t0).to.equal('michigan');
                _context16.next = 10;
                return input.type(wd.SPECIAL_KEYS['Escape']);

              case 10:
                _context16.next = 12;
                return hint.getValue();

              case 12:
                _context16.t1 = _context16.sent;
                expect(_context16.t1).to.equal('');


                done();

              case 15:
              case 'end':
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));
    });
  });

  describe('on tab', function () {
    it('should autocomplete if hint is present', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee17() {
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                _context17.next = 2;
                return input.click();

              case 2:
                _context17.next = 4;
                return input.type('mi');

              case 4:
                _context17.next = 6;
                return input.type(wd.SPECIAL_KEYS['Tab']);

              case 6:
                _context17.next = 8;
                return input.getValue();

              case 8:
                _context17.t0 = _context17.sent;
                expect(_context17.t0).to.equal('Michigan');


                done();

              case 11:
              case 'end':
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));
    });

    it('should select if cursor is on suggestion', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee18() {
        var suggestions;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                _context18.next = 2;
                return input.click();

              case 2:
                _context18.next = 4;
                return input.type('mi');

              case 4:
                _context18.next = 6;
                return dropdown.elementsByClassName('tt-suggestion');

              case 6:
                suggestions = _context18.sent;
                _context18.next = 9;
                return input.type(wd.SPECIAL_KEYS['Down arrow']);

              case 9:
                _context18.next = 11;
                return input.type(wd.SPECIAL_KEYS['Down arrow']);

              case 11:
                _context18.next = 13;
                return input.type(wd.SPECIAL_KEYS['Tab']);

              case 13:
                _context18.next = 15;
                return dropdown.isDisplayed();

              case 15:
                _context18.t0 = _context18.sent;
                expect(_context18.t0).to.equal(false);
                _context18.next = 19;
                return input.getValue();

              case 19:
                _context18.t1 = _context18.sent;
                expect(_context18.t1).to.equal('Minnesota');


                done();

              case 22:
              case 'end':
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));
    });
  });

  describe('on right arrow', function () {
    it('should autocomplete if hint is present', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee19() {
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                _context19.next = 2;
                return input.click();

              case 2:
                _context19.next = 4;
                return input.type('mi');

              case 4:
                _context19.next = 6;
                return input.type(wd.SPECIAL_KEYS['Right arrow']);

              case 6:
                _context19.next = 8;
                return input.getValue();

              case 8:
                _context19.t0 = _context19.sent;
                expect(_context19.t0).to.equal('Michigan');


                done();

              case 11:
              case 'end':
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));
    });
  });

  describe('on suggestion click', function () {
    it('should select suggestion', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee20() {
        var suggestions;
        return regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                _context20.next = 2;
                return input.click();

              case 2:
                _context20.next = 4;
                return input.type('mi');

              case 4:
                _context20.next = 6;
                return dropdown.elementsByClassName('tt-suggestion');

              case 6:
                suggestions = _context20.sent;
                _context20.next = 9;
                return suggestions[1].click();

              case 9:
                _context20.next = 11;
                return dropdown.isDisplayed();

              case 11:
                _context20.t0 = _context20.sent;
                expect(_context20.t0).to.equal(false);
                _context20.next = 15;
                return input.getValue();

              case 15:
                _context20.t1 = _context20.sent;
                expect(_context20.t1).to.equal('Minnesota');


                done();

              case 18:
              case 'end':
                return _context20.stop();
            }
          }
        }, _callee20, this);
      }));
    });
  });

  describe('on enter', function () {
    it('should select if cursor is on suggestion', function (done) {
      driver.run(regeneratorRuntime.mark(function _callee21() {
        var suggestions;
        return regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                _context21.next = 2;
                return input.click();

              case 2:
                _context21.next = 4;
                return input.type('mi');

              case 4:
                _context21.next = 6;
                return dropdown.elementsByClassName('tt-suggestion');

              case 6:
                suggestions = _context21.sent;
                _context21.next = 9;
                return input.type(wd.SPECIAL_KEYS['Down arrow']);

              case 9:
                _context21.next = 11;
                return input.type(wd.SPECIAL_KEYS['Down arrow']);

              case 11:
                _context21.next = 13;
                return input.type(wd.SPECIAL_KEYS['Return']);

              case 13:
                _context21.next = 15;
                return dropdown.isDisplayed();

              case 15:
                _context21.t0 = _context21.sent;
                expect(_context21.t0).to.equal(false);
                _context21.next = 19;
                return input.getValue();

              case 19:
                _context21.t1 = _context21.sent;
                expect(_context21.t1).to.equal('Minnesota');


                done();

              case 22:
              case 'end':
                return _context21.stop();
            }
          }
        }, _callee21, this);
      }));
    });
  });
});