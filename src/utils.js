function toStrictValidUri(string) {
  return encodeURIComponent(string).replace(/[!'()*]/g, function (chr) {
    return "%" + chr.charCodeAt(0).toString(16).toUpperCase();
  });
}

function format(string, option) {
  return option.encode
    ? option.strict
      ? toStrictValidUri(string)
      : encodeURIComponent(string)
    : string;
}

function formatParams(paramObj, option) {
  if (!paramObj) return "";
  const toParamString = (function (option) {
    switch (option.arrayFormat) {
      case "index":
        return function (key, value, idx) {
          return null === value
            ? [format(key, option), "[", idx, "]"].join("")
            : [
                format(key, option),
                "[",
                format(idx, option),
                "]=",
                format(value, option),
              ].join("");
        };
      case "bracket":
        return function (key, value) {
          return null === value
            ? format(key, option)
            : [format(key, option), "[]=", format(value, option)].join("");
        };
      default:
        return function (key, value) {
          return null === value
            ? format(key, option)
            : [format(key, option), "=", format(value, option)].join("");
        };
    }
  })(
    (option = Object.assign(
      {
        encode: true,
        strict: true,
        arrayFormat: "none",
      },
      option
    ))
  );
  const keyToUriParam = function (key) {
    var value = paramObj[key];
    if (undefined === value) return "";
    if (null === value) return format(key, option);
    if (Array.isArray(value)) {
      var paramStrings = [];
      value.slice().forEach(function (elm) {
        if (elm !== undefined) {
          paramStrings.push(toParamString(key, elm, paramStrings.length));
        }
      });
      return paramStrings.join("&");
    }
    return format(key, option) + "=" + format(value, option);
  };

  return Object.keys(paramObj)
    .sort()
    .map(keyToUriParam)
    .filter((e) => e.length > 0)
    .join("&");
}

function createIframe(options, videoType) {
  var source =
    "https://" +
    videoType +
    ".twitch.tv" +
    "?" +
    formatParams(
      Object.assign(Object.assign({}, options), {
        parent: getParentsIncludingCurrentDomain(options.parent),
        referrer: document.location.href,
      })
    );
  var iframe = document.createElement("iframe");
  iframe.setAttribute("src", source),
    iframe.setAttribute("allowfullscreen", ""),
    iframe.setAttribute("scrolling", "no"),
    iframe.setAttribute("frameborder", "0"),
    iframe.setAttribute("allow", "autoplay; fullscreen"),
    iframe.setAttribute("title", "Twitch");
  let sandbox =
    "allow-modals allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox";
  if (
    typeof document.hasStorageAccess == "function" &&
    typeof document.requestStorageAccess == "function"
  ) {
    sandbox += " allow-storage-access-by-user-activation";
  }
  iframe.setAttribute("sandbox", sandbox);
  options.width && iframe.setAttribute("width", String(options.width));
  options.height && iframe.setAttribute("height", String(options.height));
  return iframe;
}

function getParentsIncludingCurrentDomain(parent) {
  var domain = document.domain;
  if (!parent) return [domain];
  var parents = Array.isArray(parent) ? parent : [parent];
  if (domain) {
    if (parents.indexOf(domain) === -1) {
      return parents.concat(domain);
    } else {
      return parents;
    }
  }
}

export { formatParams, createIframe };
