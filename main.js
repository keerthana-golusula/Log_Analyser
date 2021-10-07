
const electron=require('electron');
const url=require('url');
const path=require('path');
const ipc=electron.ipcMain;
const nativeImage=electron.nativeImage;
var fs=require('fs');

const{app,BrowserWindow,Menu, dialog, webContents}=electron;
let appicon=nativeImage.createFromPath(path.join(__dirname,'app','assets','logo','ncr-logo.jpg'))
let mainWindow;
let filterwindow;
let dashboardwindow;
let splash;
app.on('ready',function(){
   const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize

    mainWindow= new BrowserWindow({webPreferences:{nodeIntegration:true},titleBarStyle: 'hidden',icon:appicon,width,height,show: false});
   
    splash = new BrowserWindow({width: 810, height: 610, transparent: true, frame: false, alwaysOnTop: true});
  splash.loadURL(url.format({
   pathname:path.join(__dirname,'splash.html'),
   protocol:'file:',
   slashes:true
}));
  mainWindow.loadURL(url.format({
   pathname:path.join(__dirname,'mainwindow.html'),
   protocol:'file:',
   slashes:true
}));
  
  // if main window is ready to show, then destroy the splash window and show up the main window
  mainWindow.once('ready-to-show', () => {
    splash.destroy();
    mainWindow.show();
  });

    
    ipc.on("open-file",function(){
        console.log("file opened");
     //console.log("window opened");
     //ipc.sender.send("filter window opened");
   });
    //mainWindow.webContents.openDevTools();
    // quit app when closed
    mainWindow.on('closed',function(){
        app.quit();
    });
    
    //Build menu from template
    const mainMenu=Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);

   });   
 
   ipc.on("open-filter-window",function(){
      console.log("1.entered");
     filterwindow= new BrowserWindow({parent: mainWindow,icon:appicon,webPreferences:{nodeIntegration:true},width:600,height:500,title:'Expression Definition'});
     console.log("1");
     filterwindow.loadURL(url.format({
        pathname:path.join(__dirname,'filterwindow.html'),
        protocol:'file:',
        slashes:true
    }));
    console.log("2");
     filterwindow.on('closed',()=>{
        filterwindow=null;
     });
     ipc.on("filterattributes",function(e,rowvalue,columnvalue){
        //console.log(columnvalue);
        mainWindow.webContents.send("filterattributes",rowvalue,columnvalue);
        console.log(rowvalue+" "+columnvalue);
        filterwindow.close();
     })
     console.log("window opened");
     //ipc.sender.send("filter window opened");
   });  
   ipc.on("open-dashboard",function(e,jsonobj,data){
      console.log(jsonobj);
     dashboardwindow= new BrowserWindow({ parent: mainWindow,icon:appicon,webPreferences:{nodeIntegration:true},width:1000,height:1000,title:'Dashboard'});
     dashboardwindow.loadURL(url.format({
        pathname:path.join(__dirname,'dashboard.html'),
        protocol:'file:',
        slashes:true
    }));
   
     dashboardwindow.on('closed',()=>{
        dashboardwindow=null;
     });
     ipc.on("send-jsonobj",function(event){
        console.log("sending json");
     event.sender.send("sent-jsonobj",jsonobj,data);
     console.log("sent json"+data);
     })

   //   ipc.on("filterattributes",function(e,rowvalue,columnvalue){
   //      //console.log(columnvalue);
   //      mainWindow.webContents.send("filterattributes",rowvalue,columnvalue);
   //      console.log(rowvalue+" "+columnvalue);
   //      filterwindow.close;
   //   })
     console.log("window opened");
     //ipc.sender.send("filter window opened");
   });  

   
const mainMenuTemplate=[
 {
     label:'file',
     submenu:[
         {  
             label:"open file",
             click(){
                console.log("hello");
                dialog.showOpenDialog(mainWindow, {
                    properties: ['openFile']
                  },(filePaths)=>{
                      //var file=
                   console.log(filePaths[0]);
                    //openFile(filePaths[0]);
                    mainWindow.webContents.send("call-loadDoc", filePaths[0]);
                 
                  }
                  
                 );
             }

         },
         {
            label:"close file"  
         },
         {
             label:"quit analyser",
             accelerator:process.platform =='darwin'?'Command+Q':'Ctrl+Q',
             click(){
             app.quit();
             }
         }
     ]
 },
 {
    label: 'Edit',
    submenu: [
       {
          role: 'undo'
       },
       {
          role: 'redo'
       },
       {
          type: 'separator'
       },
       {
          role: 'cut'
       },
       {
          role: 'copy'
       },
       {
          role: 'paste'
       }
    ]
 },
 
 {
    label: 'View',
    submenu: [
       {
          role: 'reload'
       },
       {
          role: 'toggledevtools'
       },
       {
          type: 'separator'
       },
       {
          role: 'resetzoom'
       },
       {
          role: 'zoomin'
       },
       {
          role: 'zoomout'
       },
       {
          type: 'separator'
       },
       {
          role: 'togglefullscreen'
       }
    ]
 },
 
 {
    role: 'window',
    submenu: [
       {
          role: 'minimize'
       },
       {
          role: 'close'
       }
    ]
 },
 
 {
    role: 'help',
    submenu: [
       {
          label: 'Learn More'
       }
    ]
 }

];

