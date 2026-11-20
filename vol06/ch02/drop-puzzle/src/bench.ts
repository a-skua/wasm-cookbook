import Matter from "matter-js";

// 同じシーン（箱の中に玉を並べて落とす）を各エンジンで作り、
// step() 1回あたりの時間とfpsを計測する

// 物理演算はメートル単位で、画面の下向きを+yとする（描画時にピクセルへ変換）
const PIXELS_PER_METER = 50;
const GRAVITY = 9.81; // 重力加速度（m/s²）
const TIME_STEP = 1 / 60; // 1ステップの時間（world.timestep の既定値と同じ）

// 計測するシーン（どのエンジンでも同じ条件にする）
const BOX_SIZE = 12; // 箱の幅と高さ（m）
const WALL_THICKNESS = 1; // 床と壁の厚さ（m）
const BALL_RADIUS = 0.08; // 玉の半径（m）
const BALL_SPACING = BALL_RADIUS * 2.2; // 玉を並べる間隔（m）
const SPAWN_MARGIN = 0.5; // 玉を並べるとき、壁と床から空ける距離（m）

const SAMPLE_SIZE = 60; // 平均を取るフレーム数

const ENGINES = ["matter", "rapier", "rapier-simd"] as const;
type EngineName = (typeof ENGINES)[number];

function isEngineName(value: string): value is EngineName {
  return (ENGINES as readonly string[]).includes(value);
}

type Vector = { x: number; y: number };

// エンジンごとの違いを隠し、同じ手順で計測できるようにする
type Simulation = {
  step(): void; // TIME_STEP だけ進める
  positions(): Vector[]; // すべての玉の位置（m）
  dispose(): void; // エンジンが確保したメモリを解放する
};

// index 番目の玉の初期位置（m）。箱の下から格子状に並べる
function spawnPoint(index: number): Vector {
  const perRow = Math.floor((BOX_SIZE - SPAWN_MARGIN * 2) / BALL_SPACING);
  // 格子状に並べたままだと真下に積み重なるため、少しだけ横にずらす。
  // どのエンジンでも同じ配置になるよう、乱数ではなくsinを使う
  const offset = Math.sin(index) * 0.01;
  return {
    x: SPAWN_MARGIN + (index % perRow) * BALL_SPACING + offset,
    y: BOX_SIZE - SPAWN_MARGIN - Math.floor(index / perRow) * BALL_SPACING,
  };
}

// SIMD版と通常版はAPIが同じなので、通常版の型として扱う
type Rapier = typeof import("@dimforge/rapier2d-compat").default;

// Rapier（SIMD版または通常版）を読み込み、Wasmモジュールを初期化する
async function loadRapier(simd: boolean): Promise<Rapier> {
  const rapierModule = simd
    ? await import("@dimforge/rapier2d-simd-compat")
    : await import("@dimforge/rapier2d-compat");
  const RAPIER = rapierModule.default as unknown as Rapier;
  await RAPIER.init();
  return RAPIER;
}

// Rapierで、count 個の玉を並べたシーンを作る
async function createRapierSimulation(
  count: number,
  simd: boolean,
): Promise<Simulation> {
  const RAPIER = await loadRapier(simd);
  const { ColliderDesc, RigidBodyDesc } = RAPIER;
  const halfSize = BOX_SIZE / 2;
  const halfThickness = WALL_THICKNESS / 2;
  const world = new RAPIER.World({ x: 0, y: GRAVITY });
  // 床
  world.createCollider(
    ColliderDesc.cuboid(halfSize, halfThickness)
      .setTranslation(halfSize, BOX_SIZE + halfThickness),
  );
  // 左右の壁。玉の数が多いと箱より上まで並ぶので、箱より高くする
  world.createCollider(
    ColliderDesc.cuboid(halfThickness, BOX_SIZE)
      .setTranslation(-halfThickness, halfSize),
  );
  world.createCollider(
    ColliderDesc.cuboid(halfThickness, BOX_SIZE)
      .setTranslation(BOX_SIZE + halfThickness, halfSize),
  );

  const balls = Array.from({ length: count }, (_, index) => {
    const { x, y } = spawnPoint(index);
    const body = world.createRigidBody(
      RigidBodyDesc.dynamic().setTranslation(x, y),
    );
    world.createCollider(ColliderDesc.ball(BALL_RADIUS), body);
    return body;
  });

  return {
    step: () => world.step(), // 時間刻みは既定値（TIME_STEP と同じ）
    positions: () => balls.map((body) => body.translation()),
    dispose: () => world.free(),
  };
}

// matter.jsで、count 個の玉を並べたシーンを作る
function createMatterSimulation(count: number): Simulation {
  // matter.jsはピクセル単位で扱う前提のため、ピクセルに換算して作る
  const { Bodies, Composite, Engine } = Matter;
  const toPixels = (meters: number) => meters * PIXELS_PER_METER;
  const engine = Engine.create();
  // matter.jsの重力は「ピクセル/ミリ秒²」単位で、既定値のままでは
  // 20m/s²相当になるため、9.81m/s²にそろえる
  engine.gravity.scale = (GRAVITY * PIXELS_PER_METER) / 1000 ** 2;
  const size = toPixels(BOX_SIZE);
  const wall = toPixels(WALL_THICKNESS);
  const wallOptions = { isStatic: true };
  // 床と左右の壁（Rapierと同じく、壁は箱より高くする）
  // Bodies.rectangle には中心の座標と、幅・高さを渡す
  Composite.add(engine.world, [
    Bodies.rectangle(size / 2, size + wall / 2, size, wall, wallOptions),
    Bodies.rectangle(-wall / 2, size / 2, wall, size * 2, wallOptions),
    Bodies.rectangle(size + wall / 2, size / 2, wall, size * 2, wallOptions),
  ]);

  const balls = Array.from({ length: count }, (_, index) => {
    const { x, y } = spawnPoint(index);
    // Rapierにそろえて、空気抵抗（既定値0.01）をなくす
    return Bodies.circle(toPixels(x), toPixels(y), toPixels(BALL_RADIUS), {
      frictionAir: 0,
    });
  });
  Composite.add(engine.world, balls);

  return {
    step: () => Engine.update(engine, TIME_STEP * 1000), // ミリ秒で指定する
    positions: () =>
      balls.map(({ position }) => ({
        x: position.x / PIXELS_PER_METER,
        y: position.y / PIXELS_PER_METER,
      })),
    dispose: () => Engine.clear(engine),
  };
}

// エンジン名に応じたシミュレーションを作る
async function createSimulation(
  engine: EngineName,
  count: number,
): Promise<Simulation> {
  switch (engine) {
    case "matter":
      return createMatterSimulation(count);
    case "rapier":
      return createRapierSimulation(count, false);
    case "rapier-simd":
      return createRapierSimulation(count, true);
  }
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// 直近の SAMPLE_SIZE 個だけを残して値を追加する
function pushSample(samples: number[], value: number) {
  samples.push(value);
  if (samples.length > SAMPLE_SIZE) samples.shift();
}

// 玉の位置をキャンバスに描く
function render(ctx: CanvasRenderingContext2D, simulation: Simulation) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#3f6fd6";
  for (const { x, y } of simulation.positions()) {
    ctx.beginPath();
    ctx.arc(
      x * PIXELS_PER_METER,
      y * PIXELS_PER_METER,
      BALL_RADIUS * PIXELS_PER_METER,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

const canvas = document.querySelector<HTMLCanvasElement>("#view")!;
const ctx = canvas.getContext("2d")!;
const form = document.querySelector<HTMLFormElement>("#controls")!;
const engineSelect = document.querySelector<HTMLSelectElement>("#engine")!;
const countSelect = document.querySelector<HTMLSelectElement>("#count")!;
const stats = document.querySelector<HTMLElement>("#stats")!;

let currentSimulation: Simulation | undefined;
let runId = 0; // 古い計測のループを止めるための番号

// 指定したエンジンと玉の数で、計測を始める（前の計測は止める）
async function start(engine: EngineName, count: number) {
  const id = ++runId;
  currentSimulation?.dispose();
  const simulation = await createSimulation(engine, count);
  currentSimulation = simulation;

  const stepTimes: number[] = []; // step() 1回にかかった時間（ミリ秒）
  const frameTimes: number[] = []; // フレームの間隔（ミリ秒）
  let lastTime = performance.now();

  const loop = (now: number) => {
    if (id !== runId) return; // 新しい計測が始まったら止める

    // 描画は含めず、step() にかかった時間だけを測る
    const stepStart = performance.now();
    simulation.step();
    pushSample(stepTimes, performance.now() - stepStart);
    pushSample(frameTimes, now - lastTime);
    lastTime = now;

    render(ctx, simulation);

    const stepMs = average(stepTimes);
    const fps = 1000 / average(frameTimes);
    stats.textContent = `${engine} / ${count}個 — `
      + `step: ${stepMs.toFixed(2)}ms, ${fps.toFixed(0)}fps`;
    // 自動計測用に、計測値と平均に使ったフレーム数を data 属性にも書き出す
    stats.dataset.stepMs = String(stepMs);
    stats.dataset.frames = String(stepTimes.length);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// 「開始」ボタンで、選択欄の条件で計測を始める
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const engine = engineSelect.value;
  if (isEngineName(engine)) start(engine, Number(countSelect.value));
});

// ?engine=rapier&n=2000 のように指定すると、すぐに計測を始める
const params = new URLSearchParams(location.search);
const engineParam = params.get("engine");
if (engineParam && isEngineName(engineParam)) {
  // 選択欄の表示も、指定した条件に合わせる
  engineSelect.value = engineParam;
  countSelect.value = params.get("n") ?? "1000";
  start(engineParam, Number(countSelect.value));
}
