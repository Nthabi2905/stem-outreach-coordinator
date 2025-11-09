-- Add generated_letter column to store letter content before sending
ALTER TABLE school_recommendations 
ADD COLUMN generated_letter text;