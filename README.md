<!-- PROJECT SHIELDS -->

<!--
*** Markdown "reference style" links used for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![License: MIT][license-shield]][license-url]

<!-- PROJECT LOGO -->

<br />
<p align="center">
  <a href="/">
    <img src="./docs/images/logo.jpg" alt="Logo" width="100" height="66">
  </a>

  <h3 align="center">Clockwork Event Source Framework</h3>

  <p align="center">
    <a href="docs/index.md"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/canadiannomad/clockwork-event-sourcing/issues">Report Bug</a>
    ·
    <a href="https://github.com/canadiannomad/clockwork-event-sourcing/issues">Request Feature</a>
  </p>
</p>

Clockwork is a minimalist event sourcing framework that simplifies management of event queues and listeners.

##### Built With

-   [AWS S3](https://aws.amazon.com)
-   [Redis](https://redis.io)
-   [NodeJS](https://nodejs.org)
-   [TypeScript](https://typescriptlang.org)

<!-- GETTING STARTED -->

## Getting Started

To install Clockwork, follow these simple example steps.

```sh
$ cd your_project
$ yarn install --save clockwork-event-sourcing
$ yarn build
```

### Build

```sh
> yarn build
```
This will create .js files for all .ts files found within the project folder. All new files will be created ```./built```


### Test

```sh
docker-compose build clockwork && docker-compose run --rm clockwork
```
Flushes Redis and runs built/example/test.js

<!-- ROADMAP -->

## Roadmap

See the [open issues](https://github.com/canadiannomad/clockwork-event-sourcing/issues) for a list of proposed features (and known issues).

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

<!-- LICENSE -->

## License

Distributed under the LGPL 3.0 License. See `LICENSE` for more information.

<!-- ACKNOWLEDGEMENTS -->

## Acknowledgements

-   [GitHub Emoji Cheat Sheet](https://www.webpagefx.com/tools/emoji-cheat-sheet)
-   [Img Shields](https://shields.io)
-   [Photo by Miguel Á. Padriñán from Pexels](https://www.pexels.com/photo/photo-of-golden-cogwheel-on-black-background-3785935/)

<!-- MARKDOWN LINKS & IMAGES -->

<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/badge/CONTRIBUTORS-3-blueviolet?style=for-the-badge

[contributors-url]: https://github.com/canadiannomad/clockwork-event-sourcing/blob/master/AUTHORS.md

[license-shield]: https://img.shields.io/badge/license-MIT-green?style=for-the-badge

[license-url]: https://github.com/canadiannomad/clockwork-event-sourcing/blob/master/LICENSE
