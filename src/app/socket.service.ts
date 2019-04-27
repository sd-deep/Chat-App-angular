import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/do';
import { catchError } from 'rxjs/operators';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  
  private url ="https://chatapi.edwisor.com";
  private socket; 

  constructor(private http : HttpClient) {
    this.socket=io(this.url);
   }

   //events to be listened
   public verifyUser  = () =>{
 
    return Observable.create((observer) =>{

      this.socket.on('verifyUser',(data)=>{

        observer.next(data);
      })
    })
   }

   public onlineUserList = () => {
      
    return Observable.create((observer)=>{

      this.socket.on('online-user-list',(userList)=>{

        observer.next(userList);
      })
    })
   }

   public disconnectedSocket = () =>{

    return Observable.create((observer)=>{
      this.socket.on('disconnect',()=>{
        observer.next();
      })
    })
   }

   //events to be emitted
   public setUser = (authToken) =>{

    this.socket.emit('set-user',authToken);
   }

   public markChatAsSeen = (userDetails)=>{
     this.socket.emit('mark-chat-as-seen', userDetails);
   }

   public sendChatMessage = (chatMsgObject) =>{
    this.socket.emit('chat-msg', chatMsgObject);
  }

  public getChat(senderId, receiverId,skip): Observable<any>{
       return this.http.get(`${this.url}/api/v1/chat/get/for/user?senderId=${senderId}&receiverId=${receiverId}&skip=${skip}&authToken=${Cookie.get('authToken')}`)
       .do(data => console.log('Data Received'))
       .pipe(catchError(this.handleError))
  }

   public chatByUserId = (userId) => {

    return Observable.create((observer)=>{
      this.socket.on('userId', data =>{
        observer.next(data);
      })
    })
   }

  
   public exitSocket = () => {
     this.socket.disconnect();
   }

   private handleError (err:HttpErrorResponse){
     let errorMessage =''
     if(err.error instanceof Error){
       errorMessage = `An error occured : ${err.error.message}`
     }else{
       errorMessage = `Server returned code : ${err.status}, error message is ${err.message}`
     }
     console.error(errorMessage);
     return Observable.throw(errorMessage);
   }
}
