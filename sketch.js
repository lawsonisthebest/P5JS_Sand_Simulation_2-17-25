let grid;
let w = 10; // Cell size
let cols, rows;
let spawnSize = 2;
let particleSelection = 1;

let expanding = false; // Track if expansion is active
let expansionSteps = 0; // How many steps it has expanded
let maxExpansion = 25; // Max number of expansion steps

function make2DArray(cols, rows) {
  return Array.from({ length: cols }, () => Array(rows).fill(0));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  cols = floor(width / w) + 1;
  rows = floor(height / w);
  grid = make2DArray(cols, rows);
}

function mouseDragged() {
  let col = floor(mouseX / w);
  let row = floor(mouseY / w);

  if (col >= 0 && col < cols && row >= 0 && row < rows) {
    for (let i = 0; i < spawnSize; i++) {
      for (let j = 0; j < spawnSize; j++) {
        let spawnCol = col - i;
        let spawnRow = row - j;
        if (spawnCol >= 0 && spawnCol < cols && spawnRow >= 0 && spawnRow < rows) {
          grid[spawnCol][spawnRow] = particleSelection;
        }
      }
    }
  }
}

function spreadParticle() {
  if (!expanding || expansionSteps >= maxExpansion) {
    expanding = false; // Stop expanding after max limit
    return;
  }

  let nextGrid = make2DArray(cols, rows); // Create a new grid for the next state

  // Copy the current grid to the nextGrid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      nextGrid[i][j] = grid[i][j]; // Copy current state
    }
  }

  // Loop through the grid and find all type 5 particles
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === 5) {
        // Pick a random direction per expansion step
        let randomDir = random([
          [1, 0],  // Right
          [-1, 0], // Left
          [0, 1],  // Down
          [0, -1]  // Up
        ]);

        let x = i + randomDir[0];
        let y = j + randomDir[1];

        // Check if the new position is within bounds and empty
        if (x >= 0 && x < cols && y >= 0 && y < rows && grid[x][y] === 0) {
          nextGrid[x][y] = 5; // Expand into that direction
        }
      }
    }
  }

  grid = nextGrid; // Update grid state
  expansionSteps++; // Increment expansion count
}

function mousePressed() {
  let col = floor(mouseX / w);
  let row = floor(mouseY / w);
  let radius = 15; // Radius of explosion effect (in grid cells)

  if (col >= 0 && col < cols && row >= 0 && row < rows) {
    let targetType = grid[col][row]; // Get the type of the clicked particle
    
    if (grid[col][row] === 5) {
      expanding = true; // Start expansion
      expansionSteps = 0; // Reset expansion counter
    }

    if (targetType === 4) {
      // Step 1: Remove all particles of the same type
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          if (grid[i][j] === targetType) {
            grid[i][j] = 0;
          }
        }
      }

      // Step 2: Destroy surrounding particles in a blast radius
      for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
          let checkCol = col + i;
          let checkRow = row + j;

          // Ensure within grid bounds
          if (checkCol >= 0 && checkCol < cols && checkRow >= 0 && checkRow < rows) {
            grid[checkCol][checkRow] = 0; // Destroy everything in the radius
          }
        }
      }
    }
  }
}

function keyPressed() {
  if (key === '1') particleSelection = 1; // Water
  if (key === '2') particleSelection = 2; // Lava
  if (key === '3') particleSelection = 3; // Stone
  if (key === '4') particleSelection = 4; // Gunpowder
  if (key === '5') particleSelection = 5; // Sponge
}

function draw() {
  background(255);

  let nextGrid = make2DArray(cols, rows);
  
  if (expanding) {
    spreadParticle(); // Automatically expand over time
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * w;
      let y = j * w;

      if (grid[i][j] === 1) fill(0, 0, 255); // Water
      if (grid[i][j] === 2) fill(255, 150, 0); // Lava
      if (grid[i][j] === 3) fill(150, 150, 150); // Stone
      if (grid[i][j] === 5) fill(0, 255, 0); // Expanding Particle (Green)

      if (grid[i][j] > 0) {
        noStroke();
        square(x, y, w);
      }
    }
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let state = grid[i][j];
      let below = j + 1 < rows ? grid[i][j + 1] : null;
      let above = j - 1 >= 0 ? grid[i][j - 1] : null;

      if (state > 0) {
        let x = i * w;
        let y = j * w;

        // Color particles
        if (state === 1) fill(0, 0, 255); // Water
        if (state === 2) fill(255, 150, 0); // Lava
        if (state === 3) fill(160, 160, 160); // Stone
        if (state === 4) fill(100, 100, 100); // Gunpowder
        if (state === 5) fill(100, 255, 100); // Sponge

        noStroke();
        square(x, y, w);

        let dir = random([-1, 1]);
        let belowSideA = i + dir >= 0 && i + dir < cols ? grid[i + dir][j + 1] : null;
        let belowSideB = i - dir >= 0 && i - dir < cols ? grid[i - dir][j + 1] : null;

        if (state === 4 || state === 5) {
          // Water falling
          if (below === 0) {
            nextGrid[i][j + 1] = state;
          } else if (belowSideA === 0) {
            nextGrid[i + dir][j + 1] = state;
          } else if (belowSideB === 0) {
            nextGrid[i - dir][j + 1] = state;
          } else {
            nextGrid[i][j] = state;
          }
        }
        
         if (state === 1) {
          // Water falling

          if (below === 0) {
            nextGrid[i][j + 1] = state;
          } else if (belowSideA === 0) {
            nextGrid[i + dir][j + 1] = state;
          } else if (belowSideB === 0) {
            nextGrid[i - dir][j + 1] = state;
          } else if (above === 2){
            nextGrid[i][j-1] = 3;
            nextGrid[i][j] = 3;
            nextGrid[i][j+1] = 3;
          } else if (below === 2){
            nextGrid[i][j-1] = 3;
            nextGrid[i][j] = 3;
            nextGrid[i][j+1] = 3;
          }else {
            nextGrid[i][j] = state;
          }
        }

         // --- Particle Movement Rules ---
        if (state === 2) {
          // Lava falling
          if (below === 0) {
            nextGrid[i][j + 1] = state;
          } else if (belowSideA === 0) {
            nextGrid[i + dir][j + 1] = state;
          } else if (belowSideB === 0) {
            nextGrid[i - dir][j + 1] = state;
          } else if (below === 1){
            nextGrid[i][j-1] = 3;
            nextGrid[i][j] = 3;
            nextGrid[i][j+1] = 3;
          }else if (above === 1){
            nextGrid[i][j-1] = 3;
            nextGrid[i][j] = 3;
            nextGrid[i][j+1] = 3;
          } else {
            nextGrid[i][j] = state;
          }
        }

        if (state === 3) {
          // Stone and Sponge do not move
          nextGrid[i][j] = state;
        }
      }
    }
  }

  grid = nextGrid;
}
