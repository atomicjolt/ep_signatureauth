Etherpad Signature Authorization (ep_signatureauth)

Description
===================================================

  This tool allows secure sign on from the Canvas LMS
  with the Etherpad collaborations tool.

Installation
===================================================

  1. Run npm install ep_signatureauth from the etherpad-lite 
  root folder

  or

  1. Clone the ep_signatureauth repository into the node_modules 
  folder of your Etherpad instance.

  After either step one create a secret.yml file in your
  etherpad-lite root directory and add a secret generated
  by rake:secret.
  
  Configure etherpad so that 'requireAuthorization' & 
  'requireAuthentication' are true in the settings file.

  2. Install the `etherpad_canvas` plugin from

  https://github.com/atomicjolt/etherpad_canvas

  Enable the plugin and add the secret above to the plugin settings.

Usage
===================================================

  This tool is set up only to work with Canvas LMS.
  It is not set up to be used with any other entry point
  than the one provided by a Canvas LMS that has the
  appropriately authored signature.

Contributing
===================================================

  1. Fork it!
  2. Create your feature branch: git checkout -b my-new-feature
  3. Commit your changes: git commit -am 'Add some feature'
  4. Push to the branch: git push origin my-new-feature
  5. Submit a pull request :D

History
===================================================

  At first the authorization would happen only through
  signature verification. It will still accomplish this upon
  accessing the Etherpad for the first time, at which time, 
  it will create a cookie that will be used for future verification.

Credits
===================================================

License
===================================================
  AGPL-3.0 License
