#!/usr/bin/env node
const api = require('./../lib/api.js');
const config = api.getConfig();

const args = process.argv.slice(2);

const [command, $1, ...rest] = args;

if (!command || command === "--help") {
  console.log(`
    Usage: haio [COMMAND] arguments...
    
    Commands:
    login  email password                    
                login and save user credentials                   

    user        
                show user info

    list        
                show haiocloud instances list                

    info  id
                show information of a vm by id number
    
    update  id  cpu  ram  title
                updated vm 

    logout      
                remove user credentials and logout                

    refresh     
                update access token
    `);

  return 0;
}

const commands = {
  async user() {
      const success = await api.info();
      if(success){
        console.log('info:');
        console.log(config.info);
      }else{
        console.error("failed to fetch info")
      }
  },
  status() {},
  async login() {
      const $2 = rest[0];
      if(!$1 || !$2){
          console.error('Bad Arguments');
          return 0;
      }
      const success = await api.login($1,$2);
      if(success){
          console.log('Successfully logged in');
      }else{
          console.error('Login Failed!');
      }

  },
  logout() {},
  async refresh(){
    const res = await api.refreshToken()
  },
  async list(){
    const success = await api.getListVms();
    if(success){
      console.log(config.instances);
    }else{
      console.error('failed to fetch list of vms');
    }
  },
  async info(){
    if(!$1){
      console.error('bad argument');
    }else{
      const result = await api.imageInfo($1);
      console.log(result);
    }
  },
  async update(){
     if(!$1){
      console.error('bad argument');
    }else{
      const result = await api.updateVm($1,...rest);
      //console.log("success:",result);
    }
  }
};



if (commands[command] && typeof commands[command] === "function") {
  commands[command]();
}
