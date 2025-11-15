// DOM要素の取得
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultDiv = document.getElementById('result');

let stream = null;
let isProcessing = false;

// OpenCV.js読み込み完了時のコールバック
function onOpenCvReady() {
  console.log('OpenCV.js is ready');
  // カメラを起動
  startCamera();
}

// カメラの起動
async function startCamera() {
  try {
    // カメラへのアクセスを要求
    stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        width: 640,
        height: 480,
        facingMode: 'environment'  // 背面カメラを優先
      }
    });

    // videoタグにストリームを設定
    video.srcObject = stream;
    
    // メタデータ読み込み後に処理開始
    video.onloadedmetadata = () => {
      isProcessing = true;
      processVideo();
    };
  } catch (err) {
    console.error('カメラアクセスエラー:', err);
    resultDiv.textContent = 'カメラにアクセスできません';
  }
}

// ビデオフレームの処理
function processVideo() {
  if (!isProcessing) return;

  // videoの内容をcanvasに描画
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // QRコード検出
  detectQRCode();
  // 次のフレームを処理
  requestAnimationFrame(processVideo);
}

// QRコード検出処理
function detectQRCode() {
  // canvasからOpenCVのMat形式に変換
  let src = cv.imread(canvas);
  let processed = new cv.Mat();

  // グレースケール化
  cv.cvtColor(src, processed, cv.COLOR_RGBA2GRAY);

  // ガウシアンぼかしでノイズ除去
  cv.GaussianBlur(processed, processed, new cv.Size(5, 5), 0);

  // 適応的二値化（照明ムラに強い）
  cv.adaptiveThreshold(
    processed, processed, 255,
    cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv.THRESH_BINARY,
    11, 2
  );

  // 処理後の画像をcanvasに反映
  cv.imshow(canvas, processed);

  // canvasから画像データを取得
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // jsQRライブラリでQRコードを検出
  const code = jsQR(imageData.data, imageData.width, imageData.height);

  if (code) {
    // QRコードが検出された場合
    resultDiv.textContent = '検出: ' + code.data;
    resultDiv.className = 'success';

    // 検出位置に枠を描画
    drawBoundingBox(code);
  } else {
    // QRコードが検出されない場合
    resultDiv.textContent = 'QRコードをカメラに映してください';
    resultDiv.className = '';
  }

  // メモリ解放（重要！）
  src.delete();
  processed.delete();
}

// QRコードの位置に枠を描画
function drawBoundingBox(code) {
  if (!code.location) return;

  // 緑色の枠線を設定
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 3;

  // 四角形を描画
  ctx.beginPath();
  ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
  ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
  ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
  ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
  ctx.closePath();
  ctx.stroke();
}

// ページ終了時にカメラを停止
window.addEventListener('beforeunload', () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
});
