import { step } from 'helpers/Test-Steps-Decorator';
import { Page, expect } from '@playwright/test'


export class LoginPage {

     readonly page: Page
    constructor(page: Page) {
        this.page = page
    }

    /**
     * @param companyCode passing string value in the companyCode Field
     * @param userName passing string value in the userName Field
     * @param password passing string value in the password Field
     * @param rememberMe passing boolean
     * @param forgotPassword passing boolean
     */


    @step
    async loginPage(tenantcode :string, userName: string, 
        password: string,rememberMe:boolean ,forgotPassword:boolean) {

        //tenant code 
        await this.companyCode(tenantcode);
        //userName 
        await this.userName(userName);
        //password
        await this.password(password);
        if(rememberMe){
        await this.page.getByText('Remember me',{exact:true}).click();
        }else{
            console.log("Remember Me is not selected");
        }
        //
        if(forgotPassword){
            await this.page.getByRole('button',{name:'Forgot password?'}).click();
        }else{
           console.log("Forgot password? is not selected"); 
        }
        await this.signinButton();

        await this.page.waitForLoadState('networkidle');
        
        await expect( this.page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();

    }

    async companyCode(tenant: string){
        const tenantCode= this.page.locator('#tenant_code');
        await tenantCode.fill(tenant);
    }

    async userName(name:string){
        const uName= this.page.locator('#username');
        await uName.fill(name);
    }

    async password(pass:string){
        const pWord =this.page.locator("#password")
        await pWord.fill(pass);
    }

    async signinButton(){
        await this.page.getByRole("button",{name:'Sign in'}).click();
    }

    async logout(){
        //profile icon
        await this.page.getByRole("button", { name: "Profile menu" }).click();
        //logout 
        await this.page.getByRole("button",{name:'Log out'}).click();
    }

}