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
		  <li><a href="#call-flow">Call Flow</a></li>
		  <li><a href="#comparisons">Comparisons to other frameworks</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul style="list-style-type:none">
        <li><a href="#prerequisites">Prerequisites</a></li>
		<li><a href="#installation">Installation</a></li>
		<li><a href="#configure-the-event-queue">Configuring the Event Queue</a></li>
		<li><a href="#hello-world">Hello, World!</a></li>
      </ul>
    </li>
	<li><a href="#testing">Tests & Testing</a></li>
	<li><a href="#troubleshooting">Troubleshooting</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
	<li><a href="#contributing">Contributing</a></li>
	<li><a href="../code-of-conduct.md">Code of Conduct</a></li>
	<li><a href="#license">License</a></li>
  </ul>
</details>

## Event-driven Architecture

<img src="/docs/images/generic_event_diagram.jpg" />

If you are completely unfamiliar with event-driven architectures, start by reading the [Wikipedia article](https://en.wikipedia.org/wiki/Event-driven_architecture).

### Call Flow

<img src="/docs/images/call_flow.png" />

## Prerequisites

## Installation

#### Minimum Requirements

* Redis >= 5.0 for the [streams](https://redis.io/topics/streams-intro)
* NodeJS >= 14.0

## Configure the Event Queue

## Roadmap

1. Extensibility
2. Storing events in something other than S3
3. Option for data stores other than Redis

## Contributing

### What do I need to know to help?
If you are looking to help to with a code contribution our project uses **[insert list of programming languages, frameworks, or tools that your project uses]**. If you don't feel ready to make a code contribution yet, no problem! You can also check out the documentation issues **[link to the docs label or tag on your issue tracker]** or the design issues that we have **[link to design label or tag on issue tracker if your project tracks design issues]**.

### How do I make a contribution?
Never made an open source contribution before? Wondering how contributions work in the in our project? Here's a quick rundown!

1. Find an issue that you are interested in addressing or a feature that you would like to add.
2. Fork the repository associated with the issue to your local GitHub organization. This means that you will have a copy of the repository under your-GitHub-username/repository-name.
3. Clone the repository to your local machine using `git clone https://github.com/canadiannomad/minevtsrc.git`.
4. Create a new branch for your fix using git checkout -b branch-name-here.
5. Make the appropriate changes for the issue you are trying to address or the feature that you want to add.
6. Use `git add insert-paths-of-changed-files-here` to add the file contents of the changed files to the "snapshot" git uses to manage the state of the project, also known as the index.
7. Use `git commit -m "Insert a short message of the changes made here"` to store the contents of the index with a descriptive message.
8. Push the changes to the remote repository using `git push origin branch-name-here`.
9. Submit a pull request to the upstream repository.
10. Title the pull request with a short description of the changes made and the issue or bug number associated with your change. For example, you can title an issue such as "Added more log output to resolve #4352".
11. In the description of the pull request, explain the changes that you made, any issues you think exist with the pull request you made, and any questions you have for the  maintainer. It's OK if your pull request is not perfect (no pull request is), the reviewer will be able to help you fix any problems and improve it!
12. Wait for the pull request to be reviewed by a maintainer.
13. Make changes to the pull request if the reviewing maintainer recommends them.
14. Celebrate your success after your pull request is merged!

### Where can I go for help?
If you need help, you can ask questions on our mailing list, IRC chat, or **[list any other communication platforms that your project uses]**.
