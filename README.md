
<div align="center">

  <h1 align=center><code>GZ</code></h1>
  
  <p align="center">
    <strong>GamesZone is a project to index games data from third party sources.</strong>
  </p>

</div>

## Disclaimer

We do not host any files or provide downloads, we index public third party data in a search engine and let the user choose what to do.



## Features

- [x] Simple and straightforward design.
- [x] Support for many sources providers.
- [x] Translate the source in a visible way.
    - [x] Origin of the source item. e.g.: `Magnet`, `Direct`
        - [x] If an item has multiple origins, a window will be displayed to choose from.
    - [x] Name of the source item.
    - [x] *Size of the source item. (can be wrong)
- [x] Completely free.


## Known issues

- ~~When searching with a letter or name that is common, your browser may use a lot of resources to load the entire list.~~
  - ~~To avoid this, search for the partial or full item name. Partial e.g.: `Grand Theft`, `Cyberp`, `Left 4`~~


## Sources

We use [Hydra Launcher](https://github.com/hydralauncher) sources structure. Any Hydra source json file will be compatible as a GZ source and vice versa.
- Despite this we do not use any Hydra code, we just translate json sources file.


## Run locally

Clone the project

```bash
  git clone https://github.com/2nxty/GZ
```
Enter the project folder and open `index.html`. No dependencies are required.


