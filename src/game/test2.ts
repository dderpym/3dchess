const quad1Moves = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 1, 0],
  [2, 0, 1],
];

const moves = [];

const cycle = [
  [1, 1, 1],
  [-1, 1, 1],
  [1, -1, 1],
  [1, 1, -1],
  [-1, -1, 1],
  [1, -1, -1],
  [-1, -1, -1],
];
for (let i = 0; i < cycle.length; ++i) {
  for (let j = 0; j < quad1Moves.length; ++j) {
    let repeat = false;
    for (let k = 0; k < cycle[0].length; ++k) {
      if (cycle[i][k] == -1 && quad1Moves[j][k] == 0) {
        repeat = true;
        break;
      }
    }
    if (!repeat) {
      moves.push(
        Array.from(quad1Moves[j], (coord, index) => coord * cycle[i][index]),
      );
    }
  }
}

console.log(moves);
