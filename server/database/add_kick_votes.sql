-- Create kick_votes table for vote-kick functionality
CREATE TABLE IF NOT EXISTS kick_votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  target_character_id INT NOT NULL,
  vote_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (target_character_id) REFERENCES characters(id) ON DELETE CASCADE,
  UNIQUE KEY unique_kick_vote (room_id, target_character_id)
);
