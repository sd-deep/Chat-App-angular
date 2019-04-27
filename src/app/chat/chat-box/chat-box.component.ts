import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SocketService } from 'src/app/socket.service';
import { AppService } from 'src/app/app.service';

import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css'],
  providers:[SocketService]
})
export class ChatBoxComponent implements OnInit {

  @ViewChild('scrollMe',{ read : ElementRef}) 
  
  public scrollMe: ElementRef;
  
  public authToken:any;
  public userInfo:any;
  public userList:any =[];

  public receiverId:any;
  public receiverName:any;
  
  public messageText:any;
  public messageList:any =[];

  public pageValue: number =0;

  public loadingPreviousChat: boolean = false;
  public disconnectedSocket:boolean;
  public scrollToChatTop : boolean =false; 

  constructor(
    private appService:AppService,
    private socketService:SocketService,
    private route:Router,
    private toastr : ToastrService) {

      this.receiverId = Cookie.get('receiverId');
      this.receiverName = Cookie.get('receiverName');
     }

  ngOnInit() {

    this.authToken = Cookie.get('authToken');

    this.userInfo = this.appService.getUserInfoFromLocalStorage();

    this.receiverId =Cookie.get('receiverId');
    this.receiverName = Cookie.get('receiverName');
    
    console.log(this.receiverId,this.receiverName);
    if(this.receiverId!=null && this.receiverId!=undefined && this.receiverId!=''){
      this.userSelectedToChat(this.receiverId,this.receiverName)
    }
    this.checkStatus();
    
    this.verifyUserConfirmation();

    this.getOnlineUserList();
    this.getMessageFromAUser();


  }
   
  public checkStatus :any = () =>{
      if( Cookie.get('authToken')=== undefined || Cookie.get('authToken')===''||Cookie.get('authToken')===null){
        this.route.navigate(['/']);
        return false;
      }
      else {
        return true;
      }
  }

  public verifyUserConfirmation :any = ()=>{
      
    this.socketService.verifyUser().subscribe(
      data=>{
        this.disconnectedSocket = false;

        this.socketService.setUser(this.authToken);
        this.getOnlineUserList();
      }
    )
  }

  public getOnlineUserList:any = () =>{
     
     this.socketService.onlineUserList().subscribe(
       userList =>{
         this.userList = []

         for(let x in userList){
           let temp = {'userId':x, 'name':userList[x],'unread':0, 'chatting':false}

           this.userList.push(temp);
         }
         console.log(this.userList);
       }
     )
 
  } // end of get online user list

  

  public sendMessageUsingKeypress : any = (event : any) =>{
    if(event.keycode === 13){
      this.sendMessage();
    }
  } // end of send message using enter key

  public sendMessage:any =() =>{
    if(this.messageText){
        let chatMsgObject ={
          senderName : this.userInfo.firstName + ' ' + this.userInfo.lastName,
          senderId : this.userInfo.userId,
          receiverName : Cookie.get('receiverName'),
          receiverId : Cookie.get('receiverId'),
          message : this.messageText,
          createdOn : new Date()
        }
        console.log(chatMsgObject);
        this.socketService.sendChatMessage(chatMsgObject)
        this.pushToChatWindow(chatMsgObject);
    }
    else{
      this.toastr.warning('text message can not be empty');
    }
  } // end of send message

  public pushToChatWindow:any =(data)=>{
    
    this.messageText = "";
    this.messageList.push(data);
    this.scrollToChatTop = false;
  } // end of push chat message to chat window

  public getMessageFromAUser:any =()=>{

    this.socketService.chatByUserId(this.userInfo.userId).subscribe(
      data=>{
           (this.receiverId==data.senderId)?this.messageList.push(data):'';
           this.toastr.success(`${data.senderName} says : ${data.message}`);
           this.scrollToChatTop=false;
      }
    )
  } // end of get message from a user

  public userSelectedToChat : any = (id,name)=> {
       
    console.log('setting user as active')
    this.userList.map((user)=>{
      if(user.userId==id){
        user.chatting=true;
      }
      else {
         user.chatting=false;
      }
    })
    
    Cookie.set('receiverId',id);
    Cookie.set('receiverName',name);

    this.receiverName = name;
    this.receiverId = id;
    this.messageList = [];
    this.pageValue = 0;
     
    let chatDetails = {
       userId : this.userInfo.userId,
       senderId : id
    }

    this.socketService.markChatAsSeen(chatDetails);
    this.getPreviousChatWithAUser();

  }// end of user selected to chat

  public getPreviousChatWithAUser : any = () =>{
    let previousData = (this.messageList.length > 0 ? this.messageList.slice():[]);

    this.socketService.getChat(this.userInfo.userId, this.receiverId, this.pageValue*10)
    .subscribe(apiResponse =>{
      console.log(apiResponse)

      if(apiResponse==200){
        this.messageList = apiResponse.data.concat(previousData)
      } else {
        this.messageList = previousData
        this.toastr.warning("No Messages available")
      }
      this.loadingPreviousChat = false;

    },
    err =>{
      this.toastr.error('some error occured')
    })
  }//end of previous chat with user

  public loadEarlierPageOfChat :any = ()=>{
      
    this.loadingPreviousChat=true;

    this.pageValue++;
    this.scrollToChatTop=true;

    this.getPreviousChatWithAUser();
  } // end of loadPreviousChat

 
  public logout : any =() => {

    this.appService.logout()
      .subscribe(apiResponse =>{

        if(apiResponse.status==200){
          console.log("logout called")
          Cookie.delete('authtoken')

          Cookie.delete('receiverId')
          Cookie.delete('receiverName')
          this.socketService.exitSocket()
          this.route.navigate(['/']);

        }else{
          this.toastr.error(apiResponse.message)
        }
      },
      err=>{
        this.toastr.error('some error occured')
      });
  } // end of logout

  public showUserName = (name:string) =>{

    this.toastr.success("You are chatting with "+name)
  }


}
