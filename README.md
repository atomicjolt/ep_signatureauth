Etherpad Signature Authorization (ep_signatureauth)
===================================================

Description
===================================================

This tool's expressed purpose is to
enable secure sign-in and signature verification
from the Canvas LMS with Etherpad collaborations tool.

===================================================
Installation
===================================================

  From your etherpad-lite folder

    npm install "./ep_signatureauth"

  Then add the public_key.pem file into the ep_signatureauth
  directory. (This public key should correspond with
  the private key used in Canvas to sign the url query.)

===================================================
Usage
===================================================

  This tool is set up only to work with Canvas LMS.
  It is not set up to be used with any other entry point
  than the one provided by a Canvas LMS that has the
  appropriately authored signature.

===================================================
Contributing
===================================================

  1. Fork it!
  2. Create your feature branch: git checkout -b my-new-feature
  3. Commit your changes: git commit -am 'Add some feature'
  4. Push to the branch: git push origin my-new-feature
  5. Submit a pull request :D

===================================================
History
===================================================

===================================================
Credits
===================================================

===================================================
License
===================================================
  AGPL-3.0 License
