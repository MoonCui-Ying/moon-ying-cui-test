import { flags, SfdxCommand} from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson} from '@salesforce/ts-types';
import { SaveResult } from 'jsforce';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('moon-ying-cui-test', 'mask');

export default class Mask extends SfdxCommand {
    protected static requiresUsername = true;
    protected static flagsConfig = {
        // flag with a value (--suffix)
        suffix: flags.string({required:true, description: messages.getMessage('suffixDescription')})        
    };

    public async run(): Promise<AnyJson> {
        let ncNameList = await this.getNamedCredentialNameList();
        if(ncNameList.length == 0){
            this.ux.log(messages.getMessage('info_NoNamedCredentialResults'));
            return;
        }

        let saveResult = await this.updateNCList(ncNameList);
        console.log(saveResult);        
        return;
    }

    //list all Named Credentials.
    private async getNamedCredentialNameList() : Promise<Array<string>>{
        const conn = this.org.getConnection();
        const apiVersion: string = conn.getApiVersion();
        const md_nc = {
            'type' : 'NamedCredential'
        }

        let ncNameList:string[]=[];
        let ncListResult: any = await conn.metadata.list(md_nc,apiVersion);
        
        if(ncListResult == undefined){
            return ncNameList;
        }
        if(ncListResult.constructor === Array){
            for(let nc of ncListResult){
                ncNameList.push(nc.fullName);
            }
        }else{
            ncNameList.push(ncListResult.fullName);
        }
        return ncNameList;
    }

    //read Named Credential details with fullname.
    private async updateNCList(ncNameList:Array<string>): Promise<SaveResult | SaveResult[]>{
        const conn = this.org.getConnection();
        let ncDetailList: any = await conn.metadata.read('NamedCredential',ncNameList);
        if(ncDetailList.constructor === Array){
            for(let nc of ncDetailList){
                nc = this.updateNC(nc);
            }
        }else{
            console.log(ncDetailList);
            ncDetailList = this.updateNC(ncDetailList);
        }
        let saveResult = await conn.metadata.update('NamedCredential', ncDetailList);
        return saveResult;
    }

    //Update some field values.
    private updateNC(nc:any){
        const suffix = '_' + this.flags.suffix;
        nc.label    = nc.label + suffix;
        nc.username = nc.username + suffix;
        nc.password = 'Not Valid';
        nc.endpoint = nc.endpoint + suffix;
        return nc;
    }
}