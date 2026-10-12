export type WeatherData = {
    name : string

    main : {
        temp : number
    }

    weather : {
        main : string
        description : string
    }[]

    wind : {
        speed : number
    }
}