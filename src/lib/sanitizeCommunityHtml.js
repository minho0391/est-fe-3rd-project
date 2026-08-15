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

const toVideoEmbedUrl = value => {
  try {
    const url = new URL(String(value ?? "").trim(), window.location.origin);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        const videoId = url.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }

      const match = url.pathname.match(/^\/(?:shorts|embed)\/([^/?#]+)/);
      return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : "";
    }

    if (host === "vimeo.com") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return /^\d+$/.test(videoId ?? "")
        ? `https://player.vimeo.com/video/${videoId}`
        : "";
    }

    if (host === "player.vimeo.com") {
      const match = url.pathname.match(/^\/video\/(\d+)/);
      return match?.[1] ? `https://player.vimeo.com/video/${match[1]}` : "";
    }

    return "";
  } catch {
    return "";
  }
};

/**
 * Quill에서 일반 링크로 남은 YouTube/Vimeo URL을 영상 iframe으로 정규화합니다.
 * 기존 게시글 데이터도 상세 렌더링 시 정상적으로 영상으로 복구할 수 있습니다.
 */
const normalizeVideoEmbedsInDocument = doc => {
  [...doc.body.querySelectorAll("a[href]")].forEach(anchor => {
    const embedUrl = toVideoEmbedUrl(anchor.getAttribute("href"));
    if (!embedUrl) return;

    const iframe = doc.createElement("iframe");
    iframe.setAttribute("class", "ql-video");
    iframe.setAttribute("src", embedUrl);
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    );
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("title", "Embedded video");

    const parent = anchor.parentElement;
    if (
      parent?.tagName === "P" &&
      parent.textContent?.trim() === anchor.textContent?.trim()
    ) {
      parent.replaceWith(iframe);
    } else {
      anchor.replaceWith(iframe);
    }
  });
};

export const normalizeCommunityVideoEmbeds = html => {
  if (typeof window === "undefined" || !html) return String(html ?? "");

  const doc = new DOMParser().parseFromString(String(html), "text/html");
  normalizeVideoEmbedsInDocument(doc);

  return doc.body.innerHTML;
};

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
  normalizeVideoEmbedsInDocument(doc);

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

    if (node.tagName === "IMG") {
      // 본문 이미지는 별도 설명 입력 구조가 없어 장식 이미지로 처리합니다.
      node.setAttribute("alt", "");
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
