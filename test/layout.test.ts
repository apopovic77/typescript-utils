// Flächen-Layouter: Neigung, Raster- und Hex-Optionen; Standard unverändert gegenüber 1.4.1.
// Aufruf: npm test (baut dist und vergleicht mit OLD_DIST, falls gesetzt)
import { Layouters } from '../src/layout/index';

let fail = 0;
const ok = (c: boolean, m: string) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fail++; };
const near = (a: number, b: number, e = 1e-9) => Math.abs(a - b) < e;
const uniq = (xs: number[]) => new Set(xs.map((v) => v.toFixed(6))).size;
// z of the local +z axis after the Euler rotation (XYZ, as three.js): +1 = faces +z, -1 = faces -z
const facingZ = (r: { x: number; y: number; z: number }) => Math.cos(r.x) * Math.cos(r.y);
const base: any = { objectCount: 23, spacingMode: 'margin', spacing: 2, orientation: 'aligned', upMode: 'world' };

// Standard = alte 45°-Fläche
const def = Layouters.planeGrid(base);
ok(def.every((t) => near(t.position.y, -t.position.z)), 'planeGrid default: 45° slope (y = -z)');

// Neigung
const ground = Layouters.planeGrid({ ...base, planeTilt: 0 });
ok(ground.every((t) => near(t.position.y, 0)), 'planeTilt 0: flat on the ground (y = 0)');
const wall = Layouters.planeGrid({ ...base, planeTilt: Math.PI / 2 });
ok(wall.every((t) => near(t.position.z, 0, 1e-9)), 'planeTilt PI/2: upright wall (z = 0)');
ok(near(facingZ(def[0].rotation), -1), 'world/aligned on the 45° slope: tiles face -z (as in 1.4.1)');
ok(near(facingZ(ground[0].rotation), 1), 'world/aligned on the ground: forward is vertical, tiles fall back to +z');
const flipped = Layouters.planeGrid({ ...base, flip180: true });
ok(near(facingZ(flipped[0].rotation), 1), 'flip180 on the 45° slope: tiles face +z');

// Raster
const rows2 = Layouters.planeGrid({ ...base, planeTilt: 0, gridRows: 2 });
ok(uniq(rows2.map((t) => t.position.z)) === 2 && uniq(rows2.map((t) => t.position.x)) === 12, 'gridRows 2: two rows, cols from count (12)');
const cols7 = Layouters.planeGrid({ ...base, planeTilt: 0, gridCols: 7 });
ok(uniq(cols7.map((t) => t.position.x)) === 7 && uniq(cols7.map((t) => t.position.z)) === 4, 'gridCols 7: seven cols, four rows');
const auto = Layouters.planeGrid({ ...base, planeTilt: 0, gridMode: 'auto', gridRows: 2 });
ok(uniq(auto.map((t) => t.position.z)) === 5, "explicit gridMode 'auto' ignores rows (23 → 5 × 5)");

// Hex
const radial = Layouters.planeHex({ ...base, objectCount: 7, planeTilt: 0 });
const row = Layouters.planeHex({ ...base, objectCount: 7, planeTilt: 0, hexMode: 'row', hexRings: 3 });
ok(near(radial[0].position.x, 0) && near(radial[0].position.z, 0), 'planeHex default: radial, first at the centre');
ok(uniq(row.map((t) => t.position.z)) === 3, "planeHex hexMode 'row', hexRings 3: three objects per row");
const rings = Layouters.planeHexRings({ ...base, objectCount: 19, planeTilt: 0, hexRings: 1 });
ok(rings.slice(7).every((t) => near(t.position.x, 0) && near(t.position.z, 0)), 'planeHexRings hexRings 1: only the first ring is placed');

// Gleichheit mit der veröffentlichten Version (optional)
if (process.env.OLD_DIST) {
  const old = (await import(process.env.OLD_DIST)).Layouters as any; // gebündelte Fassung der veröffentlichten Version
  // gleich bis auf Rundung (cos 45° und sin 45° unterscheiden sich in der letzten Stelle)
  const flat = (ts: any[]) => ts.flatMap((t) => [t.position.x, t.position.y, t.position.z, t.rotation.x, t.rotation.y, t.rotation.z]);
  const same = (a: any[], b: any[]) => a.length === b.length && flat(a).every((v, i) => near(v, flat(b)[i], 1e-9));
  for (const name of ['planeGrid', 'planeHex', 'planeHexRings']) {
    for (const cfg of [base, { ...base, upMode: 'path' }, { ...base, orientation: 'perpendicular' }, { ...base, flip180: true }, { ...base, spacingMode: 'distribute' }]) {
      ok(same((Layouters as any)[name](cfg), old[name](cfg)), `${name} ${JSON.stringify({ o: cfg.orientation, u: cfg.upMode, f: !!cfg.flip180, s: cfg.spacingMode })}: unchanged without new options`);
    }
  }
}

console.log(fail ? `${fail} FAILED` : 'ALL PASSED');
process.exit(fail ? 1 : 0);
