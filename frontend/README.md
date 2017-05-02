PReview Code frontend [![Build Status](https://travis-ci.com/preview-code/frontend.svg?token=86QRP5X4vpvgxQiXxC7x&branch=master)](https://travis-ci.com/preview-code/frontend)
=========
This is the frontend code for https://preview-code.com implemented with Polymer.

# Installation for testing

Make sure you have `web-component-tester` installed globally as well as
the plugin `web-component-tester-istanbul`:

```
sudo npm i -g web-component-tester web-component-tester-istanbul
```

# Installation for serviceWorker
Service-worker requires you to run the website on `https`. Therefore you need
to install a local self-signed certificate for `localhost:5200`.

When running `gulp serve` by default the certificate in `certificate/` is
loaded and attached. However, when opening the website you will get a message
that the page is insecure. Perform the following steps to resolve this:

(This guide is inspired by http://stackoverflow.com/a/15076602/2761676)

1. Open the website, you should see an insecurity warning from Chrome
* Click on advanced
* Click on continue anyways
* Click on the red lock in the url bar
* Click `Details`
* Click `View certificate`
* Click `Details`
* Click `Export...`
* Choose `PKCS #7, single certificate` as the file format.
* Save the file somewhere on your computer
* Open Chrome Settings
* Click `Show advanced settings...`
* Under `HTTPS/SSL` click `Manage certificates`
* Click the `Authorities` tab
* Click `Import...`
* Select the saved file
* Check all boxes in the prompt
* Restart Chrome
* ...?
* Profit!
