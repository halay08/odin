# Getting Started

- run git submodule update --init
- UPDATE `packgae.json`'s name property before `npm install`!
- Create a .npmrc file in the root and add your //registry.npmjs.org/:_authToken=xxx-xxx-xxxx-xxxx-xxx
- run npm install
- run

#### Ensure you have an SSH key added to your GitHub
https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh

##### request access to d19n npm registry
Contact IT

##### To manually setup a single module
```


cd into module/odin-api-<module_name>

npm login
cat ~/.npmrc >> .npmrc

git pull
git submodule update --init
git checkout develop
git pull origin develop

npm install


cd to the odin-dev-environment directory

docker-compose -f docker/docker-compose.yaml up -d --build

moduls/odin-api-identity npm run start:dev
moduls/odin-api-service npm run start:dev
modules/platform-desktop



```
