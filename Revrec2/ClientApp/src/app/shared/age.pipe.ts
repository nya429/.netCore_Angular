
import { PipeTransform, Pipe } from '@angular/core';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';

const moment = _rollupMoment || _moment;

@Pipe({
    name: 'agepipe'
})
export class AgePipe implements PipeTransform  {
    transform(value: any) {
        if(!value) {
            return ``;
        }
        const now = new Date();
        const dob = new Date(value)
        let year = now.getFullYear() - dob.getFullYear()
        if(now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) {
            year--;
        }

        return `${value} (Age: ${year})`;
    }
}

@Pipe({
    name: 'eligibility'
})
export class EligibilityPipe implements PipeTransform  {
    transform(value: string[]) {
        if(!value) {
            return `TBD`;
        }

        const now = new Date();
        const eligibiltiy = (
            now >= new Date(value[0]) && 
            ( value[1] == '' || now <=  new Date(value[1]))) 
        ? 'Enrolled'
        : `Non-enrolled`;
        return eligibiltiy;
    }
}

@Pipe({
    name: 'signtime'
})
export class SignTimePipe implements PipeTransform  {
    transform(value: any) {

        let timeDiffer = (Date.now() - new Date(value).getTime());
        let dayDiffer =  Math.floor(Date.now() / 86400000) -
         Math.floor(new Date(value).getTime()/ 86400000);

        const createTime = new Date(value);
        const month = createTime.getMonth() + 1;
        const date = createTime.getDate();
        const hour = this.getTimeString(createTime.getHours());
        const minute = this.getTimeString(createTime.getMinutes());
        
        
        if (timeDiffer < 60000) {
            return 'Just now';
          } else if (timeDiffer >= 60000 && timeDiffer < 3600000 ) {
            timeDiffer = Math.floor(timeDiffer / 60000);
            return `${timeDiffer} Min${timeDiffer > 1 ? '(s)' : '' }`;
          } else if (dayDiffer == 0 && timeDiffer >= 3600000 && timeDiffer < 18000000 ) {
            timeDiffer = Math.floor(timeDiffer / 3600000);
            return `${timeDiffer} Hour${timeDiffer > 1 ? '(s)' : ''}`;
          } else if (dayDiffer ==  0) {
            return ` ${hour}:${minute}`;  
          } else if (dayDiffer == 1) {
            return `Yesterday ${hour}:${minute}`;  
          } else if (dayDiffer > 1) {
            return `${month}/${date} ${hour}:${minute}`;
        }
    }

    getTimeString(time: number) {
        return time <= 9 ? `0${time}` : time.toString();
    }
}

@Pipe({
    name: 'sqlDateFormat'
})
export class SqlDateFormatPipe implements PipeTransform  {
    transform(value: any | Date) {        
        if (value === null) {
            return '';
        }

        if(typeof value === "object") {
           return value.format('YYYY-MM-DD');
        } 
        
        if (typeof value === "string") {
            value = new Date(Date.parse(value));
        }

        const day = value.getUTCDate();
        const month = value.getUTCMonth() + 1;
        const year = value.getFullYear();
        // Return the format as per your requirement
        // return value;
        return `${year}-${month > 9 ? month : "0" + month}-${day > 9 ? day : "0" + day}`;
    }
}