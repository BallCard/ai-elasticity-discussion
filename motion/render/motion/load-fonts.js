import {cancelRender, continueRender, delayRender, staticFile} from "remotion";

export const SOURCE_HAN_FAMILY = "Source Han Serif CN";

// Load the user's actual installed font files. A failed load cancels rendering;
// silent substitution would violate the requested typography.
if (typeof document !== "undefined") {
  const handle = delayRender("Loading the user's Source Han Serif CN fonts");
  Promise.all([
    ["Regular", "400"], ["Medium", "500"], ["Bold", "700"],
  ].map(async ([name, weight]) => {
    const face = new FontFace(SOURCE_HAN_FAMILY,
      `url("${staticFile(`fonts/SourceHanSerifCN-${name}.otf`)}") format("opentype")`,
      {weight, style: "normal"});
    await face.load();
    document.fonts.add(face);
    return {family: face.family, weight: face.weight, status: face.status};
  })).then(faces => {
    window.__ELASTICITY_FONTS = faces;
    continueRender(handle);
  }).catch(error => cancelRender(error));
}
