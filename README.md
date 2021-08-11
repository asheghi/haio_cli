# Haio CLI

a command line tool to manage your vms at haio.ir



    Usage: haio [COMMAND] arguments...
    
    Commands with arguments:

    login   email  password               >  login and save user credentials                   
    user                                  >  show user info
    list                                  >  show haiocloud instances list                
    info    id                            >  show information of a vm by id number
    update  id  cpu  ram  title           >  updated vm 
    logout                                >  remove user credentials and logout                
    refresh                               >  update access token
    

### installation:
git clone https://github.com/semycolon/haio_cli.git
cd haio_cli
sudo npm i -g .
