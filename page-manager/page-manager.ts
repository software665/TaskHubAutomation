import { Page } from "@playwright/test";
import { LoginPage } from "page-object/menu-screens/login";


export class PageManagers {

    readonly login: LoginPage;

    constructor(page:Page){
        this.login =new LoginPage(page);
    }



}