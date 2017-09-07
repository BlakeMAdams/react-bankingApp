INSERT INTO users
(auth_id, username, email, img)
VALUES
($1, $2, $3, $4)
RETURNING *;