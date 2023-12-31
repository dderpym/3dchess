const defDamp = (
  dampening: number,
  vel: number,
  minAbs: number,
  secondsPassed: number,
) =>
  (vel - minAbs) * Math.pow(Math.E, -Math.pow(dampening * secondsPassed, 2)) +
  Math.sign(vel) * minAbs;

console.log(defDamp(10, 0.7, 0.3, 0.01));
