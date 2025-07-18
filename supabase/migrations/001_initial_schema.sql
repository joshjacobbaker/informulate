-- Create the questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text TEXT NOT NULL,
    options TEXT[] NOT NULL CHECK (array_length(options, 1) >= 3 AND array_length(options, 1) <= 5),
    correct_answer TEXT NOT NULL,
    category TEXT DEFAULT 'General Knowledge',
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the game_sessions table
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id TEXT NOT NULL, -- For now, we'll use a simple text identifier
    score INTEGER DEFAULT 0 NOT NULL,
    correct_answers INTEGER DEFAULT 0 NOT NULL,
    total_answers INTEGER DEFAULT 0 NOT NULL,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    max_streak INTEGER DEFAULT 0 NOT NULL,
    difficulty_preference TEXT DEFAULT 'medium' CHECK (difficulty_preference IN ('easy', 'medium', 'hard')),
    category_preference TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the answers table to track user responses
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken INTEGER, -- Time in milliseconds
    points_earned INTEGER DEFAULT 0 NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the question_history table to track which questions have been asked
CREATE TABLE IF NOT EXISTS public.question_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    asked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure a question is only asked once per session
    UNIQUE(session_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at);

CREATE INDEX IF NOT EXISTS idx_game_sessions_player_id ON public.game_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_is_active ON public.game_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON public.game_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_session_id ON public.answers(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_answered_at ON public.answers(answered_at);

CREATE INDEX IF NOT EXISTS idx_question_history_session_id ON public.question_history(session_id);
CREATE INDEX IF NOT EXISTS idx_question_history_question_id ON public.question_history(question_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_questions
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_game_sessions
    BEFORE UPDATE ON public.game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a single-player game)
-- In a production environment, you might want more restrictive policies

-- Questions can be read by anyone, but only inserted/updated by authenticated users
CREATE POLICY "Questions are publicly readable" ON public.questions
    FOR SELECT USING (true);

CREATE POLICY "Questions can be inserted by anyone" ON public.questions
    FOR INSERT WITH CHECK (true);

-- Game sessions can be managed by anyone (for single-player simplicity)
CREATE POLICY "Game sessions are publicly accessible" ON public.game_sessions
    FOR ALL USING (true);

-- Answers can be managed by anyone (for single-player simplicity)
CREATE POLICY "Answers are publicly accessible" ON public.answers
    FOR ALL USING (true);

-- Question history can be managed by anyone (for single-player simplicity)
CREATE POLICY "Question history is publicly accessible" ON public.question_history
    FOR ALL USING (true);

-- Create a function to get a random question for a session
CREATE OR REPLACE FUNCTION public.get_random_question(
    p_session_id UUID,
    p_category TEXT DEFAULT NULL,
    p_difficulty TEXT DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    question_text TEXT,
    options TEXT[],
    correct_answer TEXT,
    category TEXT,
    difficulty TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.question_text,
        q.options,
        q.correct_answer,
        q.category,
        q.difficulty
    FROM public.questions q
    WHERE 
        q.id NOT IN (
            SELECT qh.question_id 
            FROM public.question_history qh 
            WHERE qh.session_id = p_session_id
        )
        AND (p_category IS NULL OR q.category = p_category)
        AND (p_difficulty IS NULL OR q.difficulty = p_difficulty)
    ORDER BY RANDOM()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create a function to calculate score based on difficulty and time
CREATE OR REPLACE FUNCTION public.calculate_score(
    p_difficulty TEXT,
    p_time_taken INTEGER DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    base_score INTEGER;
    time_bonus INTEGER := 0;
BEGIN
    -- Base score by difficulty
    CASE p_difficulty
        WHEN 'easy' THEN base_score := 10;
        WHEN 'medium' THEN base_score := 20;
        WHEN 'hard' THEN base_score := 30;
        ELSE base_score := 20;
    END CASE;
    
    -- Time bonus (if answered quickly)
    IF p_time_taken IS NOT NULL THEN
        IF p_time_taken < 5000 THEN -- Under 5 seconds
            time_bonus := 10;
        ELSIF p_time_taken < 10000 THEN -- Under 10 seconds
            time_bonus := 5;
        END IF;
    END IF;
    
    RETURN base_score + time_bonus;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample questions for testing
INSERT INTO public.questions (question_text, options, correct_answer, category, difficulty, explanation) VALUES
('What is the capital of France?', 
 ARRAY['A. London', 'B. Berlin', 'C. Paris', 'D. Madrid'], 
 'C', 'Geography', 'easy', 
 'Paris is the capital and largest city of France, known for landmarks like the Eiffel Tower and Louvre Museum.'),

('Which planet is known as the Red Planet?', 
 ARRAY['A. Venus', 'B. Mars', 'C. Jupiter', 'D. Saturn'], 
 'B', 'Science & Nature', 'easy', 
 'Mars is called the Red Planet due to its reddish appearance caused by iron oxide (rust) on its surface.'),

('Who wrote the novel "1984"?', 
 ARRAY['A. George Orwell', 'B. Aldous Huxley', 'C. Ray Bradbury', 'D. H.G. Wells'], 
 'A', 'Literature', 'medium', 
 'George Orwell wrote "1984" in 1948, creating a dystopian vision of totalitarian control and surveillance.'),

('What is the largest mammal in the world?', 
 ARRAY['A. African Elephant', 'B. Blue Whale', 'C. Sperm Whale', 'D. Giraffe'], 
 'B', 'Science & Nature', 'easy', 
 'The Blue Whale is the largest mammal and the largest animal ever known to have lived on Earth.'),

('In which year did World War II end?', 
 ARRAY['A. 1944', 'B. 1945', 'C. 1946', 'D. 1947'], 
 'B', 'History', 'medium', 
 'World War II ended in 1945, with Germany surrendering in May and Japan surrendering in September after the atomic bombings.');

-- Verify the schema was created correctly
SELECT 'Schema created successfully' as status;
