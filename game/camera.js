// game/camera.js

class Camera {
    constructor(viewW, viewH, worldW, worldH) {
      this.x = 0;
      this.y = 0;
      this.viewW = viewW;
      this.viewH = viewH;
      this.worldW = worldW;
      this.worldH = worldH;
    }
  
    clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }
  
    follow(targetX, targetY) {
      this.x = this.clamp(targetX - this.viewW / 2, 0, this.worldW - this.viewW);
      this.y = this.clamp(targetY - this.viewH / 2, 0, this.worldH - this.viewH);
    }
  
    // snap to integer pixels to prevent seams
    get renderX() { return Math.floor(this.x); }
    get renderY() { return Math.floor(this.y); }
  }
  