const axios = require("axios");
const JsonLite = require("../lib/JsonLite.js");
const path = require("path");
const config = JsonLite(path.join(__dirname, "../.config"));

axios.defaults.baseURL = "https://api.haio.ir/v1/";

//user info
module.exports.info = async function () {
  try {

    await checkLogin();

    const options = getOptions();
    const {data} = await axios.get("user/info", options);
    const {status,code,message,params:{
        name,email,mobile,balance
    }} = data;
    if(status){
        config.info = {name,email,mobile,balance};
        return true;
    }else{
        console.error('something went wrong!, try again later');
        return false;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
};

async function checkLogin(){
   if(!config.login){
      throw new Error('you must lig in first');     
    }else{
        if( 
          loginExpired() 
          && !(await login())
        ){
          throw new Error('login expired, failed to log in again');
        }
    }
}

module.exports.login = async function (email, password) {
  try {
      console.log('Loging in as ',email);
    const { data, status: StatusCode } = await axios.post("user/login", {
      email,
      password,
    });

    const {
      status,
      message,
      code,
      params: {
        data: { access_token, expires_in, refresh_token, token_type },
      },
    } = data;

    if (status && access_token) {
        let d = new Date();
        d.setSeconds(d.getSeconds() + (+expires_in - 5 * 60));
        
        config.login = {
            email,
            password,
            token:access_token,
            refresh_token,
            expire_date:d,
            token_type,
        }
      return true;
    } else {
      console.error(message, "status :", status, "code:", code);
      return false;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
};

function getOptions() {
  const options = {
    headers: {},
  };

  if (config.login) {
    options.headers.Authorization = "Bearer " + config.login.token;
  }

  return options;
}

function updateAccessToken(){

}

function loginExpired(){
    if(!config.login || !config.login.expire_date){
        return true;
    }

    const now = new Date();
    const date = new Date(config.login.expire_date);
    if(now.getDate() > date.getDate()){
        return true;
    }
    return false;
}

async function refreshToken(){
  if(!config.login){
    throw new Error('cannot refresh token, login is undefined!');
  }
  try {
    const {data} = await axios.post('user/refresh/token',{refresh_token : config.login.refresh_token});  
  const {
      status,
      message,
      code,
      params: {
        data: { access_token, expires_in, refresh_token, token_type },
      },
    } = data;

    if (status && access_token) {
        let d = new Date();
        d.setSeconds(d.getSeconds() + (+expires_in - 5 * 60));
        
        const email = config.login.email;
        const password = config.login.password;

        config.login = {            
            email,
            password,
            token:access_token,
            refresh_token,
            expire_date:d,
            token_type,
        }
        console.log('Successfully updated token');
      return true;
    } else {
      console.error(message, "status :", status, "code:", code);
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function getListVms(page = 1){
  try {
    const {data} = await axios.get('haiocloud/instances?page='+page,getOptions());
    const {
      code,
      message,
      status,
      params:{
        current_items,
        current_page,
        current_url,
        last_page,
        per_page,
        total_items,
        data: instances,
      }
    } = data;
    if(status){
      config.instances = {
        count : total_items,
        list : instances,
      };
      return true;
    }else{
      return false;
    }
  } catch (error) {
    console.error(error);   
    return false; 
  }
}

module.exports.getConfig = () => config;
module.exports.refreshToken = refreshToken;
module.exports.getListVms = getListVms;


async function imageInfo(id){
  try {    
    const {data} = await axios.get('haiocloud/info/'+id,getOptions());
    const {code,message,status,
      params:{
        data:{
          cpu,
          created_at,
          hard,
          hostname,
          image_title,
          image_version,
          price,
          ram,
          server_id,
          title,
          vps_name,
        }
      }
    } = data;
    
    if(status){
       config['wm_'+id+'_info'] = data.params;
       return data.params.data;
    }else{
      console.log('failed to fetch vm info',status,code,message);
      return {};
    }
   
  } catch (error) {
    console.error(error);
    return {};
  }
   
}


async function updateVm(id,cpu,ram,title){
  try {    
    let payload = {
     
    };
    
    if(cpu) payload.cpu = cpu;
    if(ram) payload.ram = ram;
    if(title) payload.title = title;


    const {data} = await axios.put('haiocloud/instance/update/'+id,payload,getOptions());
    const {code,message,status,params} = data;
    
    console.log(params,'\t','status:',status,'code:',code,'message:',message)
    if(status){       
       return true;
    }else{
      console.log('seems like update failed');
      return false;;
    }
   
  } catch (error) {
    console.error(error);
    return false;
  }
   
}

module.exports.imageInfo = imageInfo;
module.exports.updateVm = updateVm;
