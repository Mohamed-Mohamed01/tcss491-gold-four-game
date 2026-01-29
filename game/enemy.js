export class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
  }

  update(player) {
    // later: move toward player
  }

  draw(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
