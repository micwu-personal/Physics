# Bundled Font Licenses

The webfonts in `assets/fonts/` are **not** covered by this repository's MIT license.
Both are licensed under the **SIL Open Font License, Version 1.1**, which explicitly
permits bundling and redistribution with a work, provided this notice travels with them.

Full license text: https://openfontlicense.org/open-font-license-official-text/

## Space Grotesk

- Files: `space-grotesk-latin.woff2`, `space-grotesk-latin-ext.woff2`
- Copyright: Copyright (c) 2020 Florian Karsten
- Project: https://github.com/floriankarsten/space-grotesk
- License: SIL Open Font License 1.1
- Changes: None. These are the unmodified Latin and Latin-Extended subsets that Google
  Fonts serves, downloaded from `fonts.gstatic.com` and stored here so the site does not
  depend on an external CDN at runtime.

## JetBrains Mono

- Files: `jetbrains-mono-latin.woff2`, `jetbrains-mono-latin-ext.woff2`
- Copyright: Copyright 2020 The JetBrains Mono Project Authors
- Project: https://github.com/JetBrains/JetBrainsMono
- License: SIL Open Font License 1.1
- Changes: None. Unmodified Latin and Latin-Extended subsets, stored locally for the same
  reason.

## Why no bundled Chinese font

Simplified Chinese text renders with the reader's system font, in this preference order:
PingFang SC, Microsoft YaHei, Hiragino Sans GB, then any installed Noto Sans CJK.

Noto Sans SC is also SIL OFL 1.1 and could legally be bundled, but a usable CJK subset is
roughly ten megabytes, which would defeat the purpose of removing the CDN dependency.
Every platform that reads Simplified Chinese already ships one of the fonts above.
