# Getting Started

- run git submodule update --init
- UPDATE `packgae.json`'s name property before `npm install`!
- Create a .npmrc file in the root and add your //registry.npmjs.org/:_
  authToken=xxx-xxx-xxxx-xxxx-xxx
- run npm install
- run

### Sending emails over RPC

````
const newEmail = new SendgridEmailEntity();
newEmail.to = [
     principal.email
];
newEmail.templateLabel = 'SENDGRID_TEXT_EMAIL'
newEmail.dynamicTemplateData = {
    subject: <EMAIL_SUBJECT>,
    body: <EMAIL_BODY>,
};

````
