class AppConfig {
    readonly port: number = 4091;
    readonly dbConfig = {
        user: 'root',
        host: 'localhost',
        port: 3306,
        password: '',
        database: 'freedom',
    };
}

export const appConfig = new AppConfig();
