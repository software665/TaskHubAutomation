import { Page } from "@playwright/test";
import { LoginPage } from "page-object/menu-screens/login";
import { CreateTask } from "page-object/menu-screens/tasks";
import { NavigatePages } from "page-object/navigate-page/NavigatePage";


export class PageManagers {

    readonly navigate :NavigatePages;

    readonly login: LoginPage;
    readonly task : CreateTask;

    constructor(page:Page){
        this.login =new LoginPage(page);
        this.task = new CreateTask(page);
        this.navigate = new NavigatePages(page);
    }



}