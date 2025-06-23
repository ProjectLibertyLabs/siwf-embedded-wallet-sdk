# SIWF Embedded Wallet SDK

## 💻 Getting Started

### Prerequisites

In order to run this project you need to:

- Become a provider. To do so, visit the [Provider Dashboard](https://provider.frequency.xyz/)!
- [Get Docker](https://docs.docker.com/get-docker/)

### Install

Install NPM Dependencies:

```sh
  npm install
```

### Environment Variables

The application is configured by way of environment variables. A complete list of available environment variables is
[here](./ENVIRONMENT.md). Environment variables are supplied to the application through _environment files_.

<details>
  <summary>More Details</summary>
  The default scripts and images for this app are configured in a slightly different way from the usual method. Because
  this Gateway app is a template meant to be used with other services and built upon, the supplied scripts enable
  launching a full environment of all Frequency Gateway services needed by this Gateway application. To that end, each
  service has its own environment, which are specified in the `docker-compose-bare-metal.yaml` and `docker-compose.yaml` files.
  Additionally, when running in bare-metal mode, `npm run env:init` will create the necessary `.env.social-app-backend` file from the `env.social-app-backend.template` file.

Sample configuration files can be found [here](./environment/).

</details>

Initialize the env files using the templates:

```sh
npm run env:init
```

### ⚡ Quick Start (Dockerized)

This environment is the best for supporting frontend development.

To quickly start up a set of preconfigured services, including this sample backend Gateway, run:

```sh
./scripts/restart-chain-docker.sh
```

For more details on configuring and running the individual services, see [Usage](#usage).

### ⚡ Quick Start (Bare Metal)

This environment is the best for supporting local backend development.

```sh
./scripts/restart-chain-bare-metal.sh
npx expo start
```

### Usage

#### 1. Start Frequency Node

Note: There are other options, but these are simplest to get started with.

#### Option 1: Use Public Frequency Rococo Testnet Nodes

This is best for Testnet interactions.

Setup the Environment Variables:

- `FREQUENCY_API_WS_URL="wss://rpc.paseo.frequency.xyz"`
- `SIWF_NODE_RPC_URL="https://rpc.paseo.frequency.xyz"`

#### Option 2: Local Network from Source

This is for simple local development work.

Run the provided Docker Compose script to launch a local Frequency node:

```sh
docker compose up -d frequency
```

#### 2. Create Provider

Create Provider for `//Alice` on localhost Frequency node.

Note: There are other options, but these are simplest to get started with.

- #### Option 1: Frequency Rococo Testnet

  Follow the instructions on the Frequency Provider Dashboard (coming soon).

- #### Option 2: Local Network
  ```sh
  npm run local:init
  ```

#### 3. Start Gateway Services and dependencies

Run the following command to start all Gateway Services and dependencies. For more info on what's included or if you
want to run each service individually, check out the [docker compose file](./docker-compose.yaml).

```sh
docker compose --profile full up -d
```

#### 4. Build

**Option 1:** Build a Docker image from the Dockerfile:

```sh
npm docker-build
```

--or--

**Option 2:** Build Docker images from the docker-compose.yml file for dev:

```sh
npm docker-build:dev
```

## 📋 Testing & Development

### Run the tests

Run the test script, which uses [Vitest](https://github.com/vitest-dev/vitest):

```sh
npm test
```

### Linting

```sh
npm run lint
```

### Auto-format

```sh
npm run format
```

### Generate Types

Generate types from `openapi.json`

```sh
npm run gen:types
```

### Swagger UI

Check out the Swagger UI hosted on the app instance at
[\<base url>/api/docs/swagger](http://localhost:3000/api/docs/swagger) to view the API documentation and submit requests
to the service.

### Debugging Tips

1. Stop all docker containers.
   ```sh
   docker compose down
   ```
2. Go to Docker and delete all Volumes.
3. Rerun quickstart or usage commands.
4. If that doesn't work, repeat step 1 and 2, delete the relative Containers and Images, then repeat step 3.

### Deployment

You can deploy using containers. Check the [docker-compose.yaml](backend/docker-compose.yaml) file for more details.

<p align="right">(<a href="#-table-of-contents">back to top</a>)</p>

<!-- REFERENCES -->

## 📚 References

- [Frequency](https://github.com/LibertyDSNP/frequency)
- [Schemas](https://github.com/LibertyDSNP/schemas/)

<!-- CONTRIBUTING -->

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

- [Contributing Guidelines](./CONTRIBUTING.md)
- [Open Issues](https://github.com/ProjectLibertyLabs/siwf-embedded-wallet/issues)

<p align="right">(<a href="#-table-of-contents">back to top</a>)</p>

<!-- LICENSE -->

## 📝 License

This project is [Apache 2.0](./LICENSE) licensed.

<p align="right">(<a href="#-table-of-contents">back to top</a>)</p>
