# Recipe Book Api

## Install dependencies.

Run

```
npm install
```

or

```
yarn
```

## Create .env
 
 * You have to create a file to store the enviroment variables, follow the example of what it has to contain that its uploaded to the github.

 * The example has the components to conect to the MongoDB and makes a uri to send to mongo that is like this: mongodb+srv://<User>:<Password>@<Cluster>/myFirstDatabase?retryWrites=true&w=majority
 
 * You will find your cluster in the MongoDB Page.

## Running

 * You can run it in developer mode, with hot reload on code change

```
npm run dev
``` 
or
```
yarn run dev
```

 * You can also run it with the possibility of attaching a debugger (and hot reload)


```
npm run dev-inspect
``` 
or
```
yarn run dev-inspect
```

 * Finally you can run it in production mode


```
npm run start
``` 
or
```
yarn run start
```

## Propose of the Api

 * The Api gives you the posibility to manage a DB of recipes, managed by a User system so other users cant edit your recipes, but can see them.

## Participants

 * This Api was made by Alejandro Fernandez Armas and Pablo Hernando Izquierdo.