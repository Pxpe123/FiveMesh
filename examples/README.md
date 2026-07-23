# Examples

This folder is for curated demo assets used by the hosted FiveMesh app.

Create one category folder, then one folder per example. FiveMesh uses the
example folder name as the display name and reads the model type from the
`.yft` or `.ydr` extension.

```text
examples/
`-- assets/
    |-- Cars/
    |   `-- Baller8/
    |       |-- baller8_hi.yft
    |       `-- baller8+hi.ytd
    `-- Props/
        `-- PoolTable/
            |-- prop_pooltable_02.ydr
            `-- prop_pooltable_02+hidr.ytd
```

Rules:

- Use one `.yft` or `.ydr` model file per example folder.
- Add one optional `.ytd` texture dictionary in the same folder.
- Example folder names become display names, so `PoliceBaller` becomes
  `PoliceBaller` and `police_baller` becomes `Police Baller`.

Only add files you are comfortable hosting in the public app.
