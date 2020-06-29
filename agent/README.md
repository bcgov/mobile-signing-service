## About

This is the Agent component to the BCDevX Mobile App Signing Service. The Signing
Service is designed to be a self-serve system that enables development teams to
sign and deploy build artifacts in a secure environment.

The Agent is meant to run on a _macOS_ system and run signing jobs; these can be
for iOS, macOS, or Android.

Additional component can be fond in these repos:

[Public API](https://github.com//bcdevops/mobile-cicd-api.git)

[Public Web](https://github.com//bcdevops/mobile-cicd-web.git)

## Usage

The API documentation can be built with the following command; the result of building the documentation can be found in the `doc/` directory / folder.

```console
npm run build:doc
```

## Build

While this application is meant to be run on macOS to accommodate iOS / macOS code signing it can be built on OpenShift to accommodate code analysis and testing.

Use the OpenShift `build.json` template in this repo with the following (sample) command. The build is meant to be a CI process to confirm that a build can happen without error, ensure code quality, and that the code is security.

```console
oc process -f openshift/templates/build.json \
-p GIT_REF=develop \
-p SLACK_SECRET='helloworld' | \
oc create -f -
```

| Parameter    | Optional | Description                       |
| ------------ | -------- | --------------------------------- |
| GIT_REF      | NO       | The branch to build from          |
| SLACK_SECRET | NO       | Slack token to post to channel(s) |

\* See the `build.json` template for other _optional_ parameters.

\*\* To build multiple branches you'll use the config file multiple times. This will create errors from the `oc` command output that can safely be ignored. For example: `Error from server (AlreadyExists): secrets "github" already exists`

## Deployment

- Checkout the source code on the destination server;
- Manually run `npm run build`;
- Run `npm run`.

## Local Installation for Development

See the [API documentation](https://github.com/bcdevops/mobile-cicd-api.git/README.md) on how to setup and run supplemental services like minio.

Create an `.env` file on the root folder based on the template `.env.sample`.

Run the node application with the following command:

```shell
# Create an `.env` file on the root folder based on template
cp .env.sample .env

# Run
npm run dev
```

\* See src/lib/config/development.json for configuration options that do not need to be secure.

## Project Status / Goals / Roadmap

This project is **active**.

Progress to date, known issues, or new features will be documented on our publicly available Trello board [here](https://trello.com/b/HGJpxQdS/mobile-pathfinder).

## Getting Help or Reporting an Issue

Send a note to bcdevexchange@gov.bc.ca and you'll get routed to the right person to help you out.

## How to Contribute

_If you are including a Code of Conduct, make sure that you have a [CODE_OF_CONDUCT.md](SAMPLE-CODE_OF_CONDUCT.md) file, and include the following text in here in the README:_
"Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms."

## License

Detailed guidance around licenses is available
[here](/BC-Open-Source-Development-Employee-Guide/Licenses.md)

Attach the appropriate LICENSE file directly into your repository before you do anything else!

The default license For code repositories is: Apache 2.0

Here is the boiler-plate you should put into the comments header of every source code file as well as the bottom of your README.md:

    Copyright 2018 Province of British Columbia

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

For repos that are made up of docs, wikis and non-code stuff it's Creative Commons Attribution 4.0 International, and should look like this at the bottom of your README.md:

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons Licence" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/80x15.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">YOUR REPO NAME HERE</span> by <span xmlns:cc="http://creativecommons.org/ns#" property="cc:attributionName">the Province of Britich Columbia</span> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.

and the code for the cc 4.0 footer looks like this:

    <a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons Licence"
    style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/80x15.png" /></a><br /><span
    xmlns:dct="http://purl.org/dc/terms/" property="dct:title">YOUR REPO NAME HERE</span> by <span
    xmlns:cc="http://creativecommons.org/ns#" property="cc:attributionName">the Province of Britich Columbia
    </span> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
    Creative Commons Attribution 4.0 International License</a>.
