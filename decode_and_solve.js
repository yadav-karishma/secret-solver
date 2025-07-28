const fs = require("fs");
const bigInt = require("big-integer");

/**
 * Read and parse the JSON input file
 */
function parseJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

/**
 * Decode base-specific y-values and return the first k sorted points as [x, y]
 */
function getPoints(data) {
  const { n, k } = data.keys;
  const points = [];

  Object.keys(data).forEach((key) => {
    if (key === "keys") return;

    const x = parseInt(key);
    const base = parseInt(data[key].base);
    const valueStr = data[key].value;

    const y = bigInt(valueStr, base); // Decode y using base
    points.push([x, y]);
  });

  // Sort by x and return first k points
  return points.sort((a, b) => a[0] - b[0]).slice(0, k);
}

/**
 * Use Lagrange interpolation to calculate f(0) — the constant term c
 */
function lagrangeInterpolationAtZero(points) {
  let result = bigInt.zero;

  for (let i = 0; i < points.length; i++) {
    const [xi, yi] = points[i];
    let numerator = bigInt.one;
    let denominator = bigInt.one;

    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      const [xj] = points[j];

      numerator = numerator.multiply(bigInt(xj).negate());
      denominator = denominator.multiply(bigInt(xi).subtract(xj));
    }

    const li = numerator.divide(denominator); // Lagrange basis polynomial at x = 0
    result = result.add(yi.multiply(li));
  }

  return result; // This is f(0) = constant term
}

/**
 * Main solver for each JSON input file
 */
function solve(filePath) {
  const data = parseJSON(filePath);
  const points = getPoints(data);
  const secret = lagrangeInterpolationAtZero(points);
  return secret.toString();
}

// MAIN EXECUTION
const secret1 = solve("input1.json");
const secret2 = solve("input2.json");

console.log("✅ Secret from input1.json:", secret1);
console.log("✅ Secret from input2.json:", secret2);
