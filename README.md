# GFX - lab 1c

## Claim

All main tasks, that is:

- T1, T2, T3, T4, T5, T6, T7, T8

From the extra credit:

- B1, 2x B3

For B3, I implemented:

- 'let the block change their color after they have reached the ground'
- 'anything creative you can think of': complete slices blink before they disappear

## Tested Environments

Tested on

- EndeavourOS Linux x86_64 (Kernel: 6.14.6-arch1-1)
- Arch Linux x86_64 (Kernel: 6.14.6-arch1-1)

with Mozilla Firefox 136.0.3 browser

Ive used primarily the npm live-server 1.2.2 as a webserver, but also tested with the python http.server

You should be able to run the project out of the box by just starting an http server in the root directory

```bash
python -m http.server 8080
# or
live-server
```

## Additional and general remarks

- I added some extra things, that seemed helpful for me:
    - An axis overlay (like in lab1a) that shows the axis of the grid (it does _not_ rotate with the block) and can be used for better orientation, when the grid is rotated in some weird way. The overlay can be toggled with the '#' key.
    - A 'cheat code' that instantly spawns an I-Piece, which can be helpful for testing some things. Can be activated by pressing both ',' and '.' at the same time.
    - Music that plays in the background (paused by default) which can be toggled by pressing 'm'
- Credits
    - I used the following ressources for the textures with just minimal alignment changes:
        - [https://stock.adobe.com/at/images/wooden-crate-front-view-cargo-box-texture-3d-rendering/199149984](https://stock.adobe.com/at/images/wooden-crate-front-view-cargo-box-texture-3d-rendering/199149984)
        - [https://www.pinterest.com/pin/89157267620469807/](https://www.pinterest.com/pin/89157267620469807/)
    - The music is not made by me, but by a friend of mine that gave me explicit permission to use it here.
