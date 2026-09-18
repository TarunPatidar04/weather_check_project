export interface forecastDay{
    data:string;
    min:number;
    max:number
}


export interface weatherData{
    city:string;
    latitude:number;
    longitude:number
    temperature:number;
    forecast:forecastDay[]
    warning:string | null
}


