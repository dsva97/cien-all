(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
  var __commonJS = (cb, mod) => () => (mod || cb((mod = {exports: {}}).exports, mod), mod.exports);
  var __reExport = (target, module, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
    }
    return target;
  };
  var __toModule = (module) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? {get: () => module.default, enumerable: true} : {value: module, enumerable: true})), module);
  };

  // node_modules/page/page.js
  var require_page = __commonJS((exports, module) => {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : global.page = factory();
    })(exports, function() {
      "use strict";
      var isarray = Array.isArray || function(arr) {
        return Object.prototype.toString.call(arr) == "[object Array]";
      };
      var pathToRegexp_12 = pathToRegexp2;
      var parse_12 = parse2;
      var compile_12 = compile2;
      var tokensToFunction_12 = tokensToFunction2;
      var tokensToRegExp_12 = tokensToRegExp2;
      var PATH_REGEXP2 = new RegExp([
        "(\\\\.)",
        "([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))"
      ].join("|"), "g");
      function parse2(str) {
        var tokens = [];
        var key = 0;
        var index = 0;
        var path = "";
        var res;
        while ((res = PATH_REGEXP2.exec(str)) != null) {
          var m = res[0];
          var escaped = res[1];
          var offset = res.index;
          path += str.slice(index, offset);
          index = offset + m.length;
          if (escaped) {
            path += escaped[1];
            continue;
          }
          if (path) {
            tokens.push(path);
            path = "";
          }
          var prefix = res[2];
          var name = res[3];
          var capture = res[4];
          var group = res[5];
          var suffix = res[6];
          var asterisk = res[7];
          var repeat = suffix === "+" || suffix === "*";
          var optional = suffix === "?" || suffix === "*";
          var delimiter = prefix || "/";
          var pattern = capture || group || (asterisk ? ".*" : "[^" + delimiter + "]+?");
          tokens.push({
            name: name || key++,
            prefix: prefix || "",
            delimiter,
            optional,
            repeat,
            pattern: escapeGroup2(pattern)
          });
        }
        if (index < str.length) {
          path += str.substr(index);
        }
        if (path) {
          tokens.push(path);
        }
        return tokens;
      }
      function compile2(str) {
        return tokensToFunction2(parse2(str));
      }
      function tokensToFunction2(tokens) {
        var matches = new Array(tokens.length);
        for (var i = 0; i < tokens.length; i++) {
          if (typeof tokens[i] === "object") {
            matches[i] = new RegExp("^" + tokens[i].pattern + "$");
          }
        }
        return function(obj) {
          var path = "";
          var data = obj || {};
          for (var i2 = 0; i2 < tokens.length; i2++) {
            var token = tokens[i2];
            if (typeof token === "string") {
              path += token;
              continue;
            }
            var value = data[token.name];
            var segment;
            if (value == null) {
              if (token.optional) {
                continue;
              } else {
                throw new TypeError('Expected "' + token.name + '" to be defined');
              }
            }
            if (isarray(value)) {
              if (!token.repeat) {
                throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"');
              }
              if (value.length === 0) {
                if (token.optional) {
                  continue;
                } else {
                  throw new TypeError('Expected "' + token.name + '" to not be empty');
                }
              }
              for (var j = 0; j < value.length; j++) {
                segment = encodeURIComponent(value[j]);
                if (!matches[i2].test(segment)) {
                  throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"');
                }
                path += (j === 0 ? token.prefix : token.delimiter) + segment;
              }
              continue;
            }
            segment = encodeURIComponent(value);
            if (!matches[i2].test(segment)) {
              throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"');
            }
            path += token.prefix + segment;
          }
          return path;
        };
      }
      function escapeString2(str) {
        return str.replace(/([.+*?=^!:${}()[\]|\/])/g, "\\$1");
      }
      function escapeGroup2(group) {
        return group.replace(/([=!:$\/()])/g, "\\$1");
      }
      function attachKeys(re, keys) {
        re.keys = keys;
        return re;
      }
      function flags2(options) {
        return options.sensitive ? "" : "i";
      }
      function regexpToRegexp2(path, keys) {
        var groups = path.source.match(/\((?!\?)/g);
        if (groups) {
          for (var i = 0; i < groups.length; i++) {
            keys.push({
              name: i,
              prefix: null,
              delimiter: null,
              optional: false,
              repeat: false,
              pattern: null
            });
          }
        }
        return attachKeys(path, keys);
      }
      function arrayToRegexp2(path, keys, options) {
        var parts = [];
        for (var i = 0; i < path.length; i++) {
          parts.push(pathToRegexp2(path[i], keys, options).source);
        }
        var regexp = new RegExp("(?:" + parts.join("|") + ")", flags2(options));
        return attachKeys(regexp, keys);
      }
      function stringToRegexp2(path, keys, options) {
        var tokens = parse2(path);
        var re = tokensToRegExp2(tokens, options);
        for (var i = 0; i < tokens.length; i++) {
          if (typeof tokens[i] !== "string") {
            keys.push(tokens[i]);
          }
        }
        return attachKeys(re, keys);
      }
      function tokensToRegExp2(tokens, options) {
        options = options || {};
        var strict = options.strict;
        var end = options.end !== false;
        var route = "";
        var lastToken = tokens[tokens.length - 1];
        var endsWithSlash = typeof lastToken === "string" && /\/$/.test(lastToken);
        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];
          if (typeof token === "string") {
            route += escapeString2(token);
          } else {
            var prefix = escapeString2(token.prefix);
            var capture = token.pattern;
            if (token.repeat) {
              capture += "(?:" + prefix + capture + ")*";
            }
            if (token.optional) {
              if (prefix) {
                capture = "(?:" + prefix + "(" + capture + "))?";
              } else {
                capture = "(" + capture + ")?";
              }
            } else {
              capture = prefix + "(" + capture + ")";
            }
            route += capture;
          }
        }
        if (!strict) {
          route = (endsWithSlash ? route.slice(0, -2) : route) + "(?:\\/(?=$))?";
        }
        if (end) {
          route += "$";
        } else {
          route += strict && endsWithSlash ? "" : "(?=\\/|$)";
        }
        return new RegExp("^" + route, flags2(options));
      }
      function pathToRegexp2(path, keys, options) {
        keys = keys || [];
        if (!isarray(keys)) {
          options = keys;
          keys = [];
        } else if (!options) {
          options = {};
        }
        if (path instanceof RegExp) {
          return regexpToRegexp2(path, keys, options);
        }
        if (isarray(path)) {
          return arrayToRegexp2(path, keys, options);
        }
        return stringToRegexp2(path, keys, options);
      }
      pathToRegexp_12.parse = parse_12;
      pathToRegexp_12.compile = compile_12;
      pathToRegexp_12.tokensToFunction = tokensToFunction_12;
      pathToRegexp_12.tokensToRegExp = tokensToRegExp_12;
      var hasDocument = typeof document !== "undefined";
      var hasWindow = typeof window !== "undefined";
      var hasHistory = typeof history !== "undefined";
      var hasProcess = typeof process !== "undefined";
      var clickEvent = hasDocument && document.ontouchstart ? "touchstart" : "click";
      var isLocation = hasWindow && !!(window.history.location || window.location);
      function Page() {
        this.callbacks = [];
        this.exits = [];
        this.current = "";
        this.len = 0;
        this._decodeURLComponents = true;
        this._base = "";
        this._strict = false;
        this._running = false;
        this._hashbang = false;
        this.clickHandler = this.clickHandler.bind(this);
        this._onpopstate = this._onpopstate.bind(this);
      }
      Page.prototype.configure = function(options) {
        var opts = options || {};
        this._window = opts.window || hasWindow && window;
        this._decodeURLComponents = opts.decodeURLComponents !== false;
        this._popstate = opts.popstate !== false && hasWindow;
        this._click = opts.click !== false && hasDocument;
        this._hashbang = !!opts.hashbang;
        var _window = this._window;
        if (this._popstate) {
          _window.addEventListener("popstate", this._onpopstate, false);
        } else if (hasWindow) {
          _window.removeEventListener("popstate", this._onpopstate, false);
        }
        if (this._click) {
          _window.document.addEventListener(clickEvent, this.clickHandler, false);
        } else if (hasDocument) {
          _window.document.removeEventListener(clickEvent, this.clickHandler, false);
        }
        if (this._hashbang && hasWindow && !hasHistory) {
          _window.addEventListener("hashchange", this._onpopstate, false);
        } else if (hasWindow) {
          _window.removeEventListener("hashchange", this._onpopstate, false);
        }
      };
      Page.prototype.base = function(path) {
        if (arguments.length === 0)
          return this._base;
        this._base = path;
      };
      Page.prototype._getBase = function() {
        var base = this._base;
        if (!!base)
          return base;
        var loc = hasWindow && this._window && this._window.location;
        if (hasWindow && this._hashbang && loc && loc.protocol === "file:") {
          base = loc.pathname;
        }
        return base;
      };
      Page.prototype.strict = function(enable) {
        if (arguments.length === 0)
          return this._strict;
        this._strict = enable;
      };
      Page.prototype.start = function(options) {
        var opts = options || {};
        this.configure(opts);
        if (opts.dispatch === false)
          return;
        this._running = true;
        var url;
        if (isLocation) {
          var window2 = this._window;
          var loc = window2.location;
          if (this._hashbang && ~loc.hash.indexOf("#!")) {
            url = loc.hash.substr(2) + loc.search;
          } else if (this._hashbang) {
            url = loc.search + loc.hash;
          } else {
            url = loc.pathname + loc.search + loc.hash;
          }
        }
        this.replace(url, null, true, opts.dispatch);
      };
      Page.prototype.stop = function() {
        if (!this._running)
          return;
        this.current = "";
        this.len = 0;
        this._running = false;
        var window2 = this._window;
        this._click && window2.document.removeEventListener(clickEvent, this.clickHandler, false);
        hasWindow && window2.removeEventListener("popstate", this._onpopstate, false);
        hasWindow && window2.removeEventListener("hashchange", this._onpopstate, false);
      };
      Page.prototype.show = function(path, state, dispatch, push) {
        var ctx = new Context(path, state, this), prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        if (dispatch !== false)
          this.dispatch(ctx, prev);
        if (ctx.handled !== false && push !== false)
          ctx.pushState();
        return ctx;
      };
      Page.prototype.back = function(path, state) {
        var page3 = this;
        if (this.len > 0) {
          var window2 = this._window;
          hasHistory && window2.history.back();
          this.len--;
        } else if (path) {
          setTimeout(function() {
            page3.show(path, state);
          });
        } else {
          setTimeout(function() {
            page3.show(page3._getBase(), state);
          });
        }
      };
      Page.prototype.redirect = function(from, to) {
        var inst = this;
        if (typeof from === "string" && typeof to === "string") {
          page2.call(this, from, function(e) {
            setTimeout(function() {
              inst.replace(to);
            }, 0);
          });
        }
        if (typeof from === "string" && typeof to === "undefined") {
          setTimeout(function() {
            inst.replace(from);
          }, 0);
        }
      };
      Page.prototype.replace = function(path, state, init, dispatch) {
        var ctx = new Context(path, state, this), prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        ctx.init = init;
        ctx.save();
        if (dispatch !== false)
          this.dispatch(ctx, prev);
        return ctx;
      };
      Page.prototype.dispatch = function(ctx, prev) {
        var i = 0, j = 0, page3 = this;
        function nextExit() {
          var fn = page3.exits[j++];
          if (!fn)
            return nextEnter();
          fn(prev, nextExit);
        }
        function nextEnter() {
          var fn = page3.callbacks[i++];
          if (ctx.path !== page3.current) {
            ctx.handled = false;
            return;
          }
          if (!fn)
            return unhandled.call(page3, ctx);
          fn(ctx, nextEnter);
        }
        if (prev) {
          nextExit();
        } else {
          nextEnter();
        }
      };
      Page.prototype.exit = function(path, fn) {
        if (typeof path === "function") {
          return this.exit("*", path);
        }
        var route = new Route(path, null, this);
        for (var i = 1; i < arguments.length; ++i) {
          this.exits.push(route.middleware(arguments[i]));
        }
      };
      Page.prototype.clickHandler = function(e) {
        if (this._which(e) !== 1)
          return;
        if (e.metaKey || e.ctrlKey || e.shiftKey)
          return;
        if (e.defaultPrevented)
          return;
        var el = e.target;
        var eventPath = e.path || (e.composedPath ? e.composedPath() : null);
        if (eventPath) {
          for (var i = 0; i < eventPath.length; i++) {
            if (!eventPath[i].nodeName)
              continue;
            if (eventPath[i].nodeName.toUpperCase() !== "A")
              continue;
            if (!eventPath[i].href)
              continue;
            el = eventPath[i];
            break;
          }
        }
        while (el && el.nodeName.toUpperCase() !== "A")
          el = el.parentNode;
        if (!el || el.nodeName.toUpperCase() !== "A")
          return;
        var svg = typeof el.href === "object" && el.href.constructor.name === "SVGAnimatedString";
        if (el.hasAttribute("download") || el.getAttribute("rel") === "external")
          return;
        var link = el.getAttribute("href");
        if (!this._hashbang && this._samePath(el) && (el.hash || link === "#"))
          return;
        if (link && link.indexOf("mailto:") > -1)
          return;
        if (svg ? el.target.baseVal : el.target)
          return;
        if (!svg && !this.sameOrigin(el.href))
          return;
        var path = svg ? el.href.baseVal : el.pathname + el.search + (el.hash || "");
        path = path[0] !== "/" ? "/" + path : path;
        if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
          path = path.replace(/^\/[a-zA-Z]:\//, "/");
        }
        var orig = path;
        var pageBase = this._getBase();
        if (path.indexOf(pageBase) === 0) {
          path = path.substr(pageBase.length);
        }
        if (this._hashbang)
          path = path.replace("#!", "");
        if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== "file:")) {
          return;
        }
        e.preventDefault();
        this.show(orig);
      };
      Page.prototype._onpopstate = function() {
        var loaded = false;
        if (!hasWindow) {
          return function() {
          };
        }
        if (hasDocument && document.readyState === "complete") {
          loaded = true;
        } else {
          window.addEventListener("load", function() {
            setTimeout(function() {
              loaded = true;
            }, 0);
          });
        }
        return function onpopstate(e) {
          if (!loaded)
            return;
          var page3 = this;
          if (e.state) {
            var path = e.state.path;
            page3.replace(path, e.state);
          } else if (isLocation) {
            var loc = page3._window.location;
            page3.show(loc.pathname + loc.search + loc.hash, void 0, void 0, false);
          }
        };
      }();
      Page.prototype._which = function(e) {
        e = e || hasWindow && this._window.event;
        return e.which == null ? e.button : e.which;
      };
      Page.prototype._toURL = function(href) {
        var window2 = this._window;
        if (typeof URL === "function" && isLocation) {
          return new URL(href, window2.location.toString());
        } else if (hasDocument) {
          var anc = window2.document.createElement("a");
          anc.href = href;
          return anc;
        }
      };
      Page.prototype.sameOrigin = function(href) {
        if (!href || !isLocation)
          return false;
        var url = this._toURL(href);
        var window2 = this._window;
        var loc = window2.location;
        return loc.protocol === url.protocol && loc.hostname === url.hostname && (loc.port === url.port || loc.port === "" && (url.port == 80 || url.port == 443));
      };
      Page.prototype._samePath = function(url) {
        if (!isLocation)
          return false;
        var window2 = this._window;
        var loc = window2.location;
        return url.pathname === loc.pathname && url.search === loc.search;
      };
      Page.prototype._decodeURLEncodedURIComponent = function(val) {
        if (typeof val !== "string") {
          return val;
        }
        return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, " ")) : val;
      };
      function createPage() {
        var pageInstance = new Page();
        function pageFn() {
          return page2.apply(pageInstance, arguments);
        }
        pageFn.callbacks = pageInstance.callbacks;
        pageFn.exits = pageInstance.exits;
        pageFn.base = pageInstance.base.bind(pageInstance);
        pageFn.strict = pageInstance.strict.bind(pageInstance);
        pageFn.start = pageInstance.start.bind(pageInstance);
        pageFn.stop = pageInstance.stop.bind(pageInstance);
        pageFn.show = pageInstance.show.bind(pageInstance);
        pageFn.back = pageInstance.back.bind(pageInstance);
        pageFn.redirect = pageInstance.redirect.bind(pageInstance);
        pageFn.replace = pageInstance.replace.bind(pageInstance);
        pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
        pageFn.exit = pageInstance.exit.bind(pageInstance);
        pageFn.configure = pageInstance.configure.bind(pageInstance);
        pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
        pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);
        pageFn.create = createPage;
        Object.defineProperty(pageFn, "len", {
          get: function() {
            return pageInstance.len;
          },
          set: function(val) {
            pageInstance.len = val;
          }
        });
        Object.defineProperty(pageFn, "current", {
          get: function() {
            return pageInstance.current;
          },
          set: function(val) {
            pageInstance.current = val;
          }
        });
        pageFn.Context = Context;
        pageFn.Route = Route;
        return pageFn;
      }
      function page2(path, fn) {
        if (typeof path === "function") {
          return page2.call(this, "*", path);
        }
        if (typeof fn === "function") {
          var route = new Route(path, null, this);
          for (var i = 1; i < arguments.length; ++i) {
            this.callbacks.push(route.middleware(arguments[i]));
          }
        } else if (typeof path === "string") {
          this[typeof fn === "string" ? "redirect" : "show"](path, fn);
        } else {
          this.start(path);
        }
      }
      function unhandled(ctx) {
        if (ctx.handled)
          return;
        var current;
        var page3 = this;
        var window2 = page3._window;
        if (page3._hashbang) {
          current = isLocation && this._getBase() + window2.location.hash.replace("#!", "");
        } else {
          current = isLocation && window2.location.pathname + window2.location.search;
        }
        if (current === ctx.canonicalPath)
          return;
        page3.stop();
        ctx.handled = false;
        isLocation && (window2.location.href = ctx.canonicalPath);
      }
      function escapeRegExp(s) {
        return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
      }
      function Context(path, state, pageInstance) {
        var _page = this.page = pageInstance || page2;
        var window2 = _page._window;
        var hashbang = _page._hashbang;
        var pageBase = _page._getBase();
        if (path[0] === "/" && path.indexOf(pageBase) !== 0)
          path = pageBase + (hashbang ? "#!" : "") + path;
        var i = path.indexOf("?");
        this.canonicalPath = path;
        var re = new RegExp("^" + escapeRegExp(pageBase));
        this.path = path.replace(re, "") || "/";
        if (hashbang)
          this.path = this.path.replace("#!", "") || "/";
        this.title = hasDocument && window2.document.title;
        this.state = state || {};
        this.state.path = path;
        this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : "";
        this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
        this.params = {};
        this.hash = "";
        if (!hashbang) {
          if (!~this.path.indexOf("#"))
            return;
          var parts = this.path.split("#");
          this.path = this.pathname = parts[0];
          this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || "";
          this.querystring = this.querystring.split("#")[0];
        }
      }
      Context.prototype.pushState = function() {
        var page3 = this.page;
        var window2 = page3._window;
        var hashbang = page3._hashbang;
        page3.len++;
        if (hasHistory) {
          window2.history.pushState(this.state, this.title, hashbang && this.path !== "/" ? "#!" + this.path : this.canonicalPath);
        }
      };
      Context.prototype.save = function() {
        var page3 = this.page;
        if (hasHistory) {
          page3._window.history.replaceState(this.state, this.title, page3._hashbang && this.path !== "/" ? "#!" + this.path : this.canonicalPath);
        }
      };
      function Route(path, options, page3) {
        var _page = this.page = page3 || globalPage;
        var opts = options || {};
        opts.strict = opts.strict || _page._strict;
        this.path = path === "*" ? "(.*)" : path;
        this.method = "GET";
        this.regexp = pathToRegexp_12(this.path, this.keys = [], opts);
      }
      Route.prototype.middleware = function(fn) {
        var self = this;
        return function(ctx, next) {
          if (self.match(ctx.path, ctx.params)) {
            ctx.routePath = self.path;
            return fn(ctx, next);
          }
          next();
        };
      };
      Route.prototype.match = function(path, params) {
        var keys = this.keys, qsIndex = path.indexOf("?"), pathname = ~qsIndex ? path.slice(0, qsIndex) : path, m = this.regexp.exec(decodeURIComponent(pathname));
        if (!m)
          return false;
        delete params[0];
        for (var i = 1, len = m.length; i < len; ++i) {
          var key = keys[i - 1];
          var val = this.page._decodeURLEncodedURIComponent(m[i]);
          if (val !== void 0 || !hasOwnProperty.call(params, key.name)) {
            params[key.name] = val;
          }
        }
        return true;
      };
      var globalPage = createPage();
      var page_js = globalPage;
      var default_1 = globalPage;
      page_js.default = default_1;
      return page_js;
    });
  });

  // src/components/pe-button/template.html
  var template_default = "<button>Hola mundo!</button>\r\n";

  // src/components/pe-button/index.js
  var template = document.createElement("template");
  template.innerHTML = template_default;
  var PeButton = class extends HTMLElement {
    constructor() {
      super();
      this.appendChild(template.content.cloneNode(true));
    }
  };
  customElements.define("pe-button", PeButton);

  // src/views/view-home/template.html
  var template_default2 = '<div class="container">\r\n  <h1>Home</h1>\r\n</div>\r\n';

  // src/views/view-home/index.js
  var template2 = document.createElement("template");
  template2.innerHTML = template_default2;
  var ViewHome = class extends HTMLElement {
    constructor() {
      super();
      this.$root = this.attachShadow({mode: "open"});
      this.$root.appendChild(template2.content.cloneNode(true));
    }
  };
  customElements.define("view-home", ViewHome);

  // src/views/view-blog/template.html
  var template_default3 = '<div class="container">\r\n  <h1>Blog</h1>\r\n</div>\r\n';

  // src/views/view-blog/index.js
  var template3 = document.createElement("template");
  template3.innerHTML = template_default3;
  var ViewBlog = class extends HTMLElement {
    constructor() {
      super();
      this.$root = this.attachShadow({mode: "open"});
      this.$root.appendChild(template3.content.cloneNode(true));
    }
  };
  customElements.define("view-blog", ViewBlog);

  // node_modules/@vaadin/router/dist/vaadin-router.js
  function toArray(objectOrArray) {
    objectOrArray = objectOrArray || [];
    return Array.isArray(objectOrArray) ? objectOrArray : [objectOrArray];
  }
  function log(msg) {
    return `[Vaadin.Router] ${msg}`;
  }
  function logValue(value) {
    if (typeof value !== "object") {
      return String(value);
    }
    const stringType = Object.prototype.toString.call(value).match(/ (.*)\]$/)[1];
    if (stringType === "Object" || stringType === "Array") {
      return `${stringType} ${JSON.stringify(value)}`;
    } else {
      return stringType;
    }
  }
  var MODULE = "module";
  var NOMODULE = "nomodule";
  var bundleKeys = [MODULE, NOMODULE];
  function ensureBundle(src) {
    if (!src.match(/.+\.[m]?js$/)) {
      throw new Error(log(`Unsupported type for bundle "${src}": .js or .mjs expected.`));
    }
  }
  function ensureRoute(route) {
    if (!route || !isString(route.path)) {
      throw new Error(log(`Expected route config to be an object with a "path" string property, or an array of such objects`));
    }
    const bundle = route.bundle;
    const stringKeys = ["component", "redirect", "bundle"];
    if (!isFunction(route.action) && !Array.isArray(route.children) && !isFunction(route.children) && !isObject(bundle) && !stringKeys.some((key) => isString(route[key]))) {
      throw new Error(log(`Expected route config "${route.path}" to include either "${stringKeys.join('", "')}" or "action" function but none found.`));
    }
    if (bundle) {
      if (isString(bundle)) {
        ensureBundle(bundle);
      } else if (!bundleKeys.some((key) => key in bundle)) {
        throw new Error(log('Expected route bundle to include either "' + NOMODULE + '" or "' + MODULE + '" keys, or both'));
      } else {
        bundleKeys.forEach((key) => key in bundle && ensureBundle(bundle[key]));
      }
    }
    if (route.redirect) {
      ["bundle", "component"].forEach((overriddenProp) => {
        if (overriddenProp in route) {
          console.warn(log(`Route config "${route.path}" has both "redirect" and "${overriddenProp}" properties, and "redirect" will always override the latter. Did you mean to only use "${overriddenProp}"?`));
        }
      });
    }
  }
  function ensureRoutes(routes) {
    toArray(routes).forEach((route) => ensureRoute(route));
  }
  function loadScript(src, key) {
    let script = document.head.querySelector('script[src="' + src + '"][async]');
    if (!script) {
      script = document.createElement("script");
      script.setAttribute("src", src);
      if (key === MODULE) {
        script.setAttribute("type", MODULE);
      } else if (key === NOMODULE) {
        script.setAttribute(NOMODULE, "");
      }
      script.async = true;
    }
    return new Promise((resolve, reject) => {
      script.onreadystatechange = script.onload = (e) => {
        script.__dynamicImportLoaded = true;
        resolve(e);
      };
      script.onerror = (e) => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        reject(e);
      };
      if (script.parentNode === null) {
        document.head.appendChild(script);
      } else if (script.__dynamicImportLoaded) {
        resolve();
      }
    });
  }
  function loadBundle(bundle) {
    if (isString(bundle)) {
      return loadScript(bundle);
    } else {
      return Promise.race(bundleKeys.filter((key) => key in bundle).map((key) => loadScript(bundle[key], key)));
    }
  }
  function fireRouterEvent(type, detail) {
    return !window.dispatchEvent(new CustomEvent(`vaadin-router-${type}`, {cancelable: type === "go", detail}));
  }
  function isObject(o) {
    return typeof o === "object" && !!o;
  }
  function isFunction(f) {
    return typeof f === "function";
  }
  function isString(s) {
    return typeof s === "string";
  }
  function getNotFoundError(context) {
    const error = new Error(log(`Page not found (${context.pathname})`));
    error.context = context;
    error.code = 404;
    return error;
  }
  var notFoundResult = new class NotFoundResult {
  }();
  function getAnchorOrigin(anchor) {
    const port = anchor.port;
    const protocol = anchor.protocol;
    const defaultHttp = protocol === "http:" && port === "80";
    const defaultHttps = protocol === "https:" && port === "443";
    const host = defaultHttp || defaultHttps ? anchor.hostname : anchor.host;
    return `${protocol}//${host}`;
  }
  function vaadinRouterGlobalClickHandler(event) {
    if (event.defaultPrevented) {
      return;
    }
    if (event.button !== 0) {
      return;
    }
    if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }
    let anchor = event.target;
    const path = event.composedPath ? event.composedPath() : event.path || [];
    for (let i = 0; i < path.length; i++) {
      const target = path[i];
      if (target.nodeName && target.nodeName.toLowerCase() === "a") {
        anchor = target;
        break;
      }
    }
    while (anchor && anchor.nodeName.toLowerCase() !== "a") {
      anchor = anchor.parentNode;
    }
    if (!anchor || anchor.nodeName.toLowerCase() !== "a") {
      return;
    }
    if (anchor.target && anchor.target.toLowerCase() !== "_self") {
      return;
    }
    if (anchor.hasAttribute("download")) {
      return;
    }
    if (anchor.hasAttribute("router-ignore")) {
      return;
    }
    if (anchor.pathname === window.location.pathname && anchor.hash !== "") {
      return;
    }
    const origin = anchor.origin || getAnchorOrigin(anchor);
    if (origin !== window.location.origin) {
      return;
    }
    const {pathname, search, hash} = anchor;
    if (fireRouterEvent("go", {pathname, search, hash})) {
      event.preventDefault();
      if (event && event.type === "click") {
        window.scrollTo(0, 0);
      }
    }
  }
  var CLICK = {
    activate() {
      window.document.addEventListener("click", vaadinRouterGlobalClickHandler);
    },
    inactivate() {
      window.document.removeEventListener("click", vaadinRouterGlobalClickHandler);
    }
  };
  var isIE = /Trident/.test(navigator.userAgent);
  if (isIE && !isFunction(window.PopStateEvent)) {
    window.PopStateEvent = function(inType, params) {
      params = params || {};
      var e = document.createEvent("Event");
      e.initEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable));
      e.state = params.state || null;
      return e;
    };
    window.PopStateEvent.prototype = window.Event.prototype;
  }
  function vaadinRouterGlobalPopstateHandler(event) {
    if (event.state === "vaadin-router-ignore") {
      return;
    }
    const {pathname, search, hash} = window.location;
    fireRouterEvent("go", {pathname, search, hash});
  }
  var POPSTATE = {
    activate() {
      window.addEventListener("popstate", vaadinRouterGlobalPopstateHandler);
    },
    inactivate() {
      window.removeEventListener("popstate", vaadinRouterGlobalPopstateHandler);
    }
  };
  var pathToRegexp_1 = pathToRegexp;
  var parse_1 = parse;
  var compile_1 = compile;
  var tokensToFunction_1 = tokensToFunction;
  var tokensToRegExp_1 = tokensToRegExp;
  var DEFAULT_DELIMITER = "/";
  var DEFAULT_DELIMITERS = "./";
  var PATH_REGEXP = new RegExp([
    "(\\\\.)",
    "(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?"
  ].join("|"), "g");
  function parse(str, options) {
    var tokens = [];
    var key = 0;
    var index = 0;
    var path = "";
    var defaultDelimiter = options && options.delimiter || DEFAULT_DELIMITER;
    var delimiters = options && options.delimiters || DEFAULT_DELIMITERS;
    var pathEscaped = false;
    var res;
    while ((res = PATH_REGEXP.exec(str)) !== null) {
      var m = res[0];
      var escaped = res[1];
      var offset = res.index;
      path += str.slice(index, offset);
      index = offset + m.length;
      if (escaped) {
        path += escaped[1];
        pathEscaped = true;
        continue;
      }
      var prev = "";
      var next = str[index];
      var name = res[2];
      var capture = res[3];
      var group = res[4];
      var modifier = res[5];
      if (!pathEscaped && path.length) {
        var k = path.length - 1;
        if (delimiters.indexOf(path[k]) > -1) {
          prev = path[k];
          path = path.slice(0, k);
        }
      }
      if (path) {
        tokens.push(path);
        path = "";
        pathEscaped = false;
      }
      var partial = prev !== "" && next !== void 0 && next !== prev;
      var repeat = modifier === "+" || modifier === "*";
      var optional = modifier === "?" || modifier === "*";
      var delimiter = prev || defaultDelimiter;
      var pattern = capture || group;
      tokens.push({
        name: name || key++,
        prefix: prev,
        delimiter,
        optional,
        repeat,
        partial,
        pattern: pattern ? escapeGroup(pattern) : "[^" + escapeString(delimiter) + "]+?"
      });
    }
    if (path || index < str.length) {
      tokens.push(path + str.substr(index));
    }
    return tokens;
  }
  function compile(str, options) {
    return tokensToFunction(parse(str, options));
  }
  function tokensToFunction(tokens) {
    var matches = new Array(tokens.length);
    for (var i = 0; i < tokens.length; i++) {
      if (typeof tokens[i] === "object") {
        matches[i] = new RegExp("^(?:" + tokens[i].pattern + ")$");
      }
    }
    return function(data, options) {
      var path = "";
      var encode = options && options.encode || encodeURIComponent;
      for (var i2 = 0; i2 < tokens.length; i2++) {
        var token = tokens[i2];
        if (typeof token === "string") {
          path += token;
          continue;
        }
        var value = data ? data[token.name] : void 0;
        var segment;
        if (Array.isArray(value)) {
          if (!token.repeat) {
            throw new TypeError('Expected "' + token.name + '" to not repeat, but got array');
          }
          if (value.length === 0) {
            if (token.optional)
              continue;
            throw new TypeError('Expected "' + token.name + '" to not be empty');
          }
          for (var j = 0; j < value.length; j++) {
            segment = encode(value[j], token);
            if (!matches[i2].test(segment)) {
              throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '"');
            }
            path += (j === 0 ? token.prefix : token.delimiter) + segment;
          }
          continue;
        }
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          segment = encode(String(value), token);
          if (!matches[i2].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but got "' + segment + '"');
          }
          path += token.prefix + segment;
          continue;
        }
        if (token.optional) {
          if (token.partial)
            path += token.prefix;
          continue;
        }
        throw new TypeError('Expected "' + token.name + '" to be ' + (token.repeat ? "an array" : "a string"));
      }
      return path;
    };
  }
  function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
  }
  function escapeGroup(group) {
    return group.replace(/([=!:$/()])/g, "\\$1");
  }
  function flags(options) {
    return options && options.sensitive ? "" : "i";
  }
  function regexpToRegexp(path, keys) {
    if (!keys)
      return path;
    var groups = path.source.match(/\((?!\?)/g);
    if (groups) {
      for (var i = 0; i < groups.length; i++) {
        keys.push({
          name: i,
          prefix: null,
          delimiter: null,
          optional: false,
          repeat: false,
          partial: false,
          pattern: null
        });
      }
    }
    return path;
  }
  function arrayToRegexp(path, keys, options) {
    var parts = [];
    for (var i = 0; i < path.length; i++) {
      parts.push(pathToRegexp(path[i], keys, options).source);
    }
    return new RegExp("(?:" + parts.join("|") + ")", flags(options));
  }
  function stringToRegexp(path, keys, options) {
    return tokensToRegExp(parse(path, options), keys, options);
  }
  function tokensToRegExp(tokens, keys, options) {
    options = options || {};
    var strict = options.strict;
    var start = options.start !== false;
    var end = options.end !== false;
    var delimiter = escapeString(options.delimiter || DEFAULT_DELIMITER);
    var delimiters = options.delimiters || DEFAULT_DELIMITERS;
    var endsWith = [].concat(options.endsWith || []).map(escapeString).concat("$").join("|");
    var route = start ? "^" : "";
    var isEndDelimited = tokens.length === 0;
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        route += escapeString(token);
        isEndDelimited = i === tokens.length - 1 && delimiters.indexOf(token[token.length - 1]) > -1;
      } else {
        var capture = token.repeat ? "(?:" + token.pattern + ")(?:" + escapeString(token.delimiter) + "(?:" + token.pattern + "))*" : token.pattern;
        if (keys)
          keys.push(token);
        if (token.optional) {
          if (token.partial) {
            route += escapeString(token.prefix) + "(" + capture + ")?";
          } else {
            route += "(?:" + escapeString(token.prefix) + "(" + capture + "))?";
          }
        } else {
          route += escapeString(token.prefix) + "(" + capture + ")";
        }
      }
    }
    if (end) {
      if (!strict)
        route += "(?:" + delimiter + ")?";
      route += endsWith === "$" ? "$" : "(?=" + endsWith + ")";
    } else {
      if (!strict)
        route += "(?:" + delimiter + "(?=" + endsWith + "))?";
      if (!isEndDelimited)
        route += "(?=" + delimiter + "|" + endsWith + ")";
    }
    return new RegExp(route, flags(options));
  }
  function pathToRegexp(path, keys, options) {
    if (path instanceof RegExp) {
      return regexpToRegexp(path, keys);
    }
    if (Array.isArray(path)) {
      return arrayToRegexp(path, keys, options);
    }
    return stringToRegexp(path, keys, options);
  }
  pathToRegexp_1.parse = parse_1;
  pathToRegexp_1.compile = compile_1;
  pathToRegexp_1.tokensToFunction = tokensToFunction_1;
  pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;
  var {hasOwnProperty: hasOwnProperty2} = Object.prototype;
  var cache = new Map();
  cache.set("|false", {
    keys: [],
    pattern: /(?:)/
  });
  function decodeParam(val) {
    try {
      return decodeURIComponent(val);
    } catch (err) {
      return val;
    }
  }
  function matchPath(routepath, path, exact, parentKeys, parentParams) {
    exact = !!exact;
    const cacheKey = `${routepath}|${exact}`;
    let regexp = cache.get(cacheKey);
    if (!regexp) {
      const keys = [];
      regexp = {
        keys,
        pattern: pathToRegexp_1(routepath, keys, {
          end: exact,
          strict: routepath === ""
        })
      };
      cache.set(cacheKey, regexp);
    }
    const m = regexp.pattern.exec(path);
    if (!m) {
      return null;
    }
    const params = Object.assign({}, parentParams);
    for (let i = 1; i < m.length; i++) {
      const key = regexp.keys[i - 1];
      const prop = key.name;
      const value = m[i];
      if (value !== void 0 || !hasOwnProperty2.call(params, prop)) {
        if (key.repeat) {
          params[prop] = value ? value.split(key.delimiter).map(decodeParam) : [];
        } else {
          params[prop] = value ? decodeParam(value) : value;
        }
      }
    }
    return {
      path: m[0],
      keys: (parentKeys || []).concat(regexp.keys),
      params
    };
  }
  function matchRoute(route, pathname, ignoreLeadingSlash, parentKeys, parentParams) {
    let match;
    let childMatches;
    let childIndex = 0;
    let routepath = route.path || "";
    if (routepath.charAt(0) === "/") {
      if (ignoreLeadingSlash) {
        routepath = routepath.substr(1);
      }
      ignoreLeadingSlash = true;
    }
    return {
      next(routeToSkip) {
        if (route === routeToSkip) {
          return {done: true};
        }
        const children = route.__children = route.__children || route.children;
        if (!match) {
          match = matchPath(routepath, pathname, !children, parentKeys, parentParams);
          if (match) {
            return {
              done: false,
              value: {
                route,
                keys: match.keys,
                params: match.params,
                path: match.path
              }
            };
          }
        }
        if (match && children) {
          while (childIndex < children.length) {
            if (!childMatches) {
              const childRoute = children[childIndex];
              childRoute.parent = route;
              let matchedLength = match.path.length;
              if (matchedLength > 0 && pathname.charAt(matchedLength) === "/") {
                matchedLength += 1;
              }
              childMatches = matchRoute(childRoute, pathname.substr(matchedLength), ignoreLeadingSlash, match.keys, match.params);
            }
            const childMatch = childMatches.next(routeToSkip);
            if (!childMatch.done) {
              return {
                done: false,
                value: childMatch.value
              };
            }
            childMatches = null;
            childIndex++;
          }
        }
        return {done: true};
      }
    };
  }
  function resolveRoute(context) {
    if (isFunction(context.route.action)) {
      return context.route.action(context);
    }
    return void 0;
  }
  function isChildRoute(parentRoute, childRoute) {
    let route = childRoute;
    while (route) {
      route = route.parent;
      if (route === parentRoute) {
        return true;
      }
    }
    return false;
  }
  function generateErrorMessage(currentContext) {
    let errorMessage = `Path '${currentContext.pathname}' is not properly resolved due to an error.`;
    const routePath = (currentContext.route || {}).path;
    if (routePath) {
      errorMessage += ` Resolution had failed on route: '${routePath}'`;
    }
    return errorMessage;
  }
  function updateChainForRoute(context, match) {
    const {route, path} = match;
    if (route && !route.__synthetic) {
      const item = {path, route};
      if (!context.chain) {
        context.chain = [];
      } else {
        if (route.parent) {
          let i = context.chain.length;
          while (i-- && context.chain[i].route && context.chain[i].route !== route.parent) {
            context.chain.pop();
          }
        }
      }
      context.chain.push(item);
    }
  }
  var Resolver = class {
    constructor(routes, options = {}) {
      if (Object(routes) !== routes) {
        throw new TypeError("Invalid routes");
      }
      this.baseUrl = options.baseUrl || "";
      this.errorHandler = options.errorHandler;
      this.resolveRoute = options.resolveRoute || resolveRoute;
      this.context = Object.assign({resolver: this}, options.context);
      this.root = Array.isArray(routes) ? {path: "", __children: routes, parent: null, __synthetic: true} : routes;
      this.root.parent = null;
    }
    getRoutes() {
      return [...this.root.__children];
    }
    setRoutes(routes) {
      ensureRoutes(routes);
      const newRoutes = [...toArray(routes)];
      this.root.__children = newRoutes;
    }
    addRoutes(routes) {
      ensureRoutes(routes);
      this.root.__children.push(...toArray(routes));
      return this.getRoutes();
    }
    removeRoutes() {
      this.setRoutes([]);
    }
    resolve(pathnameOrContext) {
      const context = Object.assign({}, this.context, isString(pathnameOrContext) ? {pathname: pathnameOrContext} : pathnameOrContext);
      const match = matchRoute(this.root, this.__normalizePathname(context.pathname), this.baseUrl);
      const resolve = this.resolveRoute;
      let matches = null;
      let nextMatches = null;
      let currentContext = context;
      function next(resume, parent = matches.value.route, prevResult) {
        const routeToSkip = prevResult === null && matches.value.route;
        matches = nextMatches || match.next(routeToSkip);
        nextMatches = null;
        if (!resume) {
          if (matches.done || !isChildRoute(parent, matches.value.route)) {
            nextMatches = matches;
            return Promise.resolve(notFoundResult);
          }
        }
        if (matches.done) {
          return Promise.reject(getNotFoundError(context));
        }
        currentContext = Object.assign(currentContext ? {chain: currentContext.chain ? currentContext.chain.slice(0) : []} : {}, context, matches.value);
        updateChainForRoute(currentContext, matches.value);
        return Promise.resolve(resolve(currentContext)).then((resolution) => {
          if (resolution !== null && resolution !== void 0 && resolution !== notFoundResult) {
            currentContext.result = resolution.result || resolution;
            return currentContext;
          }
          return next(resume, parent, resolution);
        });
      }
      context.next = next;
      return Promise.resolve().then(() => next(true, this.root)).catch((error) => {
        const errorMessage = generateErrorMessage(currentContext);
        if (!error) {
          error = new Error(errorMessage);
        } else {
          console.warn(errorMessage);
        }
        error.context = error.context || currentContext;
        if (!(error instanceof DOMException)) {
          error.code = error.code || 500;
        }
        if (this.errorHandler) {
          currentContext.result = this.errorHandler(error);
          return currentContext;
        }
        throw error;
      });
    }
    static __createUrl(url, base) {
      return new URL(url, base);
    }
    get __effectiveBaseUrl() {
      return this.baseUrl ? this.constructor.__createUrl(this.baseUrl, document.baseURI || document.URL).href.replace(/[^\/]*$/, "") : "";
    }
    __normalizePathname(pathname) {
      if (!this.baseUrl) {
        return pathname;
      }
      const base = this.__effectiveBaseUrl;
      const normalizedUrl = this.constructor.__createUrl(pathname, base).href;
      if (normalizedUrl.slice(0, base.length) === base) {
        return normalizedUrl.slice(base.length);
      }
    }
  };
  Resolver.pathToRegexp = pathToRegexp_1;
  var {pathToRegexp: pathToRegexp$1} = Resolver;
  var cache$1 = new Map();
  function cacheRoutes(routesByName, route, routes) {
    const name = route.name || route.component;
    if (name) {
      if (routesByName.has(name)) {
        routesByName.get(name).push(route);
      } else {
        routesByName.set(name, [route]);
      }
    }
    if (Array.isArray(routes)) {
      for (let i = 0; i < routes.length; i++) {
        const childRoute = routes[i];
        childRoute.parent = route;
        cacheRoutes(routesByName, childRoute, childRoute.__children || childRoute.children);
      }
    }
  }
  function getRouteByName(routesByName, routeName) {
    const routes = routesByName.get(routeName);
    if (routes && routes.length > 1) {
      throw new Error(`Duplicate route with name "${routeName}". Try seting unique 'name' route properties.`);
    }
    return routes && routes[0];
  }
  function getRoutePath(route) {
    let path = route.path;
    path = Array.isArray(path) ? path[0] : path;
    return path !== void 0 ? path : "";
  }
  function generateUrls(router2, options = {}) {
    if (!(router2 instanceof Resolver)) {
      throw new TypeError("An instance of Resolver is expected");
    }
    const routesByName = new Map();
    return (routeName, params) => {
      let route = getRouteByName(routesByName, routeName);
      if (!route) {
        routesByName.clear();
        cacheRoutes(routesByName, router2.root, router2.root.__children);
        route = getRouteByName(routesByName, routeName);
        if (!route) {
          throw new Error(`Route "${routeName}" not found`);
        }
      }
      let regexp = cache$1.get(route.fullPath);
      if (!regexp) {
        let fullPath = getRoutePath(route);
        let rt = route.parent;
        while (rt) {
          const path = getRoutePath(rt);
          if (path) {
            fullPath = path.replace(/\/$/, "") + "/" + fullPath.replace(/^\//, "");
          }
          rt = rt.parent;
        }
        const tokens = pathToRegexp$1.parse(fullPath);
        const toPath = pathToRegexp$1.tokensToFunction(tokens);
        const keys = Object.create(null);
        for (let i = 0; i < tokens.length; i++) {
          if (!isString(tokens[i])) {
            keys[tokens[i].name] = true;
          }
        }
        regexp = {toPath, keys};
        cache$1.set(fullPath, regexp);
        route.fullPath = fullPath;
      }
      let url = regexp.toPath(params, options) || "/";
      if (options.stringifyQueryParams && params) {
        const queryParams = {};
        const keys = Object.keys(params);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (!regexp.keys[key]) {
            queryParams[key] = params[key];
          }
        }
        const query = options.stringifyQueryParams(queryParams);
        if (query) {
          url += query.charAt(0) === "?" ? query : `?${query}`;
        }
      }
      return url;
    };
  }
  var triggers = [];
  function setNavigationTriggers(newTriggers) {
    triggers.forEach((trigger) => trigger.inactivate());
    newTriggers.forEach((trigger) => trigger.activate());
    triggers = newTriggers;
  }
  var willAnimate = (elem) => {
    const name = getComputedStyle(elem).getPropertyValue("animation-name");
    return name && name !== "none";
  };
  var waitForAnimation = (elem, cb) => {
    const listener = () => {
      elem.removeEventListener("animationend", listener);
      cb();
    };
    elem.addEventListener("animationend", listener);
  };
  function animate(elem, className) {
    elem.classList.add(className);
    return new Promise((resolve) => {
      if (willAnimate(elem)) {
        const rect = elem.getBoundingClientRect();
        const size = `height: ${rect.bottom - rect.top}px; width: ${rect.right - rect.left}px`;
        elem.setAttribute("style", `position: absolute; ${size}`);
        waitForAnimation(elem, () => {
          elem.classList.remove(className);
          elem.removeAttribute("style");
          resolve();
        });
      } else {
        elem.classList.remove(className);
        resolve();
      }
    });
  }
  var MAX_REDIRECT_COUNT = 256;
  function isResultNotEmpty(result) {
    return result !== null && result !== void 0;
  }
  function copyContextWithoutNext(context) {
    const copy = Object.assign({}, context);
    delete copy.next;
    return copy;
  }
  function createLocation({pathname = "", search = "", hash = "", chain = [], params = {}, redirectFrom, resolver}, route) {
    const routes = chain.map((item) => item.route);
    return {
      baseUrl: resolver && resolver.baseUrl || "",
      pathname,
      search,
      hash,
      routes,
      route: route || routes.length && routes[routes.length - 1] || null,
      params,
      redirectFrom,
      getUrl: (userParams = {}) => getPathnameForRouter(Router.pathToRegexp.compile(getMatchedPath(routes))(Object.assign({}, params, userParams)), resolver)
    };
  }
  function createRedirect(context, pathname) {
    const params = Object.assign({}, context.params);
    return {
      redirect: {
        pathname,
        from: context.pathname,
        params
      }
    };
  }
  function renderElement(context, element) {
    element.location = createLocation(context);
    const index = context.chain.map((item) => item.route).indexOf(context.route);
    context.chain[index].element = element;
    return element;
  }
  function runCallbackIfPossible(callback, args, thisArg) {
    if (isFunction(callback)) {
      return callback.apply(thisArg, args);
    }
  }
  function amend(amendmentFunction, args, element) {
    return (amendmentResult) => {
      if (amendmentResult && (amendmentResult.cancel || amendmentResult.redirect)) {
        return amendmentResult;
      }
      if (element) {
        return runCallbackIfPossible(element[amendmentFunction], args, element);
      }
    };
  }
  function processNewChildren(newChildren, route) {
    if (!Array.isArray(newChildren) && !isObject(newChildren)) {
      throw new Error(log(`Incorrect "children" value for the route ${route.path}: expected array or object, but got ${newChildren}`));
    }
    route.__children = [];
    const childRoutes = toArray(newChildren);
    for (let i = 0; i < childRoutes.length; i++) {
      ensureRoute(childRoutes[i]);
      route.__children.push(childRoutes[i]);
    }
  }
  function removeDomNodes(nodes) {
    if (nodes && nodes.length) {
      const parent = nodes[0].parentNode;
      for (let i = 0; i < nodes.length; i++) {
        parent.removeChild(nodes[i]);
      }
    }
  }
  function getPathnameForRouter(pathname, router2) {
    const base = router2.__effectiveBaseUrl;
    return base ? router2.constructor.__createUrl(pathname.replace(/^\//, ""), base).pathname : pathname;
  }
  function getMatchedPath(chain) {
    return chain.map((item) => item.path).reduce((a, b) => {
      if (b.length) {
        return a.replace(/\/$/, "") + "/" + b.replace(/^\//, "");
      }
      return a;
    }, "");
  }
  var Router = class extends Resolver {
    constructor(outlet, options) {
      const baseElement = document.head.querySelector("base");
      const baseHref = baseElement && baseElement.getAttribute("href");
      super([], Object.assign({
        baseUrl: baseHref && Resolver.__createUrl(baseHref, document.URL).pathname.replace(/[^\/]*$/, "")
      }, options));
      this.resolveRoute = (context) => this.__resolveRoute(context);
      const triggers2 = Router.NavigationTrigger;
      Router.setTriggers.apply(Router, Object.keys(triggers2).map((key) => triggers2[key]));
      this.baseUrl;
      this.ready;
      this.ready = Promise.resolve(outlet);
      this.location;
      this.location = createLocation({resolver: this});
      this.__lastStartedRenderId = 0;
      this.__navigationEventHandler = this.__onNavigationEvent.bind(this);
      this.setOutlet(outlet);
      this.subscribe();
      this.__createdByRouter = new WeakMap();
      this.__addedByRouter = new WeakMap();
    }
    __resolveRoute(context) {
      const route = context.route;
      let callbacks = Promise.resolve();
      if (isFunction(route.children)) {
        callbacks = callbacks.then(() => route.children(copyContextWithoutNext(context))).then((children) => {
          if (!isResultNotEmpty(children) && !isFunction(route.children)) {
            children = route.children;
          }
          processNewChildren(children, route);
        });
      }
      const commands = {
        redirect: (path) => createRedirect(context, path),
        component: (component) => {
          const element = document.createElement(component);
          this.__createdByRouter.set(element, true);
          return element;
        }
      };
      return callbacks.then(() => {
        if (this.__isLatestRender(context)) {
          return runCallbackIfPossible(route.action, [context, commands], route);
        }
      }).then((result) => {
        if (isResultNotEmpty(result)) {
          if (result instanceof HTMLElement || result.redirect || result === notFoundResult) {
            return result;
          }
        }
        if (isString(route.redirect)) {
          return commands.redirect(route.redirect);
        }
        if (route.bundle) {
          return loadBundle(route.bundle).then(() => {
          }, () => {
            throw new Error(log(`Bundle not found: ${route.bundle}. Check if the file name is correct`));
          });
        }
      }).then((result) => {
        if (isResultNotEmpty(result)) {
          return result;
        }
        if (isString(route.component)) {
          return commands.component(route.component);
        }
      });
    }
    setOutlet(outlet) {
      if (outlet) {
        this.__ensureOutlet(outlet);
      }
      this.__outlet = outlet;
    }
    getOutlet() {
      return this.__outlet;
    }
    setRoutes(routes, skipRender = false) {
      this.__previousContext = void 0;
      this.__urlForName = void 0;
      super.setRoutes(routes);
      if (!skipRender) {
        this.__onNavigationEvent();
      }
      return this.ready;
    }
    render(pathnameOrContext, shouldUpdateHistory) {
      const renderId = ++this.__lastStartedRenderId;
      const context = Object.assign({
        search: "",
        hash: ""
      }, isString(pathnameOrContext) ? {pathname: pathnameOrContext} : pathnameOrContext, {
        __renderId: renderId
      });
      this.ready = this.resolve(context).then((context2) => this.__fullyResolveChain(context2)).then((context2) => {
        if (this.__isLatestRender(context2)) {
          const previousContext = this.__previousContext;
          if (context2 === previousContext) {
            this.__updateBrowserHistory(previousContext, true);
            return this.location;
          }
          this.location = createLocation(context2);
          if (shouldUpdateHistory) {
            this.__updateBrowserHistory(context2, renderId === 1);
          }
          fireRouterEvent("location-changed", {router: this, location: this.location});
          if (context2.__skipAttach) {
            this.__copyUnchangedElements(context2, previousContext);
            this.__previousContext = context2;
            return this.location;
          }
          this.__addAppearingContent(context2, previousContext);
          const animationDone = this.__animateIfNeeded(context2);
          this.__runOnAfterEnterCallbacks(context2);
          this.__runOnAfterLeaveCallbacks(context2, previousContext);
          return animationDone.then(() => {
            if (this.__isLatestRender(context2)) {
              this.__removeDisappearingContent();
              this.__previousContext = context2;
              return this.location;
            }
          });
        }
      }).catch((error) => {
        if (renderId === this.__lastStartedRenderId) {
          if (shouldUpdateHistory) {
            this.__updateBrowserHistory(context);
          }
          removeDomNodes(this.__outlet && this.__outlet.children);
          this.location = createLocation(Object.assign(context, {resolver: this}));
          fireRouterEvent("error", Object.assign({router: this, error}, context));
          throw error;
        }
      });
      return this.ready;
    }
    __fullyResolveChain(topOfTheChainContextBeforeRedirects, contextBeforeRedirects = topOfTheChainContextBeforeRedirects) {
      return this.__findComponentContextAfterAllRedirects(contextBeforeRedirects).then((contextAfterRedirects) => {
        const redirectsHappened = contextAfterRedirects !== contextBeforeRedirects;
        const topOfTheChainContextAfterRedirects = redirectsHappened ? contextAfterRedirects : topOfTheChainContextBeforeRedirects;
        const matchedPath = getPathnameForRouter(getMatchedPath(contextAfterRedirects.chain), contextAfterRedirects.resolver);
        const isFound = matchedPath === contextAfterRedirects.pathname;
        const findNextContextIfAny = (context, parent = context.route, prevResult) => {
          return context.next(void 0, parent, prevResult).then((nextContext) => {
            if (nextContext === null || nextContext === notFoundResult) {
              if (isFound) {
                return context;
              } else if (parent.parent !== null) {
                return findNextContextIfAny(context, parent.parent, nextContext);
              } else {
                return nextContext;
              }
            }
            return nextContext;
          });
        };
        return findNextContextIfAny(contextAfterRedirects).then((nextContext) => {
          if (nextContext === null || nextContext === notFoundResult) {
            throw getNotFoundError(topOfTheChainContextAfterRedirects);
          }
          return nextContext && nextContext !== notFoundResult && nextContext !== contextAfterRedirects ? this.__fullyResolveChain(topOfTheChainContextAfterRedirects, nextContext) : this.__amendWithOnBeforeCallbacks(contextAfterRedirects);
        });
      });
    }
    __findComponentContextAfterAllRedirects(context) {
      const result = context.result;
      if (result instanceof HTMLElement) {
        renderElement(context, result);
        return Promise.resolve(context);
      } else if (result.redirect) {
        return this.__redirect(result.redirect, context.__redirectCount, context.__renderId).then((context2) => this.__findComponentContextAfterAllRedirects(context2));
      } else if (result instanceof Error) {
        return Promise.reject(result);
      } else {
        return Promise.reject(new Error(log(`Invalid route resolution result for path "${context.pathname}". Expected redirect object or HTML element, but got: "${logValue(result)}". Double check the action return value for the route.`)));
      }
    }
    __amendWithOnBeforeCallbacks(contextWithFullChain) {
      return this.__runOnBeforeCallbacks(contextWithFullChain).then((amendedContext) => {
        if (amendedContext === this.__previousContext || amendedContext === contextWithFullChain) {
          return amendedContext;
        }
        return this.__fullyResolveChain(amendedContext);
      });
    }
    __runOnBeforeCallbacks(newContext) {
      const previousContext = this.__previousContext || {};
      const previousChain = previousContext.chain || [];
      const newChain = newContext.chain;
      let callbacks = Promise.resolve();
      const prevent = () => ({cancel: true});
      const redirect = (pathname) => createRedirect(newContext, pathname);
      newContext.__divergedChainIndex = 0;
      newContext.__skipAttach = false;
      if (previousChain.length) {
        for (let i = 0; i < Math.min(previousChain.length, newChain.length); i = ++newContext.__divergedChainIndex) {
          if (previousChain[i].route !== newChain[i].route || previousChain[i].path !== newChain[i].path && previousChain[i].element !== newChain[i].element || !this.__isReusableElement(previousChain[i].element, newChain[i].element)) {
            break;
          }
        }
        newContext.__skipAttach = newChain.length === previousChain.length && newContext.__divergedChainIndex == newChain.length && this.__isReusableElement(newContext.result, previousContext.result);
        if (newContext.__skipAttach) {
          for (let i = newChain.length - 1; i >= 0; i--) {
            callbacks = this.__runOnBeforeLeaveCallbacks(callbacks, newContext, {prevent}, previousChain[i]);
          }
          for (let i = 0; i < newChain.length; i++) {
            callbacks = this.__runOnBeforeEnterCallbacks(callbacks, newContext, {prevent, redirect}, newChain[i]);
            previousChain[i].element.location = createLocation(newContext, previousChain[i].route);
          }
        } else {
          for (let i = previousChain.length - 1; i >= newContext.__divergedChainIndex; i--) {
            callbacks = this.__runOnBeforeLeaveCallbacks(callbacks, newContext, {prevent}, previousChain[i]);
          }
        }
      }
      if (!newContext.__skipAttach) {
        for (let i = 0; i < newChain.length; i++) {
          if (i < newContext.__divergedChainIndex) {
            if (i < previousChain.length && previousChain[i].element) {
              previousChain[i].element.location = createLocation(newContext, previousChain[i].route);
            }
          } else {
            callbacks = this.__runOnBeforeEnterCallbacks(callbacks, newContext, {prevent, redirect}, newChain[i]);
            if (newChain[i].element) {
              newChain[i].element.location = createLocation(newContext, newChain[i].route);
            }
          }
        }
      }
      return callbacks.then((amendmentResult) => {
        if (amendmentResult) {
          if (amendmentResult.cancel) {
            this.__previousContext.__renderId = newContext.__renderId;
            return this.__previousContext;
          }
          if (amendmentResult.redirect) {
            return this.__redirect(amendmentResult.redirect, newContext.__redirectCount, newContext.__renderId);
          }
        }
        return newContext;
      });
    }
    __runOnBeforeLeaveCallbacks(callbacks, newContext, commands, chainElement) {
      const location = createLocation(newContext);
      return callbacks.then((result) => {
        if (this.__isLatestRender(newContext)) {
          const afterLeaveFunction = amend("onBeforeLeave", [location, commands, this], chainElement.element);
          return afterLeaveFunction(result);
        }
      }).then((result) => {
        if (!(result || {}).redirect) {
          return result;
        }
      });
    }
    __runOnBeforeEnterCallbacks(callbacks, newContext, commands, chainElement) {
      const location = createLocation(newContext, chainElement.route);
      return callbacks.then((result) => {
        if (this.__isLatestRender(newContext)) {
          const beforeEnterFunction = amend("onBeforeEnter", [location, commands, this], chainElement.element);
          return beforeEnterFunction(result);
        }
      });
    }
    __isReusableElement(element, otherElement) {
      if (element && otherElement) {
        return this.__createdByRouter.get(element) && this.__createdByRouter.get(otherElement) ? element.localName === otherElement.localName : element === otherElement;
      }
      return false;
    }
    __isLatestRender(context) {
      return context.__renderId === this.__lastStartedRenderId;
    }
    __redirect(redirectData, counter, renderId) {
      if (counter > MAX_REDIRECT_COUNT) {
        throw new Error(log(`Too many redirects when rendering ${redirectData.from}`));
      }
      return this.resolve({
        pathname: this.urlForPath(redirectData.pathname, redirectData.params),
        redirectFrom: redirectData.from,
        __redirectCount: (counter || 0) + 1,
        __renderId: renderId
      });
    }
    __ensureOutlet(outlet = this.__outlet) {
      if (!(outlet instanceof Node)) {
        throw new TypeError(log(`Expected router outlet to be a valid DOM Node (but got ${outlet})`));
      }
    }
    __updateBrowserHistory({pathname, search = "", hash = ""}, replace) {
      if (window.location.pathname !== pathname || window.location.search !== search || window.location.hash !== hash) {
        const changeState = replace ? "replaceState" : "pushState";
        window.history[changeState](null, document.title, pathname + search + hash);
        window.dispatchEvent(new PopStateEvent("popstate", {state: "vaadin-router-ignore"}));
      }
    }
    __copyUnchangedElements(context, previousContext) {
      let deepestCommonParent = this.__outlet;
      for (let i = 0; i < context.__divergedChainIndex; i++) {
        const unchangedElement = previousContext && previousContext.chain[i].element;
        if (unchangedElement) {
          if (unchangedElement.parentNode === deepestCommonParent) {
            context.chain[i].element = unchangedElement;
            deepestCommonParent = unchangedElement;
          } else {
            break;
          }
        }
      }
      return deepestCommonParent;
    }
    __addAppearingContent(context, previousContext) {
      this.__ensureOutlet();
      this.__removeAppearingContent();
      const deepestCommonParent = this.__copyUnchangedElements(context, previousContext);
      this.__appearingContent = [];
      this.__disappearingContent = Array.from(deepestCommonParent.children).filter((e) => this.__addedByRouter.get(e) && e !== context.result);
      let parentElement = deepestCommonParent;
      for (let i = context.__divergedChainIndex; i < context.chain.length; i++) {
        const elementToAdd = context.chain[i].element;
        if (elementToAdd) {
          parentElement.appendChild(elementToAdd);
          this.__addedByRouter.set(elementToAdd, true);
          if (parentElement === deepestCommonParent) {
            this.__appearingContent.push(elementToAdd);
          }
          parentElement = elementToAdd;
        }
      }
    }
    __removeDisappearingContent() {
      if (this.__disappearingContent) {
        removeDomNodes(this.__disappearingContent);
      }
      this.__disappearingContent = null;
      this.__appearingContent = null;
    }
    __removeAppearingContent() {
      if (this.__disappearingContent && this.__appearingContent) {
        removeDomNodes(this.__appearingContent);
        this.__disappearingContent = null;
        this.__appearingContent = null;
      }
    }
    __runOnAfterLeaveCallbacks(currentContext, targetContext) {
      if (!targetContext) {
        return;
      }
      for (let i = targetContext.chain.length - 1; i >= currentContext.__divergedChainIndex; i--) {
        if (!this.__isLatestRender(currentContext)) {
          break;
        }
        const currentComponent = targetContext.chain[i].element;
        if (!currentComponent) {
          continue;
        }
        try {
          const location = createLocation(currentContext);
          runCallbackIfPossible(currentComponent.onAfterLeave, [location, {}, targetContext.resolver], currentComponent);
        } finally {
          if (this.__disappearingContent.indexOf(currentComponent) > -1) {
            removeDomNodes(currentComponent.children);
          }
        }
      }
    }
    __runOnAfterEnterCallbacks(currentContext) {
      for (let i = currentContext.__divergedChainIndex; i < currentContext.chain.length; i++) {
        if (!this.__isLatestRender(currentContext)) {
          break;
        }
        const currentComponent = currentContext.chain[i].element || {};
        const location = createLocation(currentContext, currentContext.chain[i].route);
        runCallbackIfPossible(currentComponent.onAfterEnter, [location, {}, currentContext.resolver], currentComponent);
      }
    }
    __animateIfNeeded(context) {
      const from = (this.__disappearingContent || [])[0];
      const to = (this.__appearingContent || [])[0];
      const promises = [];
      const chain = context.chain;
      let config;
      for (let i = chain.length; i > 0; i--) {
        if (chain[i - 1].route.animate) {
          config = chain[i - 1].route.animate;
          break;
        }
      }
      if (from && to && config) {
        const leave = isObject(config) && config.leave || "leaving";
        const enter = isObject(config) && config.enter || "entering";
        promises.push(animate(from, leave));
        promises.push(animate(to, enter));
      }
      return Promise.all(promises).then(() => context);
    }
    subscribe() {
      window.addEventListener("vaadin-router-go", this.__navigationEventHandler);
    }
    unsubscribe() {
      window.removeEventListener("vaadin-router-go", this.__navigationEventHandler);
    }
    __onNavigationEvent(event) {
      const {pathname, search, hash} = event ? event.detail : window.location;
      if (isString(this.__normalizePathname(pathname))) {
        if (event && event.preventDefault) {
          event.preventDefault();
        }
        this.render({pathname, search, hash}, true);
      }
    }
    static setTriggers(...triggers2) {
      setNavigationTriggers(triggers2);
    }
    urlForName(name, params) {
      if (!this.__urlForName) {
        this.__urlForName = generateUrls(this);
      }
      return getPathnameForRouter(this.__urlForName(name, params), this);
    }
    urlForPath(path, params) {
      return getPathnameForRouter(Router.pathToRegexp.compile(path)(params), this);
    }
    static go(path) {
      const {pathname, search, hash} = isString(path) ? this.__createUrl(path, "http://a") : path;
      return fireRouterEvent("go", {pathname, search, hash});
    }
  };
  var DEV_MODE_CODE_REGEXP = /\/\*\*\s+vaadin-dev-mode:start([\s\S]*)vaadin-dev-mode:end\s+\*\*\//i;
  var FlowClients = window.Vaadin && window.Vaadin.Flow && window.Vaadin.Flow.clients;
  function isMinified() {
    function test() {
      return true;
    }
    return uncommentAndRun(test);
  }
  function isDevelopmentMode() {
    try {
      if (isForcedDevelopmentMode()) {
        return true;
      }
      if (!isLocalhost()) {
        return false;
      }
      if (FlowClients) {
        return !isFlowProductionMode();
      }
      return !isMinified();
    } catch (e) {
      return false;
    }
  }
  function isForcedDevelopmentMode() {
    return localStorage.getItem("vaadin.developmentmode.force");
  }
  function isLocalhost() {
    return ["localhost", "127.0.0.1"].indexOf(window.location.hostname) >= 0;
  }
  function isFlowProductionMode() {
    if (FlowClients) {
      const productionModeApps = Object.keys(FlowClients).map((key) => FlowClients[key]).filter((client) => client.productionMode);
      if (productionModeApps.length > 0) {
        return true;
      }
    }
    return false;
  }
  function uncommentAndRun(callback, args) {
    if (typeof callback !== "function") {
      return;
    }
    const match = DEV_MODE_CODE_REGEXP.exec(callback.toString());
    if (match) {
      try {
        callback = new Function(match[1]);
      } catch (e) {
        console.log("vaadin-development-mode-detector: uncommentAndRun() failed", e);
      }
    }
    return callback(args);
  }
  window["Vaadin"] = window["Vaadin"] || {};
  var runIfDevelopmentMode = function(callback, args) {
    if (window.Vaadin.developmentMode) {
      return uncommentAndRun(callback, args);
    }
  };
  if (window.Vaadin.developmentMode === void 0) {
    window.Vaadin.developmentMode = isDevelopmentMode();
  }
  function maybeGatherAndSendStats() {
  }
  var usageStatistics = function() {
    if (typeof runIfDevelopmentMode === "function") {
      return runIfDevelopmentMode(maybeGatherAndSendStats);
    }
  };
  window.Vaadin = window.Vaadin || {};
  window.Vaadin.registrations = window.Vaadin.registrations || [];
  window.Vaadin.registrations.push({
    is: "@vaadin/router",
    version: "1.7.4"
  });
  usageStatistics();
  Router.NavigationTrigger = {POPSTATE, CLICK};

  // src/index.js
  var import_page = __toModule(require_page());
  var root = document.getElementById("root");
  var router = new Router(root);
  router.setRoutes([
    {path: "/", component: "view-home"},
    {path: "/blog", component: "view-blog"}
  ]);
  console.log(router);
})();
