## Utilities Customer Self-Service Agent (UCSSA)

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
        "url": "https://<host>.ondemand.com",
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
