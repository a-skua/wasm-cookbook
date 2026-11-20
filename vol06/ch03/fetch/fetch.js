// `example:fetch/fetch`のホスト実装
//
// WITの`resource response`としてJSの`Response`をそのまま渡す．
// jcoはresourceのメソッドを`obj.status()`のように関数として呼び出すが，
// JSの`Response.status`はgetterなので，サブクラスで関数として公開する．
// (`text()`は`Response.text()`がそのまま使われる)
export class Response extends globalThis.Response {
  status() {
    return super.status;
  }
}

// WITの`future<result<response>>`はJSでは`Promise<Result>`として扱われる．
export async function fetch(url) {
  try {
    const res = await globalThis.fetch(url);
    // jcoは`instanceof Response`で検査するため，ボディ等を引き継いでサブクラスに包み直す
    return {
      tag: "ok",
      val: new Response(res.body, res),
    };
  } catch (e) {
    console.error(e);
    return { tag: "err", val: undefined };
  }
}
