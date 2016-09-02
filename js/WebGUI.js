/**
 * 文件名: WebGUI.js
 * 命名空间: WEBGUI
 *
 * @version V 1.00   2016-03-15
 * @author Zhou Shijie
 */
"use strict";
/* global Function, parseFloat, parseInt, Infinity */
var WEBGUI = {REVISION: '1'};
// Browserify 支持
if (typeof window.define === 'function' && window.define.amd) {
    window.define('webgui', WEBGUI);
} else if (typeof module === 'object') {
    module.exports = WEBGUI;
}

/*
 *  Polyfills扩展
 */
(function () {
// Function
    if (Function.prototype.name === undefined && Object.defineProperty !== undefined) {
//参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
        Object.defineProperty(Function.prototype, 'name', {
            get: function () {
                return this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
            }
        });
    }

// Number
    if (Number.EPSILON === undefined) {
//参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON
        Number.EPSILON = Math.pow(2, -52);
    }
    if (Number.MAX_SAFE_INTEGER === undefined) {
//参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
        Number.MAX_SAFE_INTEGER = 9007199254740991;
    }
    if (Number.MIN_SAFE_INTEGER === undefined) {
//参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MIN_SAFE_INTEGER
        Number.MIN_SAFE_INTEGER = -9007199254740991;
    }
    if (Number.isFinite === undefined) {
//参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite
        Number.isFinite = function (value) {
            return typeof value === "number" && isFinite(value);
        };
    }
    if (Number.isInteger === undefined) {
//参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
        Number.isInteger = function (value) {
            return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
        };
    }
    if (Number.isNaN === undefined) {
//参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
        Number.isNaN = function (value) {
            return typeof value === "number" && isNaN(value);
        };
    }
    if (Number.isSafeInteger === undefined) {
//参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger
        Number.isSafeInteger = function (value) {
            return typeof value === "number" && isFinite(value) && Math.floor(value) === value && value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER;
        };
    }
    if (Number.parseFloat === undefined) {
//参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseFloat
        Number.parseFloat = parseFloat;
    }
    if (Number.parseInt === undefined) {
//参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseInt
        Number.parseInt = parseInt;
    }
    if (Number.prototype.round === undefined) {
        Number.prototype.round = function (num) {
            return Number.parseFloat(this.toFixed(num));
        };
    }
    if (Number.prototype.equals === undefined) {
        Number.prototype.equals = function (num) {
            if (this === num)
                return true;
            if (typeof num === 'number' && Math.abs(this - num) <= Number.EPSILON)
                return true;
            return false;
        };
    }

// Math
    if (Math.sign === undefined) {
//参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
        Math.sign = function (x) {
            x = +x; // convert to a number
            if (x === 0 || isNaN(x))
                return 0;
            return x > 0 ? 1 : -1;
        };
    }
    if (Math.addition === undefined) {
        Math.addition = function (num1, num2) {
            var n1 = checkNumber(num1), n2 = checkNumber(num2);
            if (n1 === undefined || n2 === undefined) {
                return 'NaN';
            } else if (n1.value === '0') {
                return n2.value;
            } else if (n2.value === '0') {
                return n1.value;
            } else {
                if (n1.sign === n2.sign) {
                    return n1.sign + strAddition(n1, n2);
                } else {
                    var cmp = compNumber(n1, n2);
                    if (cmp === 0) {
                        return '0';
                    } else if (cmp < 0) {
                        return n2.sign + strSubtraction(n2, n1);
                    } else {
                        return n1.sign + strSubtraction(n1, n2);
                    }
                }
            }
        };
    }
    if (Math.subtraction === undefined) {
        Math.subtraction = function (num1, num2) {
            var n1 = checkNumber(num1), n2 = checkNumber(num2);
            if (n1 === undefined || n2 === undefined) {
                return 'NaN';
            } else if (n2.value === '0') {
                return n1.value;
            } else if (n1.value === '0') {
                if (n2.sign === '') {
                    return '-' + n2.value;
                } else {
                    return n2.value.replace('-', '');
                }
            } else {
                if (n1.sign === n2.sign) {
                    var cmp = compNumber(n1, n2);
                    if (cmp === 0) {
                        return '0';
                    } else if (cmp < 0) {
                        return (n2.sign === '' ? '-' : '') + strSubtraction(n2, n1);
                    } else {
                        return n1.sign + strSubtraction(n1, n2);
                    }
                } else {
                    return n1.sign + strAddition(n1, n2);
                }
            }
        };
    }
    if (Math.multiplication === undefined) {
        Math.multiplication = function (num1, num2) {
            var n1 = checkNumber(num1), n2 = checkNumber(num2);
            if (n1 === undefined || n2 === undefined) {
                return 'NaN';
            } else if (n1.value === '0' || n2.value === '0') {
                return '0';
            } else if (n1.value === '1') {
                return n2.value;
            } else if (n2.value === '1') {
                return n1.value;
            } else if (n1.value === '-1') {
                if (n2.sign === '') {
                    return '-' + n2.value;
                } else {
                    return n2.value.replace('-', '');
                }
            } else if (n2.value === '-1') {
                if (n1.sign === '') {
                    return '-' + n1.value;
                } else {
                    return n1.value.replace('-', '');
                }
            } else {
                return (n1.sign === n2.sign ? '' : '-') + strMultiplication(n1, n2);
            }
        };
    }
    if (Math.division === undefined) {
        Math.division = function (num1, num2) {
            var n1 = checkNumber(num1), n2 = checkNumber(num2);
            if (n1 === undefined || n2 === undefined) {
                return 'NaN';
            } else if (n1.value === '0' && n2.value === '0') {
                return 'NaN';
            } else if (n1.value === '0') {
                return '0';
            } else if (n2.value === '0') {
                return n1.sign + 'Infinity';
            } else if (n2.value === '1') {
                return n1.value;
            } else if (n2.value === '-1') {
                if (n1.sign === '') {
                    return '-' + n1.value;
                } else {
                    return n1.value.replace('-', '');
                }
            } else {
                return (n1.sign === n2.sign ? '' : '-') + strＤivision(n1, n2);
            }
        };
    }
    if (Math.modulo === undefined) {
        Math.modulo = function (num1, num2) {
            var n1 = checkNumber(num1), n2 = checkNumber(num2);
            if (n1 === undefined || n2 === undefined) {
                return 'NaN';
            } else if (n2.value === '0') {
                return 'NaN';
            } else if (n1.value === '0') {
                return '0';
            } else if (n2.value === '1' || n2.value === '-1') {
                if (n1.fractional.length === 0) {
                    return '0';
                } else {
                    return n1.sign + '0.' + n1.fractional;
                }
            } else {
                var cmp = compNumber(n1, n2);
                if (cmp === 0) {
                    return '0';
                } else if (cmp < 0) {
                    return n1.value;
                } else {
                    var ret = strModulo(n1, n2);
                    return ret === '0' ? '0' : n1.sign + ret;
                }
            }
        };
    }

//String
    if (String.prototype.equals === undefined) {
        String.prototype.equals = function (str) {
            if (this === str)
                return true;
            return false;
        };
    }
    if (String.prototype.equalsIgnoreCase === undefined) {
        String.prototype.equalsIgnoreCase = function (str) {
            if (this === str)
                return true;
            if (typeof str === 'string' && this.toLowerCase() === str.toLowerCase())
                return true;
            return false;
        };
    }
    if (!String.prototype.repeat) {
        String.prototype.repeat = function (count) {
            if (this === null) {
                throw new TypeError('can\'t convert ' + this + ' to object');
            }
            var str = '' + this;
            count = +count;
            if (count !== count) {
                count = 0;
            }
            if (count < 0) {
                throw new RangeError('repeat count must be non-negative');
            }
            if (count === Infinity) {
                throw new RangeError('repeat count must be less than infinity');
            }
            count = Math.floor(count);
            if (str.length === 0 || count === 0) {
                return '';
            }
// 确保 count 是一个 31 位的整数。这样我们就可以使用如下优化的算法。
// 当前（2014年8月），绝大多数浏览器都不能支持 1 << 28 长的字符串，所以：
            if (str.length * count >= 1 << 28) {
                throw new RangeError('repeat count must not overflow maximum string size');
            }
            var rpt = '';
            for (; ; ) {
                if ((count & 1) === 1) {
                    rpt += str;
                }
                count >>>= 1;
                if (count === 0) {
                    break;
                }
                str += str;
            }
            return rpt;
        };
    }
    if (!String.prototype.reverse) {
        String.prototype.reverse = function () {
            return this.split('').reverse().join('');
        };
    }
    if (!String.prototype.trim) {
//参考: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
        String.prototype.trim = function () {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        };
    }
    if (!String.prototype.trimLeft) {
//参考: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
        String.prototype.trimLeft = function () {
            return this.replace(/^[\s\uFEFF\xA0]+/g, '');
        };
    }
    if (!String.prototype.trimRight) {
//参考: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
        String.prototype.trimRight = function () {
            return this.replace(/[\s\uFEFF\xA0]+$/g, '');
        };
    }

// window
    if (window.performance === undefined) {
        window.performance = {};
    }
    if (window.performance.now === undefined) {
        (function () {
            var start = Date.now();
            window.performance.now = function () {
                return Date.now() - start;
            };
        })();
    }
    if (window.requestAnimationFrame === undefined || window.cancelAnimationFrame === undefined) {
        (function () {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for (var x = 0; x < vendors.length && window.requestAnimationFrame === undefined; x++) {
                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            }
            if (!window.requestAnimationFrame)
                window.requestAnimationFrame = function (callback) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function () {
                        callback(currTime + timeToCall);
                    }, timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            for (var x = 0; x < vendors.length && window.cancelAnimationFrame === undefined; x++) {
                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
            }
            if (!window.cancelAnimationFrame)
                window.cancelAnimationFrame = function (id) {
                    clearTimeout(id);
                };
        }());
    }

    function strNumber() {
        return {sign: '', integral: '', fractional: '', value: ''};
    }

    function checkNumber(num) {
        var n = strNumber();
        if (typeof num === "number") {
            n.sign = num < 0 ? '-' : '';
            var na = Math.abs(num);
            n.integral = Math.floor(na).toString();
            n.fractional = na === Math.floor(na) ? '' : na.toString().substr(n.integral.length + 1);
            n.value = num.toString();
            return n;
        } else if (typeof num === "string") {
            if (num.length > 0) {
                var m;
                if (!!(m = /^([\+\-]?)(\d*)(?:\.(\d+))?$/.exec(num))) {
                    var ni = m[2].replace(/^0+/g, '');
                    n.integral = ni.length === 0 ? '0' : ni;
                    n.fractional = m[3] === undefined ? '' : m[3].replace(/0+$/g, '');
                    var nv = n.integral + (n.fractional.length > 0 ? '.' + n.fractional : '');
                    n.sign = nv === '0' ? '' : (m[1] === '-' ? '-' : '');
                    n.value = n.sign + nv;
                    return n;
                } else if (!!(m = /^([\+\-]?)(\d*)(?:\.(\d+))?e([\+\-]?)(\d+)$/i.exec(num))) {
                    if (m[2].length === 0 && m[3] === undefined) return undefined;
                    var ni = m[2].replace(/^0+/g, '');
                    var nf = m[3] === undefined ? '' : m[3].replace(/0+$/g, '');
                    var nz = m[4];
                    var nt = Number.parseInt(m[5]);
                    if (nt === 0) {
                        n.integral = ni.length === 0 ? '0' : ni;
                        n.fractional = nf;
                    } else {
                        var nni = '';
                        if (nz === '-') {
                            if (ni.length === 0) {
                                n.fractional = nf.length === 0 ? '' : '0'.repeat(nt) + nf;
                            } else if (ni.length === nt) {
                                n.fractional = (ni + nf).replace(/0+$/g, '');
                            } else if (ni.length < nt) {
                                n.fractional = ('0'.repeat(nt - ni.length) + ni + nf).replace(/0+$/g, '');
                            } else {
                                nni = ni.substr(0, ni.length - nt);
                                n.fractional = (ni.substr(ni.length - nt) + nf).replace(/0+$/g, '');
                            }
                        } else {
                            if (nf.length === 0) {
                                nni = (ni + '0'.repeat(nt)).replace(/^0+/g, '');
                            } else if (nf.length === nt) {
                                nni = (ni + nf).replace(/^0+/g, '');
                            } else if (nf.length < nt) {
                                nni = (ni + nf).replace(/^0+/g, '') + '0'.repeat(nt - nf.length);
                            } else {
                                nni = (ni + nf.substr(0, nt)).replace(/^0+/g, '');
                                n.fractional = nf.substr(nt);
                            }
                        }
                        n.integral = nni.length === 0 ? '0' : nni;
                    }
                    var nv = n.integral + (n.fractional.length > 0 ? '.' + n.fractional : '');
                    n.sign = nv === '0' ? '' : (m[1] === '-' ? '-' : '');
                    n.value = n.sign + nv;
                    return n;
                } else if (!!(m = /^0x([0-9a-f]+)$/i.exec(num))) {
                    var hh = m[1];
                    var sn = strNumber();
                    sn.integral = '16';
                    sn.value = '16';
                    var ss = strNumber();
                    ss.integral = Number.parseInt('0x' + hh.charAt(0), 16).toString();
                    ss.value = ss.integral;
                    for (var i = 1; i < hh.length; i++) {
                        var sh = strNumber();
                        sh.integral = strMultiplication(ss, sn);
                        sh.value = sh.integral;
                        var si = strNumber();
                        si.integral = Number.parseInt('0x' + hh.charAt(i), 16).toString();
                        si.value = si.integral;
                        //ss = strNumber();
                        ss.integral = strAddition(sh, si);
                        ss.value = ss.integral;
                    }
                    return ss;
                }
            }
        }
    }

    function compNumber(n1, n2) {
        if (n1.integral === n2.integral) {
            return n1.fractional.localeCompare(n2.fractional);
        } else if (n1.integral.length === n2.integral.length) {
            return n1.integral.localeCompare(n2.integral);
        } else {
            return Math.sign(n1.integral.length - n2.integral.length);
        }
    }



    function strAddition(n1, n2) {
        var ss = '', k = 0, j = 0;
        var s1, s2, l1, l2, m;
        s1 = n1.fractional;
        s2 = n2.fractional;
        l1 = s1.length;
        l2 = s2.length;
        if (l1 > 0 && l2 > 0) {
            m = Math.min(l1, l2);
            if (m < l1) {
                ss = s1.substr(m).reverse();
            } else if (m < l2) {
                ss = s2.substr(m).reverse();
            }
            for (var i = m - 1; i >= 0; i--) {
                k = Number.parseInt(s1.charAt(i)) + Number.parseInt(s2.charAt(i)) + j;
                j = Math.floor(k / 10);
                ss += Math.floor(k % 10).toString();
            }
            ss = ss.replace(/^0+/g, '');
            if (ss.length > 0) {
                ss += '.';
            }
        } else if (l1 > 0) {
            ss = s1.reverse() + '.';
        } else if (l2 > 0) {
            ss = s2.reverse() + '.';
        }
        s1 = n1.integral.reverse();
        s2 = n2.integral.reverse();
        l1 = s1.length;
        l2 = s2.length;
        m = Math.min(l1, l2);
        for (var i = 0; i < m; i++) {
            k = Number.parseInt(s1.charAt(i)) + Number.parseInt(s2.charAt(i)) + j;
            j = Math.floor(k / 10);
            ss += Math.floor(k % 10).toString();
        }
        if (m < l1) {
            for (var i = m; i < l1; i++) {
                k = Number.parseInt(s1.charAt(i)) + j;
                j = Math.floor(k / 10);
                ss += Math.floor(k % 10).toString();
            }
        } else if (m < l2) {
            for (var i = m; i < l2; i++) {
                k = Number.parseInt(s2.charAt(i)) + j;
                j = Math.floor(k / 10);
                ss += Math.floor(k % 10).toString();
            }
        }
        if (j > 0) {
            ss += j.toString();
        }
        return ss.reverse();
    }

    function strSubtraction(n1, n2) {
        var ss = '', k = 0, j = 0;
        var s1, s2, l1, l2, m;
        s1 = n1.fractional;
        s2 = n2.fractional;
        l1 = s1.length;
        l2 = s2.length;
        if (l1 > 0 && l2 === 0) {
            ss = s1.reverse() + '.';
        } else if (l2 > 0) {
            m = Math.max(l1, l2);
            if (l1 < m) {
                s1 += '0'.repeat(m - l1);
            } else if (l2 < m) {
                m = l2;
                ss = s1.substr(m).reverse();
            }
            for (var i = m - 1; i >= 0; i--) {
                k = Number.parseInt('10' + s1.charAt(i)) - j - Number.parseInt(s2.charAt(i));
                j = 10 - Math.floor(k / 10);
                ss += Math.floor(k % 10).toString();
            }
            ss = ss.replace(/^0+/g, '');
            if (ss.length > 0) {
                ss += '.';
            }
        }
        s1 = n1.integral.reverse();
        s2 = n2.integral.reverse();
        l1 = s1.length;
        l2 = s2.length;
        m = Math.min(l1, l2);
        for (var i = 0; i < m; i++) {
            k = Number.parseInt('10' + s1.charAt(i)) - j - Number.parseInt(s2.charAt(i));
            j = 10 - Math.floor(k / 10);
            ss += Math.floor(k % 10).toString();
        }
        var a = m;
        while (j > 0 && a < l1) {
            k = Number.parseInt('10' + s1.charAt(a)) - j;
            j = 10 - Math.floor(k / 10);
            ss += Math.floor(k % 10).toString();
            a++;
        }
        if (a < l1) {
            ss += s1.substr(a);
        }
        return ss.reverse().replace(/^0+([^\.])/g, function () {
            return arguments[1];
        });
    }

    function strMultiplication(n1, n2) {
        var l1 = n1.fractional.length, l2 = n2.fractional.length;
        var u1 = n1.integral.length, u2 = n2.integral.length;
        var ll = l1 + l2, uu = u1 + u2;
        var ai = new Array(uu), af = new Array(ll);
        var c1, c2, cc, yy;
        for (var i = 0; i < uu; i++) {
            ai[i] = 0;
        }
        for (var i = 0; i < ll; i++) {
            af[i] = 0;
        }
        for (var i1 = -l1; i1 < u1; i1++) {
            if (i1 < 0) {
                c1 = Number.parseInt(n1.fractional.charAt(-i1 - 1));
            } else {
                c1 = Number.parseInt(n1.integral.charAt(u1 - i1 - 1));
            }
            for (var i2 = -l2; i2 < u2; i2++) {
                if (i2 < 0) {
                    c2 = Number.parseInt(n2.fractional.charAt(-i2 - 1));
                } else {
                    c2 = Number.parseInt(n2.integral.charAt(u2 - i2 - 1));
                }
                var ii = i1 + i2;
                if (ii < 0) {
                    af[ -ii - 1] += c1 * c2;
                } else {
                    ai[ii] += c1 * c2;
                }
            }
            for (var ii = i1 - l2; ii < uu - 1; ii++) {
                var ij = ii + 1;
                if (ii < 0) {
                    cc = af[ -ii - 1];
                    af[ -ii - 1] = Math.floor(cc % 10);
                } else {
                    cc = ai[ii];
                    ai[ii] = Math.floor(cc % 10);
                }
                yy = Math.floor(cc / 10);
                if (ij < 0) {
                    af[ -ij - 1] += yy;
                } else {
                    ai[ij] += yy;
                }
            }
        }
        var ss = '';
        for (var ii = -ll; ii < uu; ii++) {
            if (ii < 0) {
                if (af[ -ii - 1] !== 0 || ss.length > 0) {
                    ss += af[ -ii - 1].toString();
                }
                if (ii === -1 && ss.length > 0) {
                    ss += '.';
                }
            } else {
                ss += ai[ii].toString();
            }
        }
        return ss.reverse().replace(/^0+([^\.])/g, function () {
            return arguments[1];
        });
    }

    function _strCompNumberTmp(n1, n2) {
        if (n1 === n2) {
            return 0;
        } else if (n1.length === n2.length) {
            return n1 < n2 ? -1 : 1;
        } else {
            return Math.sign(n1.length - n2.length);
        }
    }
    function _strMultiTmp(n1, n2) {
        var nn1 = strNumber(), nn2 = strNumber();
        nn1.integral = n1.toString().replace(/^0+/g, '');
        if (nn1.integral.length === 0) nn1.integral = '0';
        nn1.value = nn1.integral;
        nn2.integral = n2.toString().replace(/^0+/g, '');
        if (nn2.integral.length === 0) nn2.integral = '0';
        nn2.value = nn2.integral;
        if (nn1.value === '0' || nn2.value === '0') {
            return '0';
        } else if (nn1.value === '1') {
            return nn2.value;
        } else if (nn2.value === '1') {
            return nn1.value;
        } else {
            return strMultiplication(nn1, nn2);
        }
    }
    function _strSubtrTmp(n1, n2) {
        var nn1 = strNumber(), nn2 = strNumber();
        nn1.integral = n1.toString().replace(/^0+/g, '');
        if (nn1.integral.length === 0) nn1.integral = '0';
        nn1.value = nn1.integral;
        nn2.integral = n2.toString().replace(/^0+/g, '');
        if (nn2.integral.length === 0) nn2.integral = '0';
        nn2.value = nn2.integral;
        if (nn2.value === '0') {
            return nn1.value;
        } else {
            return strSubtraction(nn1, nn2);
        }
    }
    function strＤivision(n1, n2) {
        var bcs, cs, ss = '', ys = '', xs = '';
        var l1 = n1.fractional.length, l2 = n2.fractional.length;
        if (l2 === 0) {
            cs = n2.integral.replace(/0+$/g, '');
            var li = n2.integral.length - cs.length;
            if (li === 0) {
                bcs = n1.integral;
                xs = n1.fractional;
            } else {
                var ln = n1.integral.length;
                if (ln <= li) {
                    bcs = '0';
                    xs = '0'.repeat(li - ln) + n1.integral + n1.fractional;
                } else {
                    bcs = n1.integral.substr(0, ln - li);
                    xs = n1.integral.substr(ln - li) + n1.fractional;
                }
            }
        } else {
            if (l1 === l2) {
                bcs = (n1.integral + n1.fractional).replace(/^0+/g, '');
            } else if (l1 < l2) {
                bcs = (n1.integral + n1.fractional + '0'.repeat(l2 - l1)).replace(/^0+/g, '');
            } else if (l1 > l2) {
                bcs = (n1.integral + n1.fractional.substr(0, l2)).replace(/^0+/g, '');
                xs = n1.fractional.substr(l2);
            }
            if (bcs.length === 0)
                bcs = '0';
            cs = (n2.integral + n2.fractional).replace(/^0+/g, '');
        }
        if (cs === '1') {
            return bcs + (xs.length > 0 ? '.' + xs : '');
        } else if (cs.length <= 2) {
            var csn = Number.parseInt(cs);
            for (var i = 0; i < bcs.length; i++) {
                ys += bcs.charAt(i);
                if (_strCompNumberTmp(ys, cs) < 0) {
                    if (ss.length > 0)
                        ss += '0';
                } else {
                    var ysn = Number.parseInt(ys);
                    var ssch = Math.floor(ysn / csn);
                    ys = Math.floor(ysn % csn).toString();
                    ss += ssch.toString();
                }
            }
            if (ss.length === 0)
                ss = '0';
            if (ys.length > 0 && ys !== '0' || xs.length > 0) {
                ss += '.';
                for (var i = 0; i < xs.length; i++) {
                    ys += xs.charAt(i);
                    if (_strCompNumberTmp(ys, cs) < 0) {
                        ss += '0';
                    } else {
                        var ysn = Number.parseInt(ys);
                        var ssch = Math.floor(ysn / csn);
                        ys = Math.floor(ysn % csn).toString();
                        ss += ssch.toString();
                    }
                }
                for (var i = 0; i < Math.max(128, l1 + l2); i++) {
                    if (ys.length === 0 || ys === '0')
                        break;
                    ys += '0';
                    if (_strCompNumberTmp(ys, cs) < 0) {
                        ss += '0';
                    } else {
                        var ysn = Number.parseInt(ys);
                        var ssch = Math.floor(ysn / csn);
                        ys = Math.floor(ysn % csn).toString();
                        ss += ssch.toString();
                    }
                }
                if (ys.length > 0 && ys !== '0') {
                    ys += '0';
                    var ysn = Number.parseInt(ys);
                    var ssch = Math.round(ysn / csn);
                    ss += ssch.toString();
                }
            }
            return ss;
        } else {
            var csn = Number.parseInt(cs.substr(0, 2));
            for (var i = 0; i < bcs.length; i++) {
                ys += bcs.charAt(i);
                if (_strCompNumberTmp(ys, cs) < 0) {
                    if (ss.length > 0)
                        ss += '0';
                } else {
                    var ysn = Number.parseInt(ys.substr(0, (ys.length === cs.length ? 2 : 3)));
                    var ssch = Math.floor(ysn / csn);
                    while (_strCompNumberTmp(ys, _strMultiTmp(ssch, cs)) < 0) {
                        ssch--;
                    }
                    ss += ssch.toString();
                    ys = _strSubtrTmp(ys, _strMultiTmp(ssch, cs));
                }
            }
            if (ss.length === 0)
                ss = '0';
            if (ys.length > 0 && ys !== '0' || xs.length > 0) {
                ss += '.';
                for (var i = 0; i < xs.length; i++) {
                    ys += xs.charAt(i);
                    if (_strCompNumberTmp(ys, cs) < 0) {
                        ss += '0';
                    } else {
                        var ysn = Number.parseInt(ys.substr(0, (ys.length === cs.length ? 2 : 3)));
                        var ssch = Math.floor(ysn / csn);
                        while (_strCompNumberTmp(ys, _strMultiTmp(ssch, cs)) < 0) {
                            ssch--;
                        }
                        ss += ssch.toString();
                        ys = _strSubtrTmp(ys, _strMultiTmp(ssch, cs));
                    }
                }
                for (var i = 0; i < Math.max(128, l1 + l2); i++) {
                    if (ys.length === 0 || ys === '0')
                        break;
                    ys += '0';
                    if (_strCompNumberTmp(ys, cs) < 0) {
                        ss += '0';
                    } else {
                        var ysn = Number.parseInt(ys.substr(0, (ys.length === cs.length ? 2 : 3)));
                        var ssch = Math.floor(ysn / csn);
                        while (_strCompNumberTmp(ys, _strMultiTmp(ssch, cs)) < 0) {
                            ssch--;
                        }
                        ss += ssch.toString();
                        ys = _strSubtrTmp(ys, _strMultiTmp(ssch, cs));
                    }
                }
                if (ys.length > 0 && ys !== '0') {
                    ys += '0';
                    if (_strCompNumberTmp(ys, cs) < 0) {
                        ys += '0';
                        var ysn = Number.parseInt(ys.substr(0, (ys.length > cs.length ? 3 : 2)));
                        if (ysn > csn) {
                            var ssch = Math.round(ysn / csn);
                            ss += ssch < 5 ? '0' : '1';
                        }
                    } else {
                        var ysn = Number.parseInt(ys.substr(0, (ys.length === cs.length ? 2 : 3)));
                        var ssch = Math.floor(ysn / csn);
                        ss += ssch.toString();
                    }
                }
                ss = ss.replace(/0+$/g, '');
            }
            return ss;
        }
    }

    function _strFixNumberTmp(n) {
        var nn = n.split('.');
        var a = nn[0].replace(/^0+/g, '');
        if (a.length === 0) a = '0';
        var b = '';
        if (nn.length > 1) {
            b = nn[1].replace(/0+$/g, '');
        }
        return a + (b.length === 0 ? '' : '.' + b);
    }
    function strModulo(n1, n2) {
        var bcs, cs, ys = '', xs = '', wy = 0;
        var l1 = n1.fractional.length, l2 = n2.fractional.length;
        if (l2 === 0) {
            cs = n2.integral.replace(/0+$/g, '');
            var li = n2.integral.length - cs.length;
            if (li === 0) {
                bcs = n1.integral;
                xs = n1.fractional;
            } else {
                var ln = n1.integral.length;
                if (ln <= li) {
                    bcs = '0';
                    xs = '0'.repeat(li - ln) + n1.integral + n1.fractional;
                } else {
                    bcs = n1.integral.substr(0, ln - li);
                    xs = n1.integral.substr(ln - li) + n1.fractional;
                }
            }
            wy = li;
        } else {
            if (l1 === l2) {
                bcs = (n1.integral + n1.fractional).replace(/^0+/g, '');
            } else if (l1 < l2) {
                bcs = (n1.integral + n1.fractional + '0'.repeat(l2 - l1)).replace(/^0+/g, '');
            } else if (l1 > l2) {
                bcs = (n1.integral + n1.fractional.substr(0, l2)).replace(/^0+/g, '');
                xs = n1.fractional.substr(l2);
            }
            if (bcs.length === 0)
                bcs = '0';
            cs = (n2.integral + n2.fractional).replace(/^0+/g, '');
            wy = -l2;
        }
        if (cs === '1') {
            if (xs.length === 0) {
                return '0';
            } else {
                if (wy === 0) {
                    return '0.' + xs;
                } else if (wy < 0) {
                    return '0.' + '0'.repeat(-wy) + xs;
                } else {
                    if (xs.length === wy) {
                        return xs;
                    } else if (xs.length < wy) {
                        return xs + '0'.repeat(wy - xs.length);
                    } else {
                        return xs.substr(0, wy) + '.' + xs.substr(wy);
                    }
                }
            }
        } else {
            var csn = Number.parseInt(cs.substr(0, 2));
            for (var i = 0; i < bcs.length; i++) {
                ys += bcs.charAt(i);
                if (_strCompNumberTmp(ys, cs) >= 0) {
                    var ysn = Number.parseInt(ys.substr(0, (ys.length === cs.length ? 2 : 3)));
                    var ssch = Math.floor(ysn / csn);
                    while (_strCompNumberTmp(ys, _strMultiTmp(ssch, cs)) < 0) {
                        ssch--;
                    }
                    ys = _strSubtrTmp(ys, _strMultiTmp(ssch, cs));
                }
            }

            if (ys.length > 0 && ys !== '0' || xs.length > 0) {
                var dd = '0';
                if (wy === 0) {
                    dd = (ys.length === 0 ? '0' : ys) + (xs.length === 0 ? '' : '.' + xs);
                } else if (wy > 0) {
                    if (xs.length === 0) {
                        dd = ys.length === 0 ? '0' : ys;
                    } else if (xs.length === wy) {
                        dd = (ys === '0' ? '' : ys) + xs;
                    } else if (xs.length < wy) {
                        dd = (ys === '0' ? '' : ys) + xs + '0'.repeat(wy - xs.length);
                    } else {
                        dd = (ys === '0' ? '' : ys) + xs.substr(0, wy) + '.' + xs.substr(wy);
                    }
                } else {
                    if (ys.length === 0 || ys === '0') {
                        dd = '0.' + '0'.repeat(-wy) + xs;
                    } else if (ys.length === -wy) {
                        dd = '0.' + ys + xs;
                    } else if (ys.length < -wy) {
                        dd = '0.' + '0'.repeat(-wy - ys.length) + ys + xs;
                    } else {
                        dd = ys.substr(0, ys.length + wy) + '.' + ys.substr(ys.length + wy) + xs;
                    }
                }
                return _strFixNumberTmp(dd);
            } else {
                return '0';
            }
        }
    }
})();

/*
 *  常量定义
 */
WEBGUI.DEBUG = true; // 调试开关

// 鼠标事件
WEBGUI.MOUSEBUTTON = {LEFT: 0, MIDDLE: 1, RIGHT: 2}; // 参考 https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent.button
WEBGUI.MOUSEBUTTONS = {NONE: 0, LEFT: 1, RIGHT: 2, MIDDLE: 4, BACK: 8, FORWARD: 16};
//


WEBGUI.Color = function () {
    var colorValue = 0, alphaValue = 1;
    this.getValue = getValue;
    this.setValue = setValue;
    this.getRed = getRed;
    this.setRed = setRed;
    this.getGreen = getGreen;
    this.setGreen = setGreen;
    this.getBlue = getBlue;
    this.setBlue = setBlue;
    this.getAlpha = getAlpha;
    this.setAlpha = setAlpha;
    this.getRGB = getRGB;
    this.setRGB = setRGB;
    this.getHSL = getHSL;
    this.setHSL = setHSL;
    this.getHSV = getHSV;
    this.setHSV = setHSV;
    this.getCMYK = getCMYK;
    this.setCMYK = setCMYK;
    this.toHetoHex = toHex;
    this.toHexString = toHexString;
    this.toString = toString;
    this.toStyleValue = toStyleValue;
    this.toStyleRBG = toStyleRBG;
    this.toStyleRBGA = toStyleRBGA;
    this.toStyleHSL = toStyleHSL;
    this.toStyleHSLA = toStyleHSLA;
    this.toStyleHSV = toStyleHSV;
    this.toStyleCMYK = toStyleCMYK;
    this.copy = function (color) {
        if (typeof color === "object" && color instanceof WEBGUI.Color) {
            copyColor(color);
        }
    };
    this.equals = function (color) {
        if (typeof color === "object" && color instanceof WEBGUI.Color) {
            return (color.getValue() === colorValue) && (color.getAlpha() === alphaValue);
        } else {
            return false;
        }
    };

    switch (arguments.length) {
        case 1:
            setValue(arguments[0]);
            break;
        case 2:
            setValue(arguments[0]);
            setAlpha(arguments[1]);
            break;
        case 3:
            setRGB(arguments[0], arguments[1], arguments[2]);
            break;
        case 4:
            setRGB(arguments[0], arguments[1], arguments[2]);
            setAlpha(arguments[3]);
            break;
    }

    function getValue() {
        return colorValue;
    }
    function setValue(value) {
        if (typeof value === "number") {
            colorValue = Math.floor(value) & 0xffffff;
        } else if (typeof value === "string") {
            var m;
            if (!!(m = /^(0x[0-9a-f]+|\d+)$/i.exec(value))) {
                colorValue = Number.parseInt(m[1]) & 0xffffff;
            } else if (!!(m = /^#([0-9a-f]{6})$/i.exec(value))) {
                var h = m[1];
                colorValue = Number.parseInt('0x' + h.substr(4, 2) + h.substr(2, 2) + h.substr(0, 2), 16);
            } else if (!!(m = /^#([0-9a-f]{3})$/i.exec(value))) {
                var h = m[1];
                colorValue = Number.parseInt('0x' + h.charAt(2) + h.charAt(2) + h.charAt(1) + h.charAt(1) + h.charAt(0) + h.charAt(0), 16);
            } else if (!!(m = /^((?:rgb|hsl)a?)\(\s*([^\)]*)\)/i.exec(value))) {
                var name = m[1].toLowerCase();
                var components = m[2];
                var c;
                switch (name) {
                    case 'rgb':
                        if (!!(c = /^(\d+(?:\.\d+)?\%?)\s*,\s*(\d+(?:\.\d+)?\%?)\s*,\s*(\d+(?:\.\d+)?\%?)/i.exec(components))) {
                            setRGB(c[1], c[2], c[3]);
                        }
                        break;
                    case 'rgba':
                        if (!!(c = /^(\d+(?:\.\d+)?\%?)\s*,\s*(\d+(?:\.\d+)?\%?)\s*,\s*(\d+(?:\.\d+)?\%?)\s*,\s*(\d+(?:\.\d+)?\%?)/i.exec(components))) {
                            setRGB(c[1], c[2], c[3]);
                            setAlpha(c[4]);
                        }
                        break;
                    case 'hsl':
                        if (!!(c = /^(\d+(?:\.\d+)?\%?)\s*,\s*(\d+(?:\.\d+)?\%?)\s*,\s*(\d+(?:\.\d+)?\%?)/.exec(components))) {
                            setHSL(c[1], c[2], c[3]);
                        }
                        break;
                    case 'hsla':
                        if (!!(c = /^(\d+(?:\.\d+)?\%?)\s*,\s*(\d+(?:\.\d+)?\%?)\s*,\s*(\d+(?:\.\d+)?\%?)\s*,\s*(\d+(?:\.\d+)?\%?)/.exec(components))) {
                            setHSL(c[1], c[2], c[3]);
                            setAlpha(c[4]);
                        }
                        break;
                }
            } else if (value.toLowerCase() === "transparent") {
                colorValue = 0;
                alphaValue = 0;
            } else {
                var hex = WEBGUI.ColorKeywords[value.toLowerCase()];
                if (hex !== undefined) {
                    colorValue = hex;
                }
            }
        } else if (typeof value === "object" && value instanceof WEBGUI.Color) {
            copyColor(value);
        }
    }
    function copyColor(color) {
        colorValue = color.getValue();
        alphaValue = color.getAlpha();
    }

    function _fixrgb(c) {
        var cc;
        if (typeof c === "number") {
            if (c > 0 && c < 1) {
                cc = Math.round(c * 255) & 0xff;
            } else if (c >= 0) {
                cc = Math.floor(c) & 0xff;
            } else {
                cc = 0;
            }
        } else if (typeof c === "string") {
            var m;
            if (!!(m = /^(\d+(?:\.\d+)?)\%$/i.exec(c))) {
                cc = Math.round(Number.parseFloat(m[1]) / 100 * 255) & 0xff;
            } else if (!!(m = /^(0x[0-9a-f]+)$/i.exec(c))) {
                cc = Number.parseInt(m[1], 16) & 0xff;
            } else if (!!(m = /^(0?\.\d+)$/i.exec(c))) {
                cc = Math.round(Number.parseFloat(m[1]) * 255) & 0xff;
            } else if (!!(m = /^(0|[1-9]\d*(?:\.\d+)?)$/i.exec(c))) {
                cc = Math.floor(Number.parseFloat(m[1])) & 0xff;
            }
        }
        return cc;
    }

    function getRGB() {
        var rgb = {r: 0, g: 0, b: 0};
        rgb.r = colorValue & 0xff;
        rgb.g = colorValue >> 8 & 0xff;
        rgb.b = colorValue >> 16 & 0xff;
        return rgb;
    }
    function setRGB(r, g, b) {
        var rr = _fixrgb(r);
        if (rr === undefined || isNaN(rr)) {
            return;
        }
        var gg = _fixrgb(g);
        if (gg === undefined || isNaN(gg)) {
            return;
        }
        var bb = _fixrgb(b);
        if (bb === undefined || isNaN(bb)) {
            return;
        }
        colorValue = rr | (gg << 8) | (bb << 16);
    }

    function getRed() {
        return colorValue & 0xff;
    }
    function setRed(r) {
        var rr = _fixrgb(r);
        if (rr === undefined || isNaN(rr)) {
            return;
        }
        colorValue = (colorValue & 0xffff00) | rr;
    }

    function getGreen() {
        return colorValue >> 8 & 0xff;
    }
    function setGreen(g) {
        var gg = _fixrgb(g);
        if (gg === undefined || isNaN(gg)) {
            return;
        }
        colorValue = (colorValue & 0xff00ff) | (gg << 8);
    }

    function getBlue() {
        return colorValue >> 16 & 0xff;
    }
    function setBlue(b) {
        var bb = _fixrgb(b);
        if (bb === undefined || isNaN(bb)) {
            return;
        }
        colorValue = (colorValue & 0xffff) | (bb << 16);
    }

    function getAlpha() {
        return alphaValue;
    }
    function setAlpha(alpha) {
        if (typeof alpha === "number") {
            if (alpha >= 0 && alpha <= 1) {
                alphaValue = alpha.round(2);
            } else if (alpha > 1 && alpha <= 100) {
                alphaValue = (Math.floor(alpha) / 100).round(2);
            } else {
                alphaValue = 1;
            }
        } else if (typeof alpha === "string") {
            var m;
            if (!!(m = /^(\d+(?:\.\d+)?)\%$/i.exec(alpha))) {
                alphaValue = (Math.min(Number.parseFloat(m[1]), 100) / 100).round(2);
            } else if (!!(m = /^(0x[0-9a-f]+)$/i.exec(alpha))) {
                alphaValue = ((Number.parseInt(m[1]) & 0xff) / 255).round(2);
            } else if (!!(m = /^(0|0?\.\d+)$/i.exec(alpha))) {
                alphaValue = Number.parseFloat(m[1]).round(2);
            } else if (!!(m = /^([1-9]\d*(?:\.\d+)?)$/i.exec(alpha))) {
                alphaValue = (Number.parseFloat(m[1]) / 100).round(2);
            }
        }
    }

    function _rgbtohue(r, g, b, max, min) {
        var hue;
        if (max === min) {
            hue = 0;
        } else if (max === r) {
            hue = Math.round(60 * (g - b) / (max - min));
            if (g < b)
                hue += 360;
        } else if (max === g) {
            hue = Math.round(60 * (b - r) / (max - min)) + 120;
        } else if (max === b) {
            hue = Math.round(60 * (r - g) / (max - min)) + 240;
        }
        return hue;
    }
    function _fixhue(h, a) {
        var hh;
        if (typeof h === "number") {
            if (h > 0 && h < 1) {
                hh = (h * a).round(6);
            } else {
                hh = ((Math.floor(h) % 360) * a / 360).round(6);
            }
        } else if (typeof h === "string") {
            var m;
            if (!!(m = /^(\d+(?:\.\d+)?)\%$/i.exec(h))) {
                hh = (Math.min(Number.parseFloat(m[1]), 100) * a / 100).round(6);
            } else if (!!(m = /^(0?\.\d+)$/i.exec(h))) {
                hh = (Number.parseFloat(m[1]) * a).round(6);
            } else if (!!(m = /^(0|[1-9]\d*(?:\.\d+)?)$/i.exec(h))) {
                hh = ((Math.floor(Number.parseFloat(m[1])) % 360) * a / 360).round(6);
            }
        }
        return hh;
    }
    function _fixslv(v) {
        var vv;
        if (typeof v === "number") {
            if (v >= 0 && v < 1) {
                vv = v.round(2);
            } else if (v >= 1 && v <= 100) {
                vv = (v / 100).round(2);
            }
        } else if (typeof v === "string") {
            var m;
            if (!!(m = /^(\d+(?:\.\d+)?)\%$/i.exec(v))) {
                vv = (Math.min(Number.parseFloat(m[1]), 100) / 100).round(2);
            } else if (!!(m = /^(0x[0-9a-f]+)$/i.exec(v))) {
                vv = ((Number.parseInt(m[1]) & 0xff) / 255).round(2);
            } else if (!!(m = /^(0|0?\.\d+)$/i.exec(v))) {
                vv = Number.parseFloat(m[1]).round(2);
            } else if (!!(m = /^([1-9]\d*(?:\.\d+)?)$/i.exec(v))) {
                vv = (Number.parseFloat(m[1]) / 100).round(2);
            }
        }
        return vv;
    }

    function getHSL() {
        var hsl = {h: 0, s: 0, l: 0};
        var r = getRed() / 255, g = getGreen() / 255, b = getBlue() / 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        hsl.h = _rgbtohue(r, g, b, max, min);
        hsl.l = Math.round((max + min) / 2 * 100);
        if (hsl.l === 0 || max === min) {
            hsl.s = 0;
        } else if ((max + min) <= 1) {
            hsl.s = Math.round((max - min) / (max + min) * 100);
        } else {
            hsl.s = Math.round((max - min) / (2 - max - min) * 100);
        }
        return hsl;
    }
    function setHSL(h, s, l) {
        var rr, gg, bb;
        var hh = _fixhue(h, 1);
        if (hh === undefined || isNaN(hh)) {
            return;
        }
        var ss = _fixslv(s);
        if (ss === undefined || isNaN(ss)) {
            return;
        }
        var ll = _fixslv(l);
        if (ll === undefined || isNaN(ll)) {
            return;
        }

        if (ss === 0) {
            rr = gg = bb = Math.round(ll * 255);
        } else {
            var hue2rgb = function (p, q, t) {
                if (t < 0)
                    t += 1;
                if (t > 1)
                    t -= 1;
                if (t * 6 < 1)
                    return p + (q - p) * 6 * t;
                if (t * 2 < 1)
                    return q;
                if (t * 3 < 2)
                    return p + (q - p) * 6 * (2 / 3 - t);
                return p;
            };
            var pp = (ll < 0.5) ? ll * (1 + ss) : (ll + ss) - (ll * ss);
            var qq = 2 * ll - pp;
            rr = Math.round(hue2rgb(qq, pp, hh + (1 / 3)) * 255);
            gg = Math.round(hue2rgb(qq, pp, hh) * 255);
            bb = Math.round(hue2rgb(qq, pp, hh - (1 / 3)) * 255);
        }
        colorValue = rr | (gg << 8) | (bb << 16);
    }

    function getHSV() {
        var hsv = {h: 0, s: 0, v: 0};
        var r = getRed() / 255, g = getGreen() / 255, b = getBlue() / 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        hsv.h = _rgbtohue(r, g, b, max, min);
        hsv.v = Math.round(max * 100);
        if (max === 0) {
            hsv.s = 0;
        } else {
            hsv.s = Math.round((max - min) / max * 100);
        }
        return hsv;
    }
    function setHSV(h, s, v) {
        var rr, gg, bb;
        var hh = _fixhue(h, 6);
        if (hh === undefined || isNaN(hh)) {
            return;
        }
        var ss = _fixslv(s);
        if (ss === undefined || isNaN(ss)) {
            return;
        }
        var vv = _fixslv(v);
        if (vv === undefined || isNaN(vv)) {
            return;
        }

        if (ss === 0) {
            rr = gg = bb = Math.round(vv * 255);
        } else {
            var ii = Math.floor(hh);
            var ff = hh - ii;
            var pp = vv * (1 - ss);
            var qq = vv * (1 - ss * ff);
            var tt = vv * (1 - ss * (1 - ff));
            switch (ii) {
                case 0:
                    rr = Math.round(vv * 255);
                    gg = Math.round(tt * 255);
                    bb = Math.round(pp * 255);
                    break;
                case 1:
                    rr = Math.round(qq * 255);
                    gg = Math.round(vv * 255);
                    bb = Math.round(pp * 255);
                    break;
                case 2:
                    rr = Math.round(pp * 255);
                    gg = Math.round(vv * 255);
                    bb = Math.round(tt * 255);
                    break;
                case 3:
                    rr = Math.round(pp * 255);
                    gg = Math.round(qq * 255);
                    bb = Math.round(vv * 255);
                    break;
                case 4:
                    rr = Math.round(tt * 255);
                    gg = Math.round(pp * 255);
                    bb = Math.round(vv * 255);
                    break;
                default: // case 5:
                    rr = Math.round(vv * 255);
                    gg = Math.round(pp * 255);
                    bb = Math.round(qq * 255);
            }
        }
        colorValue = rr | (gg << 8) | (bb << 16);
    }

    function getCMYK() {
        var cmyk = {c: 0, m: 0, y: 0, k: 0};
        var rr = getRed() / 255, gg = getGreen() / 255, bb = getBlue() / 255;
        var cc = 1 - rr, mm = 1 - gg, yy = 1 - bb;
        var tmp = Math.min(cc, mm, yy);
        if (tmp === 1) {
            cmyk.k = Math.round(tmp * 100);
        } else if (tmp === 0) {
            cmyk.c = Math.round(cc * 100);
            cmyk.m = Math.round(mm * 100);
            cmyk.y = Math.round(yy * 100);
        } else {
            cmyk.c = Math.round((cc - tmp) * 100 / (1 - tmp));
            cmyk.m = Math.round((mm - tmp) * 100 / (1 - tmp));
            cmyk.y = Math.round((yy - tmp) * 100 / (1 - tmp));
            cmyk.k = Math.round(tmp * 100);
        }
        return cmyk;
    }
    function setCMYK(c, m, y, k) {
        var rr, gg, bb;
        var cc = _fixslv(c);
        if (cc === undefined || isNaN(cc)) {
            return;
        }
        var mm = _fixslv(m);
        if (mm === undefined || isNaN(mm)) {
            return;
        }
        var yy = _fixslv(y);
        if (yy === undefined || isNaN(yy)) {
            return;
        }
        var kk = _fixslv(k);
        if (kk === undefined || isNaN(kk)) {
            return;
        }
        rr = Math.round(255 * (100 - cc) * (100 - kk) / 10000);
        gg = Math.round(255 * (100 - mm) * (100 - kk) / 10000);
        bb = Math.round(255 * (100 - yy) * (100 - kk) / 10000);
        colorValue = rr | (gg << 8) | (bb << 16);
    }

    function toHex() {
        return '0x' + colorValue.toString(16).toUpperCase();
    }

    function toHexString() {
        return '0x' + (colorValue | 0x1000000).toString(16).substr(1).toUpperCase();
    }

    function toString() {
        var nm, key;
        if (colorValue === 0 && alphaValue === 0) {
            nm = ", Name: transparent";
        } else {
            for (nm in WEBGUI.ColorKeywords) {
                if (WEBGUI.ColorKeywords[nm] === colorValue) {
                    key = nm;
                    break;
                }
            }
            nm = '';
            if (key !== undefined)
                nm = ", Name: " + key;
        }
        return 'Color: ' + toHex() + nm + ', Alpha: ' + alphaValue;
    }

    function toStyleValue() {
        var v = (colorValue | 0x1000000).toString(16).substr(1).toUpperCase();
        return '#' + v.substr(4, 2) + v.substr(2, 2) + v.substr(0, 2);
    }

    function toStyleRBG() {
        return 'RBG(' + getRed() + ', ' + getGreen() + ', ' + getBlue() + ')';
    }

    function toStyleRBGA() {
        return 'RBGA(' + getRed() + ', ' + getGreen() + ', ' + getBlue() + ', ' + alphaValue + ')';
    }

    function toStyleHSL() {
        var hsl = getHSL();
        return 'HSL(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
    }

    function toStyleHSLA() {
        var hsl = getHSL();
        return 'HSLA(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%, ' + alphaValue + ')';
    }

    function toStyleHSV() {
        var hsv = getHSV();
        return 'HSV(' + hsv.h + ', ' + hsv.s + '%, ' + hsv.v + '%)';
    }

    function toStyleCMYK() {
        var cmyk = getCMYK();
        return 'CMYK(' + cmyk.c + '%, ' + cmyk.m + '%, ' + cmyk.y + '%, ' + cmyk.k + '%)';
    }

};
WEBGUI.Color.prototype = {
    constructor: WEBGUI.Color,
    get value() {
        return this.getValue();
    },
    set value(v) {
        this.setValue(v);
    },
    get red() {
        return this.getRed();
    },
    set red(r) {
        this.setRed(r);
    },
    get green() {
        return this.getGreen();
    },
    set green(g) {
        this.setGreen(g);
    },
    get blue() {
        return this.getBlue();
    },
    set blue(b) {
        this.setBlue(b);
    },
    get alpha() {
        return this.getAlpha();
    },
    set alpha(a) {
        this.setAlpha(a);
    },
    clone: function () {
        return new this.constructor(this.getValue(), this.getAlpha());
    },
    inverse: function () {
        return new this.constructor(~this.getValue(), this.getAlpha());
    },
    add: function () {
        var cc = new this.constructor();
        switch (arguments.length) {
            case 1:
                cc.setValue(arguments[0]);
                break;
            case 2:
                cc.setValue(arguments[0]);
                cc.setAlpha(arguments[1]);
                break;
            case 3:
                cc.setRGB(arguments[0], arguments[1], arguments[2]);
                break;
            case 4:
                cc.setRGB(arguments[0], arguments[1], arguments[2]);
                cc.setAlpha(arguments[3]);
                break;
        }
        var calcadd = function (c1, c2) {
            var m = Math.max(c1, c2), n = Math.min(c1, c2);
            var c = m + Math.round(n * (255 - m) / 255);
            return Math.min(255, c);
        };
        var rr = calcadd(this.red, cc.red);
        var gg = calcadd(this.green, cc.green);
        var bb = calcadd(this.blue, cc.blue);
        var aa = Math.max(this.alpha, cc.alpha);
        return new this.constructor(rr, gg, bb, aa);
    },
    multiply: function () {
        var cc = new this.constructor();
        switch (arguments.length) {
            case 1:
                cc.setValue(arguments[0]);
                break;
            case 2:
                cc.setValue(arguments[0]);
                cc.setAlpha(arguments[1]);
                break;
            case 3:
                cc.setRGB(arguments[0], arguments[1], arguments[2]);
                break;
            case 4:
                cc.setRGB(arguments[0], arguments[1], arguments[2]);
                cc.setAlpha(arguments[3]);
                break;
        }
        var calcmulti = function (c1, c2) {
            var c = Math.round(c1 * c2 / 255);
            return Math.min(255, c);
        };
        var rr = calcmulti(this.red, cc.red);
        var gg = calcmulti(this.green, cc.green);
        var bb = calcmulti(this.blue, cc.blue);
        var aa = Math.max(this.alpha, cc.alpha);
        return new this.constructor(rr, gg, bb, aa);
    },
    lerp: function () {
        var cc = new this.constructor();
        switch (arguments.length) {
            case 1:
                cc.setValue(arguments[0]);
                break;
            case 2:
                cc.setValue(arguments[0]);
                cc.setAlpha(arguments[1]);
                break;
            case 3:
                cc.setRGB(arguments[0], arguments[1], arguments[2]);
                break;
            case 4:
                cc.setRGB(arguments[0], arguments[1], arguments[2]);
                cc.setAlpha(arguments[3]);
                break;
        }
        var calclerp = function (c1, c2, a) {
            var c = Math.round(c1 + (c2 - c1) * a);
            if (c > 255)
                c = 255;
            if (c < 0)
                c = 0;
            return c;
        };
        var rr = calclerp(this.red, cc.red, cc.alpha);
        var gg = calclerp(this.green, cc.green, cc.alpha);
        var bb = calclerp(this.blue, cc.blue, cc.alpha);
        return new this.constructor(rr, gg, bb, this.alpha);
    }
};
WEBGUI.ColorKeywords = {
    'aliceblue': 0xFFF8F0, 'antiquewhite': 0xD7EBFA, 'aqua': 0xFFFF00, 'aquamarine': 0xD4FF7F, 'azure': 0xFFFFF0,
    'beige': 0xDCF5F5, 'bisque': 0xC4E4FF, 'black': 0x000000, 'blanchedalmond': 0xCDEBFF, 'blue': 0xFF0000,
    'blueviolet': 0xE22B8A, 'brown': 0x2A2AA5, 'burlywood': 0x87B8DE,
    'cadetblue': 0xA09E5F, 'chartreuse': 0x00FF7F, 'chocolate': 0x1E69D2, 'coral': 0x507FFF,
    'cornflowerblue': 0xED9564, 'cornsilk': 0xDCF8FF, 'crimson': 0x3C14DC, 'cyan': 0xFFFF00,
    'darkblue': 0x8B0000, 'darkcyan': 0x8B8B00, 'darkgoldenrod': 0x0B86B8, 'darkgray': 0xA9A9A9, 'darkgreen': 0x006400,
    'darkgrey': 0xA9A9A9, 'darkkhaki': 0x6BB7BD, 'darkmagenta': 0x8B008B, 'darkolivegreen': 0x2F6B55, 'darkorange': 0x008CFF,
    'darkorchid': 0xCC3299, 'darkred': 0x00008B, 'darksalmon': 0x7A96E9, 'darkseagreen': 0x8FBC8F, 'darkslateblue': 0x8B3D48,
    'darkslategray': 0x4F4F2F, 'darkslategrey': 0x4F4F2F, 'darkturquoise': 0xD1CE00, 'darkviolet': 0xD30094, 'deeppink': 0x9314FF,
    'deepskyblue': 0xFFBF00, 'dimgray': 0x696969, 'dimgrey': 0x696969, 'dodgerblue': 0xFF901E,
    'firebrick': 0x2222B2, 'floralwhite': 0xF0FAFF, 'forestgreen': 0x228B22, 'fuchsia': 0xFF00FF,
    'gainsboro': 0xDCDCDC, 'ghostwhite': 0xFFF8F8, 'gold': 0x00D7FF, 'goldenrod': 0x20A5DA, 'gray': 0x808080,
    'green': 0x008000, 'greenyellow': 0x2FFFAD, 'grey': 0x808080,
    'honeydew': 0xF0FFF0, 'hotpink': 0xB469FF,
    'indianred': 0x5C5CCD, 'indigo': 0x82004B, 'ivory': 0xF0FFFF,
    'khaki': 0x8CE6F0,
    'lavender': 0xFAE6E6, 'lavenderblush': 0xF5F0FF, 'lawngreen': 0x00FC7C, 'lemonchiffon': 0xCDFAFF, 'lightblue': 0xE6D8AD,
    'lightcoral': 0x8080F0, 'lightcyan': 0xFFFFE0, 'lightgoldenrodyellow': 0xD2FAFA, 'lightgray': 0xD3D3D3,
    'lightgreen': 0x90EE90, 'lightgrey': 0xD3D3D3, 'lightpink': 0xC1B6FF, 'lightsalmon': 0x7AA0FF, 'lightseagreen': 0xAAB220,
    'lightskyblue': 0xFACE87, 'lightslategray': 0x998877, 'lightslategrey': 0x998877, 'lightsteelblue': 0xDEC4B0,
    'lightyellow': 0xE0FFFF, 'lime': 0x00FF00, 'limegreen': 0x32CD32, 'linen': 0xE6F0FA,
    'magenta': 0xFF00FF, 'maroon': 0x000080, 'mediumaquamarine': 0xAACD66, 'mediumblue': 0xCD0000, 'mediumorchid': 0xD355BA,
    'mediumpurple': 0xDB7093, 'mediumseagreen': 0x71B33C, 'mediumslateblue': 0xEE687B, 'mediumspringgreen': 0x9AFA00,
    'mediumturquoise': 0xCCD148, 'mediumvioletred': 0x8515C7, 'midnightblue': 0x701919, 'mintcream': 0xFAFFF5,
    'mistyrose': 0xE1E4FF, 'moccasin': 0xB5E4FF,
    'navajowhite': 0xADDEFF, 'navy': 0x800000,
    'oldlace': 0xE6F5FD, 'olive': 0x008080, 'olivedrab': 0x238E6B, 'orange': 0x00A5FF, 'orangered': 0x0045FF, 'orchid': 0xD670DA,
    'palegoldenrod': 0xAAE8EE, 'palegreen': 0x98FB98, 'paleturquoise': 0xEEEEAF, 'palevioletred': 0x9370DB, 'papayawhip': 0xD5EFFF,
    'peachpuff': 0xB9DAFF, 'peru': 0x3F85CD, 'pink': 0xCBC0FF, 'plum': 0xDDA0DD, 'powderblue': 0xE6E0B0, 'purple': 0x800080,
    'red': 0x0000FF, 'rosybrown': 0x8F8FBC, 'royalblue': 0xE16941,
    'saddlebrown': 0x13458B, 'salmon': 0x7280FA, 'sandybrown': 0x60A4F4, 'seagreen': 0x578B2E, 'seashell': 0xEEF5FF,
    'sienna': 0x2D52A0, 'silver': 0xC0C0C0, 'skyblue': 0xEBCE87, 'slateblue': 0xCD5A6A, 'slategray': 0x908070,
    'slategrey': 0x908070, 'snow': 0xFAFAFF, 'springgreen': 0x7FFF00, 'steelblue': 0xB48246,
    'tan': 0x8CB4D2, 'teal': 0x808000, 'thistle': 0xD8BFD8, 'tomato': 0x4763FF, 'turquoise': 0xD0E040,
    'violet': 0xEE82EE,
    'wheat': 0xB3DEF5, 'white': 0xFFFFFF, 'whitesmoke': 0xF5F5F5,
    'yellow': 0x00FFFF, 'yellowgreen': 0x32CD9A
};

