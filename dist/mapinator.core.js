/*!
 * typeahead.js 0.11.1
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2015 Twitter, Inc. and other contributors; Licensed MIT
 */

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define("bloodhound", [ "jquery" ], function(a0) {
            return root["Bloodhound"] = factory(a0);
        });
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        root["Bloodhound"] = factory(jQuery);
    }
})(this, function($) {
    var _ = function() {
        "use strict";
        return {
            isMsie: function() {
                return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
            },
            isBlankString: function(str) {
                return !str || /^\s*$/.test(str);
            },
            escapeRegExChars: function(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
            isString: function(obj) {
                return typeof obj === "string";
            },
            isNumber: function(obj) {
                return typeof obj === "number";
            },
            isArray: $.isArray,
            isFunction: $.isFunction,
            isObject: $.isPlainObject,
            isUndefined: function(obj) {
                return typeof obj === "undefined";
            },
            isElement: function(obj) {
                return !!(obj && obj.nodeType === 1);
            },
            isJQuery: function(obj) {
                return obj instanceof $;
            },
            toStr: function toStr(s) {
                return _.isUndefined(s) || s === null ? "" : s + "";
            },
            bind: $.proxy,
            each: function(collection, cb) {
                $.each(collection, reverseArgs);
                function reverseArgs(index, value) {
                    return cb(value, index);
                }
            },
            map: $.map,
            filter: $.grep,
            every: function(obj, test) {
                var result = true;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (!(result = test.call(null, val, key, obj))) {
                        return false;
                    }
                });
                return !!result;
            },
            some: function(obj, test) {
                var result = false;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (result = test.call(null, val, key, obj)) {
                        return false;
                    }
                });
                return !!result;
            },
            mixin: $.extend,
            identity: function(x) {
                return x;
            },
            clone: function(obj) {
                return $.extend(true, {}, obj);
            },
            getIdGenerator: function() {
                var counter = 0;
                return function() {
                    return counter++;
                };
            },
            templatify: function templatify(obj) {
                return $.isFunction(obj) ? obj : template;
                function template() {
                    return String(obj);
                }
            },
            defer: function(fn) {
                setTimeout(fn, 0);
            },
            debounce: function(func, wait, immediate) {
                var timeout, result;
                return function() {
                    var context = this, args = arguments, later, callNow;
                    later = function() {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context, args);
                        }
                    };
                    callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                    }
                    return result;
                };
            },
            throttle: function(func, wait) {
                var context, args, timeout, result, previous, later;
                previous = 0;
                later = function() {
                    previous = new Date();
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date(), remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },
            stringify: function(val) {
                return _.isString(val) ? val : JSON.stringify(val);
            },
            noop: function() {}
        };
    }();
    var VERSION = "0.11.1";
    var tokenizers = function() {
        "use strict";
        return {
            nonword: nonword,
            whitespace: whitespace,
            obj: {
                nonword: getObjTokenizer(nonword),
                whitespace: getObjTokenizer(whitespace)
            }
        };
        function whitespace(str) {
            str = _.toStr(str);
            return str ? str.split(/\s+/) : [];
        }
        function nonword(str) {
            str = _.toStr(str);
            return str ? str.split(/\W+/) : [];
        }
        function getObjTokenizer(tokenizer) {
            return function setKey(keys) {
                keys = _.isArray(keys) ? keys : [].slice.call(arguments, 0);
                return function tokenize(o) {
                    var tokens = [];
                    _.each(keys, function(k) {
                        tokens = tokens.concat(tokenizer(_.toStr(o[k])));
                    });
                    return tokens;
                };
            };
        }
    }();
    var LruCache = function() {
        "use strict";
        function LruCache(maxSize) {
            this.maxSize = _.isNumber(maxSize) ? maxSize : 100;
            this.reset();
            if (this.maxSize <= 0) {
                this.set = this.get = $.noop;
            }
        }
        _.mixin(LruCache.prototype, {
            set: function set(key, val) {
                var tailItem = this.list.tail, node;
                if (this.size >= this.maxSize) {
                    this.list.remove(tailItem);
                    delete this.hash[tailItem.key];
                    this.size--;
                }
                if (node = this.hash[key]) {
                    node.val = val;
                    this.list.moveToFront(node);
                } else {
                    node = new Node(key, val);
                    this.list.add(node);
                    this.hash[key] = node;
                    this.size++;
                }
            },
            get: function get(key) {
                var node = this.hash[key];
                if (node) {
                    this.list.moveToFront(node);
                    return node.val;
                }
            },
            reset: function reset() {
                this.size = 0;
                this.hash = {};
                this.list = new List();
            }
        });
        function List() {
            this.head = this.tail = null;
        }
        _.mixin(List.prototype, {
            add: function add(node) {
                if (this.head) {
                    node.next = this.head;
                    this.head.prev = node;
                }
                this.head = node;
                this.tail = this.tail || node;
            },
            remove: function remove(node) {
                node.prev ? node.prev.next = node.next : this.head = node.next;
                node.next ? node.next.prev = node.prev : this.tail = node.prev;
            },
            moveToFront: function(node) {
                this.remove(node);
                this.add(node);
            }
        });
        function Node(key, val) {
            this.key = key;
            this.val = val;
            this.prev = this.next = null;
        }
        return LruCache;
    }();
    var PersistentStorage = function() {
        "use strict";
        var LOCAL_STORAGE;
        try {
            LOCAL_STORAGE = window.localStorage;
            LOCAL_STORAGE.setItem("~~~", "!");
            LOCAL_STORAGE.removeItem("~~~");
        } catch (err) {
            LOCAL_STORAGE = null;
        }
        function PersistentStorage(namespace, override) {
            this.prefix = [ "__", namespace, "__" ].join("");
            this.ttlKey = "__ttl__";
            this.keyMatcher = new RegExp("^" + _.escapeRegExChars(this.prefix));
            this.ls = override || LOCAL_STORAGE;
            !this.ls && this._noop();
        }
        _.mixin(PersistentStorage.prototype, {
            _prefix: function(key) {
                return this.prefix + key;
            },
            _ttlKey: function(key) {
                return this._prefix(key) + this.ttlKey;
            },
            _noop: function() {
                this.get = this.set = this.remove = this.clear = this.isExpired = _.noop;
            },
            _safeSet: function(key, val) {
                try {
                    this.ls.setItem(key, val);
                } catch (err) {
                    if (err.name === "QuotaExceededError") {
                        this.clear();
                        this._noop();
                    }
                }
            },
            get: function(key) {
                if (this.isExpired(key)) {
                    this.remove(key);
                }
                return decode(this.ls.getItem(this._prefix(key)));
            },
            set: function(key, val, ttl) {
                if (_.isNumber(ttl)) {
                    this._safeSet(this._ttlKey(key), encode(now() + ttl));
                } else {
                    this.ls.removeItem(this._ttlKey(key));
                }
                return this._safeSet(this._prefix(key), encode(val));
            },
            remove: function(key) {
                this.ls.removeItem(this._ttlKey(key));
                this.ls.removeItem(this._prefix(key));
                return this;
            },
            clear: function() {
                var i, keys = gatherMatchingKeys(this.keyMatcher);
                for (i = keys.length; i--; ) {
                    this.remove(keys[i]);
                }
                return this;
            },
            isExpired: function(key) {
                var ttl = decode(this.ls.getItem(this._ttlKey(key)));
                return _.isNumber(ttl) && now() > ttl ? true : false;
            }
        });
        return PersistentStorage;
        function now() {
            return new Date().getTime();
        }
        function encode(val) {
            return JSON.stringify(_.isUndefined(val) ? null : val);
        }
        function decode(val) {
            return $.parseJSON(val);
        }
        function gatherMatchingKeys(keyMatcher) {
            var i, key, keys = [], len = LOCAL_STORAGE.length;
            for (i = 0; i < len; i++) {
                if ((key = LOCAL_STORAGE.key(i)).match(keyMatcher)) {
                    keys.push(key.replace(keyMatcher, ""));
                }
            }
            return keys;
        }
    }();
    var Transport = function() {
        "use strict";
        var pendingRequestsCount = 0, pendingRequests = {}, maxPendingRequests = 6, sharedCache = new LruCache(10);
        function Transport(o) {
            o = o || {};
            this.cancelled = false;
            this.lastReq = null;
            this._send = o.transport;
            this._get = o.limiter ? o.limiter(this._get) : this._get;
            this._cache = o.cache === false ? new LruCache(0) : sharedCache;
        }
        Transport.setMaxPendingRequests = function setMaxPendingRequests(num) {
            maxPendingRequests = num;
        };
        Transport.resetCache = function resetCache() {
            sharedCache.reset();
        };
        _.mixin(Transport.prototype, {
            _fingerprint: function fingerprint(o) {
                o = o || {};
                return o.url + o.type + $.param(o.data || {});
            },
            _get: function(o, cb) {
                var that = this, fingerprint, jqXhr;
                fingerprint = this._fingerprint(o);
                if (this.cancelled || fingerprint !== this.lastReq) {
                    return;
                }
                if (jqXhr = pendingRequests[fingerprint]) {
                    jqXhr.done(done).fail(fail);
                } else if (pendingRequestsCount < maxPendingRequests) {
                    pendingRequestsCount++;
                    pendingRequests[fingerprint] = this._send(o).done(done).fail(fail).always(always);
                } else {
                    this.onDeckRequestArgs = [].slice.call(arguments, 0);
                }
                function done(resp) {
                    cb(null, resp);
                    that._cache.set(fingerprint, resp);
                }
                function fail() {
                    cb(true);
                }
                function always() {
                    pendingRequestsCount--;
                    delete pendingRequests[fingerprint];
                    if (that.onDeckRequestArgs) {
                        that._get.apply(that, that.onDeckRequestArgs);
                        that.onDeckRequestArgs = null;
                    }
                }
            },
            get: function(o, cb) {
                var resp, fingerprint;
                cb = cb || $.noop;
                o = _.isString(o) ? {
                    url: o
                } : o || {};
                fingerprint = this._fingerprint(o);
                this.cancelled = false;
                this.lastReq = fingerprint;
                if (resp = this._cache.get(fingerprint)) {
                    cb(null, resp);
                } else {
                    this._get(o, cb);
                }
            },
            cancel: function() {
                this.cancelled = true;
            }
        });
        return Transport;
    }();
    var SearchIndex = window.SearchIndex = function() {
        "use strict";
        var CHILDREN = "c", IDS = "i";
        function SearchIndex(o) {
            o = o || {};
            if (!o.datumTokenizer || !o.queryTokenizer) {
                $.error("datumTokenizer and queryTokenizer are both required");
            }
            this.identify = o.identify || _.stringify;
            this.datumTokenizer = o.datumTokenizer;
            this.queryTokenizer = o.queryTokenizer;
            this.reset();
        }
        _.mixin(SearchIndex.prototype, {
            bootstrap: function bootstrap(o) {
                this.datums = o.datums;
                this.trie = o.trie;
            },
            add: function(data) {
                var that = this;
                data = _.isArray(data) ? data : [ data ];
                _.each(data, function(datum) {
                    var id, tokens;
                    that.datums[id = that.identify(datum)] = datum;
                    tokens = normalizeTokens(that.datumTokenizer(datum));
                    _.each(tokens, function(token) {
                        var node, chars, ch;
                        node = that.trie;
                        chars = token.split("");
                        while (ch = chars.shift()) {
                            node = node[CHILDREN][ch] || (node[CHILDREN][ch] = newNode());
                            node[IDS].push(id);
                        }
                    });
                });
            },
            get: function get(ids) {
                var that = this;
                return _.map(ids, function(id) {
                    return that.datums[id];
                });
            },
            search: function search(query) {
                var that = this, tokens, matches;
                tokens = normalizeTokens(this.queryTokenizer(query));
                _.each(tokens, function(token) {
                    var node, chars, ch, ids;
                    if (matches && matches.length === 0) {
                        return false;
                    }
                    node = that.trie;
                    chars = token.split("");
                    while (node && (ch = chars.shift())) {
                        node = node[CHILDREN][ch];
                    }
                    if (node && chars.length === 0) {
                        ids = node[IDS].slice(0);
                        matches = matches ? getIntersection(matches, ids) : ids;
                    } else {
                        matches = [];
                        return false;
                    }
                });
                return matches ? _.map(unique(matches), function(id) {
                    return that.datums[id];
                }) : [];
            },
            all: function all() {
                var values = [];
                for (var key in this.datums) {
                    values.push(this.datums[key]);
                }
                return values;
            },
            reset: function reset() {
                this.datums = {};
                this.trie = newNode();
            },
            serialize: function serialize() {
                return {
                    datums: this.datums,
                    trie: this.trie
                };
            }
        });
        return SearchIndex;
        function normalizeTokens(tokens) {
            tokens = _.filter(tokens, function(token) {
                return !!token;
            });
            tokens = _.map(tokens, function(token) {
                return token.toLowerCase();
            });
            return tokens;
        }
        function newNode() {
            var node = {};
            node[IDS] = [];
            node[CHILDREN] = {};
            return node;
        }
        function unique(array) {
            var seen = {}, uniques = [];
            for (var i = 0, len = array.length; i < len; i++) {
                if (!seen[array[i]]) {
                    seen[array[i]] = true;
                    uniques.push(array[i]);
                }
            }
            return uniques;
        }
        function getIntersection(arrayA, arrayB) {
            var ai = 0, bi = 0, intersection = [];
            arrayA = arrayA.sort();
            arrayB = arrayB.sort();
            var lenArrayA = arrayA.length, lenArrayB = arrayB.length;
            while (ai < lenArrayA && bi < lenArrayB) {
                if (arrayA[ai] < arrayB[bi]) {
                    ai++;
                } else if (arrayA[ai] > arrayB[bi]) {
                    bi++;
                } else {
                    intersection.push(arrayA[ai]);
                    ai++;
                    bi++;
                }
            }
            return intersection;
        }
    }();
    var Prefetch = function() {
        "use strict";
        var keys;
        keys = {
            data: "data",
            protocol: "protocol",
            thumbprint: "thumbprint"
        };
        function Prefetch(o) {
            this.url = o.url;
            this.ttl = o.ttl;
            this.cache = o.cache;
            this.prepare = o.prepare;
            this.transform = o.transform;
            this.transport = o.transport;
            this.thumbprint = o.thumbprint;
            this.storage = new PersistentStorage(o.cacheKey);
        }
        _.mixin(Prefetch.prototype, {
            _settings: function settings() {
                return {
                    url: this.url,
                    type: "GET",
                    dataType: "json"
                };
            },
            store: function store(data) {
                if (!this.cache) {
                    return;
                }
                this.storage.set(keys.data, data, this.ttl);
                this.storage.set(keys.protocol, location.protocol, this.ttl);
                this.storage.set(keys.thumbprint, this.thumbprint, this.ttl);
            },
            fromCache: function fromCache() {
                var stored = {}, isExpired;
                if (!this.cache) {
                    return null;
                }
                stored.data = this.storage.get(keys.data);
                stored.protocol = this.storage.get(keys.protocol);
                stored.thumbprint = this.storage.get(keys.thumbprint);
                isExpired = stored.thumbprint !== this.thumbprint || stored.protocol !== location.protocol;
                return stored.data && !isExpired ? stored.data : null;
            },
            fromNetwork: function(cb) {
                var that = this, settings;
                if (!cb) {
                    return;
                }
                settings = this.prepare(this._settings());
                this.transport(settings).fail(onError).done(onResponse);
                function onError() {
                    cb(true);
                }
                function onResponse(resp) {
                    cb(null, that.transform(resp));
                }
            },
            clear: function clear() {
                this.storage.clear();
                return this;
            }
        });
        return Prefetch;
    }();
    var Remote = function() {
        "use strict";
        function Remote(o) {
            this.url = o.url;
            this.prepare = o.prepare;
            this.transform = o.transform;
            this.transport = new Transport({
                cache: o.cache,
                limiter: o.limiter,
                transport: o.transport
            });
        }
        _.mixin(Remote.prototype, {
            _settings: function settings() {
                return {
                    url: this.url,
                    type: "GET",
                    dataType: "json"
                };
            },
            get: function get(query, cb) {
                var that = this, settings;
                if (!cb) {
                    return;
                }
                query = query || "";
                settings = this.prepare(query, this._settings());
                return this.transport.get(settings, onResponse);
                function onResponse(err, resp) {
                    err ? cb([]) : cb(that.transform(resp));
                }
            },
            cancelLastRequest: function cancelLastRequest() {
                this.transport.cancel();
            }
        });
        return Remote;
    }();
    var oParser = function() {
        "use strict";
        return function parse(o) {
            var defaults, sorter;
            defaults = {
                initialize: true,
                identify: _.stringify,
                datumTokenizer: null,
                queryTokenizer: null,
                sufficient: 5,
                sorter: null,
                local: [],
                prefetch: null,
                remote: null
            };
            o = _.mixin(defaults, o || {});
            !o.datumTokenizer && $.error("datumTokenizer is required");
            !o.queryTokenizer && $.error("queryTokenizer is required");
            sorter = o.sorter;
            o.sorter = sorter ? function(x) {
                return x.sort(sorter);
            } : _.identity;
            o.local = _.isFunction(o.local) ? o.local() : o.local;
            o.prefetch = parsePrefetch(o.prefetch);
            o.remote = parseRemote(o.remote);
            return o;
        };
        function parsePrefetch(o) {
            var defaults;
            if (!o) {
                return null;
            }
            defaults = {
                url: null,
                ttl: 24 * 60 * 60 * 1e3,
                cache: true,
                cacheKey: null,
                thumbprint: "",
                prepare: _.identity,
                transform: _.identity,
                transport: null
            };
            o = _.isString(o) ? {
                url: o
            } : o;
            o = _.mixin(defaults, o);
            !o.url && $.error("prefetch requires url to be set");
            o.transform = o.filter || o.transform;
            o.cacheKey = o.cacheKey || o.url;
            o.thumbprint = VERSION + o.thumbprint;
            o.transport = o.transport ? callbackToDeferred(o.transport) : $.ajax;
            return o;
        }
        function parseRemote(o) {
            var defaults;
            if (!o) {
                return;
            }
            defaults = {
                url: null,
                cache: true,
                prepare: null,
                replace: null,
                wildcard: null,
                limiter: null,
                rateLimitBy: "debounce",
                rateLimitWait: 300,
                transform: _.identity,
                transport: null
            };
            o = _.isString(o) ? {
                url: o
            } : o;
            o = _.mixin(defaults, o);
            !o.url && $.error("remote requires url to be set");
            o.transform = o.filter || o.transform;
            o.prepare = toRemotePrepare(o);
            o.limiter = toLimiter(o);
            o.transport = o.transport ? callbackToDeferred(o.transport) : $.ajax;
            delete o.replace;
            delete o.wildcard;
            delete o.rateLimitBy;
            delete o.rateLimitWait;
            return o;
        }
        function toRemotePrepare(o) {
            var prepare, replace, wildcard;
            prepare = o.prepare;
            replace = o.replace;
            wildcard = o.wildcard;
            if (prepare) {
                return prepare;
            }
            if (replace) {
                prepare = prepareByReplace;
            } else if (o.wildcard) {
                prepare = prepareByWildcard;
            } else {
                prepare = idenityPrepare;
            }
            return prepare;
            function prepareByReplace(query, settings) {
                settings.url = replace(settings.url, query);
                return settings;
            }
            function prepareByWildcard(query, settings) {
                settings.url = settings.url.replace(wildcard, encodeURIComponent(query));
                return settings;
            }
            function idenityPrepare(query, settings) {
                return settings;
            }
        }
        function toLimiter(o) {
            var limiter, method, wait;
            limiter = o.limiter;
            method = o.rateLimitBy;
            wait = o.rateLimitWait;
            if (!limiter) {
                limiter = /^throttle$/i.test(method) ? throttle(wait) : debounce(wait);
            }
            return limiter;
            function debounce(wait) {
                return function debounce(fn) {
                    return _.debounce(fn, wait);
                };
            }
            function throttle(wait) {
                return function throttle(fn) {
                    return _.throttle(fn, wait);
                };
            }
        }
        function callbackToDeferred(fn) {
            return function wrapper(o) {
                var deferred = $.Deferred();
                fn(o, onSuccess, onError);
                return deferred;
                function onSuccess(resp) {
                    _.defer(function() {
                        deferred.resolve(resp);
                    });
                }
                function onError(err) {
                    _.defer(function() {
                        deferred.reject(err);
                    });
                }
            };
        }
    }();
    var Bloodhound = function() {
        "use strict";
        var old;
        old = window && window.Bloodhound;
        function Bloodhound(o) {
            o = oParser(o);
            this.sorter = o.sorter;
            this.identify = o.identify;
            this.sufficient = o.sufficient;
            this.local = o.local;
            this.remote = o.remote ? new Remote(o.remote) : null;
            this.prefetch = o.prefetch ? new Prefetch(o.prefetch) : null;
            this.index = new SearchIndex({
                identify: this.identify,
                datumTokenizer: o.datumTokenizer,
                queryTokenizer: o.queryTokenizer
            });
            o.initialize !== false && this.initialize();
        }
        Bloodhound.noConflict = function noConflict() {
            window && (window.Bloodhound = old);
            return Bloodhound;
        };
        Bloodhound.tokenizers = tokenizers;
        _.mixin(Bloodhound.prototype, {
            __ttAdapter: function ttAdapter() {
                var that = this;
                return this.remote ? withAsync : withoutAsync;
                function withAsync(query, sync, async) {
                    return that.search(query, sync, async);
                }
                function withoutAsync(query, sync) {
                    return that.search(query, sync);
                }
            },
            _loadPrefetch: function loadPrefetch() {
                var that = this, deferred, serialized;
                deferred = $.Deferred();
                if (!this.prefetch) {
                    deferred.resolve();
                } else if (serialized = this.prefetch.fromCache()) {
                    this.index.bootstrap(serialized);
                    deferred.resolve();
                } else {
                    this.prefetch.fromNetwork(done);
                }
                return deferred.promise();
                function done(err, data) {
                    if (err) {
                        return deferred.reject();
                    }
                    that.add(data);
                    that.prefetch.store(that.index.serialize());
                    deferred.resolve();
                }
            },
            _initialize: function initialize() {
                var that = this, deferred;
                this.clear();
                (this.initPromise = this._loadPrefetch()).done(addLocalToIndex);
                return this.initPromise;
                function addLocalToIndex() {
                    that.add(that.local);
                }
            },
            initialize: function initialize(force) {
                return !this.initPromise || force ? this._initialize() : this.initPromise;
            },
            add: function add(data) {
                this.index.add(data);
                return this;
            },
            get: function get(ids) {
                ids = _.isArray(ids) ? ids : [].slice.call(arguments);
                return this.index.get(ids);
            },
            search: function search(query, sync, async) {
                var that = this, local;
                local = this.sorter(this.index.search(query));
                sync(this.remote ? local.slice() : local);
                if (this.remote && local.length < this.sufficient) {
                    this.remote.get(query, processRemote);
                } else if (this.remote) {
                    this.remote.cancelLastRequest();
                }
                return this;
                function processRemote(remote) {
                    var nonDuplicates = [];
                    _.each(remote, function(r) {
                        !_.some(local, function(l) {
                            return that.identify(r) === that.identify(l);
                        }) && nonDuplicates.push(r);
                    });
                    async && async(nonDuplicates);
                }
            },
            all: function all() {
                return this.index.all();
            },
            clear: function clear() {
                this.index.reset();
                return this;
            },
            clearPrefetchCache: function clearPrefetchCache() {
                this.prefetch && this.prefetch.clear();
                return this;
            },
            clearRemoteCache: function clearRemoteCache() {
                Transport.resetCache();
                return this;
            },
            ttAdapter: function ttAdapter() {
                return this.__ttAdapter();
            }
        });
        return Bloodhound;
    }();
    return Bloodhound;
});

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define("typeahead.js", [ "jquery" ], function(a0) {
            return factory(a0);
        });
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(this, function($) {
    var _ = function() {
        "use strict";
        return {
            isMsie: function() {
                return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
            },
            isBlankString: function(str) {
                return !str || /^\s*$/.test(str);
            },
            escapeRegExChars: function(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
            isString: function(obj) {
                return typeof obj === "string";
            },
            isNumber: function(obj) {
                return typeof obj === "number";
            },
            isArray: $.isArray,
            isFunction: $.isFunction,
            isObject: $.isPlainObject,
            isUndefined: function(obj) {
                return typeof obj === "undefined";
            },
            isElement: function(obj) {
                return !!(obj && obj.nodeType === 1);
            },
            isJQuery: function(obj) {
                return obj instanceof $;
            },
            toStr: function toStr(s) {
                return _.isUndefined(s) || s === null ? "" : s + "";
            },
            bind: $.proxy,
            each: function(collection, cb) {
                $.each(collection, reverseArgs);
                function reverseArgs(index, value) {
                    return cb(value, index);
                }
            },
            map: $.map,
            filter: $.grep,
            every: function(obj, test) {
                var result = true;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (!(result = test.call(null, val, key, obj))) {
                        return false;
                    }
                });
                return !!result;
            },
            some: function(obj, test) {
                var result = false;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (result = test.call(null, val, key, obj)) {
                        return false;
                    }
                });
                return !!result;
            },
            mixin: $.extend,
            identity: function(x) {
                return x;
            },
            clone: function(obj) {
                return $.extend(true, {}, obj);
            },
            getIdGenerator: function() {
                var counter = 0;
                return function() {
                    return counter++;
                };
            },
            templatify: function templatify(obj) {
                return $.isFunction(obj) ? obj : template;
                function template() {
                    return String(obj);
                }
            },
            defer: function(fn) {
                setTimeout(fn, 0);
            },
            debounce: function(func, wait, immediate) {
                var timeout, result;
                return function() {
                    var context = this, args = arguments, later, callNow;
                    later = function() {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context, args);
                        }
                    };
                    callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                    }
                    return result;
                };
            },
            throttle: function(func, wait) {
                var context, args, timeout, result, previous, later;
                previous = 0;
                later = function() {
                    previous = new Date();
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date(), remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },
            stringify: function(val) {
                return _.isString(val) ? val : JSON.stringify(val);
            },
            noop: function() {}
        };
    }();
    var WWW = function() {
        "use strict";
        var defaultClassNames = {
            wrapper: "twitter-typeahead",
            input: "tt-input",
            hint: "tt-hint",
            menu: "tt-menu",
            dataset: "tt-dataset",
            suggestion: "tt-suggestion",
            selectable: "tt-selectable",
            empty: "tt-empty",
            open: "tt-open",
            cursor: "tt-cursor",
            highlight: "tt-highlight"
        };
        return build;
        function build(o) {
            var www, classes;
            classes = _.mixin({}, defaultClassNames, o);
            www = {
                css: buildCss(),
                classes: classes,
                html: buildHtml(classes),
                selectors: buildSelectors(classes)
            };
            return {
                css: www.css,
                html: www.html,
                classes: www.classes,
                selectors: www.selectors,
                mixin: function(o) {
                    _.mixin(o, www);
                }
            };
        }
        function buildHtml(c) {
            return {
                wrapper: '<span class="' + c.wrapper + '"></span>',
                menu: '<div class="' + c.menu + '"></div>'
            };
        }
        function buildSelectors(classes) {
            var selectors = {};
            _.each(classes, function(v, k) {
                selectors[k] = "." + v;
            });
            return selectors;
        }
        function buildCss() {
            var css = {
                wrapper: {
                    position: "relative",
                    display: "inline-block"
                },
                hint: {
                    position: "absolute",
                    top: "0",
                    left: "0",
                    borderColor: "transparent",
                    boxShadow: "none",
                    opacity: "1"
                },
                input: {
                    position: "relative",
                    verticalAlign: "top",
                    backgroundColor: "transparent"
                },
                inputWithNoHint: {
                    position: "relative",
                    verticalAlign: "top"
                },
                menu: {
                    position: "absolute",
                    top: "100%",
                    left: "0",
                    zIndex: "100",
                    display: "none"
                },
                ltr: {
                    left: "0",
                    right: "auto"
                },
                rtl: {
                    left: "auto",
                    right: " 0"
                }
            };
            if (_.isMsie()) {
                _.mixin(css.input, {
                    backgroundImage: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)"
                });
            }
            return css;
        }
    }();
    var EventBus = function() {
        "use strict";
        var namespace, deprecationMap;
        namespace = "typeahead:";
        deprecationMap = {
            render: "rendered",
            cursorchange: "cursorchanged",
            select: "selected",
            autocomplete: "autocompleted"
        };
        function EventBus(o) {
            if (!o || !o.el) {
                $.error("EventBus initialized without el");
            }
            this.$el = $(o.el);
        }
        _.mixin(EventBus.prototype, {
            _trigger: function(type, args) {
                var $e;
                $e = $.Event(namespace + type);
                (args = args || []).unshift($e);
                this.$el.trigger.apply(this.$el, args);
                return $e;
            },
            before: function(type) {
                var args, $e;
                args = [].slice.call(arguments, 1);
                $e = this._trigger("before" + type, args);
                return $e.isDefaultPrevented();
            },
            trigger: function(type) {
                var deprecatedType;
                this._trigger(type, [].slice.call(arguments, 1));
                if (deprecatedType = deprecationMap[type]) {
                    this._trigger(deprecatedType, [].slice.call(arguments, 1));
                }
            }
        });
        return EventBus;
    }();
    var EventEmitter = function() {
        "use strict";
        var splitter = /\s+/, nextTick = getNextTick();
        return {
            onSync: onSync,
            onAsync: onAsync,
            off: off,
            trigger: trigger
        };
        function on(method, types, cb, context) {
            var type;
            if (!cb) {
                return this;
            }
            types = types.split(splitter);
            cb = context ? bindContext(cb, context) : cb;
            this._callbacks = this._callbacks || {};
            while (type = types.shift()) {
                this._callbacks[type] = this._callbacks[type] || {
                    sync: [],
                    async: []
                };
                this._callbacks[type][method].push(cb);
            }
            return this;
        }
        function onAsync(types, cb, context) {
            return on.call(this, "async", types, cb, context);
        }
        function onSync(types, cb, context) {
            return on.call(this, "sync", types, cb, context);
        }
        function off(types) {
            var type;
            if (!this._callbacks) {
                return this;
            }
            types = types.split(splitter);
            while (type = types.shift()) {
                delete this._callbacks[type];
            }
            return this;
        }
        function trigger(types) {
            var type, callbacks, args, syncFlush, asyncFlush;
            if (!this._callbacks) {
                return this;
            }
            types = types.split(splitter);
            args = [].slice.call(arguments, 1);
            while ((type = types.shift()) && (callbacks = this._callbacks[type])) {
                syncFlush = getFlush(callbacks.sync, this, [ type ].concat(args));
                asyncFlush = getFlush(callbacks.async, this, [ type ].concat(args));
                syncFlush() && nextTick(asyncFlush);
            }
            return this;
        }
        function getFlush(callbacks, context, args) {
            return flush;
            function flush() {
                var cancelled;
                for (var i = 0, len = callbacks.length; !cancelled && i < len; i += 1) {
                    cancelled = callbacks[i].apply(context, args) === false;
                }
                return !cancelled;
            }
        }
        function getNextTick() {
            var nextTickFn;
            if (window.setImmediate) {
                nextTickFn = function nextTickSetImmediate(fn) {
                    setImmediate(function() {
                        fn();
                    });
                };
            } else {
                nextTickFn = function nextTickSetTimeout(fn) {
                    setTimeout(function() {
                        fn();
                    }, 0);
                };
            }
            return nextTickFn;
        }
        function bindContext(fn, context) {
            return fn.bind ? fn.bind(context) : function() {
                fn.apply(context, [].slice.call(arguments, 0));
            };
        }
    }();
    var highlight = function(doc) {
        "use strict";
        var defaults = {
            node: null,
            pattern: null,
            tagName: "strong",
            className: null,
            wordsOnly: false,
            caseSensitive: false
        };
        return function hightlight(o) {
            var regex;
            o = _.mixin({}, defaults, o);
            if (!o.node || !o.pattern) {
                return;
            }
            o.pattern = _.isArray(o.pattern) ? o.pattern : [ o.pattern ];
            regex = getRegex(o.pattern, o.caseSensitive, o.wordsOnly);
            traverse(o.node, hightlightTextNode);
            function hightlightTextNode(textNode) {
                var match, patternNode, wrapperNode;
                if (match = regex.exec(textNode.data)) {
                    wrapperNode = doc.createElement(o.tagName);
                    o.className && (wrapperNode.className = o.className);
                    patternNode = textNode.splitText(match.index);
                    patternNode.splitText(match[0].length);
                    wrapperNode.appendChild(patternNode.cloneNode(true));
                    textNode.parentNode.replaceChild(wrapperNode, patternNode);
                }
                return !!match;
            }
            function traverse(el, hightlightTextNode) {
                var childNode, TEXT_NODE_TYPE = 3;
                for (var i = 0; i < el.childNodes.length; i++) {
                    childNode = el.childNodes[i];
                    if (childNode.nodeType === TEXT_NODE_TYPE) {
                        i += hightlightTextNode(childNode) ? 1 : 0;
                    } else {
                        traverse(childNode, hightlightTextNode);
                    }
                }
            }
        };
        function getRegex(patterns, caseSensitive, wordsOnly) {
            var escapedPatterns = [], regexStr;
            for (var i = 0, len = patterns.length; i < len; i++) {
                escapedPatterns.push(_.escapeRegExChars(patterns[i]));
            }
            regexStr = wordsOnly ? "\\b(" + escapedPatterns.join("|") + ")\\b" : "(" + escapedPatterns.join("|") + ")";
            return caseSensitive ? new RegExp(regexStr) : new RegExp(regexStr, "i");
        }
    }(window.document);
    var Input = function() {
        "use strict";
        var specialKeyCodeMap;
        specialKeyCodeMap = {
            9: "tab",
            27: "esc",
            37: "left",
            39: "right",
            13: "enter",
            38: "up",
            40: "down"
        };
        function Input(o, www) {
            o = o || {};
            if (!o.input) {
                $.error("input is missing");
            }
            www.mixin(this);
            this.$hint = $(o.hint);
            this.$input = $(o.input);
            this.query = this.$input.val();
            this.queryWhenFocused = this.hasFocus() ? this.query : null;
            this.$overflowHelper = buildOverflowHelper(this.$input);
            this._checkLanguageDirection();
            if (this.$hint.length === 0) {
                this.setHint = this.getHint = this.clearHint = this.clearHintIfInvalid = _.noop;
            }
        }
        Input.normalizeQuery = function(str) {
            return _.toStr(str).replace(/^\s*/g, "").replace(/\s{2,}/g, " ");
        };
        _.mixin(Input.prototype, EventEmitter, {
            _onBlur: function onBlur() {
                this.resetInputValue();
                this.trigger("blurred");
            },
            _onFocus: function onFocus() {
                this.queryWhenFocused = this.query;
                this.trigger("focused");
            },
            _onKeydown: function onKeydown($e) {
                var keyName = specialKeyCodeMap[$e.which || $e.keyCode];
                this._managePreventDefault(keyName, $e);
                if (keyName && this._shouldTrigger(keyName, $e)) {
                    this.trigger(keyName + "Keyed", $e);
                }
            },
            _onInput: function onInput() {
                this._setQuery(this.getInputValue());
                this.clearHintIfInvalid();
                this._checkLanguageDirection();
            },
            _managePreventDefault: function managePreventDefault(keyName, $e) {
                var preventDefault;
                switch (keyName) {
                  case "up":
                  case "down":
                    preventDefault = !withModifier($e);
                    break;

                  default:
                    preventDefault = false;
                }
                preventDefault && $e.preventDefault();
            },
            _shouldTrigger: function shouldTrigger(keyName, $e) {
                var trigger;
                switch (keyName) {
                  case "tab":
                    trigger = !withModifier($e);
                    break;

                  default:
                    trigger = true;
                }
                return trigger;
            },
            _checkLanguageDirection: function checkLanguageDirection() {
                var dir = (this.$input.css("direction") || "ltr").toLowerCase();
                if (this.dir !== dir) {
                    this.dir = dir;
                    this.$hint.attr("dir", dir);
                    this.trigger("langDirChanged", dir);
                }
            },
            _setQuery: function setQuery(val, silent) {
                var areEquivalent, hasDifferentWhitespace;
                areEquivalent = areQueriesEquivalent(val, this.query);
                hasDifferentWhitespace = areEquivalent ? this.query.length !== val.length : false;
                this.query = val;
                if (!silent && !areEquivalent) {
                    this.trigger("queryChanged", this.query);
                } else if (!silent && hasDifferentWhitespace) {
                    this.trigger("whitespaceChanged", this.query);
                }
            },
            bind: function() {
                var that = this, onBlur, onFocus, onKeydown, onInput;
                onBlur = _.bind(this._onBlur, this);
                onFocus = _.bind(this._onFocus, this);
                onKeydown = _.bind(this._onKeydown, this);
                onInput = _.bind(this._onInput, this);
                this.$input.on("blur.tt", onBlur).on("focus.tt", onFocus).on("keydown.tt", onKeydown);
                if (!_.isMsie() || _.isMsie() > 9) {
                    this.$input.on("input.tt", onInput);
                } else {
                    this.$input.on("keydown.tt keypress.tt cut.tt paste.tt", function($e) {
                        if (specialKeyCodeMap[$e.which || $e.keyCode]) {
                            return;
                        }
                        _.defer(_.bind(that._onInput, that, $e));
                    });
                }
                return this;
            },
            focus: function focus() {
                this.$input.focus();
            },
            blur: function blur() {
                this.$input.blur();
            },
            getLangDir: function getLangDir() {
                return this.dir;
            },
            getQuery: function getQuery() {
                return this.query || "";
            },
            setQuery: function setQuery(val, silent) {
                this.setInputValue(val);
                this._setQuery(val, silent);
            },
            hasQueryChangedSinceLastFocus: function hasQueryChangedSinceLastFocus() {
                return this.query !== this.queryWhenFocused;
            },
            getInputValue: function getInputValue() {
                return this.$input.val();
            },
            setInputValue: function setInputValue(value) {
                this.$input.val(value);
                this.clearHintIfInvalid();
                this._checkLanguageDirection();
            },
            resetInputValue: function resetInputValue() {
                this.setInputValue(this.query);
            },
            getHint: function getHint() {
                return this.$hint.val();
            },
            setHint: function setHint(value) {
                this.$hint.val(value);
            },
            clearHint: function clearHint() {
                this.setHint("");
            },
            clearHintIfInvalid: function clearHintIfInvalid() {
                var val, hint, valIsPrefixOfHint, isValid;
                val = this.getInputValue();
                hint = this.getHint();
                valIsPrefixOfHint = val !== hint && hint.indexOf(val) === 0;
                isValid = val !== "" && valIsPrefixOfHint && !this.hasOverflow();
                !isValid && this.clearHint();
            },
            hasFocus: function hasFocus() {
                return this.$input.is(":focus");
            },
            hasOverflow: function hasOverflow() {
                var constraint = this.$input.width() - 2;
                this.$overflowHelper.text(this.getInputValue());
                return this.$overflowHelper.width() >= constraint;
            },
            isCursorAtEnd: function() {
                var valueLength, selectionStart, range;
                valueLength = this.$input.val().length;
                selectionStart = this.$input[0].selectionStart;
                if (_.isNumber(selectionStart)) {
                    return selectionStart === valueLength;
                } else if (document.selection) {
                    range = document.selection.createRange();
                    range.moveStart("character", -valueLength);
                    return valueLength === range.text.length;
                }
                return true;
            },
            destroy: function destroy() {
                this.$hint.off(".tt");
                this.$input.off(".tt");
                this.$overflowHelper.remove();
                this.$hint = this.$input = this.$overflowHelper = $("<div>");
            }
        });
        return Input;
        function buildOverflowHelper($input) {
            return $('<pre aria-hidden="true"></pre>').css({
                position: "absolute",
                visibility: "hidden",
                whiteSpace: "pre",
                fontFamily: $input.css("font-family"),
                fontSize: $input.css("font-size"),
                fontStyle: $input.css("font-style"),
                fontVariant: $input.css("font-variant"),
                fontWeight: $input.css("font-weight"),
                wordSpacing: $input.css("word-spacing"),
                letterSpacing: $input.css("letter-spacing"),
                textIndent: $input.css("text-indent"),
                textRendering: $input.css("text-rendering"),
                textTransform: $input.css("text-transform")
            }).insertAfter($input);
        }
        function areQueriesEquivalent(a, b) {
            return Input.normalizeQuery(a) === Input.normalizeQuery(b);
        }
        function withModifier($e) {
            return $e.altKey || $e.ctrlKey || $e.metaKey || $e.shiftKey;
        }
    }();
    var Dataset = function() {
        "use strict";
        var keys, nameGenerator;
        keys = {
            val: "tt-selectable-display",
            obj: "tt-selectable-object"
        };
        nameGenerator = _.getIdGenerator();
        function Dataset(o, www) {
            o = o || {};
            o.templates = o.templates || {};
            o.templates.notFound = o.templates.notFound || o.templates.empty;
            if (!o.source) {
                $.error("missing source");
            }
            if (!o.node) {
                $.error("missing node");
            }
            if (o.name && !isValidName(o.name)) {
                $.error("invalid dataset name: " + o.name);
            }
            www.mixin(this);
            this.highlight = !!o.highlight;
            this.name = o.name || nameGenerator();
            this.limit = o.limit || 5;
            this.displayFn = getDisplayFn(o.display || o.displayKey);
            this.templates = getTemplates(o.templates, this.displayFn);
            this.source = o.source.__ttAdapter ? o.source.__ttAdapter() : o.source;
            this.async = _.isUndefined(o.async) ? this.source.length > 2 : !!o.async;
            this._resetLastSuggestion();
            this.$el = $(o.node).addClass(this.classes.dataset).addClass(this.classes.dataset + "-" + this.name);
        }
        Dataset.extractData = function extractData(el) {
            var $el = $(el);
            if ($el.data(keys.obj)) {
                return {
                    val: $el.data(keys.val) || "",
                    obj: $el.data(keys.obj) || null
                };
            }
            return null;
        };
        _.mixin(Dataset.prototype, EventEmitter, {
            _overwrite: function overwrite(query, suggestions) {
                suggestions = suggestions || [];
                if (suggestions.length) {
                    this._renderSuggestions(query, suggestions);
                } else if (this.async && this.templates.pending) {
                    this._renderPending(query);
                } else if (!this.async && this.templates.notFound) {
                    this._renderNotFound(query);
                } else {
                    this._empty();
                }
                this.trigger("rendered", this.name, suggestions, false);
            },
            _append: function append(query, suggestions) {
                suggestions = suggestions || [];
                if (suggestions.length && this.$lastSuggestion.length) {
                    this._appendSuggestions(query, suggestions);
                } else if (suggestions.length) {
                    this._renderSuggestions(query, suggestions);
                } else if (!this.$lastSuggestion.length && this.templates.notFound) {
                    this._renderNotFound(query);
                }
                this.trigger("rendered", this.name, suggestions, true);
            },
            _renderSuggestions: function renderSuggestions(query, suggestions) {
                var $fragment;
                $fragment = this._getSuggestionsFragment(query, suggestions);
                this.$lastSuggestion = $fragment.children().last();
                this.$el.html($fragment).prepend(this._getHeader(query, suggestions)).append(this._getFooter(query, suggestions));
            },
            _appendSuggestions: function appendSuggestions(query, suggestions) {
                var $fragment, $lastSuggestion;
                $fragment = this._getSuggestionsFragment(query, suggestions);
                $lastSuggestion = $fragment.children().last();
                this.$lastSuggestion.after($fragment);
                this.$lastSuggestion = $lastSuggestion;
            },
            _renderPending: function renderPending(query) {
                var template = this.templates.pending;
                this._resetLastSuggestion();
                template && this.$el.html(template({
                    query: query,
                    dataset: this.name
                }));
            },
            _renderNotFound: function renderNotFound(query) {
                var template = this.templates.notFound;
                this._resetLastSuggestion();
                template && this.$el.html(template({
                    query: query,
                    dataset: this.name
                }));
            },
            _empty: function empty() {
                this.$el.empty();
                this._resetLastSuggestion();
            },
            _getSuggestionsFragment: function getSuggestionsFragment(query, suggestions) {
                var that = this, fragment;
                fragment = document.createDocumentFragment();
                _.each(suggestions, function getSuggestionNode(suggestion) {
                    var $el, context;
                    context = that._injectQuery(query, suggestion);
                    $el = $(that.templates.suggestion(context)).data(keys.obj, suggestion).data(keys.val, that.displayFn(suggestion)).addClass(that.classes.suggestion + " " + that.classes.selectable);
                    fragment.appendChild($el[0]);
                });
                this.highlight && highlight({
                    className: this.classes.highlight,
                    node: fragment,
                    pattern: query
                });
                return $(fragment);
            },
            _getFooter: function getFooter(query, suggestions) {
                return this.templates.footer ? this.templates.footer({
                    query: query,
                    suggestions: suggestions,
                    dataset: this.name
                }) : null;
            },
            _getHeader: function getHeader(query, suggestions) {
                return this.templates.header ? this.templates.header({
                    query: query,
                    suggestions: suggestions,
                    dataset: this.name
                }) : null;
            },
            _resetLastSuggestion: function resetLastSuggestion() {
                this.$lastSuggestion = $();
            },
            _injectQuery: function injectQuery(query, obj) {
                return _.isObject(obj) ? _.mixin({
                    _query: query
                }, obj) : obj;
            },
            update: function update(query) {
                var that = this, canceled = false, syncCalled = false, rendered = 0;
                this.cancel();
                this.cancel = function cancel() {
                    canceled = true;
                    that.cancel = $.noop;
                    that.async && that.trigger("asyncCanceled", query);
                };
                this.source(query, sync, async);
                !syncCalled && sync([]);
                function sync(suggestions) {
                    if (syncCalled) {
                        return;
                    }
                    syncCalled = true;
                    suggestions = (suggestions || []).slice(0, that.limit);
                    rendered = suggestions.length;
                    that._overwrite(query, suggestions);
                    if (rendered < that.limit && that.async) {
                        that.trigger("asyncRequested", query);
                    }
                }
                function async(suggestions) {
                    suggestions = suggestions || [];
                    if (!canceled && rendered < that.limit) {
                        that.cancel = $.noop;
                        rendered += suggestions.length;
                        that._append(query, suggestions.slice(0, that.limit - rendered));
                        that.async && that.trigger("asyncReceived", query);
                    }
                }
            },
            cancel: $.noop,
            clear: function clear() {
                this._empty();
                this.cancel();
                this.trigger("cleared");
            },
            isEmpty: function isEmpty() {
                return this.$el.is(":empty");
            },
            destroy: function destroy() {
                this.$el = $("<div>");
            }
        });
        return Dataset;
        function getDisplayFn(display) {
            display = display || _.stringify;
            return _.isFunction(display) ? display : displayFn;
            function displayFn(obj) {
                return obj[display];
            }
        }
        function getTemplates(templates, displayFn) {
            return {
                notFound: templates.notFound && _.templatify(templates.notFound),
                pending: templates.pending && _.templatify(templates.pending),
                header: templates.header && _.templatify(templates.header),
                footer: templates.footer && _.templatify(templates.footer),
                suggestion: templates.suggestion || suggestionTemplate
            };
            function suggestionTemplate(context) {
                return $("<div>").text(displayFn(context));
            }
        }
        function isValidName(str) {
            return /^[_a-zA-Z0-9-]+$/.test(str);
        }
    }();
    var Menu = function() {
        "use strict";
        function Menu(o, www) {
            var that = this;
            o = o || {};
            if (!o.node) {
                $.error("node is required");
            }
            www.mixin(this);
            this.$node = $(o.node);
            this.query = null;
            this.datasets = _.map(o.datasets, initializeDataset);
            function initializeDataset(oDataset) {
                var node = that.$node.find(oDataset.node).first();
                oDataset.node = node.length ? node : $("<div>").appendTo(that.$node);
                return new Dataset(oDataset, www);
            }
        }
        _.mixin(Menu.prototype, EventEmitter, {
            _onSelectableClick: function onSelectableClick($e) {
                this.trigger("selectableClicked", $($e.currentTarget));
            },
            _onRendered: function onRendered(type, dataset, suggestions, async) {
                this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
                this.trigger("datasetRendered", dataset, suggestions, async);
            },
            _onCleared: function onCleared() {
                this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
                this.trigger("datasetCleared");
            },
            _propagate: function propagate() {
                this.trigger.apply(this, arguments);
            },
            _allDatasetsEmpty: function allDatasetsEmpty() {
                return _.every(this.datasets, isDatasetEmpty);
                function isDatasetEmpty(dataset) {
                    return dataset.isEmpty();
                }
            },
            _getSelectables: function getSelectables() {
                return this.$node.find(this.selectors.selectable);
            },
            _removeCursor: function _removeCursor() {
                var $selectable = this.getActiveSelectable();
                $selectable && $selectable.removeClass(this.classes.cursor);
            },
            _ensureVisible: function ensureVisible($el) {
                var elTop, elBottom, nodeScrollTop, nodeHeight;
                elTop = $el.position().top;
                elBottom = elTop + $el.outerHeight(true);
                nodeScrollTop = this.$node.scrollTop();
                nodeHeight = this.$node.height() + parseInt(this.$node.css("paddingTop"), 10) + parseInt(this.$node.css("paddingBottom"), 10);
                if (elTop < 0) {
                    this.$node.scrollTop(nodeScrollTop + elTop);
                } else if (nodeHeight < elBottom) {
                    this.$node.scrollTop(nodeScrollTop + (elBottom - nodeHeight));
                }
            },
            bind: function() {
                var that = this, onSelectableClick;
                onSelectableClick = _.bind(this._onSelectableClick, this);
                this.$node.on("click.tt", this.selectors.selectable, onSelectableClick);
                _.each(this.datasets, function(dataset) {
                    dataset.onSync("asyncRequested", that._propagate, that).onSync("asyncCanceled", that._propagate, that).onSync("asyncReceived", that._propagate, that).onSync("rendered", that._onRendered, that).onSync("cleared", that._onCleared, that);
                });
                return this;
            },
            isOpen: function isOpen() {
                return this.$node.hasClass(this.classes.open);
            },
            open: function open() {
                this.$node.addClass(this.classes.open);
            },
            close: function close() {
                this.$node.removeClass(this.classes.open);
                this._removeCursor();
            },
            setLanguageDirection: function setLanguageDirection(dir) {
                this.$node.attr("dir", dir);
            },
            selectableRelativeToCursor: function selectableRelativeToCursor(delta) {
                var $selectables, $oldCursor, oldIndex, newIndex;
                $oldCursor = this.getActiveSelectable();
                $selectables = this._getSelectables();
                oldIndex = $oldCursor ? $selectables.index($oldCursor) : -1;
                newIndex = oldIndex + delta;
                newIndex = (newIndex + 1) % ($selectables.length + 1) - 1;
                newIndex = newIndex < -1 ? $selectables.length - 1 : newIndex;
                return newIndex === -1 ? null : $selectables.eq(newIndex);
            },
            setCursor: function setCursor($selectable) {
                this._removeCursor();
                if ($selectable = $selectable && $selectable.first()) {
                    $selectable.addClass(this.classes.cursor);
                    this._ensureVisible($selectable);
                }
            },
            getSelectableData: function getSelectableData($el) {
                return $el && $el.length ? Dataset.extractData($el) : null;
            },
            getActiveSelectable: function getActiveSelectable() {
                var $selectable = this._getSelectables().filter(this.selectors.cursor).first();
                return $selectable.length ? $selectable : null;
            },
            getTopSelectable: function getTopSelectable() {
                var $selectable = this._getSelectables().first();
                return $selectable.length ? $selectable : null;
            },
            update: function update(query) {
                var isValidUpdate = query !== this.query;
                if (isValidUpdate) {
                    this.query = query;
                    _.each(this.datasets, updateDataset);
                }
                return isValidUpdate;
                function updateDataset(dataset) {
                    dataset.update(query);
                }
            },
            empty: function empty() {
                _.each(this.datasets, clearDataset);
                this.query = null;
                this.$node.addClass(this.classes.empty);
                function clearDataset(dataset) {
                    dataset.clear();
                }
            },
            destroy: function destroy() {
                this.$node.off(".tt");
                this.$node = $("<div>");
                _.each(this.datasets, destroyDataset);
                function destroyDataset(dataset) {
                    dataset.destroy();
                }
            }
        });
        return Menu;
    }();
    var DefaultMenu = function() {
        "use strict";
        var s = Menu.prototype;
        function DefaultMenu() {
            Menu.apply(this, [].slice.call(arguments, 0));
        }
        _.mixin(DefaultMenu.prototype, Menu.prototype, {
            open: function open() {
                !this._allDatasetsEmpty() && this._show();
                return s.open.apply(this, [].slice.call(arguments, 0));
            },
            close: function close() {
                this._hide();
                return s.close.apply(this, [].slice.call(arguments, 0));
            },
            _onRendered: function onRendered() {
                if (this._allDatasetsEmpty()) {
                    this._hide();
                } else {
                    this.isOpen() && this._show();
                }
                return s._onRendered.apply(this, [].slice.call(arguments, 0));
            },
            _onCleared: function onCleared() {
                if (this._allDatasetsEmpty()) {
                    this._hide();
                } else {
                    this.isOpen() && this._show();
                }
                return s._onCleared.apply(this, [].slice.call(arguments, 0));
            },
            setLanguageDirection: function setLanguageDirection(dir) {
                this.$node.css(dir === "ltr" ? this.css.ltr : this.css.rtl);
                return s.setLanguageDirection.apply(this, [].slice.call(arguments, 0));
            },
            _hide: function hide() {
                this.$node.hide();
            },
            _show: function show() {
                this.$node.css("display", "block");
            }
        });
        return DefaultMenu;
    }();
    var Typeahead = function() {
        "use strict";
        function Typeahead(o, www) {
            var onFocused, onBlurred, onEnterKeyed, onTabKeyed, onEscKeyed, onUpKeyed, onDownKeyed, onLeftKeyed, onRightKeyed, onQueryChanged, onWhitespaceChanged;
            o = o || {};
            if (!o.input) {
                $.error("missing input");
            }
            if (!o.menu) {
                $.error("missing menu");
            }
            if (!o.eventBus) {
                $.error("missing event bus");
            }
            www.mixin(this);
            this.eventBus = o.eventBus;
            this.minLength = _.isNumber(o.minLength) ? o.minLength : 1;
            this.input = o.input;
            this.menu = o.menu;
            this.enabled = true;
            this.active = false;
            this.input.hasFocus() && this.activate();
            this.dir = this.input.getLangDir();
            this._hacks();
            this.menu.bind().onSync("selectableClicked", this._onSelectableClicked, this).onSync("asyncRequested", this._onAsyncRequested, this).onSync("asyncCanceled", this._onAsyncCanceled, this).onSync("asyncReceived", this._onAsyncReceived, this).onSync("datasetRendered", this._onDatasetRendered, this).onSync("datasetCleared", this._onDatasetCleared, this);
            onFocused = c(this, "activate", "open", "_onFocused");
            onBlurred = c(this, "deactivate", "_onBlurred");
            onEnterKeyed = c(this, "isActive", "isOpen", "_onEnterKeyed");
            onTabKeyed = c(this, "isActive", "isOpen", "_onTabKeyed");
            onEscKeyed = c(this, "isActive", "_onEscKeyed");
            onUpKeyed = c(this, "isActive", "open", "_onUpKeyed");
            onDownKeyed = c(this, "isActive", "open", "_onDownKeyed");
            onLeftKeyed = c(this, "isActive", "isOpen", "_onLeftKeyed");
            onRightKeyed = c(this, "isActive", "isOpen", "_onRightKeyed");
            onQueryChanged = c(this, "_openIfActive", "_onQueryChanged");
            onWhitespaceChanged = c(this, "_openIfActive", "_onWhitespaceChanged");
            this.input.bind().onSync("focused", onFocused, this).onSync("blurred", onBlurred, this).onSync("enterKeyed", onEnterKeyed, this).onSync("tabKeyed", onTabKeyed, this).onSync("escKeyed", onEscKeyed, this).onSync("upKeyed", onUpKeyed, this).onSync("downKeyed", onDownKeyed, this).onSync("leftKeyed", onLeftKeyed, this).onSync("rightKeyed", onRightKeyed, this).onSync("queryChanged", onQueryChanged, this).onSync("whitespaceChanged", onWhitespaceChanged, this).onSync("langDirChanged", this._onLangDirChanged, this);
        }
        _.mixin(Typeahead.prototype, {
            _hacks: function hacks() {
                var $input, $menu;
                $input = this.input.$input || $("<div>");
                $menu = this.menu.$node || $("<div>");
                $input.on("blur.tt", function($e) {
                    var active, isActive, hasActive;
                    active = document.activeElement;
                    isActive = $menu.is(active);
                    hasActive = $menu.has(active).length > 0;
                    if (_.isMsie() && (isActive || hasActive)) {
                        $e.preventDefault();
                        $e.stopImmediatePropagation();
                        _.defer(function() {
                            $input.focus();
                        });
                    }
                });
                $menu.on("mousedown.tt", function($e) {
                    $e.preventDefault();
                });
            },
            _onSelectableClicked: function onSelectableClicked(type, $el) {
                this.select($el);
            },
            _onDatasetCleared: function onDatasetCleared() {
                this._updateHint();
            },
            _onDatasetRendered: function onDatasetRendered(type, dataset, suggestions, async) {
                this._updateHint();
                this.eventBus.trigger("render", suggestions, async, dataset);
            },
            _onAsyncRequested: function onAsyncRequested(type, dataset, query) {
                this.eventBus.trigger("asyncrequest", query, dataset);
            },
            _onAsyncCanceled: function onAsyncCanceled(type, dataset, query) {
                this.eventBus.trigger("asynccancel", query, dataset);
            },
            _onAsyncReceived: function onAsyncReceived(type, dataset, query) {
                this.eventBus.trigger("asyncreceive", query, dataset);
            },
            _onFocused: function onFocused() {
                this._minLengthMet() && this.menu.update(this.input.getQuery());
            },
            _onBlurred: function onBlurred() {
                if (this.input.hasQueryChangedSinceLastFocus()) {
                    this.eventBus.trigger("change", this.input.getQuery());
                }
            },
            _onEnterKeyed: function onEnterKeyed(type, $e) {
                var $selectable;
                if ($selectable = this.menu.getActiveSelectable()) {
                    this.select($selectable) && $e.preventDefault();
                }
            },
            _onTabKeyed: function onTabKeyed(type, $e) {
                var $selectable;
                if ($selectable = this.menu.getActiveSelectable()) {
                    this.select($selectable) && $e.preventDefault();
                } else if ($selectable = this.menu.getTopSelectable()) {
                    this.autocomplete($selectable) && $e.preventDefault();
                }
            },
            _onEscKeyed: function onEscKeyed() {
                this.close();
            },
            _onUpKeyed: function onUpKeyed() {
                this.moveCursor(-1);
            },
            _onDownKeyed: function onDownKeyed() {
                this.moveCursor(+1);
            },
            _onLeftKeyed: function onLeftKeyed() {
                if (this.dir === "rtl" && this.input.isCursorAtEnd()) {
                    this.autocomplete(this.menu.getTopSelectable());
                }
            },
            _onRightKeyed: function onRightKeyed() {
                if (this.dir === "ltr" && this.input.isCursorAtEnd()) {
                    this.autocomplete(this.menu.getTopSelectable());
                }
            },
            _onQueryChanged: function onQueryChanged(e, query) {
                this._minLengthMet(query) ? this.menu.update(query) : this.menu.empty();
            },
            _onWhitespaceChanged: function onWhitespaceChanged() {
                this._updateHint();
            },
            _onLangDirChanged: function onLangDirChanged(e, dir) {
                if (this.dir !== dir) {
                    this.dir = dir;
                    this.menu.setLanguageDirection(dir);
                }
            },
            _openIfActive: function openIfActive() {
                this.isActive() && this.open();
            },
            _minLengthMet: function minLengthMet(query) {
                query = _.isString(query) ? query : this.input.getQuery() || "";
                return query.length >= this.minLength;
            },
            _updateHint: function updateHint() {
                var $selectable, data, val, query, escapedQuery, frontMatchRegEx, match;
                $selectable = this.menu.getTopSelectable();
                data = this.menu.getSelectableData($selectable);
                val = this.input.getInputValue();
                if (data && !_.isBlankString(val) && !this.input.hasOverflow()) {
                    query = Input.normalizeQuery(val);
                    escapedQuery = _.escapeRegExChars(query);
                    frontMatchRegEx = new RegExp("^(?:" + escapedQuery + ")(.+$)", "i");
                    match = frontMatchRegEx.exec(data.val);
                    match && this.input.setHint(val + match[1]);
                } else {
                    this.input.clearHint();
                }
            },
            isEnabled: function isEnabled() {
                return this.enabled;
            },
            enable: function enable() {
                this.enabled = true;
            },
            disable: function disable() {
                this.enabled = false;
            },
            isActive: function isActive() {
                return this.active;
            },
            activate: function activate() {
                if (this.isActive()) {
                    return true;
                } else if (!this.isEnabled() || this.eventBus.before("active")) {
                    return false;
                } else {
                    this.active = true;
                    this.eventBus.trigger("active");
                    return true;
                }
            },
            deactivate: function deactivate() {
                if (!this.isActive()) {
                    return true;
                } else if (this.eventBus.before("idle")) {
                    return false;
                } else {
                    this.active = false;
                    this.close();
                    this.eventBus.trigger("idle");
                    return true;
                }
            },
            isOpen: function isOpen() {
                return this.menu.isOpen();
            },
            open: function open() {
                if (!this.isOpen() && !this.eventBus.before("open")) {
                    this.menu.open();
                    this._updateHint();
                    this.eventBus.trigger("open");
                }
                return this.isOpen();
            },
            close: function close() {
                if (this.isOpen() && !this.eventBus.before("close")) {
                    this.menu.close();
                    this.input.clearHint();
                    this.input.resetInputValue();
                    this.eventBus.trigger("close");
                }
                return !this.isOpen();
            },
            setVal: function setVal(val) {
                this.input.setQuery(_.toStr(val));
            },
            getVal: function getVal() {
                return this.input.getQuery();
            },
            select: function select($selectable) {
                var data = this.menu.getSelectableData($selectable);
                if (data && !this.eventBus.before("select", data.obj)) {
                    this.input.setQuery(data.val, true);
                    this.eventBus.trigger("select", data.obj);
                    this.close();
                    return true;
                }
                return false;
            },
            autocomplete: function autocomplete($selectable) {
                var query, data, isValid;
                query = this.input.getQuery();
                data = this.menu.getSelectableData($selectable);
                isValid = data && query !== data.val;
                if (isValid && !this.eventBus.before("autocomplete", data.obj)) {
                    this.input.setQuery(data.val);
                    this.eventBus.trigger("autocomplete", data.obj);
                    return true;
                }
                return false;
            },
            moveCursor: function moveCursor(delta) {
                var query, $candidate, data, payload, cancelMove;
                query = this.input.getQuery();
                $candidate = this.menu.selectableRelativeToCursor(delta);
                data = this.menu.getSelectableData($candidate);
                payload = data ? data.obj : null;
                cancelMove = this._minLengthMet() && this.menu.update(query);
                if (!cancelMove && !this.eventBus.before("cursorchange", payload)) {
                    this.menu.setCursor($candidate);
                    if (data) {
                        this.input.setInputValue(data.val);
                    } else {
                        this.input.resetInputValue();
                        this._updateHint();
                    }
                    this.eventBus.trigger("cursorchange", payload);
                    return true;
                }
                return false;
            },
            destroy: function destroy() {
                this.input.destroy();
                this.menu.destroy();
            }
        });
        return Typeahead;
        function c(ctx) {
            var methods = [].slice.call(arguments, 1);
            return function() {
                var args = [].slice.call(arguments);
                _.each(methods, function(method) {
                    return ctx[method].apply(ctx, args);
                });
            };
        }
    }();
    (function() {
        "use strict";
        var old, keys, methods;
        old = $.fn.typeahead;
        keys = {
            www: "tt-www",
            attrs: "tt-attrs",
            typeahead: "tt-typeahead"
        };
        methods = {
            initialize: function initialize(o, datasets) {
                var www;
                datasets = _.isArray(datasets) ? datasets : [].slice.call(arguments, 1);
                o = o || {};
                www = WWW(o.classNames);
                return this.each(attach);
                function attach() {
                    var $input, $wrapper, $hint, $menu, defaultHint, defaultMenu, eventBus, input, menu, typeahead, MenuConstructor;
                    _.each(datasets, function(d) {
                        d.highlight = !!o.highlight;
                    });
                    $input = $(this);
                    $wrapper = $(www.html.wrapper);
                    $hint = $elOrNull(o.hint);
                    $menu = $elOrNull(o.menu);
                    defaultHint = o.hint !== false && !$hint;
                    defaultMenu = o.menu !== false && !$menu;
                    defaultHint && ($hint = buildHintFromInput($input, www));
                    defaultMenu && ($menu = $(www.html.menu).css(www.css.menu));
                    $hint && $hint.val("");
                    $input = prepInput($input, www);
                    if (defaultHint || defaultMenu) {
                        $wrapper.css(www.css.wrapper);
                        $input.css(defaultHint ? www.css.input : www.css.inputWithNoHint);
                        $input.wrap($wrapper).parent().prepend(defaultHint ? $hint : null).append(defaultMenu ? $menu : null);
                    }
                    MenuConstructor = defaultMenu ? DefaultMenu : Menu;
                    eventBus = new EventBus({
                        el: $input
                    });
                    input = new Input({
                        hint: $hint,
                        input: $input
                    }, www);
                    menu = new MenuConstructor({
                        node: $menu,
                        datasets: datasets
                    }, www);
                    typeahead = new Typeahead({
                        input: input,
                        menu: menu,
                        eventBus: eventBus,
                        minLength: o.minLength
                    }, www);
                    $input.data(keys.www, www);
                    $input.data(keys.typeahead, typeahead);
                }
            },
            isEnabled: function isEnabled() {
                var enabled;
                ttEach(this.first(), function(t) {
                    enabled = t.isEnabled();
                });
                return enabled;
            },
            enable: function enable() {
                ttEach(this, function(t) {
                    t.enable();
                });
                return this;
            },
            disable: function disable() {
                ttEach(this, function(t) {
                    t.disable();
                });
                return this;
            },
            isActive: function isActive() {
                var active;
                ttEach(this.first(), function(t) {
                    active = t.isActive();
                });
                return active;
            },
            activate: function activate() {
                ttEach(this, function(t) {
                    t.activate();
                });
                return this;
            },
            deactivate: function deactivate() {
                ttEach(this, function(t) {
                    t.deactivate();
                });
                return this;
            },
            isOpen: function isOpen() {
                var open;
                ttEach(this.first(), function(t) {
                    open = t.isOpen();
                });
                return open;
            },
            open: function open() {
                ttEach(this, function(t) {
                    t.open();
                });
                return this;
            },
            close: function close() {
                ttEach(this, function(t) {
                    t.close();
                });
                return this;
            },
            select: function select(el) {
                var success = false, $el = $(el);
                ttEach(this.first(), function(t) {
                    success = t.select($el);
                });
                return success;
            },
            autocomplete: function autocomplete(el) {
                var success = false, $el = $(el);
                ttEach(this.first(), function(t) {
                    success = t.autocomplete($el);
                });
                return success;
            },
            moveCursor: function moveCursoe(delta) {
                var success = false;
                ttEach(this.first(), function(t) {
                    success = t.moveCursor(delta);
                });
                return success;
            },
            val: function val(newVal) {
                var query;
                if (!arguments.length) {
                    ttEach(this.first(), function(t) {
                        query = t.getVal();
                    });
                    return query;
                } else {
                    ttEach(this, function(t) {
                        t.setVal(newVal);
                    });
                    return this;
                }
            },
            destroy: function destroy() {
                ttEach(this, function(typeahead, $input) {
                    revert($input);
                    typeahead.destroy();
                });
                return this;
            }
        };
        $.fn.typeahead = function(method) {
            if (methods[method]) {
                return methods[method].apply(this, [].slice.call(arguments, 1));
            } else {
                return methods.initialize.apply(this, arguments);
            }
        };
        $.fn.typeahead.noConflict = function noConflict() {
            $.fn.typeahead = old;
            return this;
        };
        function ttEach($els, fn) {
            $els.each(function() {
                var $input = $(this), typeahead;
                (typeahead = $input.data(keys.typeahead)) && fn(typeahead, $input);
            });
        }
        function buildHintFromInput($input, www) {
            return $input.clone().addClass(www.classes.hint).removeData().css(www.css.hint).css(getBackgroundStyles($input)).prop("readonly", true).removeAttr("id name placeholder required").attr({
                autocomplete: "off",
                spellcheck: "false",
                tabindex: -1
            });
        }
        function prepInput($input, www) {
            $input.data(keys.attrs, {
                dir: $input.attr("dir"),
                autocomplete: $input.attr("autocomplete"),
                spellcheck: $input.attr("spellcheck"),
                style: $input.attr("style")
            });
            $input.addClass(www.classes.input).attr({
                autocomplete: "off",
                spellcheck: false
            });
            try {
                !$input.attr("dir") && $input.attr("dir", "auto");
            } catch (e) {}
            return $input;
        }
        function getBackgroundStyles($el) {
            return {
                backgroundAttachment: $el.css("background-attachment"),
                backgroundClip: $el.css("background-clip"),
                backgroundColor: $el.css("background-color"),
                backgroundImage: $el.css("background-image"),
                backgroundOrigin: $el.css("background-origin"),
                backgroundPosition: $el.css("background-position"),
                backgroundRepeat: $el.css("background-repeat"),
                backgroundSize: $el.css("background-size")
            };
        }
        function revert($input) {
            var www, $wrapper;
            www = $input.data(keys.www);
            $wrapper = $input.parent().filter(www.selectors.wrapper);
            _.each($input.data(keys.attrs), function(val, key) {
                _.isUndefined(val) ? $input.removeAttr(key) : $input.attr(key, val);
            });
            $input.removeData(keys.typeahead).removeData(keys.www).removeData(keys.attr).removeClass(www.classes.input);
            if ($wrapper.length) {
                $input.detach().insertAfter($wrapper);
                $wrapper.remove();
            }
        }
        function $elOrNull(obj) {
            var isValid, $el;
            isValid = _.isJQuery(obj) || _.isElement(obj);
            $el = isValid ? $(obj).first() : [];
            return $el.length ? $el : null;
        }
    })();
});
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EasyMaps = require('./vendor/EasyMaps.js');

var _EasyMaps2 = _interopRequireDefault(_EasyMaps);

var _AbstractServiceContainer = require('./models/AbstractServiceContainer');

var _AbstractServiceContainer2 = _interopRequireDefault(_AbstractServiceContainer);

var _StoreModelClassFactory = require('./models/StoreModelClassFactory');

var _StoreModelClassFactory2 = _interopRequireDefault(_StoreModelClassFactory);

var _StoreCollectionFactory = require('./models/StoreCollectionFactory');

var _StoreCollectionFactory2 = _interopRequireDefault(_StoreCollectionFactory);

var _AddressViewFactory = require('./views/AddressViewFactory');

var _AddressViewFactory2 = _interopRequireDefault(_AddressViewFactory);

var _MapViewFactory = require('./views/MapViewFactory');

var _MapViewFactory2 = _interopRequireDefault(_MapViewFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//import jQuery from 'jquery';

var $ = window ? window.jQuery || window.$ || (window.jQuery = jQuery) : jQuery;

var Mapinator = function () {
    function Mapinator(config) {
        var _this = this;

        _classCallCheck(this, Mapinator);

        this.config = config;

        this.serviceContainer = this.createServiceContainer(config);
        this.serviceContainer.set('jQuery', $);

        this.addressView = this.createAddressView(config, this.serviceContainer);

        this.mapView = this.createMapView(config, this.serviceContainer);
        this.mapView.$el.bind('map:loaded', function (evt) {
            _this.serviceContainer.setLocation(config.mapLocation);

            _this.serviceContainer.set('mapLoaded', true);

            _this.mapView.$el.unbind('map:loaded');
        });

        this.bindEvents();
    }

    _createClass(Mapinator, [{
        key: 'bindEvents',
        value: function bindEvents() {
            var serviceContainer = this.serviceContainer;

            this.addressView.$el.bind('address:select', function (evt, result) {
                serviceContainer.setLocation({
                    lat: result.lat,
                    lng: result.lng
                });
            });
            serviceContainer.on('change:mapLocation', function (serviceContainer, mapLocation) {
                serviceContainer.get('easyMap').setCenter(mapLocation.lat, mapLocation.lng);
                //easyMap.setZoom(10);
            });

            this.mapView.$el.bind('map:bounds_changed', function (evt, bounds) {
                serviceContainer.set('mapBounds', bounds);
            });
        }
    }, {
        key: 'refreshStores',
        value: function refreshStores(options) {
            var _this2 = this;

            var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            this.showLoading();

            this.serviceContainer.get('stores').once('sync', function (serviceContainer, stores) {
                callback(stores);

                _this2.hideLoading();
            });

            return this.serviceContainer.get('stores').fetchStores(_extends({
                url: typeof this.config.storesUrl === 'function' ? this.config.storesUrl(this.serviceContainer) : this.config.storesUrl

            }, options, {

                data: typeof this.config.parseRequest === 'function' ? this.config.parseRequest(options.data) : options.data
            }));
        }
    }, {
        key: 'showLoading',
        value: function showLoading() {
            var _config$startLoading = this.config.startLoading;
            var startLoading = _config$startLoading === undefined ? function () {} : _config$startLoading;


            startLoading();
        }
    }, {
        key: 'hideLoading',
        value: function hideLoading() {
            var _config$endLoading = this.config.endLoading;
            var endLoading = _config$endLoading === undefined ? function () {} : _config$endLoading;


            endLoading();
        }
    }, {
        key: 'fitMapToMarkers',
        value: function fitMapToMarkers() {
            this.serviceContainer.get('easyMap').fitCenterZoomToMarkers();
        }
    }, {
        key: 'fitMapToNearestMarkers',
        value: function fitMapToNearestMarkers(min, center) {
            if (!min) min = 1;

            var serviceContainer = this.serviceContainer;
            var mapLocation = center || serviceContainer.get('mapLocation');

            var bounds = new google.maps.LatLngBounds();
            bounds.extend(new google.maps.LatLng(mapLocation.lat, mapLocation.lng));

            var minStores = serviceContainer.get('stores').models.slice(0, min);
            for (var n in minStores) {
                var store = minStores[n];

                console.log('store', n, store.get('lat'), store.get('lng'));

                if (!bounds.contains(new google.maps.LatLng(store.get('lat'), store.get('lng')))) {
                    bounds.extend(new google.maps.LatLng(store.get('lat'), store.get('lng')));
                }
            }

            serviceContainer.get('easyMap').setZoom(30);

            serviceContainer.get('map').fitBounds(bounds);
        }
    }, {
        key: 'createServiceContainer',
        value: function createServiceContainer(_ref) {
            var storesUrl = _ref.storesUrl;
            var storesComparator = _ref.storesComparator;
            var _ref$parseRequest = _ref.parseRequest;
            var parseRequest = _ref$parseRequest === undefined ? function (req) {
                return req;
            } : _ref$parseRequest;
            var _ref$parseResponse = _ref.parseResponse;
            var parseResponse = _ref$parseResponse === undefined ? function (resp) {
                return resp;
            } : _ref$parseResponse;

            var ServiceContainer = _AbstractServiceContainer2.default.extend({
                comparator: storesComparator,
                getLocation: function getLocation() {
                    return this.get('mapLocation');
                },
                setLocation: function setLocation(location, toFetch) {
                    this.set('mapLocation', {
                        lat: location.lat,
                        lng: location.lng
                    });

                    if (this.has('centerMarker')) {
                        this.get('centerMarker').setMap(null);
                        this.set('centerMarker', null);
                    }
                    var map = this.get('map');
                    this.set('centerMarker', new google.maps.Marker({
                        position: location,
                        map: map
                    }));

                    if (toFetch) {
                        this.get('stores').fetch({
                            data: location
                        });
                    }

                    return this.get('mapLocation');
                },
                getVisibleStores: function getVisibleStores(mapBounds) {
                    return this.get('stores').filter(function (model) {
                        var latLng = new google.maps.LatLng(model.get('lat'), model.get('lng'));

                        return mapBounds.contains(latLng);
                    });
                },
                refreshDistances: function refreshDistances(centerLocation) {}
            });

            return new ServiceContainer({
                StoreCollectionFactory: _StoreCollectionFactory2.default,
                StoreModelClassFactory: _StoreModelClassFactory2.default
            }, {
                url: storesUrl,
                parseResponse: parseResponse
            });
        }
    }, {
        key: 'createAddressView',
        value: function createAddressView(config, serviceContainer) {
            return (0, _AddressViewFactory2.default)({}, {
                el: config.addressSelector,
                serviceContainer: serviceContainer,
                address: config.address,

                collection: serviceContainer.get('stores'),

                jQuery: serviceContainer.get('jQuery')
            });
        }
    }, {
        key: 'createMapView',
        value: function createMapView(config, serviceContainer) {
            return (0, _MapViewFactory2.default)({}, {
                el: config.mapSelector,
                serviceContainer: serviceContainer,
                EasyMaps: _EasyMaps2.default,
                mapLocation: config.mapLocation,
                mapZoom: config.mapZoom,
                mapControls: config.mapControls || {
                    'mapTypeControl': false,
                    'navigationControl': false,
                    'scrollwheel': false,
                    'streetViewControl': false,
                    'panControl': false,
                    'zoomControl': false,
                    'scaleControl': true,
                    'overviewMapControl': false,
                    'disableDoubleClickZoom': false,
                    'draggable': true
                },
                markerIcon: typeof config.iconPath === 'function' ? config.iconPath() : config.iconPath,
                infoWindow: config.infoWindow,
                collection: serviceContainer.get('stores')
            });
        }
    }]);

    return Mapinator;
}();

exports.default = Mapinator;

},{"./models/AbstractServiceContainer":2,"./models/StoreCollectionFactory":3,"./models/StoreModelClassFactory":4,"./vendor/EasyMaps.js":5,"./views/AddressViewFactory":11,"./views/MapViewFactory":12}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.AbstractServiceContainerClassFactory = AbstractServiceContainerClassFactory;

var _PlacesAdapter = require('../vendor/PlacesAdapter');

var _PlacesAdapter2 = _interopRequireDefault(_PlacesAdapter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //import Backbone from 'backbone';

var AbstractServiceContainer = function (_Backbone$Model) {
    _inherits(AbstractServiceContainer, _Backbone$Model);

    function AbstractServiceContainer(_ref, _ref2) {
        var StoreCollectionFactory = _ref.StoreCollectionFactory;
        var StoreModelClassFactory = _ref.StoreModelClassFactory;
        var url = _ref2.url;
        var parseResponse = _ref2.parseResponse;

        _classCallCheck(this, AbstractServiceContainer);

        var classProps = {
            defaults: {
                jQuery: null,

                mapBounds: null,
                geocoder: null,

                stores: null, //Backbone.Collection

                map: null,
                easyMap: null,
                centerMarker: null,
                mapLocation: {
                    lat: null,
                    lng: null
                },
                mapLoaded: false
            }
        };
        return _possibleConstructorReturn(this, (AbstractServiceContainer.__proto__ || Object.getPrototypeOf(AbstractServiceContainer)).call(this, classProps, { StoreCollectionFactory: StoreCollectionFactory, StoreModelClassFactory: StoreModelClassFactory }, { url: url, parseResponse: parseResponse }));
    }

    _createClass(AbstractServiceContainer, [{
        key: 'initialize',
        value: function initialize(classProps, _ref3, _ref4) {
            var StoreCollectionFactory = _ref3.StoreCollectionFactory;
            var StoreModelClassFactory = _ref3.StoreModelClassFactory;
            var url = _ref4.url;
            var parseResponse = _ref4.parseResponse;

            this.set('mapBounds', new google.maps.LatLngBounds());
            this.set('geocoder', new google.maps.Geocoder());

            this.set('placesAdapter', new _PlacesAdapter2.default());

            var stores = StoreCollectionFactory({
                url: url,
                parse: parseResponse
            }, null, {
                model: StoreModelClassFactory()
            });

            this.set('stores', stores);

            console.log('stores', this.get('stores'));

            if (typeof this.setLocation !== 'function') {
                this.setLocation = function () {
                    throw new Error('setLocation method is not implements');
                };
                throw new Error('setLocation method is not implements');
            }
        }
    }, {
        key: 'fitMapToMarkers',
        value: function fitMapToMarkers() {
            this.get('easyMap').fitCenterZoomToMarkers();
        }
    }, {
        key: 'fitMapToNearestMarkers',
        value: function fitMapToNearestMarkers(min) {
            if (!min) min = 1;

            var stores = this.get('stores');
            var minStores = stores.models.slice(0, min);

            //var mapBounds = this.get('mapBounds');
            //var mapBounds = this.get('map').getBounds();
            var mapBounds = new google.maps.LatLngBounds();
            var mapLocation = this.get('mapLocation');
            mapBounds.extend(new google.maps.LatLng(mapLocation.lat, mapLocation.lng));
            for (var n in minStores) {
                var store = minStores[n];
                console.log('store', n, store.get('lat'), store.get('lng'));
                if (!mapBounds.contains(new google.maps.LatLng(store.get('lat'), store.get('lng')))) {
                    mapBounds.extend(new google.maps.LatLng(store.get('lat'), store.get('lng')));
                }
            }

            this.get('map').fitBounds(mapBounds);
        }
    }, {
        key: 'getAddressFromLatLng',
        value: function getAddressFromLatLng(lat, lng, callback) {
            if (!callback) callback = function callback() {};

            this.get('placesAdapter').fetchPlaceByLatLng({ location: { lat: lat, lng: lng } }, function (result) {
                var address = result['formatted_address'] || null;

                callback(address, result);
            });
        }
    }]);

    return AbstractServiceContainer;
}(Backbone.Model);

exports.default = AbstractServiceContainer;
function AbstractServiceContainerClassFactory() {
    return AbstractServiceContainer;
}

},{"../vendor/PlacesAdapter":6}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; //import Backbone from 'backbone';

var _backboneFactory = require('../vendor/backboneFactory');

var _backboneFactory2 = _interopRequireDefault(_backboneFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storeCollection = {
    /*initialize: function( options, classProps ) {
        console.log('initialize', arguments);
    },*/

    fetchStores: function fetchStores() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

        return this.fetch(_extends({}, options, {

            success: function success(data) {
                callback(data);
            },
            error: function error(_error) {
                callback(false, _error);
            }
        }));
    }
};

exports.default = (0, _backboneFactory2.default)(storeCollection, Backbone.Collection);

},{"../vendor/backboneFactory":9}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _backboneClassFactory = require('../vendor/backboneClassFactory');

var _backboneClassFactory2 = _interopRequireDefault(_backboneClassFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storeModel = {
  /*initialize: function( options, classProps ) {
   console.log('initialize', arguments);
   }*/
}; //import Backbone from 'backbone';

exports.default = (0, _backboneClassFactory2.default)(storeModel, Backbone.Model);

},{"../vendor/backboneClassFactory":8}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function EasyMaps(properties) {
    var that = this;

    this.$ = properties.jQuery || jQuery;

    var config = properties || {};
    if (!config.center) {
        config.center = {
            lat: 0,
            lng: 0
        };
    }

    if (!config.center.lat) {
        config.center.lat = 0;
    }
    if (!config.center.lng) {
        config.center.lng = 0;
    }

    that.mapObj = null;
    that.domElem = null;
    that.center = null;
    that.zoom = 8;

    that.bounds = null;

    that.eventListener = {
        onLoaded: function onLoaded() {}
    };

    for (var evt in that.eventListener) {
        if (config[evt]) {
            that.addEventListener(evt, config[evt]);
        }
    }

    that.mapSettings = config.mapSettings || {
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    if (!that.mapSettings.mapTypeId) {
        that.mapSettings.mapTypeId = google.maps.MapTypeId.ROADMAP;
    }

    if (config.noControls) {

        that.mapSettings['mapTypeControl'] = false;
        that.mapSettings['navigationControl'] = false;
        that.mapSettings['scrollwheel'] = false;
        that.mapSettings['streetViewControl'] = false;

        that.mapSettings['panControl'] = false;
        that.mapSettings['zoomControl'] = false;
        that.mapSettings['mapTypeControl'] = false;
        that.mapSettings['scaleControl'] = false;
        that.mapSettings['streetViewControl'] = false;
        that.mapSettings['overviewMapControl'] = false;

        that.mapSettings['disableDoubleClickZoom'] = true;
        that.mapSettings['draggable'] = false;
    }

    if (config.controls) {

        if (_typeof(config.controls) === 'object') {
            for (var name in config.controls) {
                that.mapSettings[name] = config.controls[name];
            }
        }
    }

    that.markerSettings = {
        w: 32,
        h: 32,
        unit: 'px'
    };
    that.infoWindowSettings = {
        maxW: 400,
        maxH: 500,
        unit: 'px'
    };

    that.markerList = [];
    that.markerObjList = [];

    that.infoWindowObjList = [];

    that.clusterList = [];
    that.clusterObjList = [];
    that.clusterGridRule = {};
    for (var i = 1; i <= 22; i++) {
        that.clusterGridRule[i] = i * 2;
    }

    that.circleList = [];
    that.circleObjList = [];

    if (!config.elem && !config.map) return;

    that.resetBounds();

    if (config.elem) that.setDomElem(config.elem, false);
    that.setCenter(config.center.lat, config.center.lng, false);
    that.setZoom(config.zoom, false);

    that.initMap(config.map);
};

EasyMaps.prototype.addEventListener = function (event, fnHandler) {
    var that = this;

    if (that.eventListener[event] && typeof fnHandler === 'function') {
        that.eventListener[event] = fnHandler;
        return true;
    } else {
        return false;
    }
};

EasyMaps.prototype.onLoaded = function (fnHandler) {
    var that = this;

    var eventName = 'onLoaded';

    return that.addEventListener(eventName, fnHandler);
};

EasyMaps.prototype.resetBounds = function () {
    var that = this;

    that.bounds = new google.maps.LatLngBounds();

    return that.bounds;
};

EasyMaps.prototype.setDomElem = function (elem) {
    return this.domElem = elem instanceof HTMLElement ? elem : document.querySelector(elem);
};

EasyMaps.prototype.getCenter = function () {
    var that = this;

    return that.center;
};
EasyMaps.prototype.setCenter = function (lat, lng, render) {
    var that = this;
    render = typeof render !== 'undefined' ? render : true;
    that.center = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
    };

    if (render) {
        //set center on map
        that.mapObj.setCenter(new google.maps.LatLng(that.center.lat, that.center.lng));
        return that.mapObj;
    } else {
        return that.center;
    }
};
EasyMaps.prototype.getZoom = function () {
    var that = this;

    return that.mapObj.getZoom();
};
EasyMaps.prototype.setZoom = function (zoomNumb, render) {
    if (!zoomNumb) return false;
    var that = this;
    render = typeof render !== 'undefined' ? render : true;
    that.zoom = parseInt(zoomNumb);

    if (render) {
        //set zoom on map
        that.mapObj.setZoom(that.zoom);
        return that.mapObj;
    } else {
        return that.zoom;
    }
};
EasyMaps.prototype.fitCenterZoomToMarkers = function (render) {
    var that = this;
    render = typeof render !== 'undefined' ? render : true;

    var area = null;

    var markers = that.markerObjList;
    for (var n in markers) {
        var pos = markers[n].getPosition();
        var lat = pos.lat();
        var lng = pos.lng();

        if (!area) {
            area = {
                'x1': lat,
                'x2': lat,
                'y1': lng,
                'y2': lng
            };
        }

        area['x1'] = lat < area['x1'] ? lat : area['x1'];
        area['x2'] = lat > area['x2'] ? lat : area['x2'];
        area['y1'] = lng < area['y1'] ? lng : area['y1'];
        area['y2'] = lng > area['y2'] ? lng : area['y2'];
    }

    if (!area) {
        area = {
            'x1': that.center.lat,
            'x2': that.center.lat,
            'y1': that.center.lng,
            'y2': that.center.lng
        };
    }

    that.resetBounds();

    that.bounds.extend(new google.maps.LatLng(area['x1'], area['y1']));
    //that.bounds.extend( new google.maps.LatLng( area['x2'], area['y1'] ) );
    //that.bounds.extend( new google.maps.LatLng( area['x1'], area['y2'] ) );
    that.bounds.extend(new google.maps.LatLng(area['x2'], area['y2']));

    var oldCenter = that.center;
    var oldZoom = that.zoom;

    that.mapObj.fitBounds(that.bounds);

    var actualCenter = that.mapObj.getCenter();
    var newCenter = {
        'lat': actualCenter.k,
        'lng': actualCenter.B
    };
    var newZoom = that.mapObj.getZoom();

    if (render) {
        that.center = newCenter;
        that.zoom = newZoom;
    } else {
        that.setCenter(oldCenter);
        that.setZoom(oldZoom);
    }
};
EasyMaps.prototype.initMap = function (map) {
    var that = this;

    var options = that.mapSettings;

    options['center'] = new google.maps.LatLng(that.center.lat, that.center.lng);
    options['zoom'] = that.zoom;

    /*var options = {
     zoom: that.zoom,
     center: new google.maps.LatLng( that.center.lat, that.center.lng ),
     mapTypeId: google.maps.MapTypeId.ROADMAP
     };*/

    that.mapObj = map || new google.maps.Map(that.domElem, options);

    google.maps.event.addListenerOnce(that.mapObj, 'idle', function () {
        that.eventListener['onLoaded']();
    });

    return that.mapObj;
};

EasyMaps.prototype.addMarker = function (markerData, render, clusterData, callback) {
    var that = this;

    if (!callback) callback = function callback() {};

    render = typeof render !== "undefined" ? render : true;
    var markerList = typeof markerData.length !== 'undefined' ? markerData : [markerData];
    //var markerList = markerData[0] ? markerData : [ markerData ];

    //options - OK
    //icon - OK
    //info window - OK
    //cluster

    /*	google.maps.event.addDomListener( that.mapObj, 'bounds_changed', function() {
     //google.maps.event.clearListeners( that.mapObj, 'idle');
     console.log('idle');
     callback();
     });*/

    google.maps.event.addDomListener(that.mapObj, 'idle', function () {
        clearTimeout(that.markerTimer);
        that.markerTimer = setTimeout(function () {
            google.maps.event.clearListeners(that.mapObj, 'idle');

            setTimeout(function () {
                callback();
            }, 400);
        }, 400);
    });

    var markerGroup = [];

    for (var n in markerList) {
        that.markerList.push(markerList[n]);
        var pos = {
            lat: parseFloat(markerList[n]['position']['lat']),
            lng: parseFloat(markerList[n]['position']['lng'])
        };
        var posObj = new google.maps.LatLng(pos.lat, pos.lng);
        var markerConf = {
            position: posObj,
            map: that.mapObj
        };

        if (markerList[n]['icon']) {
            var iconData = markerList[n]['icon'];
            if (iconData['path']) {
                markerConf['icon'] = {
                    //anchor: new google.maps.Point( -16, -16 ),
                    scaledSize: new google.maps.Size(iconData['w'] || that.markerSettings.w, iconData['h'] || that.markerSettings.h, iconData['unit'] || that.markerSettings.unit, iconData['unit'] || that.markerSettings.unit),
                    url: iconData['path']
                };
            }
            if (iconData['shadow']) {
                markerConf['shadow'] = iconData['shadow'];
            }
            if (iconData['flat']) {
                markerConf['flat'] = !!iconData['flat'];
            }
        }

        if (markerList[n]['title']) {
            markerConf['title'] = markerList[n]['title'];
        }
        var marker = new google.maps.Marker(markerConf);

        that.markerObjList.push(marker);

        markerGroup.push(marker);

        /*(function( marker ) {
         google.maps.event.addListener( marker, 'mouseover', function(e) {
         var zIndex = marker.getZIndex();
         marker.setZIndex( zIndex+10000 );
         });
         google.maps.event.addListener( marker, 'mouseout', function(e) {
         var zIndex = marker.getZIndex();
         marker.setZIndex( zIndex-10000 );
         });
         })( marker );*/

        if (markerList[n]['infoWindow']) {
            var infoWindowData = markerList[n]['infoWindow'];

            var openHandler = infoWindowData['open'] || function () {};

            var infoWindowConf = {
                content: infoWindowData['content']
            };
            var infoWindow = new google.maps.InfoWindow(infoWindowConf);
            that.infoWindowObjList.push(infoWindow);

            (function (marker, infoWindow, openHandler) {
                google.maps.event.addListener(marker, 'click', function () {

                    that.closeAllInfoWindow();

                    infoWindow.open(that.mapObj, marker);
                    openHandler(infoWindow, marker);
                    /*google.maps.event.addListener( marker, 'mouseout', function() {
                     infoWindow.close();
                     google.maps.event.clearListeners( marker, 'mouseout' );
                     });
                     google.maps.event.addListener( marker, 'click', function() {
                     google.maps.event.clearListeners( marker, 'mouseout' );
                     });*/
                });
            })(marker, infoWindow, openHandler);
        }
    }

    if (clusterData) {
        that.addCluster(markerGroup, clusterData);
    }
};

EasyMaps.prototype.closeAllInfoWindow = function () {
    var that = this;

    for (var n in that.infoWindowObjList) {
        var infoWindow = that.infoWindowObjList[n];
        infoWindow.close();
    }
};

EasyMaps.prototype.addCluster = function (markerGroup, conf) {
    var that = this;

    conf = conf || {};

    var clusterConf = {
        maxZoom: conf.maxZoom || 18,
        gridSize: conf.size || 10
    };

    if (conf.icon) {
        clusterConf['styles'] = [{
            url: conf.icon,
            width: conf.width || 50,
            height: conf.height || 50,
            anchor: conf.anchor || [3, 0],
            textSize: conf.textSize || 10,
            textColor: conf.textColor || '#000'
        }];
    }

    var cluster = new MarkerClusterer(that.mapObj, markerGroup, clusterConf);

    var clusterData = {
        'conf': clusterConf,
        'markerGroup': markerGroup
    };

    that.clusterList.push(clusterData);
    that.clusterObjList.push(cluster);

    /*(function( cluster, clusterData ) {
     google.maps.event.addListener( that.mapObj, 'zoom_changed', function() {
     var gridZoomMatch = clusterData.gridRule;
      var zoom = that.mapObj.getZoom();
      for( var maxZoom in gridZoomMatch ) {
     if( zoom <= maxZoom ) {
     zoom = maxZoom;
     }
     }
     var gridSize = gridZoomMatch[ zoom ] || false;
     if( gridSize ) {
     cluster.setGridSize( gridSize );
     cluster.resetViewport();
     }
     console.log( 'actualGridSize: ' + cluster.getGridSize() );
     });
     })( cluster, clusterData );*/
};

EasyMaps.prototype.removeAllCluster = function (render) {
    var that = this;

    render = typeof render !== "undefined" ? render : true;

    that.clusterList = [];
    if (render) {
        for (var n in that.clusterObjList) {
            //that.clusterObjList[ n ].setMap( null );
        }
        that.clusterObjList = [];
    }
};

EasyMaps.prototype.removeAllMarker = function (render) {
    var that = this;

    render = typeof render !== "undefined" ? render : true;

    that.markerList = [];
    if (render) {
        for (var n in that.markerObjList) {
            that.markerObjList[n].setMap(null);
        }
        that.markerObjList = [];

        that.infoWindowObjList = [];
    }

    that.removeAllCluster(render);
};

EasyMaps.prototype.addCircle = function (circleData, render) {
    var that = this;

    render = typeof render !== "undefined" ? render : true;

    var cirleStyleList = {
        'stroke': '',
        'fill': ''
    };

    var radiusAmp = 1;

    var circleList = typeof circleData.length !== 'undefined' ? circleData : [circleData];
    for (var n in circleList) {
        that.circleList.push(circleList[n]);
        var pos = {
            lat: parseFloat(circleList[n]['position']['lat']),
            lng: parseFloat(circleList[n]['position']['lng'])
        };
        var posObj = new google.maps.LatLng(pos.lat, pos.lng);
        var radius = parseInt(circleList[n]['radius']) * radiusAmp;

        var circleConf = {
            center: posObj,
            map: that.mapObj,
            radius: radius
        };

        for (var style in cirleStyleList) {
            if (circleList[n][style]) {
                var strokeData = circleList[n][style];
                for (var type in strokeData) {
                    var confName = style + type.substr(0, 1).toUpperCase() + type.substr(1);
                    circleConf[confName] = strokeData[type];
                }
            }
        }

        var circle = new google.maps.Circle(circleConf);
        that.circleObjList.push(circle);
    }
};

EasyMaps.prototype.removeAllCircle = function (render) {
    var that = this;

    render = typeof render !== "undefined" ? render : true;

    that.circleList = [];
    if (render) {
        for (var n in that.circleObjList) {
            that.circleObjList[n].setMap(null);
        }
        that.circleObjList = [];
    }
};

EasyMaps.prototype.autocomplete = function (domElement, fnCallback) {
    var that = this;

    if (!domElement) {
        domElement = this;
    } else if (typeof domElement === 'function') {
        fnCallback = domElement;
        domElement = this;
    } else {
        fnCallback = fnCallback || function () {};
    }

    var pacContainer = '.pac-container';

    var fnFinal = function fnFinal(place, el) {
        fnCallback(place, el);
    };

    //var defaultCenter = 'Italia';

    var $inputList = that.$(domElement);
    $inputList.each(function (i, el) {
        (function (el) {
            var inputCenter = el;

            var autocomplete = new google.maps.places.Autocomplete(inputCenter, {
                types: ["geocode"],
                componentRestrictions: { country: 'it' }
            });

            var setPacItem;

            that.$(el).click(function (e) {

                setTimeout(function () {
                    that.$(e.target).select();
                    autocomplete.pacContainer = autocomplete.pacContainer || that.$(pacContainer).filter(':visible');
                }, 200);

                var isChanged = false;

                that.$(el).unbind('keypress blur').bind('keypress blur', function (e) {
                    var $this = that.$(this);

                    if (e.type == 'blur') {
                        if (!isChanged) {
                            return true;
                        }
                        isChanged = false;
                    } else {
                        isChanged = true;
                    }

                    var $pacContainer = autocomplete.pacContainer;
                    var $pacItem = $pacContainer.find(".pac-item");
                    var $firstMatch = $pacItem.filter(':first');

                    //console.log( $firstMatch.length );

                    var pacItemSelected = 'pac-item-selected';

                    setTimeout(function () {
                        $pacItem.removeClass(pacItemSelected);
                        $firstMatch.addClass(pacItemSelected);
                    }, 400);

                    if (e.which == 13 || e.type == 'blur') {
                        //google.maps.event.clearListeners( autocomplete, 'place_changed' );

                        var delay = e.type == 'blur' ? 400 : 400;

                        setPacItem = setTimeout(function () {

                            //$firstMatch = $pacItem.filter('.'+pacItemSelected).length ? $pacItem.filter('.'+pacItemSelected) : $firstMatch;
                            var allText = $firstMatch.text();
                            var lastText = $firstMatch.children('span:last').text();
                            var firstResult = allText.replace(lastText, ', ' + lastText);

                            $this.val(firstResult);
                            $this.attr('value', firstResult);

                            if (e.type != 'blur') {
                                //$this.blur();
                            }

                            var t = setInterval(function () {
                                if ($this.val() != firstResult) {
                                    $this.val(firstResult);
                                    clearInterval(t);
                                }
                            }, 200);

                            var geocoder = new google.maps.Geocoder();
                            geocoder.geocode({ "address": firstResult }, function (results, status) {
                                var place = false;

                                if (status == google.maps.GeocoderStatus.OK) {
                                    place = results[0];

                                    //$firstMatch.addClass( pacItemSelected );
                                    $pacContainer.css("display", "none");
                                }
                                //console.log('geocode');
                                fnFinal(place, el);
                            });
                        }, delay);
                    }
                });
            });

            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                var place = autocomplete.getPlace();
                //console.log( place );
                if (place.geometry && place.geometry.location) {
                    that.$(el).unbind('keypress blur');
                    clearInterval(setPacItem);
                    //console.log('listener');
                    fnFinal(place, el);
                }
            });
        })(el);
    });
};

exports.default = EasyMaps;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PlacesAdapter = function () {
    function PlacesAdapter() {
        _classCallCheck(this, PlacesAdapter);

        this.placeService = new google.maps.places.AutocompleteService();
        this.geocoder = new google.maps.Geocoder();
    }

    _createClass(PlacesAdapter, [{
        key: 'search',
        value: function search(query) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            this.placeService.getPlacePredictions({
                input: query,
                types: ['geocode'],
                componentRestrictions: {
                    country: 'it'
                }
            }, function (suggestions, status) {
                //console.log('suggestions', suggestions);

                callback(suggestions, status);
            });
        }
    }, {
        key: 'fetchPlaceByLatLng',
        value: function fetchPlaceByLatLng(options) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            this.geocoder.geocode(options, function (results, status) {
                if (status !== 'OK' || !results.length) {
                    callback(false);
                    return false;
                }

                callback(results.shift());
            });
        }
    }]);

    return PlacesAdapter;
}();

exports.default = PlacesAdapter;

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//import Bloodhound from "typeahead.js/dist/bloodhound";

var PlacesBloodhoundEngine = function (_Bloodhound) {
    _inherits(PlacesBloodhoundEngine, _Bloodhound);

    function PlacesBloodhoundEngine() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, PlacesBloodhoundEngine);

        var _this = _possibleConstructorReturn(this, (PlacesBloodhoundEngine.__proto__ || Object.getPrototypeOf(PlacesBloodhoundEngine)).call(this, _extends({}, options, {
            datumTokenizer: function datumTokenizer(obj) {
                return Bloodhound.tokenizers.whitespace(obj.description);
            },
            queryTokenizer: function queryTokenizer(query) {
                _this.onSearch(query);

                return Bloodhound.tokenizers.whitespace(query);
            },
            identify: function identify(obj) {
                return obj.id;
            }
        })));

        _this.setServiceAdapter(options.serviceAdapter);
        return _this;
    }

    _createClass(PlacesBloodhoundEngine, [{
        key: "onSearch",
        value: function onSearch(query) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            var self = this;

            this.getServiceAdapter().search(query, function (suggestions, status) {
                self.add(suggestions);

                callback(suggestions);
            });
        }
    }, {
        key: "setServiceAdapter",
        value: function setServiceAdapter(serviceAdapter) {
            return this.serviceAdapter = serviceAdapter;
        }
    }, {
        key: "getServiceAdapter",
        value: function getServiceAdapter() {
            return this.serviceAdapter || null;
        }
    }]);

    return PlacesBloodhoundEngine;
}(Bloodhound);

exports.default = PlacesBloodhoundEngine;

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function backboneClassFactory(customObj, BackboneClass) {

    return function () {
        var classProps = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        return BackboneClass.extend(Object.assign({}, customObj, classProps));
    };
}

exports.default = backboneClassFactory;

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _backboneClassFactory = require('./backboneClassFactory');

var _backboneClassFactory2 = _interopRequireDefault(_backboneClassFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function backboneFactory(customObj, BackboneClass) {

    return function () {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        var classProps = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        return new (Function.prototype.bind.apply(BackboneClass.extend(Object.assign({}, customObj, classProps)), [null].concat(args)))();
    };

    /*return ( classProps = {}, ...args ) =>
        new (backboneClassFactory( customObj, BackboneClass ))( ...args )*/
}

exports.default = backboneFactory;

},{"./backboneClassFactory":8}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = typeaheadFactory;
function typeaheadFactory(selector) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    //require('typeahead.js');

    var $input = jQuery(selector);

    return $input.typeahead({}, _extends({
        display: 'description'
    }, options));
}

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _PlacesBloodhoundEngine = require('../vendor/PlacesBloodhoundEngine');

var _PlacesBloodhoundEngine2 = _interopRequireDefault(_PlacesBloodhoundEngine);

var _typeaheadFactory = require('../vendor/typeaheadFactory');

var _typeaheadFactory2 = _interopRequireDefault(_typeaheadFactory);

var _backboneFactory = require('../vendor/backboneFactory');

var _backboneFactory2 = _interopRequireDefault(_backboneFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import PlacesAdapter from '../vendor/PlacesAdapter';
var addressView = {
    events: {
        'keyup': 'pickerHandler',
        'click': 'pickerHandler'
    },
    initialize: function initialize(options) {
        var view = this;

        var serviceAdapter = options.serviceContainer.get('placesAdapter');
        var placeEngine = new _PlacesBloodhoundEngine2.default({ serviceAdapter: serviceAdapter });

        (0, _typeaheadFactory2.default)(view.el, {
            source: placeEngine
        });

        view.el.value = options.address;

        view.$el.bind('typeahead:select', function (evt, result) {
            if (result.lat && result.lng) {
                view.$el.trigger('address:select', result);
                return;
            }

            serviceAdapter.fetchLatLng({ placeId: result['place_id'] }, function (placeDetails) {
                if (!placeDetails) throw new Error('Error to fetch place position');

                result.lat = placeDetails.geometry.location.lat();
                result.lng = placeDetails.geometry.location.lng();

                view.$el.trigger('address:select', result);
            });
        });
    },
    pickerHandler: function pickerHandler(evt, result) {
        var view = this;
        var input = view.el;
        var $input = jQuery(input);

        var selectFirst = function selectFirst() {
            setTimeout(function () {
                if (!jQuery('.tt-dataset-0').length || !jQuery('.tt-dataset-0').find('.tt-suggestion').length) return;
                jQuery('.tt-dataset-0').find('.tt-suggestion').eq(0).addClass('tt-cursor');
            }, 200);
        };

        switch (evt.type) {
            case 'keyup':
                var keyCode = evt.keyCode || evt.which;
                if (keyCode == 40 || keyCode == 38) {
                    break;
                }
                selectFirst();
                break;
            case 'click':
                input.setSelectionRange(0, input.value.length);
                selectFirst();
                break;
        }
    }
}; //import Backbone from 'backbone';

exports.default = (0, _backboneFactory2.default)(addressView, Backbone.View);

},{"../vendor/PlacesBloodhoundEngine":7,"../vendor/backboneFactory":9,"../vendor/typeaheadFactory":10}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _backboneFactory = require('../vendor/backboneFactory');

var _backboneFactory2 = _interopRequireDefault(_backboneFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mapView = {
    initialize: function initialize(_ref) {
        var serviceContainer = _ref.serviceContainer;
        var EasyMaps = _ref.EasyMaps;
        var mapLocation = _ref.mapLocation;
        var mapZoom = _ref.mapZoom;
        var mapControls = _ref.mapControls;
        var markerIcon = _ref.markerIcon;
        var infoWindow = _ref.infoWindow;

        var view = this;

        var jQuery = serviceContainer.get('jQuery');

        var easyMap = new EasyMaps({
            jQuery: jQuery,
            //map: map,
            elem: view.el,
            center: mapLocation,
            zoom: mapZoom,
            controls: mapControls
        });

        easyMap.addEventListener('onLoaded', function () {
            easyMap.setZoom(mapZoom);

            view.$el.trigger('map:loaded');
        });

        var map = easyMap.mapObj;

        serviceContainer.set('easyMap', easyMap);
        serviceContainer.set('map', map);

        map.addListener('bounds_changed', function () {
            window.clearTimeout(view._t);
            view._t = window.setTimeout(function () {
                view.$el.trigger('map:bounds_changed', map.getBounds());
            }, 800);
        });

        this.listenTo(this.collection, 'sync', function (collection, resp, req) {
            view.refreshMap({ collection: collection, easyMap: easyMap, iconPath: markerIcon, infoWindowCreator: infoWindow });
        });
    },

    refreshMap: function refreshMap(_ref2) {
        var collection = _ref2.collection;
        var easyMap = _ref2.easyMap;
        var iconPath = _ref2.iconPath;
        var infoWindowCreator = _ref2.infoWindowCreator;

        this.removeAllMarkers(easyMap);
        this.loadMarkers({ collection: collection, easyMap: easyMap, iconPath: iconPath, infoWindowCreator: infoWindowCreator });
    },

    loadMarkers: function loadMarkers(_ref3) {
        var collection = _ref3.collection;
        var easyMap = _ref3.easyMap;
        var iconPath = _ref3.iconPath;
        var infoWindowCreator = _ref3.infoWindowCreator;

        for (var n in collection.models) {
            var model = collection.models[n];

            var markerConfig = {
                position: {
                    lat: model.get('lat'),
                    lng: model.get('lng')
                },
                icon: {
                    path: iconPath,
                    w: 41,
                    h: 47
                }
            };
            if (typeof infoWindowCreator === 'function') {
                var content = infoWindowCreator(model.attributes, model);
                if (content) {
                    markerConfig.infoWindow = {
                        content: content
                    };
                }
            }
            easyMap.addMarker(markerConfig);
        }

        //todo: togliere?
        //easyMap.fitCenterZoomToMarkers();
    },

    removeAllMarkers: function removeAllMarkers(easyMap) {
        easyMap.removeAllMarker();
    }
}; //import Backbone from 'backbone';

exports.default = (0, _backboneFactory2.default)(mapView, Backbone.View);

},{"../vendor/backboneFactory":9}],13:[function(require,module,exports){
'use strict';

var _Mapinator = require('./class/Mapinator');

var _Mapinator2 = _interopRequireDefault(_Mapinator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import AbstractServiceContainer from './class/models/AbstractServiceContainer';

window.Mapinator = _Mapinator2.default;
//window.AbstractServiceContainer = AbstractServiceContainer;

},{"./class/Mapinator":1}]},{},[13]);
