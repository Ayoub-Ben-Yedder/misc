class Maze {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = this.initGrid();
        this.stack = [];
    }

    initGrid() {
        let grid = [];
        for (let r = 0; r < this.rows; r++) {
            let row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push({
                    i: r,
                    j: c,
                    visited: false,
                    top: true,
                    right: true,
                    bottom: true,
                    left: true
                });
            }
            grid.push(row);
        }
        return grid;
    }

    addWalls(cell, walls) {
        const { i, j } = cell;
        if (i > 0 && !this.grid[i - 1][j].visited) walls.push({ current: cell, next: this.grid[i - 1][j] });
        if (i < this.rows - 1 && !this.grid[i + 1][j].visited) walls.push({ current: cell, next: this.grid[i + 1][j] });
        if (j > 0 && !this.grid[i][j - 1].visited) walls.push({ current: cell, next: this.grid[i][j - 1] });
        if (j < this.cols - 1 && !this.grid[i][j + 1].visited) walls.push({ current: cell, next: this.grid[i][j + 1] });
    }

    removeWalls(cell1, cell2) {
        const x = cell1.i - cell2.i;
        const y = cell1.j - cell2.j;

        if (x === 1) {
            cell1.top = false;
            cell2.bottom = false;
        } else if (x === -1) {
            cell1.bottom = false;
            cell2.top = false;
        }

        if (y === 1) {
            cell1.left = false;
            cell2.right = false;
        } else if (y === -1) {
            cell1.right = false;
            cell2.left = false;
        }
    }

    getNeighbors(r, c) {
        let neighbors = [];
        if (r > 0) neighbors.push([r - 1, c, 'top', 'bottom']);
        if (c > 0) neighbors.push([r, c - 1, 'left', 'right']);
        if (r < this.rows - 1) neighbors.push([r + 1, c, 'bottom', 'top']);
        if (c < this.cols - 1) neighbors.push([r, c + 1, 'right', 'left']);
        return neighbors;
    }

    generateDFS() {
        let stack = [[0, 0]];
        this.grid[0][0].visited = true;

        while (stack.length > 0) {
            let [r, c] = stack[stack.length - 1];
            let neighbors = this.getNeighbors(r, c).filter(
                ([nr, nc]) => !this.grid[nr][nc].visited
            );

            if (neighbors.length > 0) {
                let [nr, nc, currentWall, nextWall] = neighbors[
                    Math.floor(Math.random() * neighbors.length)
                ];
                this.grid[r][c][currentWall] = false;
                this.grid[nr][nc][nextWall] = false;
                this.grid[nr][nc].visited = true;
                stack.push([nr, nc]);
            } else {
                stack.pop();
            }
        }
    }

    generatePrim() {
        const walls = [];
        let current = this.grid[0][0];
        current.visited = true;

        this.addWalls(current, walls);

        while (walls.length > 0) {
            const randomIndex = Math.floor(Math.random() * walls.length);
            const { current, next } = walls.splice(randomIndex, 1)[0];

            if (!next.visited) {
                this.removeWalls(current, next);
                next.visited = true;
                this.addWalls(next, walls);
            }
        }
    }

    draw(canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const cellWidth = canvas.width / this.cols;
        const cellHeight = canvas.height / this.rows;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let cell = this.grid[r][c];
                let x = c * cellWidth;
                let y = r * cellHeight;

                if (cell.top) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + cellWidth, y);
                    ctx.stroke();
                }
                if (cell.right) {
                    ctx.beginPath();
                    ctx.moveTo(x + cellWidth, y);
                    ctx.lineTo(x + cellWidth, y + cellHeight);
                    ctx.stroke();
                }
                if (cell.bottom) {
                    ctx.beginPath();
                    ctx.moveTo(x, y + cellHeight);
                    ctx.lineTo(x + cellWidth, y + cellHeight);
                    ctx.stroke();
                }
                if (cell.left) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y + cellHeight);
                    ctx.stroke();
                }
            }
        }
    }

    solveHandOnWall() {
        let current = { r: 0, c: 0 };
        let dir = "S";
        const end = { r: this.rows - 1, c: this.cols - 1 };

        const directions = {
            "N": { r: -1, c: 0 },
            "E": { r: 0, c: 1 },
            "S": { r: 1, c: 0 },
            "W": { r: 0, c: -1 }
        };

        const turnRight = {
            "N": "E",
            "E": "S",
            "S": "W",
            "W": "N"
        };

        const turnLeft = {
            "N": "W",
            "E": "N",
            "S": "E",
            "W": "S"
        };

        const moveForward = (pos, dir) => {
            return {
                r: pos.r + directions[dir].r,
                c: pos.c + directions[dir].c
            };
        };

        const canMoveForward = (pos, dir) => {
            const newPos = moveForward(pos, dir);
            if (newPos.r < 0 || newPos.r >= this.rows || newPos.c < 0 || newPos.c >= this.cols) {
                return false;
            }
            switch (dir) {
                case "N": return !this.grid[pos.r][pos.c].top;
                case "E": return !this.grid[pos.r][pos.c].right;
                case "S": return !this.grid[pos.r][pos.c].bottom;
                case "W": return !this.grid[pos.r][pos.c].left;
            }
        };

        let steps = [current];
        while (current.r !== end.r || current.c !== end.c) {
            let cell = this.grid[current.r][current.c];
            if (canMoveForward(current, turnRight[dir])) {
                dir = turnRight[dir];
                current = moveForward(current, dir);
                steps.push(current);
            } else if (canMoveForward(current, dir)) {
                current = moveForward(current, dir);
                steps.push(current);
            } else {
                dir = turnLeft[dir];
            }
        }
        return steps;
    }

    async drawTrail(canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const cellWidth = canvas.width / this.cols;
        const cellHeight = canvas.height / this.rows;

        const steps = this.solveHandOnWall();


        const drawArrow = (x1, y1, x2, y2) => {
            const headLength = 10;
            const angle = Math.atan2(y2 - y1, x2 - x1);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
            ctx.strokeStyle = "#25C1EC";
            ctx.lineWidth = 1;
            ctx.stroke();
        };

        async function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        for (let i = 0; i < steps.length - 1; i++) {
            const current = steps[i];
            const next = steps[i + 1];

            const x1 = current.c * cellWidth + cellWidth / 2;
            const y1 = current.r * cellHeight + cellHeight / 2;
            const x2 = next.c * cellWidth + cellWidth / 2;
            const y2 = next.r * cellHeight + cellHeight / 2;

            drawArrow(x1, y1, x2, y2);
            await delay(50);
        }
    }
}
