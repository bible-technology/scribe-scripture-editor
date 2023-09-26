<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="">
    <img src="https://github.com/bible-technology/scribe-scripture-editor/blob/development/styles/Logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Scribe Scripture Editor (Scribe SE)</h3>

  <p align="center">
    A Bible translation editor for everyone.
    <br />
    <a href="https://github.com/friendsofagape/autographa/issues">Report Issue</a>
    ·
    <a href="https://github.com/bible-technology/scribe-scripture-editor/issues">Feature Request</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->

## Table of Contents

-   [About the Project](#about-the-project)
    -   [Built With](#built-with)
-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
-   [Roadmap](#roadmap)
-   [Contributing](#contributing)
-   [License](#license)
-   [Contact](#contact)
-   [Acknowledgements](#acknowledgements)

<!-- ABOUT THE PROJECT -->

## About The Project

Scribe SE is a standalone desktop application which aims to aid and be a friendly companion for the Bible Translator. It is composed of modes which support focus on specific use-cases e.g. text translation (USFM-based editor), Oral Bible translation (audio recorder) and Open Bible Story (in Markdown format) drafting mode. It supports syncing with online repositories for data backup and other such helpful features. 

### Built With

-   [ReactJS](https://reactjs.org/)
-   [Electron](https://www.electronjs.org/)
-   [Tailwind CSS](https://tailwindcss.com/)

<!-- GETTING STARTED -->

## Getting Started

It is relatively easy to setup the application locally for development.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.

-   [Node.js ^16.15.1](https://nodejs.org/en/)
-   [YARN ^1.22.19](https://yarnpkg.com/getting-started)

### Installation

1. Fork and clone this repository
2. Install dependencies with `yarn install`
3. Start the application with `yarn start`
4. Checkout the web version with `yarn dev`
   Runs the app in the development mode.<br>
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

<!-- ROADMAP -->

## Roadmap

See the [projects page](https://github.com/orgs/bible-technology/projects/1/views/1) for a list of proposed features and known issues we are working on.

<!-- CONTRIBUTING -->

## Contributing

If you'd like to contribute, please fork the repository and commit changes in your fork. Pull requests are warmly welcome.

We really value our contributors whether they helped fix a bug, built a feature, tested out the app or contributed in some other way.

The process for submitting pull requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewFeature`)
3. Create [logs](https://github.com/winstonjs/winston#readme) as you start making changes

```
Logger level:
Production => warn
Development => debug
```

```
Usage: logger.[level]("<filename>, <message>")
```

4. Add nessesary propTypes for all the properties passed to react component (`https://github.com/facebook/prop-types`)
5. After adding features make sure you write test for that using:

-   [Jest](https://testing-library.com/docs/react-testing-library/intro)
-   [React Testing Library](https://jestjs.io/docs/en/getting-started)

6. Run `yarn lint:fix` for code to adapt our linting rules
7. Run `yarn build` for build checks
8. Commit your Changes (`git commit -m 'Add some NewFeatures'`)
9. Push to the Branch (`git push origin feature/NewFeature`)
10. Open a Pull Request and make sure all checks have passed

<!-- LICENSE -->

## License

This project is licensed under the MIT License. See [LICENSE](https://github.com/bible-technology/scribe-scripture-editor/blob/development/LICENSE) for more details.

<!-- CONTACT -->

## Contact

Let us know if you face any bugs/problems by opening an [issue](https://github.com/bible-technology/scribe-scripture-editor/issues) on GitHub. We'll do our best to be prompt in our response.

<!-- ACKNOWLEDGEMENTS -->

## Acknowledgements
- Supported by the Open Components Ecosystem.
- Developed and maintained by [Bridgeconn](https://bridgeconn.com/)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/bible-technology/scribe-scripture-editor.svg?style=flat-square
[contributors-url]: https://github.com/bible-technology/scribe-scripture-editor/graphs/contributors
[issues-shield]: https://img.shields.io/github/contributors/bible-technology/scribe-scripture-editor.svg?style=flat-square
[issues-url]: https://github.com/bible-technology/scribe-scripture-editor/issues
[license-shield]: https://img.shields.io/github/contributors/bible-technology/scribe-scripture-editor.svg?style=flat-square
[license-url]: https://github.com/bible-technology/scribe-scripture-editor/blob/development/LICENSE
