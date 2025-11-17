// Simple fraction representation and operations
export class Fraction {
  constructor(numerator, denominator = 1) {
    if (denominator === 0) throw new Error('Denominator cannot be zero');
    
    const gcd = this.gcd(Math.abs(numerator), Math.abs(denominator));
    this.num = numerator / gcd;
    this.den = denominator / gcd;
    
    // Keep denominator positive
    if (this.den < 0) {
      this.num = -this.num;
      this.den = -this.den;
    }
  }
  
  gcd(a, b) {
    return b === 0 ? a : this.gcd(b, a % b);
  }
  
  static fromDecimal(decimal, tolerance = 1e-10) {
    if (Math.abs(decimal) < tolerance) return new Fraction(0, 1);
    
    const sign = decimal < 0 ? -1 : 1;
    decimal = Math.abs(decimal);
    
    let denominator = 1;
    let numerator = decimal;
    
    // Simple continued fraction approximation
    for (let i = 0; i < 15; i++) {
      if (Math.abs(numerator - Math.round(numerator)) < tolerance) {
        break;
      }
      denominator *= 10;
      numerator = decimal * denominator;
    }
    
    return new Fraction(sign * Math.round(numerator), denominator);
  }
  
  toString() {
    if (this.den === 1) return this.num.toString();
    return `${this.num}/${this.den}`;
  }
  
  toDecimal() {
    return this.num / this.den;
  }
  
  multiply(other) {
    return new Fraction(this.num * other.num, this.den * other.den);
  }
  
  add(other) {
    return new Fraction(
      this.num * other.den + other.num * this.den,
      this.den * other.den
    );
  }
}