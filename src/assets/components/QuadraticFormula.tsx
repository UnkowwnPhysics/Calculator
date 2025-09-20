import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuadraticFormula.css';


// Pequena implementação de números complexos para suportar coeficientes com 'i'
class Complex {
re: number;
im: number;
constructor(re = 0, im = 0) {
this.re = re;
this.im = im;
}


static fromString(s: string): Complex {
if (!s) return new Complex(0, 0);
// Normaliza: remove espaços e transforma 'i' em imaginary marker
s = s.replace(/\s+/g, '');
// Tratar casos simples: '3', '-2', '2i', '-3i', '3+2i', '3-2i'
// Se somente 'i' ou '-i'
if (s === 'i') return new Complex(0, 1);
if (s === '-i') return new Complex(0, -1);


const reImMatch = s.match(/^([+-]?[0-9]*\.?[0-9]+)?([+-][0-9]*\.?[0-9]+)?i$/);
if (reImMatch) {
// tipo '3+2i' ou '+3-2i' (já pega nos grupos)
}


// Caso contenha 'i' em qualquer posição
if (s.includes('i')) {
// Substituir 'i' por 'j' não ajuda em JS, parse manual
// Separar em parte real e imag
// Encontrar último '+' ou '-' que separa
const idx = Math.max(s.lastIndexOf('+', s.length - 2), s.lastIndexOf('-', s.length - 2));
if (idx > 0) {
const realPart = parseFloat(s.slice(0, idx));
let imagPart = s.slice(idx);
imagPart = imagPart.replace(/i$/, '');
if (imagPart === '+' || imagPart === '-') imagPart += '1';
return new Complex(realPart || 0, parseFloat(imagPart) || 0);
} else {
// Apenas imag: '2i' or '-2i'
const imagPart = s.replace(/i$/, '');
return new Complex(0, parseFloat(imagPart) || 0);
}
}


// Caso seja só real
return new Complex(parseFloat(s) || 0, 0);
}


add(b: Complex) {
return new Complex(this.re + b.re, this.im + b.im);
}
sub(b: Complex) {
return new Complex(this.re - b.re, this.im - b.im);
}
mul(b: Complex) {
return new Complex(this.re * b.re - this.im * b.im, this.re * b.im + this.im * b.re);
}
div(b: Complex) {
const denom = b.re * b.re + b.im * b.im;
return new Complex((this.re * b.re + this.im * b.im) / denom, (this.im * b.re - this.re * b.im) / denom);
}
abs() {
return Math.hypot(this.re, this.im);
}
export default QuadraticFormula;
