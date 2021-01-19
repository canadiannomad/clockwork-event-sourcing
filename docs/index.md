<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="/">
    <img src="docs/images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">MinEvtSrc</h3>

  <p align="center">
    A minimalist NodeJS (TypeScript) + Redis Event Sourcing Framework
    <br />
    <a href="docs/index.md"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/canadiannomad/minevtsrc/issues">Report Bug</a>
    ·
    <a href="https://github.com/canadiannomad/minevtsrc/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ul style="list-style-type:none;">
    <li>
      <a href="#event-driven-architecture">Event-Driven Architecture</a>
      <ul style="list-style-type:none">
		  <li><a href="#design-goals">Design Goals</a></li>
		  <li><a href="#arch-comparisons">Comparisons to other frameworks</a></li>
		  <li><a href="#call-stack">Anatomy of a Request</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul style="list-style-type:none">
        <li><a href="#prerequisites">Prerequisites</a></li>
		<li><a href="#installation">Installation</a></li>
		<li><a href="#contact">Configuration Options</a></li>
		<li><a href="#first-app">Creating Your First Application</a></li>
      </ul>
    </li>
	<li><a href="#extending">Extensions or Middleware?</a></li>
	<li><a href="#testing">Tests & Testing</a></li>
	<li><a href="#troubleshooting">Troubleshooting</a></li>
    <li><a href="#lib-ref">Library Reference</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
	<li><a href="#contributing">Contributing</a></li>
	<li><a href="../code-of-conduct.md">Code of Conduct</a></li>
	<li><a href="#license">License</a></li>
  </ul>
</details>

## Event-driven Architecture

![Event Queue General Diagram](docs/images/generic_event_diagram.png)
