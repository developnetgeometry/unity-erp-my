-- Add rejection_reason column for overtime sessions
ALTER TABLE overtime_sessions 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add comment for documentation
COMMENT ON COLUMN overtime_sessions.rejection_reason IS 'Reason provided when overtime session is rejected by HR/Admin';