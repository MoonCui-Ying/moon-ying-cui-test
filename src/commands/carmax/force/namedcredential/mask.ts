import { flags, SfdxCommand} from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson} from '@salesforce/ts-types';
import { SaveResult } from 'jsforce';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('moon-ying-cui-test', 'mask');

export default class Mask extends SfdxCommand {
    protected static requiresUsername = true;
    protected static flagsConfig = {
        // flag with a value (-a, --alias)
        alias: flags.string({required:true, description: messages.getMessage('aliasDescription')})        
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

    private async updateNCList(ncNameList): Promise<SaveResult | SaveResult[]>{
        const conn = this.org.getConnection();
        let ncDetailList: any = await conn.metadata.read('NamedCredential',ncNameList);
        if(ncDetailList.constructor === Array){
            for(let nc of ncDetailList){
                nc = this.updateNC(nc);
            }
        }else{
            ncDetailList = this.updateNC(ncDetailList);
        }
        let saveResult = await conn.metadata.update('NamedCredential', ncDetailList);
        return saveResult;
    }

    private updateNC(nc):Promise<AnyJson>{
        const suffix = this.flags.alias;
        nc.username = nc.username + '_' + suffix;
        nc.password = 'Not Valid';
        nc.endpoint = nc.endpoint + '_' + suffix;
        return nc;
    }
}