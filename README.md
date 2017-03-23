Etherpad Signature Authorization (ep_signatureauth)

Description
===================================================

  This tool's expressed purpose is to
  enable secure sign-in and signature verification
  from the Canvas LMS with Etherpad collaborations tool.

Installation
===================================================

  1. Run npm install ep_signatureauth from the etherpad-lite 
  root folder

  or

  1. Clone the ep_signatureauth repository into the node_modules 
  folder of your Etherpad instance.

  After either step one create a secret.yml file in your
  etherpad-lite root directory and add the secret generated
  by rake:secret that also resides in the setting of 
  the corresponding etherpad security gem plugin in Canvas. 

  After setting up the yml file set 'requireAuthorization' to
  true in the settings file.

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
