/*
 * eisenscript v1.1.9
 * https://github.com/after12am/eisenscript
 * (c)2013-2016 Satoshi Okami
 * Released under the MIT license
 */
var EISEN = (function() {
var exports = {};
exports.version='1.1.9'

// src/compiler.js
exports.Compiler = function() {
  this.interpreter = undefined;
}

exports.Compiler.prototype.compile = function(source) {
  this.interpreter = new Interpreter();
  return this.interpreter.generate(this.parse(source));
}

exports.Compiler.prototype.parse = function(source) {
  return parser.parse(source);
}

// src/interpreter.js
// module generate object code from ast
var Interpreter = function() {
  this.name = 'Interpreter';
  this.objects = [];
  this.define = [];
  this.rules = {};
  this.computed = [];
  this.maxdepth = 1000;
  this.depth = 0;
  this.maxobjects = 1000;
  this.objectnum = 0;
  this.minsize = .2;
  this.maxsize = 1.0;
  this.seed = 'initial'; // integer or 'initial'
  this.stack = [];
  this.curr = {};
  this.curr.matrix = new Matrix4();
  this.curr.hex = Color('#ff0000');
  this.curr.hsv = _.extend(Color({ hue: 0, saturation: 1, value: 1 }), { computed: false });
  this.curr.blend = { color: null, strength: 0, computed: false };
  this.curr.alpha = 1;
  this.mt = new MersenneTwister();
}

// termination criteria
Interpreter.prototype.terminated = function() {
  if (this.objectnum > this.maxobjects) return true;
  if (this.depth > this.maxdepth) return true;
  return false;
}

// stack current transformation state
Interpreter.prototype.pushState = function() {
  this.depth++;
  this.stack.push({
    matrix: this.curr.matrix.clone(),
    hex: this.curr.hex.clone(),
    hsv: this.curr.hsv.clone(),
    blend: _.extend({}, this.curr.blend),
    alpha: this.curr.alpha
  });
  return this;
}

// pull the parent transformation state
Interpreter.prototype.popState = function() {
  if (this.stack.length > 0) {
    this.curr = this.stack.pop();
    this.depth--;
  }
  return this;
}

Interpreter.prototype.translate = function(x, y, z) {
  this.curr.matrix.translate({
    x: x,
    y: y,
    z: z
  });
  return this;
}

Interpreter.prototype.rotateX = function(angle) {
  this.curr.matrix.rotateX(angle);
  return this;
}

Interpreter.prototype.rotateY = function(angle) {
  this.curr.matrix.rotateY(angle);
  return this;
}

Interpreter.prototype.rotateZ = function(angle) {
  this.curr.matrix.rotateZ(angle);
  return this;
}

Interpreter.prototype.scale = function(x, y, z) {
  this.curr.matrix.scale({
    x: x,
    y: y,
    z: z
  });
  return this;
}

// make 3x3 rotation matrix to 4x4 matrix
// test: { m 1 0 0 0 .53 -.85 0 .85 .53 } box
Interpreter.prototype.matrix = function(v) {
  this.curr.matrix.set(
    v[0], v[1], v[2], 0, 
    v[3], v[4], v[5], 0, 
    v[6], v[7], v[8], 0,
       0,    0,    0, 1
  );
  return this;
}

Interpreter.prototype.random16 = function() {
  var rand = this.mt.next() * 0xffffff;
  return Math.floor(rand).toString(16);
}

Interpreter.prototype.randomColor = function() {
  return sprintf('#%s', this.random16());
}

Interpreter.prototype.setColor = function(color) {
  if (color === 'random') color = this.randomColor();
  this.curr.hex = Color(color);
  return this;
}

Interpreter.prototype.setHue = function(v) {
  this.curr.hsv.computed = true;
  this.curr.hsv.hue += v % 360;
  return this;
}

Interpreter.prototype.setSaturation = function(v) {
  this.curr.hsv.computed = true;
  this.curr.hsv.saturation = clamp(this.curr.hsv.saturation * v, 0, 1);
  return this;
}

Interpreter.prototype.setBrightness = function(v) {
  this.curr.hsv.computed = true;
  this.curr.hsv.value = clamp(this.curr.hsv.value * v, 0, 1);
  return this;
}

Interpreter.prototype.setBlend = function(color, strength) {
  this.curr.blend.computed = true;
  this.curr.blend.color = color;
  this.curr.blend.strength = this.curr.blend.strength + clamp(strength, 0, 1);
  return this;
}

// execute eisenscript
Interpreter.prototype.generate = function(ast) {
  // rewriting ast
  var that = this;
  ast.forEach(function(statement) {
    switch (statement.type) {
      case Symbol.Rule: that.rewriteRule(statement); break;
    }
  });
  
  // pull the defines
  ast.forEach(function(statement) {
    switch (statement.type) {
      case Symbol.Define: that.define.push(statement); break;
      case Symbol.Set: that.define.push(statement); break;
      case Symbol.Statement: if (statement.computed) that.computed.push(statement); break;
    }
  });
  
  // creating intermediate code...
  // promise
  this.define.forEach(function(statement) {
    switch (statement.type) {
      case Symbol.Set:
        switch (statement.key) {
          case Symbol.Maxdepth: that.maxdepth = statement.value; break;
          case Symbol.Maxobjects: that.maxobjects = statement.value; break;
          case Symbol.Minsize: that.minsize = statement.value; break;
          case Symbol.Maxsize: that.maxsize = statement.value; break;
          case Symbol.Seed: that.seed = statement.value; break;
        }
        break;
      case Symbol.Define:
        // not implemented, but I don't think the definition statement is need.
        break;
    }
  });
  
  // initial value is randomised chosen integer
  this.mt.setSeed(this.seed === 'initial' ? randInt(0, 65535) : this.seed);
  
  // pull the statement of system environment
  this.define.forEach(function(statement) {
    switch (statement.type) {
      case Symbol.Set:
        if (statement.key === Symbol.Background) that.generateBackground(statement);
        break;
    }
  });
  
  // execute main
  this.parseStatements(this.computed);
  
  // return the intermediate code
  return {
    maxdepth: this.maxdepth,
    maxobjects: this.maxobjects,
    minsize: this.minsize,
    maxsize: this.maxsize,
    seed: this.seed,
    objects: this.objects,
    num: this.objects.length
  }
}

// rewrite subtree related to rule statement
Interpreter.prototype.rewriteRule = function(rule) {
  rule.params.forEach(function(param) {
    if (param.type === Symbol.Modifier) {
      switch (param.key) {
        case Symbol.Weight: rule.weight = param.value; break;
        case Symbol.Maxdepth: rule.maxdepth = param.value; rule.alternate = param.alternate; break;
      }
    }
  });
  if (!this.rules[rule.id]) this.rules[rule.id] = [];
  this.rules[rule.id].push(rule);
  return this;
}

// execute statements
Interpreter.prototype.parseStatements = function(statements) {
  var i = 0, len = statements.length;
  while (i < len) {
    if (this.terminated()) break;
    this.parseStatement(statements[i], 0);
    i++;
  }
  return this;
}

// execute a statement
Interpreter.prototype.parseStatement = function(statement, index) {
  // parse transformation expression
  var expr = statement.exprs[index];
  if (expr) {
    this.pushState();
    for (var i = 0; i < expr.left; i++) {
      if (this.terminated()) break;
      this.parseTransformStatement(expr.right);
      // if statement.exprs[index + 1] is undefined, it would break the transformation loops.
      this.parseStatement(statement, index + 1);
    }
    this.popState();
    return this;
  }
  
  // if not primitive, call rule and parse next transformation loops
  if (_.values(Primitive).indexOf(statement.id) === -1) {
    this.rules[statement.id].depth = (this.rules[statement.id].depth || 0) + 1;
    var rule = this.sampling(statement.id);
    if (rule) this.parseStatements(rule.body);
    this.rules[statement.id].depth--;
    return this;
  }
  
  // achieve the end of nested transformation loops
  this.generatePrimitive(statement);
  return this;
}

// break down transformation set
Interpreter.prototype.parseTransformStatement = function(transform) {
  var i = 0, len = transform.properties.length;
  while (i < len) {
    this.parseTransform(transform.properties[i]);
    i++;
  }
  return this;
}

// parse transformation property
Interpreter.prototype.parseTransform = function(property) {
  var v = property.value;
  switch (property.key) {
    case Symbol.XShift: this.translate(v, 0, 0); break;
    case Symbol.YShift: this.translate(0, v, 0); break;
    case Symbol.ZShift: this.translate(0, 0, v); break;
    case Symbol.RotateX: this.rotateX(degToRad(v)); break;
    case Symbol.RotateY: this.rotateY(degToRad(v)); break;
    case Symbol.RotateZ: this.rotateZ(degToRad(v)); break;
    case Symbol.Size: this.scale(v.x, v.y, v.z); break;
    case Symbol.Matrix: this.matrix(v); break;
    case Symbol.Color: this.setColor(v); break;
    case Symbol.Hue: this.setHue(v); break;
    case Symbol.Saturation: this.setSaturation(v); break;
    case Symbol.Brightness: this.setBrightness(v); break;
    case Symbol.Blend: this.setBlend(property.color, property.strength); break;
    case Symbol.Alpha: this.curr.alpha *= v; break;
  }
  return this;
}

// create primitive object and stack it as intermediate code for renderer
Interpreter.prototype.generatePrimitive = function(statement) {
  // if achieved maxobjects
  this.objectnum++;
  if (this.terminated()) return;
  
  // blend the current color with the specified color
  if (this.curr.blend.computed) {
    this.curr.hex = this.curr.hex.toHSV();
    var blend = Color(this.curr.blend.color).toHSV();
    this.curr.hex.hue += (blend.hue - this.curr.hex.hue) * this.curr.blend.strength / 6;
    this.curr.hex.hue %= 360;
  }
  
  // primitive object
  this.objects.push({
    type: Type.Primitive,
    name: statement.id,
    matrix: this.curr.matrix.clone(),
    color: this.curr.hsv.computed ? this.curr.hex.blend(this.curr.hsv, 1).toCSS() : this.curr.hex.toCSS(),
    opacity: this.curr.alpha,
    depth: this.depth,
    objnum: this.objectnum
  });
}

// create background object code and stack it as intermediate code for renderer
Interpreter.prototype.generateBackground = function(statement) {
  this.objects.push({
    type: Type.Background,
    color: statement.value
  });
}

// randomly choose one of the rules according to their weights
Interpreter.prototype.sampling = function(name, retry) {
  if (!this.rules[name]) {
    throw new Error(
      sprintf("ReferenceError: '%s' is not defined. As reported by eisenscript interpreter.", name),
      sprintf("%s.js", this.name)
    );
  }
  
  // sum weights of each rules
  var sum = 0;
  this.rules[name].forEach(function(rule) {
    rule.weight = rule.weight || 1;
    sum += rule.weight;
  });
  
  // choosing...
  var rand = this.mt.next() * sum;
  var chosen;
  for (var i = 0; i < this.rules[name].length; i++) {
    var rule = this.rules[name][i];
    if (rule.weight - rand < 0) {
      rand -= rule.weight
      continue;
    }
    chosen = rule;
    break;
  }
  
  // if rule could not be selected, interpreter tries to choose until 3 times
  if (!chosen) {
    retry = retry || 0;
    if (retry < 3) return this.sampling(name, ++retry);
    // if achieve max retry count
    return false;
  }
  
  // if achieved maxdepth
  if (chosen.maxdepth && chosen.maxdepth < this.rules[name].depth) {
    if (chosen.alternate) return this.sampling(chosen.alternate);
    if (this.rules[name].depth >= chosen.maxdepth) return false;
    if (this.depth < chosen.maxdepth) return chosen;
    return false;
  }
  
  // the rule randomly chosen
  return chosen;
}

// src/math.js
/**
 * @author alteredq / http://alteredqualia.com/
 */

// Clamp value to range <a, b>

var clamp = function ( x, a, b ) {
  
  return ( x < a ) ? a : ( ( x > b ) ? b : x );
};

// Clamp value to range <a, inf)

var clampBottom = function ( x, a ) {
  
  return x < a ? a : x;
};

// Linear mapping from range <a1, a2> to range <b1, b2>

var mapLinear = function ( x, a1, a2, b1, b2 ) {
  
  return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
};

// http://en.wikipedia.org/wiki/Smoothstep

var smoothstep = function ( x, min, max ) {

  if ( x <= min ) return 0;
  if ( x >= max ) return 1;
  
  x = ( x - min )/( max - min );
  
  return x*x*(3 - 2*x);
};

var smootherstep = function ( x, min, max ) {

  if ( x <= min ) return 0;
  if ( x >= max ) return 1;

  x = ( x - min )/( max - min );

  return x*x*x*(x*(x*6 - 15) + 10);
};

// Random float from <0, 1> with 16 bits of randomness
// (standard Math.random() creates repetitive patterns when applied over larger space)

var random16 = function () {
  
  return ( 65280 * Math.random() + 255 * Math.random() ) / 65535;
};

// Random integer from <low, high> interval

var randInt = function ( low, high ) {
  
  return low + Math.floor( Math.random() * ( high - low + 1 ) );
};

// Random float from <low, high> interval

var randFloat = function ( low, high ) {
  
  return low + Math.random() * ( high - low );
};

// Random float from <-range/2, range/2> interval

var randFloatSpread = function ( range ) {
  
  return range * ( 0.5 - Math.random() );
};

var sign = function ( x ) {
  
  return ( x < 0 ) ? -1 : ( ( x > 0 ) ? 1 : 0 );
};

var degToRad = function() {

  var degreeToRadiansFactor = Math.PI / 180;

  return function ( degrees ) {
    return degrees * degreeToRadiansFactor;
  };
}();

var radToDeg = function() {

  var radianToDegreesFactor = 180 / Math.PI;

  return function ( radians ) {
    return radians * radianToDegreesFactor;
  };
}();



// src/matrix.js
/**
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author timknip / http://www.floorplanner.com/
 * @author bhouston / http://exocortex.com
 */


var Matrix4 = function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

  var te = this.elements = new Float32Array( 16 );

  // TODO: if n11 is undefined, then just set to identity, otherwise copy all other values into matrix
  //   we should not support semi specification of Matrix4, it is just weird.

  te[0] = ( n11 !== undefined ) ? n11 : 1; te[4] = n12 || 0; te[8] = n13 || 0; te[12] = n14 || 0;
  te[1] = n21 || 0; te[5] = ( n22 !== undefined ) ? n22 : 1; te[9] = n23 || 0; te[13] = n24 || 0;
  te[2] = n31 || 0; te[6] = n32 || 0; te[10] = ( n33 !== undefined ) ? n33 : 1; te[14] = n34 || 0;
  te[3] = n41 || 0; te[7] = n42 || 0; te[11] = n43 || 0; te[15] = ( n44 !== undefined ) ? n44 : 1;

};

Matrix4.prototype = {

  set: function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

    var te = this.elements;

    te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
    te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
    te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
    te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;

    return this;

  },

  identity: function () {

    this.set(

      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1

    );

    return this;

  },

  translate: function ( v ) {

    var te = this.elements;
    var x = v.x, y = v.y, z = v.z;

    te[12] = te[0] * x + te[4] * y + te[8] * z + te[12];
    te[13] = te[1] * x + te[5] * y + te[9] * z + te[13];
    te[14] = te[2] * x + te[6] * y + te[10] * z + te[14];
    te[15] = te[3] * x + te[7] * y + te[11] * z + te[15];

    return this;

  },

  rotateX: function ( angle ) {

    var te = this.elements;
    var m12 = te[4];
    var m22 = te[5];
    var m32 = te[6];
    var m42 = te[7];
    var m13 = te[8];
    var m23 = te[9];
    var m33 = te[10];
    var m43 = te[11];
    var c = Math.cos( angle );
    var s = Math.sin( angle );

    te[4] = c * m12 + s * m13;
    te[5] = c * m22 + s * m23;
    te[6] = c * m32 + s * m33;
    te[7] = c * m42 + s * m43;

    te[8] = c * m13 - s * m12;
    te[9] = c * m23 - s * m22;
    te[10] = c * m33 - s * m32;
    te[11] = c * m43 - s * m42;

    return this;

  },

  rotateY: function ( angle ) {

    var te = this.elements;
    var m11 = te[0];
    var m21 = te[1];
    var m31 = te[2];
    var m41 = te[3];
    var m13 = te[8];
    var m23 = te[9];
    var m33 = te[10];
    var m43 = te[11];
    var c = Math.cos( angle );
    var s = Math.sin( angle );

    te[0] = c * m11 - s * m13;
    te[1] = c * m21 - s * m23;
    te[2] = c * m31 - s * m33;
    te[3] = c * m41 - s * m43;

    te[8] = c * m13 + s * m11;
    te[9] = c * m23 + s * m21;
    te[10] = c * m33 + s * m31;
    te[11] = c * m43 + s * m41;

    return this;

  },

  rotateZ: function ( angle ) {

    var te = this.elements;
    var m11 = te[0];
    var m21 = te[1];
    var m31 = te[2];
    var m41 = te[3];
    var m12 = te[4];
    var m22 = te[5];
    var m32 = te[6];
    var m42 = te[7];
    var c = Math.cos( angle );
    var s = Math.sin( angle );

    te[0] = c * m11 + s * m12;
    te[1] = c * m21 + s * m22;
    te[2] = c * m31 + s * m32;
    te[3] = c * m41 + s * m42;

    te[4] = c * m12 - s * m11;
    te[5] = c * m22 - s * m21;
    te[6] = c * m32 - s * m31;
    te[7] = c * m42 - s * m41;

    return this;

  },

  scale: function ( v ) {

    var te = this.elements;
    var x = v.x, y = v.y, z = v.z;

    te[0] *= x; te[4] *= y; te[8] *= z;
    te[1] *= x; te[5] *= y; te[9] *= z;
    te[2] *= x; te[6] *= y; te[10] *= z;
    te[3] *= x; te[7] *= y; te[11] *= z;

    return this;

  },

  clone: function () {

    var te = this.elements;

    return new Matrix4(

      te[0], te[4], te[8], te[12],
      te[1], te[5], te[9], te[13],
      te[2], te[6], te[10], te[14],
      te[3], te[7], te[11], te[15]

    );
  }
}


// src/parser.js
/* parser generated by jison 0.4.6 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"eisenscript":3,"lines":4,"EOF":5,"line":6,"maxdepth":7,"maxobjects":8,"minsize":9,"maxsize":10,"seed":11,"background":12,"color":13,"colorpool":14,"define":15,"rule":16,"statement":17,"SET":18,"MAXDEPTH":19,"num":20,"MAXOBJECTS":21,"MINSIZE":22,"MAXSIZE":23,"SEED":24,"INITIAL":25,"BACKGROUND":26,"COLOR3":27,"COLOR6":28,"STRING":29,"RANDOM":30,"COLOR":31,"HUE":32,"ALPHA":33,"BLEND":34,"SATURATION":35,"BRIGHTNESS":36,"COLORPOOL":37,"RANDOMHUE":38,"RANDOMRGB":39,"GREYSCALE":40,"COLORLIST":41,"IMAGE":42,"DEFINE":43,"RULE":44,"id":45,"modifiers":46,"{":47,"statements":48,"}":49,"modifier":50,"WEIGHT":51,">":52,"rulename":53,"expressions":54,"expression":55,"object":56,"n":57,"*":58,"properties":59,"property":60,"geo":61,"XSHIFT":62,"YSHIFT":63,"ZSHIFT":64,"ROTATEX":65,"ROTATEY":66,"ROTATEZ":67,"SIZE":68,"MATRIX":69,"+":70,"-":71,"/":72,"(":73,"e":74,")":75,"NUMBER":76,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",18:"SET",19:"MAXDEPTH",21:"MAXOBJECTS",22:"MINSIZE",23:"MAXSIZE",24:"SEED",25:"INITIAL",26:"BACKGROUND",27:"COLOR3",28:"COLOR6",29:"STRING",30:"RANDOM",31:"COLOR",32:"HUE",33:"ALPHA",34:"BLEND",35:"SATURATION",36:"BRIGHTNESS",37:"COLORPOOL",38:"RANDOMHUE",39:"RANDOMRGB",40:"GREYSCALE",41:"COLORLIST",42:"IMAGE",43:"DEFINE",44:"RULE",47:"{",49:"}",51:"WEIGHT",52:">",58:"*",62:"XSHIFT",63:"YSHIFT",64:"ZSHIFT",65:"ROTATEX",66:"ROTATEY",67:"ROTATEZ",68:"SIZE",69:"MATRIX",70:"+",71:"-",72:"/",73:"(",74:"e",75:")",76:"NUMBER"},
productions_: [0,[3,2],[4,2],[4,0],[6,1],[6,1],[6,1],[6,1],[6,1],[6,1],[6,1],[6,1],[6,1],[6,1],[6,1],[7,3],[8,3],[9,3],[10,3],[11,3],[11,3],[12,3],[12,3],[12,3],[12,3],[13,3],[13,2],[13,2],[13,2],[13,2],[13,2],[13,2],[13,3],[13,3],[13,3],[13,3],[13,2],[13,2],[14,3],[14,3],[14,3],[14,3],[14,3],[15,3],[16,6],[46,2],[46,0],[50,2],[50,2],[50,4],[48,2],[48,0],[17,2],[54,2],[54,0],[55,1],[55,3],[56,3],[59,2],[59,0],[60,1],[60,1],[61,2],[61,2],[61,2],[61,2],[61,2],[61,2],[61,2],[61,4],[61,10],[20,1],[20,2],[20,2],[20,3],[20,3],[20,4],[20,4],[20,3],[57,1],[45,1],[53,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1: this.$ = $$[$0-1]; return this.$; 
break;
case 2: this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 3: this.$ = []; 
break;
case 4: this.$ = $$[$0]; 
break;
case 5: this.$ = $$[$0]; 
break;
case 6: this.$ = $$[$0]; 
break;
case 7: this.$ = $$[$0]; 
break;
case 8: this.$ = $$[$0]; 
break;
case 9: this.$ = $$[$0]; 
break;
case 10: this.$ = $$[$0]; 
break;
case 11: this.$ = $$[$0]; 
break;
case 12: this.$ = $$[$0]; 
break;
case 13: this.$ = $$[$0]; 
break;
case 14: this.$ = $$[$0]; $$[$0].computed = true; 
break;
case 15: this.$ = { type: 'set', key: 'maxdepth', value: $$[$0] }; 
break;
case 16: this.$ = { type: 'set', key: 'maxobjects', value: $$[$0] }; 
break;
case 17: this.$ = { type: 'set', key: 'minsize', value: $$[$0] }; 
break;
case 18: this.$ = { type: 'set', key: 'maxsize', value: $$[$0] }; 
break;
case 19: this.$ = { type: 'set', key: 'seed', value: $$[$0] }; 
break;
case 20: this.$ = { type: 'set', key: 'seed', value: $$[$0] }; 
break;
case 21: this.$ = { type: 'set', key: 'background', value: $$[$0].toLowerCase() }; 
break;
case 22: this.$ = { type: 'set', key: 'background', value: $$[$0].toLowerCase() }; 
break;
case 23: this.$ = { type: 'set', key: 'background', value: $$[$0].toLowerCase() }; 
break;
case 24: this.$ = { type: 'set', key: 'background', value: $$[$0].toLowerCase() }; 
break;
case 25: this.$ = { type: 'set', key: 'color', value: $$[$0].toLowerCase() }; 
break;
case 26: this.$ = { type: 'property', key: 'hue',   value: $$[$0] }; 
break;
case 27: this.$ = { type: 'property', key: 'alpha', value: $$[$0] }; 
break;
case 28: this.$ = { type: 'property', key: 'color', value: $$[$0].toLowerCase() }; 
break;
case 29: this.$ = { type: 'property', key: 'color', value: $$[$0].toLowerCase() }; 
break;
case 30: this.$ = { type: 'property', key: 'color', value: $$[$0].toLowerCase() }; 
break;
case 31: this.$ = { type: 'property', key: 'color', value: $$[$0].toLowerCase() }; 
break;
case 32: this.$ = { type: 'property', key: 'blend', color: $$[$0-1].toLowerCase(), strength: $$[$0] }; 
break;
case 33: this.$ = { type: 'property', key: 'blend', color: $$[$0-1].toLowerCase(), strength: $$[$0] }; 
break;
case 34: this.$ = { type: 'property', key: 'blend', color: $$[$0-1].toLowerCase(), strength: $$[$0] }; 
break;
case 35: this.$ = { type: 'property', key: 'blend', color: $$[$0-1].toLowerCase(), strength: $$[$0] }; 
break;
case 36: this.$ = { type: 'property', key: 'saturation', value: $$[$0] }; 
break;
case 37: this.$ = { type: 'property', key: 'brightness', value: $$[$0] }; 
break;
case 38: this.$ = { type: 'set', key: 'colorpool', value: $$[$0].toLowerCase() }; 
break;
case 39: this.$ = { type: 'set', key: 'colorpool', value: $$[$0].toLowerCase() }; 
break;
case 40: this.$ = { type: 'set', key: 'colorpool', value: $$[$0].toLowerCase() }; 
break;
case 41: this.$ = { type: 'set', key: 'colorpool', value: $$[$0].toLowerCase() }; 
break;
case 42: this.$ = { type: 'set', key: 'colorpool', value: $$[$0].toLowerCase() }; 
break;
case 43: this.$ = { type: 'define', varname: $$[$0-1], value: $$[$0] }; 
break;
case 44: this.$ = { type: 'rule', id: $$[$0-4], params: $$[$0-3], body: $$[$0-1] }; 
break;
case 45: this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 46: this.$ = []; 
break;
case 47: this.$ = { type: 'modifier', key: 'weight',   value: $$[$0] }; 
break;
case 48: this.$ = { type: 'modifier', key: 'maxdepth', value: $$[$0] }; 
break;
case 49: this.$ = { type: 'modifier', key: 'maxdepth', value: $$[$0-2], alternate: $$[$0]}; 
break;
case 50: this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 51: this.$ = []; 
break;
case 52: this.$ = { type: 'statement', id: $$[$0], exprs: $$[$0-1] }; 
break;
case 53: this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 54: this.$ = []; 
break;
case 55: this.$ = { type: 'expr', left:  1, right: $$[$0] }; 
break;
case 56: this.$ = { type: 'expr', left: $$[$0-2], right: $$[$0] }; 
break;
case 57: this.$ = { type: 'object', properties: $$[$0-1] }; 
break;
case 58: type: 'property', this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 59: this.$ = []; 
break;
case 62: this.$ = { type: 'property', key: 'xshift',  value: $$[$0] }; 
break;
case 63: this.$ = { type: 'property', key: 'yshift',  value: $$[$0] }; 
break;
case 64: this.$ = { type: 'property', key: 'zshift',  value: $$[$0] }; 
break;
case 65: this.$ = { type: 'property', key: 'rotatex', value: $$[$0] }; 
break;
case 66: this.$ = { type: 'property', key: 'rotatey', value: $$[$0] }; 
break;
case 67: this.$ = { type: 'property', key: 'rotatez', value: $$[$0] }; 
break;
case 68: this.$ = { type: 'property', key: 'size',    value: { x: $$[$0], y: $$[$0], z: $$[$0] } }; 
break;
case 69: this.$ = { type: 'property', key: 'size',    value: { x: $$[$0-2], y: $$[$0-1], z: $$[$0] } }; 
break;
case 70: this.$ = { type: 'property', key: 'matrix', value: [$$[$0-8], $$[$0-7], $$[$0-6], $$[$0-5], $$[$0-4], $$[$0-3], $$[$0-2], $$[$0-1], $$[$0]] }; 
break;
case 72: this.$ =  $$[$0]; 
break;
case 73: this.$ = -$$[$0]; 
break;
case 74: this.$ =  $$[$0-2]*$$[$0]; 
break;
case 75: this.$ =  $$[$0-2]/$$[$0]; 
break;
case 76: this.$ = -$$[$0-2]*$$[$0]; 
break;
case 77: this.$ = -$$[$0-2]/$$[$0]; 
break;
case 78: this.$ =  $$[$0-1]; 
break;
case 79: this.$ = parseFloat(yytext); 
break;
case 80: this.$ = yytext; 
break;
case 81:this.$ = $$[$0]; 
break;
}
},
table: [{3:1,4:2,5:[2,3],18:[2,3],29:[2,3],31:[2,3],32:[2,3],33:[2,3],34:[2,3],35:[2,3],36:[2,3],43:[2,3],44:[2,3],47:[2,3],76:[2,3]},{1:[3]},{5:[1,3],6:4,7:5,8:6,9:7,10:8,11:9,12:10,13:11,14:12,15:13,16:14,17:15,18:[1,16],29:[2,54],31:[1,19],32:[1,17],33:[1,18],34:[1,20],35:[1,21],36:[1,22],43:[1,23],44:[1,24],47:[2,54],54:25,76:[2,54]},{1:[2,1]},{5:[2,2],18:[2,2],29:[2,2],31:[2,2],32:[2,2],33:[2,2],34:[2,2],35:[2,2],36:[2,2],43:[2,2],44:[2,2],47:[2,2],76:[2,2]},{5:[2,4],18:[2,4],29:[2,4],31:[2,4],32:[2,4],33:[2,4],34:[2,4],35:[2,4],36:[2,4],43:[2,4],44:[2,4],47:[2,4],76:[2,4]},{5:[2,5],18:[2,5],29:[2,5],31:[2,5],32:[2,5],33:[2,5],34:[2,5],35:[2,5],36:[2,5],43:[2,5],44:[2,5],47:[2,5],76:[2,5]},{5:[2,6],18:[2,6],29:[2,6],31:[2,6],32:[2,6],33:[2,6],34:[2,6],35:[2,6],36:[2,6],43:[2,6],44:[2,6],47:[2,6],76:[2,6]},{5:[2,7],18:[2,7],29:[2,7],31:[2,7],32:[2,7],33:[2,7],34:[2,7],35:[2,7],36:[2,7],43:[2,7],44:[2,7],47:[2,7],76:[2,7]},{5:[2,8],18:[2,8],29:[2,8],31:[2,8],32:[2,8],33:[2,8],34:[2,8],35:[2,8],36:[2,8],43:[2,8],44:[2,8],47:[2,8],76:[2,8]},{5:[2,9],18:[2,9],29:[2,9],31:[2,9],32:[2,9],33:[2,9],34:[2,9],35:[2,9],36:[2,9],43:[2,9],44:[2,9],47:[2,9],76:[2,9]},{5:[2,10],18:[2,10],29:[2,10],31:[2,10],32:[2,10],33:[2,10],34:[2,10],35:[2,10],36:[2,10],43:[2,10],44:[2,10],47:[2,10],76:[2,10]},{5:[2,11],18:[2,11],29:[2,11],31:[2,11],32:[2,11],33:[2,11],34:[2,11],35:[2,11],36:[2,11],43:[2,11],44:[2,11],47:[2,11],76:[2,11]},{5:[2,12],18:[2,12],29:[2,12],31:[2,12],32:[2,12],33:[2,12],34:[2,12],35:[2,12],36:[2,12],43:[2,12],44:[2,12],47:[2,12],76:[2,12]},{5:[2,13],18:[2,13],29:[2,13],31:[2,13],32:[2,13],33:[2,13],34:[2,13],35:[2,13],36:[2,13],43:[2,13],44:[2,13],47:[2,13],76:[2,13]},{5:[2,14],18:[2,14],29:[2,14],31:[2,14],32:[2,14],33:[2,14],34:[2,14],35:[2,14],36:[2,14],43:[2,14],44:[2,14],47:[2,14],76:[2,14]},{19:[1,26],21:[1,27],22:[1,28],23:[1,29],24:[1,30],26:[1,31],31:[1,32],37:[1,33]},{20:34,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:40,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{27:[1,41],28:[1,42],29:[1,44],30:[1,43]},{27:[1,45],28:[1,46],29:[1,48],30:[1,47]},{20:49,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:50,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{29:[1,51]},{29:[1,53],45:52},{29:[1,53],45:54,47:[1,58],55:55,56:56,57:57,76:[1,39]},{20:59,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:60,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:61,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:62,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:63,25:[1,64],57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{27:[1,65],28:[1,66],29:[1,67],30:[1,68]},{30:[1,69]},{38:[1,70],39:[1,71],40:[1,72],41:[1,73],42:[1,74]},{5:[2,26],18:[2,26],29:[2,26],31:[2,26],32:[2,26],33:[2,26],34:[2,26],35:[2,26],36:[2,26],43:[2,26],44:[2,26],47:[2,26],49:[2,26],62:[2,26],63:[2,26],64:[2,26],65:[2,26],66:[2,26],67:[2,26],68:[2,26],69:[2,26],76:[2,26]},{5:[2,71],18:[2,71],19:[2,71],29:[2,71],31:[2,71],32:[2,71],33:[2,71],34:[2,71],35:[2,71],36:[2,71],43:[2,71],44:[2,71],47:[2,71],49:[2,71],51:[2,71],52:[2,71],58:[1,75],62:[2,71],63:[2,71],64:[2,71],65:[2,71],66:[2,71],67:[2,71],68:[2,71],69:[2,71],70:[2,71],71:[2,71],72:[1,76],73:[2,71],76:[2,71]},{57:77,76:[1,39]},{57:78,76:[1,39]},{74:[1,79]},{5:[2,79],18:[2,79],19:[2,79],29:[2,79],31:[2,79],32:[2,79],33:[2,79],34:[2,79],35:[2,79],36:[2,79],43:[2,79],44:[2,79],47:[2,79],49:[2,79],51:[2,79],52:[2,79],58:[2,79],62:[2,79],63:[2,79],64:[2,79],65:[2,79],66:[2,79],67:[2,79],68:[2,79],69:[2,79],70:[2,79],71:[2,79],72:[2,79],73:[2,79],76:[2,79]},{5:[2,27],18:[2,27],29:[2,27],31:[2,27],32:[2,27],33:[2,27],34:[2,27],35:[2,27],36:[2,27],43:[2,27],44:[2,27],47:[2,27],49:[2,27],62:[2,27],63:[2,27],64:[2,27],65:[2,27],66:[2,27],67:[2,27],68:[2,27],69:[2,27],76:[2,27]},{5:[2,28],18:[2,28],29:[2,28],31:[2,28],32:[2,28],33:[2,28],34:[2,28],35:[2,28],36:[2,28],43:[2,28],44:[2,28],47:[2,28],49:[2,28],62:[2,28],63:[2,28],64:[2,28],65:[2,28],66:[2,28],67:[2,28],68:[2,28],69:[2,28],76:[2,28]},{5:[2,29],18:[2,29],29:[2,29],31:[2,29],32:[2,29],33:[2,29],34:[2,29],35:[2,29],36:[2,29],43:[2,29],44:[2,29],47:[2,29],49:[2,29],62:[2,29],63:[2,29],64:[2,29],65:[2,29],66:[2,29],67:[2,29],68:[2,29],69:[2,29],76:[2,29]},{5:[2,30],18:[2,30],29:[2,30],31:[2,30],32:[2,30],33:[2,30],34:[2,30],35:[2,30],36:[2,30],43:[2,30],44:[2,30],47:[2,30],49:[2,30],62:[2,30],63:[2,30],64:[2,30],65:[2,30],66:[2,30],67:[2,30],68:[2,30],69:[2,30],76:[2,30]},{5:[2,31],18:[2,31],29:[2,31],31:[2,31],32:[2,31],33:[2,31],34:[2,31],35:[2,31],36:[2,31],43:[2,31],44:[2,31],47:[2,31],49:[2,31],62:[2,31],63:[2,31],64:[2,31],65:[2,31],66:[2,31],67:[2,31],68:[2,31],69:[2,31],76:[2,31]},{20:80,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:81,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:82,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:83,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{5:[2,36],18:[2,36],29:[2,36],31:[2,36],32:[2,36],33:[2,36],34:[2,36],35:[2,36],36:[2,36],43:[2,36],44:[2,36],47:[2,36],49:[2,36],62:[2,36],63:[2,36],64:[2,36],65:[2,36],66:[2,36],67:[2,36],68:[2,36],69:[2,36],76:[2,36]},{5:[2,37],18:[2,37],29:[2,37],31:[2,37],32:[2,37],33:[2,37],34:[2,37],35:[2,37],36:[2,37],43:[2,37],44:[2,37],47:[2,37],49:[2,37],62:[2,37],63:[2,37],64:[2,37],65:[2,37],66:[2,37],67:[2,37],68:[2,37],69:[2,37],76:[2,37]},{20:84,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{19:[2,46],46:85,47:[2,46],51:[2,46]},{5:[2,80],18:[2,80],19:[2,80],29:[2,80],31:[2,80],32:[2,80],33:[2,80],34:[2,80],35:[2,80],36:[2,80],43:[2,80],44:[2,80],47:[2,80],49:[2,80],51:[2,80],76:[2,80]},{5:[2,52],18:[2,52],29:[2,52],31:[2,52],32:[2,52],33:[2,52],34:[2,52],35:[2,52],36:[2,52],43:[2,52],44:[2,52],47:[2,52],49:[2,52],76:[2,52]},{29:[2,53],47:[2,53],76:[2,53]},{29:[2,55],47:[2,55],76:[2,55]},{58:[1,86]},{18:[2,59],31:[2,59],32:[2,59],33:[2,59],34:[2,59],35:[2,59],36:[2,59],49:[2,59],59:87,62:[2,59],63:[2,59],64:[2,59],65:[2,59],66:[2,59],67:[2,59],68:[2,59],69:[2,59]},{5:[2,15],18:[2,15],29:[2,15],31:[2,15],32:[2,15],33:[2,15],34:[2,15],35:[2,15],36:[2,15],43:[2,15],44:[2,15],47:[2,15],76:[2,15]},{5:[2,16],18:[2,16],29:[2,16],31:[2,16],32:[2,16],33:[2,16],34:[2,16],35:[2,16],36:[2,16],43:[2,16],44:[2,16],47:[2,16],76:[2,16]},{5:[2,17],18:[2,17],29:[2,17],31:[2,17],32:[2,17],33:[2,17],34:[2,17],35:[2,17],36:[2,17],43:[2,17],44:[2,17],47:[2,17],76:[2,17]},{5:[2,18],18:[2,18],29:[2,18],31:[2,18],32:[2,18],33:[2,18],34:[2,18],35:[2,18],36:[2,18],43:[2,18],44:[2,18],47:[2,18],76:[2,18]},{5:[2,19],18:[2,19],29:[2,19],31:[2,19],32:[2,19],33:[2,19],34:[2,19],35:[2,19],36:[2,19],43:[2,19],44:[2,19],47:[2,19],76:[2,19]},{5:[2,20],18:[2,20],29:[2,20],31:[2,20],32:[2,20],33:[2,20],34:[2,20],35:[2,20],36:[2,20],43:[2,20],44:[2,20],47:[2,20],76:[2,20]},{5:[2,21],18:[2,21],29:[2,21],31:[2,21],32:[2,21],33:[2,21],34:[2,21],35:[2,21],36:[2,21],43:[2,21],44:[2,21],47:[2,21],76:[2,21]},{5:[2,22],18:[2,22],29:[2,22],31:[2,22],32:[2,22],33:[2,22],34:[2,22],35:[2,22],36:[2,22],43:[2,22],44:[2,22],47:[2,22],76:[2,22]},{5:[2,23],18:[2,23],29:[2,23],31:[2,23],32:[2,23],33:[2,23],34:[2,23],35:[2,23],36:[2,23],43:[2,23],44:[2,23],47:[2,23],76:[2,23]},{5:[2,24],18:[2,24],29:[2,24],31:[2,24],32:[2,24],33:[2,24],34:[2,24],35:[2,24],36:[2,24],43:[2,24],44:[2,24],47:[2,24],76:[2,24]},{5:[2,25],18:[2,25],29:[2,25],31:[2,25],32:[2,25],33:[2,25],34:[2,25],35:[2,25],36:[2,25],43:[2,25],44:[2,25],47:[2,25],49:[2,25],62:[2,25],63:[2,25],64:[2,25],65:[2,25],66:[2,25],67:[2,25],68:[2,25],69:[2,25],76:[2,25]},{5:[2,38],18:[2,38],29:[2,38],31:[2,38],32:[2,38],33:[2,38],34:[2,38],35:[2,38],36:[2,38],43:[2,38],44:[2,38],47:[2,38],76:[2,38]},{5:[2,39],18:[2,39],29:[2,39],31:[2,39],32:[2,39],33:[2,39],34:[2,39],35:[2,39],36:[2,39],43:[2,39],44:[2,39],47:[2,39],76:[2,39]},{5:[2,40],18:[2,40],29:[2,40],31:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],43:[2,40],44:[2,40],47:[2,40],76:[2,40]},{5:[2,41],18:[2,41],29:[2,41],31:[2,41],32:[2,41],33:[2,41],34:[2,41],35:[2,41],36:[2,41],43:[2,41],44:[2,41],47:[2,41],76:[2,41]},{5:[2,42],18:[2,42],29:[2,42],31:[2,42],32:[2,42],33:[2,42],34:[2,42],35:[2,42],36:[2,42],43:[2,42],44:[2,42],47:[2,42],76:[2,42]},{57:88,76:[1,39]},{57:89,76:[1,39]},{5:[2,72],18:[2,72],19:[2,72],29:[2,72],31:[2,72],32:[2,72],33:[2,72],34:[2,72],35:[2,72],36:[2,72],43:[2,72],44:[2,72],47:[2,72],49:[2,72],51:[2,72],52:[2,72],62:[2,72],63:[2,72],64:[2,72],65:[2,72],66:[2,72],67:[2,72],68:[2,72],69:[2,72],70:[2,72],71:[2,72],73:[2,72],76:[2,72]},{5:[2,73],18:[2,73],19:[2,73],29:[2,73],31:[2,73],32:[2,73],33:[2,73],34:[2,73],35:[2,73],36:[2,73],43:[2,73],44:[2,73],47:[2,73],49:[2,73],51:[2,73],52:[2,73],58:[1,90],62:[2,73],63:[2,73],64:[2,73],65:[2,73],66:[2,73],67:[2,73],68:[2,73],69:[2,73],70:[2,73],71:[2,73],72:[1,91],73:[2,73],76:[2,73]},{75:[1,92]},{5:[2,32],18:[2,32],29:[2,32],31:[2,32],32:[2,32],33:[2,32],34:[2,32],35:[2,32],36:[2,32],43:[2,32],44:[2,32],47:[2,32],49:[2,32],62:[2,32],63:[2,32],64:[2,32],65:[2,32],66:[2,32],67:[2,32],68:[2,32],69:[2,32],76:[2,32]},{5:[2,33],18:[2,33],29:[2,33],31:[2,33],32:[2,33],33:[2,33],34:[2,33],35:[2,33],36:[2,33],43:[2,33],44:[2,33],47:[2,33],49:[2,33],62:[2,33],63:[2,33],64:[2,33],65:[2,33],66:[2,33],67:[2,33],68:[2,33],69:[2,33],76:[2,33]},{5:[2,34],18:[2,34],29:[2,34],31:[2,34],32:[2,34],33:[2,34],34:[2,34],35:[2,34],36:[2,34],43:[2,34],44:[2,34],47:[2,34],49:[2,34],62:[2,34],63:[2,34],64:[2,34],65:[2,34],66:[2,34],67:[2,34],68:[2,34],69:[2,34],76:[2,34]},{5:[2,35],18:[2,35],29:[2,35],31:[2,35],32:[2,35],33:[2,35],34:[2,35],35:[2,35],36:[2,35],43:[2,35],44:[2,35],47:[2,35],49:[2,35],62:[2,35],63:[2,35],64:[2,35],65:[2,35],66:[2,35],67:[2,35],68:[2,35],69:[2,35],76:[2,35]},{5:[2,43],18:[2,43],29:[2,43],31:[2,43],32:[2,43],33:[2,43],34:[2,43],35:[2,43],36:[2,43],43:[2,43],44:[2,43],47:[2,43],76:[2,43]},{19:[1,96],47:[1,93],50:94,51:[1,95]},{47:[1,58],56:97},{13:101,18:[1,110],31:[1,19],32:[1,17],33:[1,18],34:[1,20],35:[1,21],36:[1,22],49:[1,98],60:99,61:100,62:[1,102],63:[1,103],64:[1,104],65:[1,105],66:[1,106],67:[1,107],68:[1,108],69:[1,109]},{5:[2,74],18:[2,74],19:[2,74],29:[2,74],31:[2,74],32:[2,74],33:[2,74],34:[2,74],35:[2,74],36:[2,74],43:[2,74],44:[2,74],47:[2,74],49:[2,74],51:[2,74],52:[2,74],62:[2,74],63:[2,74],64:[2,74],65:[2,74],66:[2,74],67:[2,74],68:[2,74],69:[2,74],70:[2,74],71:[2,74],73:[2,74],76:[2,74]},{5:[2,75],18:[2,75],19:[2,75],29:[2,75],31:[2,75],32:[2,75],33:[2,75],34:[2,75],35:[2,75],36:[2,75],43:[2,75],44:[2,75],47:[2,75],49:[2,75],51:[2,75],52:[2,75],62:[2,75],63:[2,75],64:[2,75],65:[2,75],66:[2,75],67:[2,75],68:[2,75],69:[2,75],70:[2,75],71:[2,75],73:[2,75],76:[2,75]},{57:111,76:[1,39]},{57:112,76:[1,39]},{5:[2,78],18:[2,78],19:[2,78],29:[2,78],31:[2,78],32:[2,78],33:[2,78],34:[2,78],35:[2,78],36:[2,78],43:[2,78],44:[2,78],47:[2,78],49:[2,78],51:[2,78],52:[2,78],62:[2,78],63:[2,78],64:[2,78],65:[2,78],66:[2,78],67:[2,78],68:[2,78],69:[2,78],70:[2,78],71:[2,78],73:[2,78],76:[2,78]},{29:[2,51],47:[2,51],48:113,49:[2,51],76:[2,51]},{19:[2,45],47:[2,45],51:[2,45]},{20:114,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:115,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{29:[2,56],47:[2,56],76:[2,56]},{29:[2,57],47:[2,57],76:[2,57]},{18:[2,58],31:[2,58],32:[2,58],33:[2,58],34:[2,58],35:[2,58],36:[2,58],49:[2,58],62:[2,58],63:[2,58],64:[2,58],65:[2,58],66:[2,58],67:[2,58],68:[2,58],69:[2,58]},{18:[2,60],31:[2,60],32:[2,60],33:[2,60],34:[2,60],35:[2,60],36:[2,60],49:[2,60],62:[2,60],63:[2,60],64:[2,60],65:[2,60],66:[2,60],67:[2,60],68:[2,60],69:[2,60]},{18:[2,61],31:[2,61],32:[2,61],33:[2,61],34:[2,61],35:[2,61],36:[2,61],49:[2,61],62:[2,61],63:[2,61],64:[2,61],65:[2,61],66:[2,61],67:[2,61],68:[2,61],69:[2,61]},{20:116,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:117,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:118,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:119,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:120,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:121,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:122,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:123,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{31:[1,32]},{5:[2,76],18:[2,76],19:[2,76],29:[2,76],31:[2,76],32:[2,76],33:[2,76],34:[2,76],35:[2,76],36:[2,76],43:[2,76],44:[2,76],47:[2,76],49:[2,76],51:[2,76],52:[2,76],62:[2,76],63:[2,76],64:[2,76],65:[2,76],66:[2,76],67:[2,76],68:[2,76],69:[2,76],70:[2,76],71:[2,76],73:[2,76],76:[2,76]},{5:[2,77],18:[2,77],19:[2,77],29:[2,77],31:[2,77],32:[2,77],33:[2,77],34:[2,77],35:[2,77],36:[2,77],43:[2,77],44:[2,77],47:[2,77],49:[2,77],51:[2,77],52:[2,77],62:[2,77],63:[2,77],64:[2,77],65:[2,77],66:[2,77],67:[2,77],68:[2,77],69:[2,77],70:[2,77],71:[2,77],73:[2,77],76:[2,77]},{17:125,29:[2,54],47:[2,54],49:[1,124],54:25,76:[2,54]},{19:[2,47],47:[2,47],51:[2,47]},{19:[2,48],47:[2,48],51:[2,48],52:[1,126]},{18:[2,62],31:[2,62],32:[2,62],33:[2,62],34:[2,62],35:[2,62],36:[2,62],49:[2,62],62:[2,62],63:[2,62],64:[2,62],65:[2,62],66:[2,62],67:[2,62],68:[2,62],69:[2,62]},{18:[2,63],31:[2,63],32:[2,63],33:[2,63],34:[2,63],35:[2,63],36:[2,63],49:[2,63],62:[2,63],63:[2,63],64:[2,63],65:[2,63],66:[2,63],67:[2,63],68:[2,63],69:[2,63]},{18:[2,64],31:[2,64],32:[2,64],33:[2,64],34:[2,64],35:[2,64],36:[2,64],49:[2,64],62:[2,64],63:[2,64],64:[2,64],65:[2,64],66:[2,64],67:[2,64],68:[2,64],69:[2,64]},{18:[2,65],31:[2,65],32:[2,65],33:[2,65],34:[2,65],35:[2,65],36:[2,65],49:[2,65],62:[2,65],63:[2,65],64:[2,65],65:[2,65],66:[2,65],67:[2,65],68:[2,65],69:[2,65]},{18:[2,66],31:[2,66],32:[2,66],33:[2,66],34:[2,66],35:[2,66],36:[2,66],49:[2,66],62:[2,66],63:[2,66],64:[2,66],65:[2,66],66:[2,66],67:[2,66],68:[2,66],69:[2,66]},{18:[2,67],31:[2,67],32:[2,67],33:[2,67],34:[2,67],35:[2,67],36:[2,67],49:[2,67],62:[2,67],63:[2,67],64:[2,67],65:[2,67],66:[2,67],67:[2,67],68:[2,67],69:[2,67]},{18:[2,68],20:127,31:[2,68],32:[2,68],33:[2,68],34:[2,68],35:[2,68],36:[2,68],49:[2,68],57:35,62:[2,68],63:[2,68],64:[2,68],65:[2,68],66:[2,68],67:[2,68],68:[2,68],69:[2,68],70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:128,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{5:[2,44],18:[2,44],29:[2,44],31:[2,44],32:[2,44],33:[2,44],34:[2,44],35:[2,44],36:[2,44],43:[2,44],44:[2,44],47:[2,44],76:[2,44]},{29:[2,50],47:[2,50],49:[2,50],76:[2,50]},{29:[1,130],53:129},{20:131,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:132,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{19:[2,49],47:[2,49],51:[2,49]},{19:[2,81],47:[2,81],51:[2,81]},{18:[2,69],31:[2,69],32:[2,69],33:[2,69],34:[2,69],35:[2,69],36:[2,69],49:[2,69],62:[2,69],63:[2,69],64:[2,69],65:[2,69],66:[2,69],67:[2,69],68:[2,69],69:[2,69]},{20:133,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:134,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:135,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:136,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:137,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{20:138,57:35,70:[1,36],71:[1,37],73:[1,38],76:[1,39]},{18:[2,70],31:[2,70],32:[2,70],33:[2,70],34:[2,70],35:[2,70],36:[2,70],49:[2,70],62:[2,70],63:[2,70],64:[2,70],65:[2,70],66:[2,70],67:[2,70],68:[2,70],69:[2,70]}],
defaultActions: {3:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip */
break;
case 1:/* ignore comment */
break;
case 2:/* ignore comment */
break;
case 3:return 18
break;
case 4:return 51;
break;
case 5:return 51;
break;
case 6:return 19;
break;
case 7:return 19;
break;
case 8:return 21;
break;
case 9:return 22;
break;
case 10:return 23;
break;
case 11:return 24;
break;
case 12:return 25;
break;
case 13:return 26;
break;
case 14:return 37;
break;
case 15:return 44;
break;
case 16:return 52;
break;
case 17:return 47;
break;
case 18:return 49;
break;
case 19:return '[';
break;
case 20:return ']';
break;
case 21:return '^';
break;
case 22:return 58;
break;
case 23:return 72;
break;
case 24:return 70;
break;
case 25:return 71;
break;
case 26:return 73;
break;
case 27:return 75;
break;
case 28:return ',';
break;
case 29:return 62;
break;
case 30:return 63;
break;
case 31:return 64;
break;
case 32:return 65;
break;
case 33:return 66;
break;
case 34:return 67;
break;
case 35:return 68;
break;
case 36:return 69;
break;
case 37:return 32;
break;
case 38:return 32;
break;
case 39:return 35;
break;
case 40:return 35;
break;
case 41:return 36;
break;
case 42:return 36;
break;
case 43:return 33;
break;
case 44:return 33;
break;
case 45:return 31;
break;
case 46:return 30;
break;
case 47:return 34;
break;
case 48:return 38;
break;
case 49:return 39;
break;
case 50:return 40;
break;
case 51:return 5;
break;
case 52:return 76;
break;
case 53:return 76;
break;
case 54:return 41;
break;
case 55:return 42;
break;
case 56:return 29;
break;
case 57:return 43;
break;
case 58:return 28;
break;
case 59:return 27;
break;
}
},
rules: [/^(?:\s+)/,/^(?:\/\/.*)/,/^(?:\/\*[\w\W]*?\*\/)/,/^(?:set\b)/,/^(?:w\b)/,/^(?:weight\b)/,/^(?:md\b)/,/^(?:maxdepth\b)/,/^(?:maxobjects\b)/,/^(?:minsize\b)/,/^(?:maxsize\b)/,/^(?:seed\b)/,/^(?:initial\b)/,/^(?:background\b)/,/^(?:colorpool\b)/,/^(?:rule\b)/,/^(?:>)/,/^(?:\{)/,/^(?:\})/,/^(?:\[)/,/^(?:\])/,/^(?:\^)/,/^(?:\*)/,/^(?:\/)/,/^(?:\+)/,/^(?:-)/,/^(?:\()/,/^(?:\))/,/^(?:,)/,/^(?:x\b)/,/^(?:y\b)/,/^(?:z\b)/,/^(?:rx\b)/,/^(?:ry\b)/,/^(?:rz\b)/,/^(?:s\b)/,/^(?:m\b)/,/^(?:hue\b)/,/^(?:h\b)/,/^(?:saturation\b)/,/^(?:sat\b)/,/^(?:brightness\b)/,/^(?:b\b)/,/^(?:alpha\b)/,/^(?:a\b)/,/^(?:color\b)/,/^(?:random\b)/,/^(?:blend\b)/,/^(?:randomhue\b)/,/^(?:randomrgb\b)/,/^(?:greyscale\b)/,/^(?:$)/,/^(?:[0-9]+(\.[0-9]*)?)/,/^(?:\.[0-9]+)/,/^(?:list:[\w,]+)/,/^(?:image:[\w\.\w]+)/,/^(?:[a-zA-Z_]+[a-zA-Z0-9_]*)/,/^(?:#define\b)/,/^(?:#[a-fA-F0-9]{6})/,/^(?:#[a-fA-F0-9]{3})/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
// src/primitive.js
var Primitive = {
  Box: 'box',
  Sphere: 'sphere',
  Torus: 'torus',
  Cylinder: 'cylinder',
  Penta: 'penta',
  Hexa: 'hexa',
  FPenta: 'fpenta',
  FHexa: 'fhexa',
  FSquare: 'fbox',
  FtPenta: 'ftpenta',
  FtHexa: 'fthexa',
  FtSquare: 'ftbox',
  Tetra: 'tetra',
  Octa: 'octa',
  Icosa: 'icosa',
  Pyra3: 'pyra3',
  Pyra4: 'pyra4',
  Cone: 'cone',
  Frame: 'frame',
  CrossFrame: 'crossframe',
  StraightRun: 'straightrun',
  CornerRun: 'cornerrun',
  UpRun: 'uprun'
  
 // CSG: 'csg'
  // Line: 'line',
  // Point: 'point',
  // Triangle: 'triangle',
  // Mesh: 'mesh',
  // Tube: 'tube'
}

// objects are loaded in a differnt way - not sure how to/if you can get them in and then move and size...
// src/sprintf.js
function makeArray(array) {
  var ret = [];
  if(array != null){
    var i = array.length;
    if ( i == null || array.split || array.setInterval || array.call ) {
      ret[0] = array;
    } else {
      while( i ) ret[--i] = array[i];
    }
  }
  return ret;
}

function sprintf(){
  var _arg = makeArray(arguments), template = _arg.shift(), i;
  for(i in _arg){
    template = template.replace('%s', _arg[i]);
  }
  return template;
}

// src/symbol.js
var Symbol = {
  Define: 'define',
  Set: 'set',
  Statement: 'statement',
  Rule: 'rule',
  Modifier: 'modifier',
  Maxdepth: 'maxdepth',
  Maxobjects: 'maxobjects',
  Minsize: 'minsize',
  Maxsize: 'maxsize',
  Seed: 'seed',
  Weight: 'weight',
  Background: 'background',
  XShift: 'xshift',
  YShift: 'yshift',
  ZShift: 'zshift',
  RotateX: 'rotatex',
  RotateY: 'rotatey',
  RotateZ: 'rotatez',
  Size: 'size',
  Matrix: 'matrix',
  Color: 'color',
  Hue: 'hue',
  Saturation: 'saturation',
  Brightness: 'brightness',
  Blend: 'blend',
  Alpha: 'alpha'
}
// src/type.js
var Type = {
  Background: 'background',
  Primitive: 'primitive',
  Rule: 'rule',
  Property: 'property'
}
// src/_.js
var _ = {
  has: function(obj, key) {
    return hasOwnProperty.call(obj, key);
  },

  extend: function(destination, source) {
    for(var k in source) destination[k] = source[k];
    return destination;
  },

  values: function(obj) {
    var values = [];
    for (var key in obj) if (this.has(obj, key)) values.push(obj[key]);
    return values;
  }
};

// src/test\geometry.js
var detail = 16;
if(localStorage.getItem('detail_level')) {
  detail = JSON.parse(localStorage.getItem('detail_level'));
}  
  

var Geometry = function(type) {
  switch (type) {
    case Primitive.Box: return new THREE.BoxBufferGeometry(1, 1, 1);
    case Primitive.Sphere: return new THREE.SphereBufferGeometry(.5, detail, detail);
    // somehow being able to pass number of sgments from script to here??
    case Primitive.Torus: return new THREE.TorusBufferGeometry(1, 0.2, detail, detail);
    case Primitive.Cylinder: return new THREE.CylinderBufferGeometry(1, 1, 1, detail, 1);
    case Primitive.Penta: return new THREE.CylinderBufferGeometry(1,1,1,5,1);
    case Primitive.Hexa: return new THREE.CylinderBufferGeometry(1,1,1,6,1);
    case Primitive.FtPenta: return new THREE.TorusBufferGeometry(1,0.25,4,5).rotateX(Math.PI/2).rotateY(Math.PI/-10);
    case Primitive.FtHexa: return new THREE.TorusBufferGeometry(1,0.25,4,6).rotateX(Math.PI/2).rotateY(Math.PI/6);
    case Primitive.FtSquare: return new THREE.TorusBufferGeometry(1,0.25,4,4).rotateX(Math.PI/2).rotateY(Math.PI/4);
    case Primitive.FPenta: return Geometry.PentaFrame;
    case Primitive.FHexa: return Geometry.HexaFrame;
    case Primitive.FSquare: return Geometry.SquareFrame.rotateY(Math.PI/4);
    case Primitive.Tetra: return new THREE.TetrahedronBufferGeometry(1,0).rotateY(Math.PI/4);
    case Primitive.Octa: return new THREE.OctahedronBufferGeometry(1,0);
    case Primitive.Icosa: return new THREE.IcosahedronBufferGeometry(1,0);
    case Primitive.Pyra3: return Geometry.Pyra3;
    case Primitive.Pyra4: return Geometry.Pyra4;
    case Primitive.Cone: return Geometry.Cone;
    case Primitive.Frame: return Geometry.Frame;
    case Primitive.CrossFrame: return Geometry.CrossFrame;
    case Primitive.StraightRun: return Geometry.StraightRun;
    // not sure about the bend object CornerRun - difficult to scale
    case Primitive.CornerRun: return Geometry.CornerRun;
    case Primitive.UpRun: return Geometry.UpRun;
	 // case Primitive.CSG: return Geometry.CSG;
  }
}

Geometry.Pyra3 = new THREE.ConeBufferGeometry(1, 1, 3 );
Geometry.Pyra4 = new THREE.ConeBufferGeometry(1, 1, 4 );
Geometry.Cone = new THREE.ConeBufferGeometry(1, 1, detail );

// regular frame
var reg_fbox = new ThreeBSP( new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 )));
var cutframe1 =new ThreeBSP(new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 0.8)));
var cutframe2 =new ThreeBSP(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8,1)));
var cutframe3 =new ThreeBSP(new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.8)));
var csg1_result = reg_fbox.subtract(cutframe1).subtract(cutframe2).subtract(cutframe3);
Geometry.Frame = csg1_result.toGeometry();

// hexagonal frame - NOT twisted but flat
var bigHexa = new ThreeBSP( new THREE.Mesh( new THREE.CylinderGeometry(1,1,1,6,1)));
var smallHexa = new ThreeBSP( new THREE.Mesh( new THREE.CylinderGeometry(0.75,0.75,1,6,1)));
var csgHexaResult = bigHexa.subtract(smallHexa);
Geometry.HexaFrame = csgHexaResult.toGeometry();

// penta frame - NOT twisted but flat
var bigPenta = new ThreeBSP( new THREE.Mesh( new THREE.CylinderGeometry(1,1,1,5,1)));
var smallPenta = new ThreeBSP( new THREE.Mesh( new THREE.CylinderGeometry(0.75,0.75,1,5,1)));
var csgPentaResult = bigPenta.subtract(smallPenta);
Geometry.PentaFrame = csgPentaResult.toGeometry();

// Square frame - NOT twisted but flat
var bigSquare = new ThreeBSP( new THREE.Mesh( new THREE.CylinderGeometry(1,1,1,4,1)));
var smallSquare = new ThreeBSP( new THREE.Mesh( new THREE.CylinderGeometry(0.75,0.75,1,4,1)));
var csgSquareResult = bigSquare.subtract(smallSquare);
Geometry.SquareFrame = csgSquareResult.toGeometry();

// merged frames
var fbox = new ThreeBSP( new THREE.Mesh( new THREE.BoxGeometry( 1, 3, 1 )));
var cutframe1 =new ThreeBSP(new THREE.Mesh(new THREE.BoxGeometry(1, 2.8, 0.8)));
var cutframe2 =new ThreeBSP(new THREE.Mesh(new THREE.BoxGeometry(0.8,3 , 0.8)));
var cutframe3 =new ThreeBSP(new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.8, 1)));

var csg_result = fbox.subtract(cutframe1).subtract(cutframe2).subtract(cutframe3);
var result = csg_result.toMesh();

var singleframeGeometry = new THREE.Geometry();
singleframeGeometry.merge(result.geometry, result.matrix); 
result.rotateZ(Math.PI/2).updateMatrix(); 
singleframeGeometry.merge(result.geometry, result.matrix);
result.rotateX(Math.PI/2).updateMatrix(); 
singleframeGeometry.merge(result.geometry, result.matrix);

Geometry.CrossFrame = singleframeGeometry

///// plane with sides
var plane = new ThreeBSP( new THREE.Mesh( new THREE.BoxGeometry( 2, 1, 0.1,8)));
var side1 = new ThreeBSP( new THREE.Mesh( new THREE.BoxGeometry( 2, 0.2, 0.2,8).translate(0,0.5,0)));
var side2 = new ThreeBSP( new THREE.Mesh( new THREE.BoxGeometry( 2, 0.2, 0.2,8).translate(0,-0.5,0)));
var csg3_result = plane.union(side1).union(side2);
Geometry.StraightRun = csg3_result.toGeometry();

//bending it for up dowm
var modifier2 = new THREE.BendModifier();
var direction2 = new THREE.Vector3( 0, 0, 1 );
var axis2 =  new THREE.Vector3( 0, 1, 0 );
var angle2 = Math.PI / 4;
var bend2_result = Geometry.StraightRun.clone();
modifier2.set( direction2, axis2, angle2 ).modify(bend2_result);
Geometry.UpRun = bend2_result.rotateY(Math.PI/4).translate(0.136,0,0.31);

// bending it for corner
var modifier = new THREE.BendModifier();
var direction = new THREE.Vector3( 0, 1, 0 );
var axis =  new THREE.Vector3( 0, 0, 1 );
var angle = Math.PI / 4;

// original for short corner positioning is a problem
/*
var bend_result = Geometry.StraightRun.clone();
modifier.set( direction, axis, angle ).modify(bend_result);
Geometry.CornerRun = bend_result.rotateZ(Math.PI/4).translate(-0.235,0.162,0);
*/
var plane = new ThreeBSP( new THREE.Mesh( new THREE.BoxGeometry( 3.15, 1, 0.1,8)));
var side1 = new ThreeBSP( new THREE.Mesh( new THREE.BoxGeometry( 3.15, 0.2, 0.2,8).translate(0,0.5,0)));
var side2 = new ThreeBSP( new THREE.Mesh( new THREE.BoxGeometry( 3.15, 0.2, 0.2,8).translate(0,-0.5,0)));
var csg_c_result = plane.union(side1).union(side2);
 csg_c_result.toGeometry();
var bend_result = csg_c_result.toGeometry();
modifier.set( direction, axis, angle ).modify(bend_result);
// this way it lines up with a 2x2 box but that does not really help
//Geometry.CornerRun = bend_result.rotateZ(Math.PI/4).translate(0.05,-0.05,0);
Geometry.CornerRun = bend_result.rotateZ(Math.PI/4).translate(0.05,-0.143,0);



// todo pipe bending - problem - get geometry bend in a way that you can create a 
// L-system 
// meaning
// pipe diameter should be 1 and the bending of a 90/45 degree corner should 
// result in a proper number you can use to move things around

//var bend_result = new THREE.CylinderGeometry( 0.5, 0.5, 4, 12, 22, false );

// src/test\material.js
var Material = function(parameters) {
//  console.log(parameters);
  switch (parameters.name) {
    case Material.Lambert: return new THREE.MeshLambertMaterial(parameters);
    case Material.Normal: return new THREE.MeshNormalMaterial(parameters);
    case Material.Phong: return  new THREE.MeshPhongMaterial(parameters);
    default: return new THREE.MeshBasicMaterial(parameters);
  }
}

Material.Basic = 'basic';
Material.Normal = 'normal';
Material.Lambert = 'lambert';
Material.Phong = 'phong';
// src/test\renderer.js
sbVertexShader = [
"varying vec3 vWorldPosition;",
"void main() {",
"  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
"  vWorldPosition = worldPosition.xyz;",
"  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
"}",
].join("\n");

sbFragmentShader = [
"uniform vec3 topColor;",
"uniform vec3 bottomColor;",
"uniform float offset;",
"uniform float exponent;",
"varying vec3 vWorldPosition;",
"void main() {",
"  float h = normalize( vWorldPosition + offset ).y;",
"  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );",
"}",
].join("\n");

exports.TestRenderer = function(width, height, options) {
  this.name = 'TestRenderer';
  this.width = width;
  this.height = height;
  //this.materialType = options.materialType || 'basic';
  this.materialType = 'phong';

  this.group = new THREE.Object3D();

  // Create main scene
  this.scene = new THREE.Scene();
  this.scene.fog = new THREE.FogExp2(0xcce0ff, 0.0009);
  var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;

  // Prepare perspective camera
  var VIEW_ANGLE = 35, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 1000;
  this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  this.scene.add(this.camera);
	this.camera.position.set(0, 20, 45);
  this.camera.target = new THREE.Vector3(0, 0, 0);

 // this.resetCamera().updateCamera();
  
  this.lights = [
    new THREE.SpotLight(0xafa7af, 0.7),
    new THREE.SpotLight(0xafafaf, 0.6),    
    new THREE.SpotLight(0xafafaf, 0.7), 
    new THREE.SpotLight(0xafafaf, 0.6),    
    new THREE.SpotLight(0xafafaf, 0.4), 
    new THREE.SpotLight(0xafafaf, 0.3)
  ];
  
  this.lights[0].position.set(0, 450, -450);
  this.lights[0].castShadow = true;
  this.lights[1].position.set(0, -450, 450);
  this.lights[1].castShadow = true;
  this.lights[2].position.set(450, -300, 0);
  this.lights[2].castShadow = true;
  this.lights[3].position.set(-450, 300, 0);
  this.lights[3].castShadow = true;
  this.lights[4].position.set(-300, 0, 450);
  this.lights[4].castShadow = true;
  this.lights[5].position.set(300, 0, -450);
  this.lights[5].castShadow = true;

  this.scene.add(this.camera);
  this.scene.add(this.group);
  this.scene.add(this.lights[0]);
  this.scene.add(this.lights[1]);
  this.scene.add(this.lights[2]);
  this.scene.add(this.lights[3]);
  this.scene.add(this.lights[4]);
  this.scene.add(this.lights[5]);
  
  //this.renderer = new THREE.WebGLRenderer({ antialias: true });
  
  // Prepare webgl renderer
  this.renderer = new THREE.WebGLRenderer({ antialias:true, preserveDrawingBuffer: true});
  this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  this.renderer.setClearColor(this.scene.fog.color);
  this.renderer.shadowMap.enabled = true;
  this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  this.rendererStats   = new THREEx.RendererStats()
  this.stats = new Stats();

  // Events
  THREEx.WindowResize(this.renderer, this.camera);
  document.addEventListener('mousedown', this.onDocumentMouseDown, false);
  document.addEventListener('mousemove', this.onDocumentMouseMove, false);
  document.addEventListener('mouseup', this.onDocumentMouseUp, false);

  // Prepare Orbit controls
  this.controls = new THREE.OrbitControls(this.camera);
  this.controls.target = new THREE.Vector3(0, 0, 0);
  this.controls.maxDistance =350;
  this.domElement = this.renderer.domElement;
};


var axischange = true;
exports.TestRenderer.prototype.axisHelper = function(on){
  var axisHelper = new THREE.AxesHelper( 25 );
  axisHelper.name = "AxisHelper";
  if(on && axischange){
	 this.scene.add( axisHelper );
	 axischange = false;
	 console.log("axis on")
  }
  if(!on && !axischange){
	var object = this.scene.getObjectByName( "AxisHelper" );
	this.scene.remove( object);
	axischange = true;
	console.log("axis off")
  }
}

exports.TestRenderer.prototype.gridHelper = function(params){
  if(params.on){
    var size = params.size;
    var step = params.step;

    var gridHelper = new THREE.GridHelper( size, step );
    gridHelper.name = "GridHelper";
    this.scene.add( gridHelper );
    console.log("grid on")
  }
  if(params.off){
    var object = this.scene.getObjectByName( "GridHelper" );
    this.scene.remove( object);
    console.log("grid off")
  }
}

exports.TestRenderer.prototype.fps_stats = function(which){
  if(which > -1){
    this.stats.showPanel( which ); // 0: fps, 1: ms, 2: mb, 3+: custom
    this.stats.domElement.style.position = 'absolute'
    this.stats.domElement.style.cssText.left = '0px'
    this.stats.domElement.style.top   = '90px'
    document.body.appendChild( this.stats.domElement );
  }
}

exports.TestRenderer.prototype.render_stats = function(on){
  if(on){
    // position the stats
    this.rendererStats.domElement.style.position = 'absolute'
    this.rendererStats.domElement.style.right = '0px'
    this.rendererStats.domElement.style.bottom   = '0px'
    document.body.appendChild( this.rendererStats.domElement )
  }
}

exports.TestRenderer.prototype.addSkybox = function(parameters) {
    var iSBrsize = 500;
    var uniforms = {
      topColor: {
        type: "c", 
        value: new THREE.Color(parameters.top)
      }, 
      bottomColor: {
        type: "c", 
        value: new THREE.Color(parameters.bottom)
      },
      offset: {
        type: "f", 
        value: iSBrsize
      },
      exponent: {
        type: "f", 
        value: parameters.split
      }
    }

    var skyGeo = new THREE.SphereGeometry(iSBrsize, 8, 8);
    skyMat = new THREE.ShaderMaterial({vertexShader: sbVertexShader, fragmentShader: sbFragmentShader, uniforms: uniforms, side: THREE.DoubleSide, fog: false});
    skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(skyMesh);
  }


// repaint background with specific color
exports.TestRenderer.prototype.clearColor = function(hex) {
  this.renderer.setClearColor(new THREE.Color(hex), 1);
  return this;
};

// add any primitive to stage
exports.TestRenderer.prototype.addPrimitive = function(parameters) {
  var geometry = new Geometry(parameters.name);
  //console.log("mat_" + parameters.color.substr(1,6) + "_" + parameters.opacity.toFixed(5).toString().replace('.','_'));
  var mat_name = "mat_" + parameters.color.substr(1,6) + "_" + parameters.opacity.toFixed(5).toString().replace('.','_');
  var material = new Material({
    name: this.materialType,
    uuid: mat_name,
    color: parameters.color,
    opacity: parameters.opacity,
    shininess: 20,
    specular: 0x444444,
    emissive: 0x111111,
    //opacity: 0.95,
    transparent: true,
    side: THREE.DoubleSide
    //wireframe: !!(parameters.name === Primitive.Grid) // removed Grid because the exporters don't handle it
  });

  var mesh = new THREE.Mesh(geometry, material);
  //console.log("uuid: "+material.uuid);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.applyMatrix4(parameters.matrix);
  this.group.add(mesh);
//bounding box 

//  var bbox = new THREE.BoundingBoxHelper( mesh, 0x888888 );
//  bbox.update();
//  this.group.add( bbox );
  return this;
};

// remove a "named" object
exports.TestRenderer.prototype.removePrimitive = function(number) {
  this.group.remove(this.group.children[0]);
}

// remove all objects from stage
exports.TestRenderer.prototype.removeAll = function() {
  var boxes = this.group.children;
  for (var i = boxes.length - 1; i >= 0; i--) this.group.remove(boxes[i]);
  return this;
}

// garbage collection
exports.TestRenderer.prototype.clear = function() {
  this.removeAll();
  this.renderer.render(this.scene, this.camera);
  return this;
};

// rendering the scene
exports.TestRenderer.prototype.render = function() {
  this.renderer.sortObjects = false;
  this.renderer.shadowCameraFov = this.camera.fov;
  this.renderer.render(this.scene, this.camera);
  this.rendererStats.update(this.renderer);
  this.stats.update();
  return this;
}


// save image rendered on stage with jpg format
exports.TestRenderer.prototype.saveImg = function(format) {
  imgData = renderer.domElement.toDataURL("image/jpeg");
  var imgName = "SaveImg_"+getFormattedTime()+".jpg";
  saveFile(imgData.replace("image/jpeg", "image/octet-stream"), imgName);
  return this;
};

var saveFile = function (strData, filename) {
  var link = document.createElement('a');
  if (typeof link.download === 'string') {
      document.body.appendChild(link); //Firefox requires the link to be in the body
      link.download = filename;
      link.href = strData;
      link.click();
      document.body.removeChild(link); //remove the link when done
  } else {
      location.replace(uri);
  }
}

function getFormattedTime() {
  var today = new Date();
  var y = today.getFullYear();
  // JavaScript months are 0-based.
  var m = today.getMonth() + 1;
  var d = today.getDate();
  var h = today.getHours();
  var mi = today.getMinutes();
  var s = today.getSeconds();
  return y + "-" + m + "-" + d + "-" + h + "-" + mi + "-" + s;
}

exports.TestRenderer.prototype.exportToObj = function() {
  alert("processing all the objects and creating the .obj and .mtl file takes some time\n\nthis browser window will be unresponsive for about 10 seconds per 1500 elements")
    
  var outname = "model_"+ getFormattedTime();
  var exporter = new THREE.OBJExporter();
  var result = exporter.parse( this.group ,outname, "error");
  

  var blob = new Blob([result.obj], {type: "text/plain;charset=utf-8"});
  saveAs(blob, outname+".obj", true);
  var blob = new Blob([result.mtl], {type: "text/plain;charset=utf-8"});
  saveAs(blob, outname+".mtl",true);
  
  return this;
}


exports.TestRenderer.prototype.exportToGltf = function() {
  exportGLTF( this.group);
}

function exportGLTF( input ) {
  var gltfExporter = new THREE.GLTFExporter(); 
  var options = {
    trs: false,
    onlyVisible: true,
    truncateDrawRange: true,
    binary: false,
    forceIndices: false,
    forcePowerOfTwoTextures: false,
    maxTextureSize: 1024
  };
  gltfExporter.parse( input, function ( result ) {
    var outname = "scene_"+ getFormattedTime();
    if ( result instanceof ArrayBuffer ) {
      saveArrayBuffer( result, outname+'glb' );
    } else {
      var output = JSON.stringify( result, null, 2 );
      //console.log( output );
      saveString( output, outname +".gltf" );
    }
  }, options );
}

function saveString( text, filename ) {
  saveAs( new Blob( [ text ], { type: 'text/plain' } ), filename );
}
function saveArrayBuffer( buffer, filename ) {
  saveAs( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
}

return exports;
})();
