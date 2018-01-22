CREATE TABLE keys
(
  id   VARCHAR(8) NOT NULL
    PRIMARY KEY,
  date DATETIME DEFAULT datetime('now')
);

CREATE UNIQUE INDEX keys_id_uindex
  ON keys (id);