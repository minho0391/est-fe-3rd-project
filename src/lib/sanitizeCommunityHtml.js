/**
 * 커뮤니티 본문 출력용 allowlist sanitizer.
 * DB에는 에디터 원본 HTML을 보존하고, 브라우저에 렌더링하기 직전에만 사용합니다.
 */
const ALLOWED_TAGS = new Set([
  "P",
  "BR",
  "DIV",
  "SPAN",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "S",
  "STRIKE",
  "BLOCKQUOTE",
  "UL",
  "OL",
  "LI",
  "H1",
  "H2",
  "H3",
  "A",
  "IMG",
  "IFRAME",
  "VIDEO",
  "SOURCE",
]);
const GLOBAL_ATTRS = new Set(["class"]);
const ATTRS = {
  A: new Set(["href", "target", "rel"]),
  IMG: new Set(["src", "alt", "width", "height"]),
  IFRAME: new Set([
    "src",
    "width",
    "height",
    "frameborder",
    "allow",
    "allowfullscreen",
    "title",
  ]),
  VIDEO: new Set(["src", "width", "height", "controls", "poster"]),
  SOURCE: new Set(["src", "type"]),
};
const SAFE_IFRAME_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
]);

const safeUrl = (value, { iframe = false } = {}) => {
  try {
    const url = new URL(value, window.location.origin);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    if (iframe && !SAFE_IFRAME_HOSTS.has(url.hostname.toLowerCase())) return "";
    return url.href;
  } catch {
    return "";
  }
};

export const sanitizeCommunityHtml = html => {
  if (typeof window === "undefined" || !html) return "";
  const doc = new DOMParser().parseFromString(String(html), "text/html");

  [...doc.body.querySelectorAll("*")].forEach(node => {
    if (!ALLOWED_TAGS.has(node.tagName)) {
      node.replaceWith(...node.childNodes);
      return;
    }

    [...node.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();
      const allowed = GLOBAL_ATTRS.has(name) || ATTRS[node.tagName]?.has(name);
      if (!allowed || name.startsWith("on") || name === "style")
        node.removeAttribute(attr.name);
    });

    if (node.tagName === "IFRAME") {
      const src = safeUrl(node.getAttribute("src"), { iframe: true });
      if (!src) {
        node.remove();
        return;
      }
      node.setAttribute("src", src);
      node.setAttribute("loading", "lazy");
      node.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      node.setAttribute("allowfullscreen", "");
    }

    if (["A", "IMG", "VIDEO", "SOURCE"].includes(node.tagName)) {
      const attr = node.tagName === "A" ? "href" : "src";
      const value = node.getAttribute(attr);
      if (value) {
        const normalized = safeUrl(value);
        if (!normalized) node.removeAttribute(attr);
        else node.setAttribute(attr, normalized);
      }
      if (node.tagName === "A") {
        node.setAttribute("rel", "noopener noreferrer");
        if (node.getAttribute("target") === "_blank")
          node.setAttribute("target", "_blank");
      }
    }
  });

  return doc.body.innerHTML;
};
