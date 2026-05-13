[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/utilities-customer-self-service-agent-utilities-demo-ui)](https://api.reuse.software/info/github.com/SAP-samples/utilities-customer-self-service-agent-utilities-demo-ui)
# Description
UI5 demo application for testing and learning how to consume the Utilities Customer Self-Service Agent API for a non-productive setup.

## Requirements
Active subscription to the [Utilities Customer Self Service Agent](https://help.sap.com/docs/utilities-self-service-agent)

## Download and Installation
### Local Development Setup

1. **Install dependencies:**

   ```sh
   npm install
   ```

### Running the App

#### Local execution
To run the application locally two things need to be added

1. Use your created credentials from IAS. A detailed description can be found in our [offical documentation](https://help.sap.com/docs/utilities-self-service-agent/administration-guide-for-utilities-customer-self-service-agent/create-dependent-application-and-api-access-credentials)

2. Set the Backend service URL in `ui5-local.yaml` (e.g. `https://<app>.stage.kyma.ondemand.com`).
```yaml
backend:
  - path: /dssa
    pathReplace: "/"
    url: https://....ucssa.ai.cloud.sap/
```

3. Create a `config.json` file in `webapp/test/mock` with the created crendentials from step 1. The content should look like this:

  ```json
  {
    "firstName": "Emma",  //displayed in the welcome message of the app
    "auth":{
        "url": "<IAS URL>",
        "clientid": "<clientid>",
        "clientSecret": "<clientSecret>",
        "resource": "<resource>"
    },
    "users":[
      {
        "ucssa-userid": "<userid>", //such as emma
        "businessPartners": [
            "<bpnubmer>"  // such as 1113855
        ],
        "ucssa-username": "<username>"  // such as Emma
      },
    ]
  }
  ```

- Start the app with Kyma backend:
  
  ```sh
  npm run start
  ```

## Known Issues
No known issues.

## How to obtain support
[Create an issue](https://github.com/SAP-samples/<repository-name>/issues) in this repository if you find a bug or have questions about the content.
 

## Contributing
If you wish to contribute code, offer fixes or improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

## License
Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
