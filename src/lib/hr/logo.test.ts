import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { logoImgHtml, MAX_LOGO_BYTES } from "./logo.ts";
import { createDemo } from "./seed.ts";

const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==";

describe("logoImgHtml", () => {
  it("devuelve una etiqueta img con el data URL del logo", () => {
    const data = createDemo();
    const html = logoImgHtml({ ...data.company, logo: PNG });
    assert.match(html, /^<img /);
    assert.match(html, new RegExp(PNG.replace(/[+/=]/g, (c) => `\\${c}`)));
    assert.match(html, /object-fit:contain/);
  });

  it("devuelve cadena vacía si la empresa no tiene logo", () => {
    const data = createDemo();
    assert.equal(logoImgHtml({ ...data.company, logo: undefined }), "");
    assert.equal(logoImgHtml(data.company), "");
  });

  it("escapa el nombre de la empresa en el atributo alt", () => {
    const data = createDemo();
    const html = logoImgHtml({ ...data.company, name: 'A "B" <C>', logo: PNG });
    assert.match(html, /alt="A &quot;B&quot; &lt;C&gt;"/);
  });
});

describe("MAX_LOGO_BYTES", () => {
  it("permite logos de hasta 1 MB", () => {
    assert.equal(MAX_LOGO_BYTES, 1_000_000);
  });
});
