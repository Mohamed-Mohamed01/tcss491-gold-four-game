// game/tilemap.js
// TileMap (Tiled TMJ):
// - Loads a Tiled .tmj JSON map (main.js calls loadFromTiledTMJ)
// - Provides world size + player spawn position (used by player.js)
// - Draws tile layers + tile-object layers (main draw loop)
// - Reads solid rectangles from "Colliders" object layer for collision
// - Exposes isBlockedAtWorld(x,y) for Player/Enemy/Projectile movement (player.js, enemy.js, projectile.js)
//
// Tileset support:
// 1) External tilesets (.tsx / spritesheet): map tileset NAME -> AssetManager key queued in main.js
// 2) Collection-of-images tilesets: each tile has its own image path; we normalize to AssetManager keys

class TileMap {
  constructor(game, assetManager) {
    this.game = game;
    this.AM = assetManager;

    this.TILE_SIZE = 32;

    // Map dimensions (tiles + world pixels)
    this.COLS = 0;
    this.ROWS = 0;
    this.WORLD_W = 0;
    this.WORLD_H = 0;

    // Player spawn (world px) read from Objects layer object named "player_spawn"
    this.spawnX = 0;
    this.spawnY = 0;

    // Raw TMJ JSON stored after load
    this._map = null;

    // Tile layers by name -> tilelayer object
    this.layers = {};

    // Solid collision rectangles read from "Colliders" objectgroup
    this.tiledColliders = []; // {x,y,w,h,type}

    // Tilesets resolved from map.tilesets (sorted by firstgid)
    this.tilesets = [];

    // Cache: gid -> { ts, localId }
    this._gidCache = new Map();
  }

  // Loads TMJ JSON from URL and builds layers/tilesets/colliders/spawn points
  async loadFromTiledTMJ(url) {
    const map = await fetch(url).then((r) => r.json());
    this._map = map;

    // Dimensions
    this.COLS = map.width;
    this.ROWS = map.height;
    this.WORLD_W = this.COLS * this.TILE_SIZE;
    this.WORLD_H = this.ROWS * this.TILE_SIZE;

    // Tile layers (Ground/Walls/Decor are drawn in draw())
    this.layers = {};
    for (const layer of map.layers ?? []) {
      if (layer.type === "tilelayer") {
        this.layers[layer.name] = layer;
      }
    }

    // Player spawn point: object named "player_spawn" inside "Objects" objectgroup
    const objectsLayer = (map.layers ?? []).find(
      (l) => l.type === "objectgroup" && l.name === "Objects"
    );
    const spawn = objectsLayer?.objects?.find((o) => o.name === "player_spawn");
    if (spawn) {
      this.spawnX = spawn.x;
      this.spawnY = spawn.y;
    } else {
      // Fallback: center of map
      this.spawnX = this.WORLD_W / 2;
      this.spawnY = this.WORLD_H / 2;
    }

    // Colliders: solid rectangles used by isBlockedAtWorld()
    const collidersLayer = (map.layers ?? []).find(
      (l) => l.type === "objectgroup" && l.name === "Colliders"
    );

    this.tiledColliders = (collidersLayer?.objects ?? []).map((o) => {
      const propType = (o.properties ?? []).find((p) => p.name === "type")?.value;
      return {
        x: o.x,
        y: o.y,
        w: o.width ?? 0,
        h: o.height ?? 0,
        type: propType || "solid",
      };
    });

    // Point objects used as spawn markers (used by main.js to place keys/scrolls)
    this.keySpawns = [];    // [{ name, x, y }]
    this.scrollSpawns = []; // [{ name, x, y }]

    const anyObjectLayers = (map.layers ?? []).filter(l => l.type === "objectgroup");

    for (const ol of anyObjectLayers) {
      for (const o of (ol.objects ?? [])) {
        if (!o.point) continue;

        if (o.name === "key1" || o.name === "key2" || o.name === "key3") {
          this.keySpawns.push({ name: o.name, x: o.x, y: o.y });
        }

        if (o.name === "story_scroll") {
          this.scrollSpawns.push({ name: o.name, x: o.x, y: o.y });
        }
      }
    }

    // Resolve tilesets (external spritesheets + per-tile image collections)
    this._buildTilesetsFromMap(map);

    // Clear gid cache for new map
    this._gidCache.clear();
  }

  // Builds this.tilesets from TMJ tileset definitions
  _buildTilesetsFromMap(map) {
    // External tilesets: tileset NAME -> AssetManager key (queued in main.js)
    this.tilesetImageByName = {
      grass: "assets/images/tiles/grass.png",
      dirt1: "assets/images/tiles/dirt1.png",
      dirt2: "assets/images/tiles/dirt2.png",
      dirt3: "assets/images/tiles/dirt3.png",
      dirt4: "assets/images/tiles/dirt4.png",
      dirt5: "assets/images/tiles/dirt5.png",
      walls: "assets/images/tiles/walls.png",

      FieldsTileset: "assets/images/tiles/FieldsTileset.png",
    };

    const raw = map.tilesets ?? [];

    const built = raw.map((ts) => {
      // Use embedded name or derive from tsx filename
      const name =
        ts.name ||
        (ts.source ? ts.source.split("/").pop().replace(".tsx", "") : "tileset");

      // Collection-of-images tileset: each tile has its own image path
      const isCollection = Array.isArray(ts.tiles) && !ts.image;

      if (isCollection) {
        const tilesByLocalId = new Map();
        for (const t of ts.tiles) {
          const localId = t.id;
          const imageKey = this._normalizeTiledImagePathToAssetKey(t.image);

          tilesByLocalId.set(localId, {
            imageKey,
            w: t.imagewidth ?? this.TILE_SIZE,
            h: t.imageheight ?? this.TILE_SIZE,
          });
        }

        return {
          firstgid: ts.firstgid,
          name,
          kind: "collection",
          tilewidth: ts.tilewidth ?? this.TILE_SIZE,
          tileheight: ts.tileheight ?? this.TILE_SIZE,
          tilesByLocalId,
        };
      }

      // External / spritesheet tileset
      return {
        firstgid: ts.firstgid,
        name,
        kind: "external",
        tilewidth: ts.tilewidth ?? this.TILE_SIZE,
        tileheight: ts.tileheight ?? this.TILE_SIZE,
        imageKey: this.tilesetImageByName[name] || null,
      };
    });

    // Sort by firstgid so GID resolution works correctly
    built.sort((a, b) => a.firstgid - b.firstgid);
    this.tilesets = built;
  }

  // Converts a Tiled tile-image path into the AssetManager key used by queueDownload (main.js)
  _normalizeTiledImagePathToAssetKey(tiledPath) {
    if (!tiledPath) return null;

    const idx = tiledPath.lastIndexOf("assets/");
    if (idx !== -1) {
      return tiledPath.slice(idx).replace(/\\/g, "/");
    }

    const base = tiledPath.split("/").pop().split("\\").pop();
    return `assets/images/tiles/${base}`;
  }

  // Finds which tileset a gid belongs to
  _getTilesetForGid(gid) {
    let best = null;
    for (const ts of this.tilesets) {
      if (gid >= ts.firstgid) best = ts;
      else break;
    }
    return best;
  }

  // Resolves a raw gid into { ts, localId } and strips Tiled flip flags
  _resolveGid(gidRaw) {
    if (!gidRaw) return null;

    const FLIP_H = 0x80000000;
    const FLIP_V = 0x40000000;
    const FLIP_D = 0x20000000;
    const gid = gidRaw & ~(FLIP_H | FLIP_V | FLIP_D);

    if (this._gidCache.has(gid)) return this._gidCache.get(gid);

    const ts = this._getTilesetForGid(gid);
    if (!ts) {
      this._gidCache.set(gid, null);
      return null;
    }

    const localId = gid - ts.firstgid;
    const out = { ts, localId };
    this._gidCache.set(gid, out);
    return out;
  }

  // Returns true if a point hits any "solid" collider rectangle
  _pointHitsSolidCollider(x, y) {
    for (const r of this.tiledColliders) {
      if (r.type !== "solid") continue;
      if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return true;
    }
    return false;
  }

  // Main collision query used by Player/Enemy/Projectile movement
  isBlockedAtWorld(x, y) {
    if (x < 0 || y < 0 || x >= this.WORLD_W || y >= this.WORLD_H) return true;
    return this._pointHitsSolidCollider(x, y);
  }

  // Draws visible tiles + objects based on the current camera viewport
  draw(ctx, camera) {
    ctx.imageSmoothingEnabled = false;

    const camX = camera.renderX;
    const camY = camera.renderY;

    // Only draw tiles inside the camera bounds
    const startCol = Math.floor(camX / this.TILE_SIZE);
    const endCol = Math.ceil((camX + ctx.canvas.width) / this.TILE_SIZE);
    const startRow = Math.floor(camY / this.TILE_SIZE);
    const endRow = Math.ceil((camY + ctx.canvas.height) / this.TILE_SIZE);

    // Tile layers (order matters visually)
    this._drawTileLayer(ctx, camera, this.layers["Ground"], startRow, endRow, startCol, endCol);
    this._drawTileLayer(ctx, camera, this.layers["Walls"], startRow, endRow, startCol, endCol);
    this._drawTileLayer(ctx, camera, this.layers["Decor"], startRow, endRow, startCol, endCol);

    // Tile-objects (object layers that store gid-based objects like trees/rocks/etc)
    this._drawObjectGroup(ctx, camera, "Decor Object");
    this._drawObjectGroup(ctx, camera, "Objects");
    this._drawObjectGroup(ctx, camera, "Ground Objects");

    // Optional collider debug overlay
    if (this.game.debug) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,0,0,0.9)";
      ctx.lineWidth = 2;
      for (const r of this.tiledColliders) {
        ctx.strokeRect(r.x - camX, r.y - camY, r.w, r.h);
      }
      ctx.restore();
    }
  }

  // Draws a tilelayer grid using resolved gid -> tileset lookup
  _drawTileLayer(ctx, camera, layer, startRow, endRow, startCol, endCol) {
    if (!layer || !layer.data) return;

    const camX = camera.renderX;
    const camY = camera.renderY;

    for (let r = startRow; r < endRow; r++) {
      if (r < 0 || r >= this.ROWS) continue;

      for (let c = startCol; c < endCol; c++) {
        if (c < 0 || c >= this.COLS) continue;

        const idx = r * this.COLS + c;
        const gidRaw = layer.data[idx];
        if (!gidRaw || gidRaw === 0) continue;

        const res = this._resolveGid(gidRaw);
        if (!res) continue;

        const { ts, localId } = res;

        const x = c * this.TILE_SIZE - camX;
        const y = r * this.TILE_SIZE - camY;

        // External spritesheet tileset
        if (ts.kind === "external") {
          if (!ts.imageKey) continue;
          const img = this.AM.getAsset(ts.imageKey);
          if (!img) continue;

          const tw = ts.tilewidth || this.TILE_SIZE;
          const th = ts.tileheight || this.TILE_SIZE;
          const cols = Math.max(1, Math.floor(img.width / tw));

          const sx = (localId % cols) * tw;
          const sy = Math.floor(localId / cols) * th;

          ctx.drawImage(img, sx, sy, tw, th, x, y, this.TILE_SIZE, this.TILE_SIZE);
          continue;
        }

        // Collection-of-images tileset
        if (ts.kind === "collection") {
          const tile = ts.tilesByLocalId.get(localId);
          if (!tile) continue;

          const img = this.AM.getAsset(tile.imageKey);
          if (!img) continue;

          ctx.drawImage(img, x, y, this.TILE_SIZE, this.TILE_SIZE);
          continue;
        }
      }
    }
  }

  // Draws a Tiled objectgroup that contains gid-based tile objects
  _drawObjectGroup(ctx, camera, layerName) {
    if (!this._map) return;

    const layer = (this._map.layers || []).find(
      (l) => l.type === "objectgroup" && l.name === layerName
    );
    if (!layer) return;

    const camX = camera.renderX;
    const camY = camera.renderY;

    // Sort by y so objects lower on screen overlap naturally
    const objs = [...(layer.objects || [])].sort((a, b) => (a.y || 0) - (b.y || 0));

    for (const o of objs) {
      // Skip point objects (spawns/markers) and non-tile objects
      if (o.point) continue;
      if (!o.gid) continue;

      const res = this._resolveGid(o.gid);
      if (!res) continue;

      const { ts, localId } = res;

      // Tile objects are anchored at bottom-left (Tiled convention)
      const drawX = o.x - camX;
      const drawY = (o.y - camY) - (o.height || 0);

      const outW = o.width || this.TILE_SIZE;
      const outH = o.height || this.TILE_SIZE;

      if (ts.kind === "collection") {
        const tile = ts.tilesByLocalId.get(localId);
        if (!tile) continue;

        const img = this.AM.getAsset(tile.imageKey);
        if (!img) continue;

        const w = o.width || img.width;
        const h = o.height || img.height;

        ctx.drawImage(img, drawX, drawY, w, h);
        continue;
      }

      if (ts.kind === "external") {
        if (!ts.imageKey) continue;
        const img = this.AM.getAsset(ts.imageKey);
        if (!img) continue;

        const tw = ts.tilewidth || this.TILE_SIZE;
        const th = ts.tileheight || this.TILE_SIZE;
        const cols = Math.max(1, Math.floor(img.width / tw));

        const sx = (localId % cols) * tw;
        const sy = Math.floor(localId / cols) * th;

        ctx.drawImage(img, sx, sy, tw, th, drawX, drawY, outW, outH);
        continue;
      }
    }
  }
}
