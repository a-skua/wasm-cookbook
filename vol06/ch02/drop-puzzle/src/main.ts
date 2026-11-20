import RAPIER from "@dimforge/rapier2d-compat";

// 物理演算はメートル単位で、画面の下向きを+yとする（描画時にピクセルへ変換）
const PIXELS_PER_METER = 50;
const FIELD_WIDTH = 8; // フィールドの幅（400px）
const FIELD_HEIGHT = 12; // フィールドの高さ（600px）

// 物理演算
const GRAVITY = 9.81; // 重力加速度（m/s²）
const TIME_STEP = 1 / 60; // 1ステップの時間（world.timestep の既定値と同じ）
const MAX_FRAME_TIME = 0.25; // 1フレームで進める時間の上限（秒）

// ゲームのルール
const DROP_Y = 1; // 玉を落とす高さ（線より上）
const DEADLINE_Y = 2; // この線を越えて積み上がるとゲームオーバー
const GRACE_PERIOD = 1.5; // 出現してからこの秒数はゲームオーバーの判定をしない

// 玉の半径と色。添字をレベルと呼び、同じレベルの玉がぶつかると
// 1つ上のレベルの玉になる
const BALL_RADII = [0.3, 0.4, 0.55, 0.7, 0.9, 1.1, 1.35];
const BALL_COLORS = [
  "#e94f64", "#f28c38", "#f6c83b", "#7cc35b",
  "#3fb4c6", "#5b74d6", "#9b59c9",
];
const MAX_LEVEL = BALL_RADII.length - 1;
const DROPPABLE_LEVEL_COUNT = 3; // クリックで落とせるのはレベル0〜2

// 落とす玉のレベルをランダムに選ぶ
function randomDropLevel() {
  return Math.floor(Math.random() * DROPPABLE_LEVEL_COUNT);
}

type Ball = {
  body: RAPIER.RigidBody;
  level: number;
  createdAt: number; // 出現した時点のゲーム内時刻（秒）
};

await RAPIER.init(); // Wasmモジュールを初期化する

class Game {
  readonly world = new RAPIER.World({ x: 0, y: GRAVITY });
  readonly eventQueue = new RAPIER.EventQueue(true);
  // コライダーのハンドル → 玉（衝突イベントでハンドルが渡されるため）
  readonly balls = new Map<number, Ball>();
  score = 0;
  isGameOver = false;
  nextLevel = randomDropLevel(); // 次に落とす玉のレベル
  private elapsed = 0; // ゲーム内の経過時間（秒）

  constructor() {
    const halfWidth = FIELD_WIDTH / 2;
    const halfHeight = FIELD_HEIGHT / 2;
    const halfThickness = 0.5; // 床と壁の厚みの半分
    // 床
    this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(halfWidth, halfThickness)
        .setTranslation(halfWidth, FIELD_HEIGHT + halfThickness),
    );
    // 左右の壁。玉が画面の上へ押し出されても外へ出ないよう、
    // 画面より高くする
    this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(halfThickness, FIELD_HEIGHT)
        .setTranslation(-halfThickness, halfHeight),
    );
    this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(halfThickness, FIELD_HEIGHT)
        .setTranslation(FIELD_WIDTH + halfThickness, halfHeight),
    );
  }

  // Wasm側のメモリを解放する
  dispose() {
    this.eventQueue.free();
    this.world.free();
  }

  // 指定したx座標の上から次の玉を落とし、その次の玉を選ぶ
  drop(x: number) {
    this.addBall(x, DROP_Y, this.nextLevel);
    this.nextLevel = randomDropLevel();
  }

  // 指定した位置に、指定したレベルの玉を追加する
  private addBall(x: number, y: number, level: number) {
    const radius = BALL_RADII[level];
    // 壁にめり込まないよう、x を範囲内に収める
    const clampedX = Math.min(Math.max(x, radius), FIELD_WIDTH - radius);
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(clampedX, y)
        // 速く動いてもすり抜けないようにする
        .setCcdEnabled(true),
    );
    const collider = this.world.createCollider(
      RAPIER.ColliderDesc.ball(radius)
        .setRestitution(0.1)
        // 衝突イベントを受け取る
        .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
      body,
    );
    this.balls.set(collider.handle, {
      body,
      level,
      createdAt: this.elapsed,
    });
  }

  // 玉を物理ワールドと balls の両方から削除する
  private removeBall(handle: number, ball: Ball) {
    // 剛体に付いているコライダーも一緒に削除される
    this.world.removeRigidBody(ball.body);
    this.balls.delete(handle);
  }

  // 物理演算を1ステップ進め、合体とゲームオーバーを判定する
  step() {
    this.world.step(this.eventQueue); // Wasm側で計算する
    this.elapsed += TIME_STEP;
    this.mergeCollidedBalls();
    this.isGameOver = this.hasBallAboveDeadline();
  }

  // 同じレベルの玉がぶつかったら、1つ上のレベルの玉に合体させる
  // 合体した玉は balls から消えるので、同じ玉が2回合体することはない
  private mergeCollidedBalls() {
    this.eventQueue.drainCollisionEvents((handleA, handleB, started) => {
      if (!started) return; // ぶつかり始めたときだけ処理する
      const a = this.balls.get(handleA);
      const b = this.balls.get(handleB);
      if (!a || !b) return; // 壁や床との衝突
      if (a.level !== b.level || a.level === MAX_LEVEL) return;

      const posA = a.body.translation();
      const posB = b.body.translation();
      const x = (posA.x + posB.x) / 2; // 2つの玉の中間に出す
      const y = (posA.y + posB.y) / 2;
      const level = a.level + 1;
      this.removeBall(handleA, a);
      this.removeBall(handleB, b);
      this.addBall(x, y, level);
      this.score += level * 10; // 大きな玉ができるほど高得点
    });
  }

  // 出現してから時間が経った玉が、線より上に出ているか
  private hasBallAboveDeadline() {
    for (const { body, level, createdAt } of this.balls.values()) {
      // 玉の上端（y は下向きなので半径を引く）
      const top = body.translation().y - BALL_RADII[level];
      const pastGrace = this.elapsed - createdAt > GRACE_PERIOD;
      if (pastGrace && top < DEADLINE_Y) return true;
    }
    return false;
  }
}

// ゲームの状態をキャンバスに描く
function render(ctx: CanvasRenderingContext2D, game: Game) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);

  // ゲームオーバーの線
  ctx.strokeStyle = "#c33";
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(0, DEADLINE_Y * PIXELS_PER_METER);
  ctx.lineTo(width, DEADLINE_Y * PIXELS_PER_METER);
  ctx.stroke();
  ctx.setLineDash([]);

  // 玉
  for (const { body, level } of game.balls.values()) {
    const { x, y } = body.translation();
    ctx.fillStyle = BALL_COLORS[level];
    ctx.beginPath();
    ctx.arc(
      x * PIXELS_PER_METER,
      y * PIXELS_PER_METER,
      BALL_RADII[level] * PIXELS_PER_METER,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // ゲームオーバー画面
  if (game.isGameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("GAME OVER", width / 2, height / 2);
    ctx.font = "16px sans-serif";
    ctx.fillText("クリックでリスタート", width / 2, height / 2 + 32);
  }
}

const canvas = document.querySelector<HTMLCanvasElement>("#game")!;
const scoreLabel = document.querySelector<HTMLElement>("#score")!;
const nextBallView = document.querySelector<HTMLElement>("#next")!;
const ctx = canvas.getContext("2d")!;

let game = new Game();
let lastTime = performance.now();
let accumulated = 0; // まだ物理演算に反映していない時間（秒）

// 画面のリフレッシュレートによらず、一定の間隔で物理演算を進める
function loop(now: number) {
  const delta = (now - lastTime) / 1000; // ミリ秒 → 秒
  lastTime = now;
  // タブが非表示だった間の時間は進めすぎないよう、上限を設ける
  accumulated += Math.min(delta, MAX_FRAME_TIME);
  while (accumulated >= TIME_STEP) {
    if (!game.isGameOver) game.step();
    accumulated -= TIME_STEP;
  }
  scoreLabel.textContent = String(game.score);
  // 次の玉を、実際の大きさと色の丸で表示する
  const size = `${BALL_RADII[game.nextLevel] * 2 * PIXELS_PER_METER}px`;
  nextBallView.style.width = size;
  nextBallView.style.height = size;
  nextBallView.style.background = BALL_COLORS[game.nextLevel];
  render(ctx, game);
  requestAnimationFrame(loop);
}

// ゲームオーバー中ならリスタートし、それ以外はクリックした位置に玉を落とす
canvas.addEventListener("click", (event) => {
  if (game.isGameOver) {
    game.dispose();
    game = new Game();
    return;
  }
  game.drop(event.offsetX / PIXELS_PER_METER);
});

requestAnimationFrame(loop);
