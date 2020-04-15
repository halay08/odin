import * as moment from 'moment';


export function getWeekDayOnlyDateRangeFromStartAndEnd(start: string, end: string, format: string = "YYYY-MM-DD"): string[] {
    const getDatesDiff = () => {
        const getDateAsArray = date => {
            return moment(date.split(/\D+/), format);
        };
        const diff = getDateAsArray(end).diff(getDateAsArray(start), "days") + 1;
        const dates = [];
        for(let i = 0; i < diff; i++) {
            const nextDate = getDateAsArray(start).add(i, "day");
            const isWeekEndDay = nextDate.isoWeekday() > 5;
            if(!isWeekEndDay) {
                dates.push(nextDate.format(format));
            }
        }
        return dates;
    };

    return getDatesDiff();
}

export function getFullWeekDateRangeFromStartAndEnd(start: string, end: string, format: string = "YYYY-MM-DD"): string[] {
    const getDatesDiff = () => {
        const getDateAsArray = date => {
            return moment(date.split(/\D+/), format);
        };
        const diff = getDateAsArray(end).diff(getDateAsArray(start), "days") + 1;
        const dates = [];
        for(let i = 0; i < diff; i++) {
            const nextDate = getDateAsArray(start).add(i, "day");
            dates.push(nextDate.format(format));
        }
        return dates;
    };

    return getDatesDiff();
}
