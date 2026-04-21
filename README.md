# WHITEBURD — The art of passage.

A premium, deliberately unrealistic landing-page study for a private network.
Swiss brutalist typography, cinematic negative space, a central composition of
rough concrete breaking open to release a wing of liquid light.

## Stack

Static HTML + CSS + a touch of JS. No framework, no build step.

```
.
├── index.html       # page structure and copy
├── styles.css       # typography, layout, motion
├── script.js        # scroll reveal and hero parallax
└── assets/
    └── hero.svg     # the central fracture-and-wing composition
```

## Run locally

Any static server will do. For example:

```sh
python3 -m http.server 8080
# then open http://localhost:8080
```

## Design notes

- **Typography**: Inter, hairline weight (100–200). Display sizes up to
  `18vw` so titles become architecture, not content.
- **Palette**: near-black `#050505` base, warm off-white `#f5f2ea` ink,
  cool chromatic fringes on the wing edges for dispersion.
- **Motion**: hero letters rise through a blur veil; the hero SVG has a
  subtle mouse-parallax with inertia; sections fade in on scroll.
- **Accessibility**: fully respects `prefers-reduced-motion`. The hero
  SVG has an `aria-label` describing the composition; decorative atmosphere
  layers (grain, vignette) are `aria-hidden`.

The interface dissolves into the art.
