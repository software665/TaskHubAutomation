import { Page } from "@playwright/test";
import { LoginPage } from "../page-object/menu-screens/Login";
import { Tasks } from "../page-object/menu-screens/tasks-screen/Tasks"; 
import { NavigatePages } from "page-object/navigate-page/NavigatePage";
import { TaskReports } from "page-object/menu-screens/reports-screen/TaskReports";


export class PageManagers {

    readonly navigate :NavigatePages;

    readonly login: LoginPage;
    readonly task : Tasks;
    readonly taskReports :TaskReports;

    constructor(page:Page){
        this.login =new LoginPage(page);
        this.task = new Tasks(page);
        this.navigate = new NavigatePages(page);
        this.taskReports = new TaskReports(page);
    }



}