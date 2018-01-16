'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function (_ref2) {
  var t = _ref2.types;

  return {
    visitor: {
      /**
       * CallExpression visitor.
       * @param {Object} path The path object from Babel.
       */
      CallExpression: function CallExpression(path) {
        var node = path.node;
        var args = node.arguments;

        // Is this a require.include call?

        if (isMemberCall(node, 'require', 'include')) {
          // Do we have exactly one argument?
          if (args.length !== 1) {
            return;
          }
          // Is that argument a string?
          if (!t.isStringLiteral(args[0])) {
            return;
          }
          // TRANSFORM!
          // Remove require.include call.
          path.remove();
          return;
        }

        // Is this a require.ensure call?
        if (isMemberCall(node, 'require', 'ensure')) {
          // Do we have at least two arguments?
          if (args.length < 2) {
            return;
          }
          // Are the first two arguments the expected type?

          var _args = _slicedToArray(args, 2),
              arr = _args[0],
              fn = _args[1];

          if (!(t.isArrayExpression(arr) && validPossibleFunctionTypes.indexOf(fn.type) !== -1)) {
            return;
          }
          // TRANSFORM!
          // Remove require.ensure wrapper.
          fn.params = [];
          // path.replaceWith(t.callExpression(fn, []));
          path.replaceWith(forcedAsyncTemplate({ SOURCE: fn }));
        }
      }
    }
  };
};

var _babelTemplate = require('babel-template');

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Determines if a given node represents a call to prop on object.
 * @param  {Object} node The ast node.
 * @param  {string} obj  The object identity.
 * @param  {string} prop The property identity.
 * @return {Boolean} `true` if node represents `obj[prop]()`. `false` otherwise.
 */
function isMemberCall(_ref, obj, prop) {
  var callee = _ref.callee;

  return callee.type === 'MemberExpression' && callee.object.name === obj && callee.property.name === prop;
}

var validPossibleFunctionTypes = ['ArrowFunctionExpression', 'FunctionExpression'];

var forcedAsyncTemplate = (0, _babelTemplate2.default)('\n  (setTimeout(SOURCE));\n');

/**
 * Babel plugin which replaces `require.ensure` calls with self-executing anonymous functions.
 * @param {Object} babel The current babel object
 * @param {Object} babel.types babel-types
 * @return {Object} Babel visitor.
 */
module.exports = exports['default'];