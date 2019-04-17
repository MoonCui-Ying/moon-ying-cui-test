import { SfdxCommand } from '@salesforce/command';

import { AnyJson } from '@salesforce/ts-types';

//const messages = Messages.loadMessages('moon-ying-cui-test', 'mask');

export default class Mask extends SfdxCommand {

    protected static requiresUsername = true;

    /*protected static flagsConfig = {
        // flag with a value (-a, --all)
        all: flags.string({char: 'a', description: messages.getMessage('allFlagDescription')})
        
      };
      */

    public async run(): Promise<AnyJson> {
        const conn = this.org.getConnection();
        const query = 'SELECT Id,DeveloperName,Endpoint,MasterLabel,PrincipalType FROM NamedCredential';

        interface NamedCredential {
            Id: string;
            DeveloperName: string;
            Endpoint: string;
            MasterLabel: string;
            PrincipalType: string;
        }

        const result = await conn.query<NamedCredential>(query);

        if (!result.records || result.records.length <= 0) {
            this.ux.log('No NamedCredentail found!');
        }else{
            for(let record of result.records){
                this.ux.log(record.DeveloperName + ', ' + record.MasterLabel);
            }
        }
        return;
    }
}