class AppConfig{
    readonly port: number = 4000

    readonly dbConfig = {
        user:'root',
        host: 'localhost',
        port: 3306,
        password: '',
        database: 'parkings'
    }
}

export const appConfig = new AppConfig;