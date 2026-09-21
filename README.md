# Blood on the Clocktower Utils

https://docs.google.com/spreadsheets/d/1eJkBC6rF-VU6J0h0KJvyiXjs2HLl6Yjzw9jfVYHOW34/edit?gid=0#gid=0

## Development

This project uses [pnpm](https://pnpm.io).

```
pnpm install
pnpm dev
```

The translations come from Weblate (translation.botc.app). To update them:

```
pnpm translations        # de
pnpm translations de fr  # other languages
```

Scripts are imported in the format of the official script tool (`data/scripts/*.json`, only the role ids).
Team and English name come from `data/roles.json` and the texts from the translations, both resolved at
runtime in `lib/script.ts`. The jinxes are in `data/jinxes.json` (the German texts are in the translations), the night order in
`data/nightsheet.json` and the role icons in `public/icons`. To update all of it:

```
pnpm game-data
```
