# 3D-resume

An interactive 3D portfolio by Shubhangi Sharma: a Minecraft-style isometric room where each object opens a part of the story (desk → passion projects, bookshelf → reads, mirror → about me, iPad → Spotify & hobbies, pegboard → travel), followed by Projects, Work experience, Testimonials and Extras.

Built with plain HTML/CSS/JS and [Three.js](https://threejs.org/) (bundled in `vendor/`). No build step.

## Run locally

```bash
python3 serve.py        # then open http://localhost:8899
```

(`serve.py` is a tiny static server with no-cache headers; any static server works.)

## Edit the content

Almost everything lives in **`content.js`** — projects, work experience, testimonials, books, travel stories, hobbies, links. Images are in `img/`.

| Area | Files |
|---|---|
| Room, avatar, panels, sound | `main.js` |
| Projects section + hover outcomes | `projects.js` |
| Case-study page template | `case-study.html`, `case.js` |
| Testimonials / Extras / footer | `extras.js` |
| Voxel landscape behind Extras | `extras-bg.js` |
| Little voxel iMac | `imac.js` |
| Styles | `style.css` |
