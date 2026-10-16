# PerfilWiki installer

This is the real two-screen local installer for PerfilWiki 1.18.0. Preserve its accepted design and accessible Portuguese copy.

- Keep tests and preview entirely local with synthetic data. Never log in, publish, purge, or perform authenticated Wikimedia requests.
- Use the exact runtime renderers in the isolated local preview. Do not create a competing dashboard renderer.
- Keep the original eight counters selected by default and right alignment as the default. The article and byte counters are optional.
- Export full configuration, guarded loader, initial markup, edit summaries and downloads. Place a direct destination editor link beside Copy, but never visit it during automated tests.
- Preserve existing code when appending in the local editor. Never evaluate pasted user code.
- Shared files are a local candidate until the maintainer manually publishes them.

- Personal content sections are static page wikitext outside refreshed dashboard and profile markers. Never include them in the activation configuration or overwrite them during metrics downloads.
- Settings import reads JSON as data, validates before replacing the current choices and never executes code. Downloaded runtime settings do not recover personal wikitext edited on the page.
- Future live editing remains an ordinary manual Wikipedia edit with preview and Save. Do not add automatic saves or claims of bot-policy approval.

- The local Ver painel / Editar painel flow keeps the validated full installer model in the same tab. Use opaque local session tokens only, never names or settings in URLs, and retain the in-memory fallback and optional JSON backup.
- The edit-panel button belongs only to the local app, never to exported wiki markup or activation code. Live hosting and account-owner integration require separate work.
- Local clock text is compact, such as 10:42 (UTC-4). Keep the exact instant, zone and saved/live distinction in its attributes and tooltip.
- Mark the account input as required with the red asterisk, an explained accessible label and required semantics. Keep optional hints subtle and readable, and preserve conditional validation.
- Keep every cover preview synthetic and local. Retain manual and daily Commons modes. The optional Commons runtime feed is public GET only, with one UTC-day image, one in-flight request, last-good fallback and a five-minute failure pause. Preserve manual filenames across source changes, file credits and manually saved Commons visitor snapshots.
- The wiki-daily mode exports the existing ptwiki daily image transclusion with UTC magic words and one guarded #ifexist call. Keep that call dynamic in every download and preserve its parsed native DOM during owner updates. Visitors require no PerfilWiki JavaScript or API calls. Do not promise a midnight switch or updates in an already open tab. Never publish a new template or module for this mode.
- Keep Cor do painel and box highlight color in Disposição. Keep name color beside the name and label/information colors beside the profile fields. The standalone Cores e destaques section is removed. Empty text colors mean automatic, and explicit #RRGGBB choices render exactly, including field links, without changing counter colors or metrics.
- Keep per-field labelColor and per-item valueColor or valueColors optional. Empty means Padrão do perfil and inherits the global label/information color. Explicit six-digit hex choices remain exact, including wikilinks. Preserve color alignment when adding or removing items, switching layouts or converting a legacy single value to a group. Keep choices in preview, runtime DOM, wiki export, JSON import/export and local panel sessions, with no new network requests.
