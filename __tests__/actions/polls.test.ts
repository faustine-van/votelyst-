import { createPoll, getPoll, updatePoll } from '@/app/(main)/polls/actions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Mock the Supabase server client
jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

describe('Poll Actions', () => {
  const supabaseMock = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createSupabaseServerClient as jest.Mock).mockResolvedValue(supabaseMock);
  });

  // Tests for createPoll
  describe('createPoll', () => {
    it('should create a poll and its options successfully', async () => {
      const mockPoll = { id: 'poll-1', question: 'Test Poll' };
      const mockOptions = [{ id: 'opt-1', option_text: 'Option 1' }];

      // Mock the chain for creating a poll
      const pollInsertMock = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPoll, error: null }),
      };
      const pollFromMock = {
        insert: jest.fn().mockReturnValue(pollInsertMock),
      };

      // Mock the chain for creating options
      const optionsInsertMock = {
        select: jest.fn().mockResolvedValue({ data: mockOptions, error: null }),
      };
      const optionsFromMock = {
        insert: jest.fn().mockReturnValue(optionsInsertMock),
      };

      supabaseMock.from.mockImplementation((tableName: string) => {
        if (tableName === 'polls') return pollFromMock;
        if (tableName === 'poll_options') return optionsFromMock;
        return { insert: jest.fn() }; // Default mock
      });

      const result = await createPoll('user-1', 'Test Poll', 'A description', ['Option 1'], false);

      expect(supabaseMock.from).toHaveBeenCalledWith('polls');
      expect(pollFromMock.insert).toHaveBeenCalledWith(expect.objectContaining({ question: 'Test Poll' }));
      expect(supabaseMock.from).toHaveBeenCalledWith('poll_options');
      expect(optionsFromMock.insert).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ option_text: 'Option 1' })]));
      expect(result).toEqual({ ...mockPoll, options: mockOptions });
    });

    it('should throw an error if poll creation fails', async () => {
        const pollError = new Error('Failed to create poll');
        const pollInsertMock = {
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: pollError }),
        };
        supabaseMock.from.mockReturnValue({ insert: jest.fn().mockReturnValue(pollInsertMock) });

        await expect(createPoll('user-1', 'Test Poll', null, ['Opt 1', 'Opt 2'], false)).rejects.toThrow(pollError);
    });
  });

  // Tests for getPoll
  describe('getPoll', () => {
    it('should retrieve a poll with its options', async () => {
        const mockPoll = { id: 'poll-1', question: 'Existing Poll' };
        const mockOptions = [{ id: 'opt-1', poll_id: 'poll-1', option_text: 'Yes' }];

        const pollSelectMock = { eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: mockPoll, error: null }) };
        const optionsSelectMock = { eq: jest.fn().mockResolvedValue({ data: mockOptions, error: null }) };

        supabaseMock.from.mockImplementation((tableName: string) => {
            if (tableName === 'polls') return { select: jest.fn().mockReturnValue(pollSelectMock) };
            if (tableName === 'poll_options') return { select: jest.fn().mockReturnValue(optionsSelectMock) };
            return {};
        });

        const result = await getPoll('poll-1');

        expect(supabaseMock.from).toHaveBeenCalledWith('polls');
        expect(pollSelectMock.eq).toHaveBeenCalledWith('id', 'poll-1');
        expect(supabaseMock.from).toHaveBeenCalledWith('poll_options');
        expect(optionsSelectMock.eq).toHaveBeenCalledWith('poll_id', 'poll-1');
        expect(result).toEqual({ ...mockPoll, options: mockOptions });
    });
  });

  // Tests for updatePoll
  describe('updatePoll', () => {
    it('should update poll details and manage options correctly', async () => {
        const mockPoll = { id: 'poll-1', question: 'Updated Question' };
        const existingDbOptions = [{ id: 'opt-1' }, { id: 'opt-to-delete' }];

        const pollUpdateMock = { eq: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: mockPoll, error: null }) };
        const optionsSelectMock = { eq: jest.fn().mockResolvedValue({ data: existingDbOptions, error: null }) };
        const optionsUpsertMock = { error: null };
        const optionsInsertMock = { error: null };
        const optionsDeleteMock = { in: jest.fn().mockResolvedValue({ error: null }) };


        supabaseMock.from.mockImplementation((tableName: string) => {
            if (tableName === 'polls') return { update: jest.fn().mockReturnValue(pollUpdateMock) };
            if (tableName === 'poll_options') return {
                select: jest.fn().mockReturnValue(optionsSelectMock),
                upsert: jest.fn().mockResolvedValue(optionsUpsertMock),
                insert: jest.fn().mockResolvedValue(optionsInsertMock),
                delete: jest.fn().mockReturnValue(optionsDeleteMock),
            };
            return {};
        });

        const optionsToUpdate = [
            { id: 'opt-1', option_text: 'Updated Option 1' }, // Update
            { option_text: 'New Option 2' }, // Insert
        ];

        await updatePoll('poll-1', 'Updated Question', 'New Desc', optionsToUpdate, false);

        expect(supabaseMock.from).toHaveBeenCalledWith('polls');
        expect(pollUpdateMock.eq).toHaveBeenCalledWith('id', 'poll-1');
    });
  });
});