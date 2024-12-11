import { registerUser } from '../services/serverServices';

jest.mock('../db/dal', () => ({
    runQuery: jest.fn(),
}));

describe('registerUser', () => {
    it('should create a new user and return token and userId', async () => {
        const mockRunQuery = require('../db/dal').runQuery;
        mockRunQuery.mockResolvedValue([{ insertId: 1 }]);

        const { token, userId } = await registerUser('John', 'Doe', 'john@example.com', 'securePass123', false);

        expect(userId).toBe(1);
        expect(token).toBeDefined();
    });

    it('should throw an error if email already exists', async () => {
        const mockRunQuery = require('../db/dal').runQuery;
        mockRunQuery.mockResolvedValue([]);

        await expect(registerUser('John', 'Doe', 'john@example.com', 'securePass123', false))
            .rejects
            .toThrow('Email already exists');
    });
});
