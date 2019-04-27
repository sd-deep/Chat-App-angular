import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public email : any;
  public password : any;

  constructor(
    public appService:AppService,
    public router:Router,
    private toastr: ToastrService) {

      console.log("in login component")
     }

  ngOnInit() {
  }
   

  goToSignUp: any =()=>{
       this.router.navigate(['/sign-up'])
  }

  signinFunction : any = () => {

    if(!this.email){
      this.toastr.warning('enter email')
    }else if(!this.password){
      this.toastr.warning('enter password')
    } else {

      let data = {
        email : this.email,
        password : this.password
      }

      this.appService.signinFunction(data).subscribe(
        apiResponse =>{
          if(apiResponse.status===200){
            
            Cookie.set('authToken',apiResponse.data.authToken);
            Cookie.set('receiverId',apiResponse.data.userDetails.userId);
            Cookie.set('receiverName',apiResponse.data.userDetails.firstName+' '+apiResponse.data.userDetails.lastName);
            this.appService.setUserInfoInLocalStorage(apiResponse.data.userDetails);
            this.router.navigate(['/chat']);
          }else{
            this.toastr.error(apiResponse.message)
          }
        }, err => {
          this.toastr.error('some error occured',err);
        }
      )
    }
  }
}
